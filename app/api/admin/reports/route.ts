import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { subDays, startOfMonth } from "date-fns"
import { requireAdmin } from "@/lib/adminAuth"

export async function GET(req: Request) {
  const { error } = await requireAdmin()
  if (error) return error
  try {
    const { searchParams } = new URL(req.url)
    const range = searchParams.get("range") || "30" // today, 7, 30, 90, this_month, all
    
    let fromDate = new Date(0)
    const now = new Date()

    if (range === "today") {
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    } else if (range === "7") {
      fromDate = subDays(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0), 6)
    } else if (range === "30") {
      fromDate = subDays(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0), 29)
    } else if (range === "90") {
      fromDate = subDays(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0), 89)
    } else if (range === "this_month") {
      fromDate = startOfMonth(now)
    }

    const where = range === "all" ? {} : { createdAt: { gte: fromDate } }
    const expenseWhere = range === "all" ? {} : { date: { gte: fromDate } }

    // Fetch orders with item variant details for accurate COGS
    const [orders, newCustomers, expenses] = await Promise.all([
      prisma.order.findMany({
        where: {
          ...where,
          status: { not: "CANCELLED" },
        },
        include: {
          items: {
            include: {
              variant: { select: { costPrice: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }).catch(() => []),

      prisma.user.count({
        where: {
          role: "CUSTOMER",
          ...(range === "all" ? {} : { createdAt: { gte: fromDate } }),
        },
      }).catch(() => 0),

      prisma.expense.findMany({
        where: expenseWhere,
        select: { amount: true, category: true, date: true, note: true },
        orderBy: { date: "desc" },
      }).catch(() => []),
    ])

    const totalOrders = orders.length
    let grossSales = 0
    let totalDiscounts = 0
    let shippingCollected = 0
    let totalRevenue = 0
    let totalCOGS = 0

    const productStats: Record<string, { name: string; units: number; revenue: number; cogs: number }> = {}
    const paymentCounts: Record<string, number> = { BKASH: 0, NAGAD: 0, COD: 0, CARD: 0, OTHER: 0 }
    const statusCounts: Record<string, number> = {}
    const dailyRevenueMap: Record<string, { revenue: number; orders: number }> = {}

    for (const o of orders) {
      const orderTotal = Number(o.total || 0)
      const orderSubtotal = Number(o.subtotal || 0)
      const orderDiscount = Number(o.discount || 0)
      const orderShipping = Number(o.shippingCharge || 0)

      grossSales += orderSubtotal
      totalDiscounts += orderDiscount
      shippingCollected += orderShipping
      totalRevenue += orderTotal

      // Payment method
      const pm = (o.paymentMethod || "OTHER").toUpperCase()
      if (paymentCounts[pm] !== undefined) paymentCounts[pm]++
      else paymentCounts.OTHER++

      // Status
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1

      // Daily trend
      const dateStr = o.createdAt.toISOString().split("T")[0]
      if (!dailyRevenueMap[dateStr]) dailyRevenueMap[dateStr] = { revenue: 0, orders: 0 }
      dailyRevenueMap[dateStr].revenue += orderTotal
      dailyRevenueMap[dateStr].orders += 1

      // Items & COGS
      for (const item of o.items) {
        const itemPrice = Number(item.price || 0)
        const itemQty = item.quantity || 1
        const itemCost = Number(item.variant?.costPrice || 0) * itemQty
        totalCOGS += itemCost

        if (!productStats[item.productId]) {
          productStats[item.productId] = { name: item.productName, units: 0, revenue: 0, cogs: 0 }
        }
        productStats[item.productId].units += itemQty
        productStats[item.productId].revenue += itemPrice * itemQty
        productStats[item.productId].cogs += itemCost
      }
    }

    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const grossProfit = (grossSales - totalDiscounts) - totalCOGS
    const netProfit = totalRevenue - totalCOGS - totalExpenses
    const grossMarginPct = grossSales > 0 ? Math.round((grossProfit / grossSales) * 100) : 0
    const netMarginPct = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0

    // Expenses by Category
    const expensesByCategory: Record<string, number> = {}
    expenses.forEach((e) => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + Number(e.amount)
    })

    const paymentData = [
      { name: "bKash", value: paymentCounts.BKASH, fill: "#ec4899" },
      { name: "Nagad", value: paymentCounts.NAGAD, fill: "#f97316" },
      { name: "Cash on Delivery", value: paymentCounts.COD, fill: "#10b981" },
      { name: "Card / Other", value: paymentCounts.CARD + paymentCounts.OTHER, fill: "#3b82f6" },
    ].filter(p => p.value > 0)

    const statusData = Object.entries(statusCounts).map(([name, count]) => ({
      name,
      count,
    }))

    const revenueData = Object.entries(dailyRevenueMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, val]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: Math.round(val.revenue),
        orders: val.orders,
      }))

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(p => ({
        ...p,
        grossProfit: p.revenue - p.cogs,
        marginPct: p.revenue > 0 ? Math.round(((p.revenue - p.cogs) / p.revenue) * 100) : 0,
      }))

    // Raw export rows
    const exportData = orders.map(o => ({
      OrderNumber: o.orderNumber,
      Date: o.createdAt.toISOString().split("T")[0],
      Status: o.status,
      Customer: o.shippingName,
      Phone: o.shippingPhone,
      PaymentMethod: o.paymentMethod,
      PaymentStatus: o.paymentStatus,
      Subtotal: Number(o.subtotal || 0),
      Discount: Number(o.discount || 0),
      Shipping: Number(o.shippingCharge || 0),
      Total: Number(o.total || 0),
    }))

    return NextResponse.json({
      summary: {
        totalOrders,
        grossSales,
        totalDiscounts,
        shippingCollected,
        totalRevenue,
        averageOrderValue,
        newCustomers,
      },
      pnl: {
        revenue: totalRevenue,
        grossSales,
        discounts: totalDiscounts,
        shippingCollected,
        cogs: totalCOGS,
        grossProfit,
        grossMarginPct,
        expenses: totalExpenses,
        netProfit,
        netMarginPct,
        expensesByCategory: Object.entries(expensesByCategory).map(([name, value]) => ({ name, value })),
      },
      paymentData,
      statusData,
      revenueData,
      topProducts,
      exportData,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
