import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendReviewRequestEmail } from "@/lib/email"

// Called by Vercel Cron (set in vercel.json) or cron monitoring
// Sends "How was your baby's order?" review request emails 3 days after delivery
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Find orders delivered 3-7 days ago
  const deliveredOrders = await prisma.order.findMany({
    where: {
      status: "DELIVERED",
      updatedAt: { gte: sevenDaysAgo, lte: threeDaysAgo },
    },
    include: {
      user: { select: { email: true, name: true } },
      items: { take: 2, include: { product: { select: { name: true, slug: true, images: { take: 1 } } } } },
    },
    take: 50,
  })

  if (deliveredOrders.length === 0) {
    return NextResponse.json({ sent: 0, message: "No pending delivered orders found" })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.minibunny.com"
  let sent = 0

  for (const order of deliveredOrders) {
    const email = order.user?.email ?? order.guestEmail
    if (!email) continue

    const customerName = order.user?.name || "there"
    const productNames = order.items.map((i: any) => i.product?.name).filter(Boolean).join(", ") || "Mini Bunny babywear"

    try {
      await sendReviewRequestEmail({
        to: email,
        customerName,
        orderNumber: order.orderNumber,
        productNames,
        reviewUrl: `${siteUrl}/account/orders`,
      })
      sent++
    } catch (e) {
      console.error(`[post-purchase-email] Failed for order ${order.orderNumber}:`, e)
    }
  }

  return NextResponse.json({ sent })
}
