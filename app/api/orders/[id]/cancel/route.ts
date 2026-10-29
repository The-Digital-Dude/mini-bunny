import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendOrderStatusUpdate } from "@/lib/email"
import { revalidatePath } from "next/cache"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const { reason, phone } = body

    const session = await auth()
    const userId = session?.user?.id
    const isAdmin = session?.user?.role === "ADMIN"

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: { select: { email: true, name: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Security check:
    // If user is logged in, they must own the order or be an admin.
    // If order was placed by guest (or user not logged in), verify matching phone number or allow if accessed from valid context.
    if (!isAdmin) {
      if (order.userId && userId && order.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized to cancel this order" }, { status: 403 })
      }
      if (phone && order.shippingPhone && phone.trim() !== order.shippingPhone.trim()) {
        return NextResponse.json({ error: "Phone number does not match order record" }, { status: 403 })
      }
    }

    // Check cancellation eligibility
    // Allowed when PENDING or CONFIRMED (not yet packed, shipped, or delivered)
    const cancellableStatuses = ["PENDING", "CONFIRMED"]
    if (!cancellableStatuses.includes(order.status)) {
      if (order.status === "CANCELLED") {
        return NextResponse.json({ error: "Order is already cancelled" }, { status: 400 })
      }
      return NextResponse.json({
        error: `Order cannot be cancelled because it is already ${order.status.toLowerCase()}. Please contact customer support for returns or size exchanges.`
      }, { status: 400 })
    }

    // Transaction to update status and restore stock
    const cancellationNote = reason?.trim()
      ? `Cancelled by customer: ${reason.trim()}`
      : "Cancelled by customer"

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Update order status
      const updated = await tx.order.update({
        where: { id },
        data: {
          status: "CANCELLED",
        },
      })

      // 2. Restore stock for each product variant
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          }).catch(() => {})
        }
      }

      // 3. Create status log
      await tx.orderStatusLog.create({
        data: {
          orderId: id,
          status: "CANCELLED",
          note: cancellationNote,
        },
      })

      return updated
    })

    // Revalidate relevant pages
    revalidatePath(`/order/${id}`)
    revalidatePath("/admin/orders")
    revalidatePath("/account")

    // Send email notification (fire-and-forget)
    const toEmail = order.user?.email || order.guestEmail
    const customerName = order.user?.name || order.shippingName
    if (toEmail) {
      sendOrderStatusUpdate({
        to: toEmail,
        customerName: customerName || "Valued Parent",
        orderNumber: order.orderNumber,
        status: "CANCELLED",
        note: reason?.trim() ? `Reason: ${reason.trim()}` : undefined,
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Order successfully cancelled and inventory restored.",
    })
  } catch (error: any) {
    console.error("[CancelOrder API Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to cancel order" }, { status: 500 })
  }
}
