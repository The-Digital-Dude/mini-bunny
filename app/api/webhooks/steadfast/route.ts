import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifySteadfastWebhook } from "@/lib/steadfast"
import { sendShippingDispatched, sendOrderDelivered, sendOrderStatusUpdate } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("X-Signature") || req.headers.get("x-signature")

    // Verify webhook signature if secret key is present
    if (process.env.STEADFAST_SECRET_KEY && signature) {
      const isValid = verifySteadfastWebhook(rawBody, signature)
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody)
    const {
      notification_type,
      consignment_id,
      invoice,
      status,
      cod_amount,
      delivery_charge,
      tracking_message,
    } = payload

    if (!invoice && !consignment_id) {
      return NextResponse.json({ error: "Missing invoice or consignment_id" }, { status: 400 })
    }

    // Find the matching order by orderNumber (invoice) or consignmentId
    let order = null
    if (invoice) {
      order = await prisma.order.findUnique({
        where: { orderNumber: String(invoice) },
        include: { user: true, delivery: true },
      })
    }

    if (!order && consignment_id) {
      const delivery = await prisma.delivery.findFirst({
        where: { consignmentId: String(consignment_id) },
        select: { orderId: true },
      })
      if (delivery) {
        order = await prisma.order.findUnique({
          where: { id: delivery.orderId },
          include: { user: true, delivery: true },
        })
      }
    }

    if (!order) {
      // Return 200 so Steadfast doesn't keep hammering if order is deleted or test
      return NextResponse.json({ status: "ignored", reason: "Order not found" }, { status: 200 })
    }

    const prevStatus = order.status
    const customerEmail = order.guestEmail || order.user?.email
    const customerName = order.shippingName || order.user?.name || "Valued Parent"

    // Map Steadfast status to internal OrderStatus
    const normStatus = (status || "").toLowerCase()
    let mappedOrderStatus: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED" | null = null
    let mappedPaymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | null = null

    if (normStatus === "delivered" || normStatus === "partial_delivered") {
      mappedOrderStatus = "DELIVERED"
      mappedPaymentStatus = "PAID"
    } else if (normStatus === "cancelled") {
      mappedOrderStatus = "CANCELLED"
    } else if (normStatus === "returned" || normStatus === "partial_returned") {
      mappedOrderStatus = "RETURNED"
    } else if (normStatus === "in_review" || normStatus === "in_transit" || normStatus === "shipped") {
      mappedOrderStatus = "SHIPPED"
    }

    // Update order status if mapped
    if (mappedOrderStatus) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: mappedOrderStatus,
          ...(mappedPaymentStatus ? { paymentStatus: mappedPaymentStatus } : {}),
        },
      })
    }

    // Update or Upsert Delivery record
    const effectiveConsignmentId = consignment_id ? String(consignment_id) : (order.delivery?.consignmentId || undefined)
    const effectiveTrackingCode = effectiveConsignmentId || String(invoice)

    if (consignment_id || invoice) {
      await prisma.delivery.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          courier: "STEADFAST",
          consignmentId: effectiveConsignmentId,
          trackingCode: effectiveTrackingCode,
          status: (status || "IN_TRANSIT").toUpperCase(),
          charge: delivery_charge ? Number(delivery_charge) : 0,
        },
        update: {
          status: (status || "IN_TRANSIT").toUpperCase(),
          ...(effectiveConsignmentId ? { consignmentId: effectiveConsignmentId, trackingCode: effectiveTrackingCode } : {}),
          ...(delivery_charge !== undefined ? { charge: Number(delivery_charge) } : {}),
        },
      })
    }

    // Trigger Automated Milestone Emails to Customer
    if (customerEmail && mappedOrderStatus && mappedOrderStatus !== prevStatus) {
      if (mappedOrderStatus === "DELIVERED") {
        sendOrderDelivered({
          to: customerEmail,
          customerName,
          orderNumber: order.orderNumber,
        }).catch((err) => console.error("[steadfast-webhook] Delivered email error:", err))
      } else if (mappedOrderStatus === "SHIPPED" && prevStatus !== "SHIPPED") {
        sendShippingDispatched({
          to: customerEmail,
          customerName,
          orderNumber: order.orderNumber,
          courierName: "Steadfast Courier",
          trackingNumber: effectiveTrackingCode,
          trackingUrl: `https://steadfast.com.bd/t/${effectiveTrackingCode}`,
        }).catch((err) => console.error("[steadfast-webhook] Dispatch email error:", err))
      } else if (mappedOrderStatus === "CANCELLED" || mappedOrderStatus === "RETURNED") {
        sendOrderStatusUpdate({
          to: customerEmail,
          customerName,
          orderNumber: order.orderNumber,
          status: mappedOrderStatus,
          note: tracking_message || null,
        }).catch((err) => console.error("[steadfast-webhook] Status update email error:", err))
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorRole: "WEBHOOK",
        actorEmail: "steadfast@webhook",
        action: "order.courier_update",
        entityType: "Order",
        entityId: order.id,
        after: JSON.stringify({
          courier: "STEADFAST",
          consignment_id,
          status,
          mappedOrderStatus,
          tracking_message,
          delivery_charge,
          customerEmailNotified: Boolean(customerEmail),
        }),
      },
    }).catch(() => null)

    return NextResponse.json({ status: "success", received: true })
  } catch (error: any) {
    console.error("Steadfast webhook error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

