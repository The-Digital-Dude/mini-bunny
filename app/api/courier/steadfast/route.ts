import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"
import { createConsignment, getConsignmentStatus } from "@/lib/steadfast"
import { sendShippingDispatched, sendOrderDelivered, sendOrderStatusUpdate } from "@/lib/email"

// POST: Auto-create a Steadfast consignment for an order via official API
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { delivery: true, user: true },
    })
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const addressParts = [
      order.shippingAddress,
      order.shippingArea,
      order.shippingDistrict,
      order.shippingDivision,
    ].filter(Boolean)

    const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : "Dhaka, Bangladesh"
    const codAmount = order.paymentMethod === "COD" && order.paymentStatus !== "PAID" 
      ? Math.round(Number(order.total || 0) - Number(order.depositAmount || 0)) 
      : 0

    const consignment = await createConsignment({
      invoice: order.orderNumber,
      recipient_name: order.shippingName || "Valued Parent",
      recipient_phone: order.shippingPhone || "01700000000",
      recipient_address: fullAddress,
      cod_amount: codAmount,
      note: order.note || `Order #${order.orderNumber} - Mini Bunny Baby Store`,
    })

    if (!consignment || !consignment.consignment_id) {
      return NextResponse.json({ error: "Failed to obtain consignment ID from Steadfast" }, { status: 502 })
    }

    const consignmentIdStr = String(consignment.consignment_id)
    const trackingCodeStr = consignment.tracking_code || consignmentIdStr

    // Upsert delivery record
    await prisma.delivery.upsert({
      where: { orderId },
      create: {
        orderId,
        courier: "STEADFAST",
        consignmentId: consignmentIdStr,
        trackingCode: trackingCodeStr,
        status: (consignment.status || "IN_REVIEW").toUpperCase(),
      },
      update: {
        courier: "STEADFAST",
        consignmentId: consignmentIdStr,
        trackingCode: trackingCodeStr,
        status: (consignment.status || "IN_REVIEW").toUpperCase(),
      },
    })

    // Advance order status to PROCESSING or SHIPPED if currently PENDING/CONFIRMED
    if (order.status === "PENDING" || order.status === "CONFIRMED") {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "PROCESSING" },
      })
    }

    // Automatically send Shipping Dispatched email to customer
    const customerEmail = order.guestEmail || order.user?.email
    if (customerEmail) {
      sendShippingDispatched({
        to: customerEmail,
        customerName: order.shippingName || order.user?.name || "Valued Parent",
        orderNumber: order.orderNumber,
        courierName: "Steadfast Courier",
        trackingNumber: trackingCodeStr,
        trackingUrl: `https://steadfast.com.bd/t/${trackingCodeStr}`,
      }).catch((err) => console.error("[steadfast-dispatch] Failed to send customer dispatch email:", err))
    }

    // Add Audit Log
    await prisma.auditLog.create({
      data: {
        actorRole: "ADMIN",
        action: "courier.dispatched",
        entityType: "Order",
        entityId: orderId,
        after: JSON.stringify({
          courier: "STEADFAST",
          consignmentId: consignmentIdStr,
          trackingCode: trackingCodeStr,
          status: consignment.status,
          customerEmailNotified: Boolean(customerEmail),
        }),
      },
    }).catch(() => null)

    return NextResponse.json({
      success: true,
      consignment: {
        consignment_id: consignmentIdStr,
        tracking_code: trackingCodeStr,
        status: consignment.status,
      },
    })
  } catch (err: any) {
    console.error("Steadfast auto-dispatch error:", err)
    return NextResponse.json({ error: err.message || "Failed to book parcel with Steadfast" }, { status: 500 })
  }
}

// GET: check live status of a consignment from Steadfast API
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const consignmentId = req.nextUrl.searchParams.get("consignmentId")
    if (!consignmentId) {
      return NextResponse.json({ error: "consignmentId is required" }, { status: 400 })
    }

    const result = await getConsignmentStatus(consignmentId)

    // Map Steadfast statuses to our internal statuses
    const statusMap: Record<string, string> = {
      "delivered": "DELIVERED",
      "partial_delivered": "DELIVERED",
      "returned": "RETURNED",
      "partial_returned": "RETURNED",
      "in_review": "SHIPPED",
      "cancelled": "CANCELLED",
      "pending": "SHIPPED",
    }
    const internalStatus = statusMap[result.status?.toLowerCase()] || "SHIPPED"

    // Fetch delivery and order before updating to detect status transitions
    const delivery = await prisma.delivery.findFirst({
      where: { consignmentId },
      include: { order: { include: { user: true } } },
    })

    // Update delivery record in DB
    await prisma.delivery.updateMany({
      where: { consignmentId },
      data: { status: internalStatus },
    })

    if (delivery?.order) {
      const prevStatus = delivery.order.status
      const customerEmail = delivery.order.guestEmail || delivery.order.user?.email
      const customerName = delivery.order.shippingName || delivery.order.user?.name || "Valued Parent"

      // Update Order Status if delivered or returned
      if (internalStatus === "DELIVERED" && prevStatus !== "DELIVERED") {
        await prisma.order.update({
          where: { id: delivery.order.id },
          data: { status: "DELIVERED", paymentStatus: "PAID" },
        })

        if (customerEmail) {
          sendOrderDelivered({
            to: customerEmail,
            customerName,
            orderNumber: delivery.order.orderNumber,
          }).catch((err) => console.error("[steadfast-sync] Delivered email error:", err))
        }
      } else if (internalStatus === "RETURNED" && prevStatus !== "RETURNED") {
        await prisma.order.update({
          where: { id: delivery.order.id },
          data: { status: "RETURNED" },
        })

        if (customerEmail) {
          sendOrderStatusUpdate({
            to: customerEmail,
            customerName,
            orderNumber: delivery.order.orderNumber,
            status: "RETURNED",
          }).catch((err) => console.error("[steadfast-sync] Return email error:", err))
        }
      }
    }

    return NextResponse.json({
      status: result.status,
      internalStatus,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to query status" }, { status: 500 })
  }
}

