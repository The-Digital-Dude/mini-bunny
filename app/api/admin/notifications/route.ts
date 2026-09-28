import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [
      pendingOrdersCount,
      lowStockCount,
      outOfStockCount,
      pendingReturnsCount,
      pendingGiftCardsCount,
      recentPendingOrders,
      lowStockProducts,
    ] = await Promise.all([
      prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED"] } } }).catch(() => 0),
      prisma.productVariant.count({ where: { stock: { lte: 5, gt: 0 } } }).catch(() => 0),
      prisma.productVariant.count({ where: { stock: 0 } }).catch(() => 0),
      prisma.returnRequest.count({ where: { status: "PENDING" } }).catch(() => 0),
      prisma.giftCard.count({ where: { paymentStatus: "PENDING_VERIFICATION" } }).catch(() => 0),
      prisma.order.findMany({
        where: { status: { in: ["PENDING", "CONFIRMED"] } },
        take: 3,
        orderBy: { createdAt: "desc" },
        select: { id: true, orderNumber: true, total: true, shippingName: true, createdAt: true },
      }).catch(() => []),
      prisma.productVariant.findMany({
        where: { stock: { lte: 5 } },
        take: 3,
        orderBy: { stock: "asc" },
        include: { product: { select: { name: true } } },
      }).catch(() => []),
    ])

    const totalAlerts =
      pendingOrdersCount +
      (lowStockCount + outOfStockCount > 0 ? 1 : 0) +
      pendingReturnsCount +
      pendingGiftCardsCount

    return NextResponse.json({
      badges: {
        pendingOrders: pendingOrdersCount,
        stockAlerts: lowStockCount + outOfStockCount,
        outOfStock: outOfStockCount,
        lowStock: lowStockCount,
        pendingReturns: pendingReturnsCount,
        pendingGiftCards: pendingGiftCardsCount,
        totalAlerts,
      },
      notifications: [
        ...(pendingOrdersCount > 0
          ? [
              {
                id: "orders",
                type: "order",
                title: `${pendingOrdersCount} New Order${pendingOrdersCount > 1 ? "s" : ""} Pending`,
                message: recentPendingOrders[0]
                  ? `Latest: ${recentPendingOrders[0].orderNumber} (৳${Number(recentPendingOrders[0].total).toLocaleString()})`
                  : "Needs confirmation or processing",
                href: "/admin/orders",
                time: recentPendingOrders[0]?.createdAt || new Date(),
                severity: "warning",
              },
            ]
          : []),
        ...(outOfStockCount > 0
          ? [
              {
                id: "stock-out",
                type: "inventory",
                title: `${outOfStockCount} Variant${outOfStockCount > 1 ? "s" : ""} Out of Stock`,
                message: lowStockProducts[0]
                  ? `${lowStockProducts[0].product.name} (${lowStockProducts[0].size || ""}${lowStockProducts[0].color ? `/${lowStockProducts[0].color}` : ""})`
                  : "Items are currently unavailable for sale",
                href: "/admin/inventory",
                time: new Date(),
                severity: "danger",
              },
            ]
          : []),
        ...(pendingReturnsCount > 0
          ? [
              {
                id: "returns",
                type: "return",
                title: `${pendingReturnsCount} Return / Exchange Request${pendingReturnsCount > 1 ? "s" : ""}`,
                message: "Customer exchange requests awaiting approval",
                href: "/admin/returns",
                time: new Date(),
                severity: "info",
              },
            ]
          : []),
        ...(pendingGiftCardsCount > 0
          ? [
              {
                id: "gift-cards",
                type: "gift_card",
                title: `${pendingGiftCardsCount} Gift Card Payment${pendingGiftCardsCount > 1 ? "s" : ""}`,
                message: "Manual payment verification required",
                href: "/admin/gift-cards",
                time: new Date(),
                severity: "warning",
              },
            ]
          : []),
      ],
    })
  } catch (error: any) {
    console.error("Admin notifications error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch notifications" }, { status: 500 })
  }
}
