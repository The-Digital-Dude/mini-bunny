import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

function toCSV(rows: Record<string, any>[]): string {
  if (!rows.length) return ""
  const headers = Object.keys(rows[0])
  const escape = (v: any) => {
    const s = String(v ?? "").replace(/"/g, '""')
    return s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r") ? `"${s}"` : s
  }
  return [
    headers.join(","),
    ...rows.map(r => headers.map(h => escape(r[h])).join(",")),
  ].join("\r\n")
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const type = req.nextUrl.searchParams.get("type") || "orders"
  const from = req.nextUrl.searchParams.get("from")
  const to = req.nextUrl.searchParams.get("to")

  const dateFilter = from || to ? {
    createdAt: {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to + "T23:59:59.999Z") } : {}),
    },
  } : {}

  let csv = ""
  let filename = ""

  if (type === "orders") {
    const orders = await prisma.order.findMany({
      where: dateFilter,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: {
          include: {
            variant: { select: { sku: true, costPrice: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const rows = orders.map(o => {
      const cogs = o.items.reduce((s, i) => s + (Number(i.variant?.costPrice || 0) * i.quantity), 0)
      const grossMargin = Number(o.total || 0) - cogs
      return {
        orderNumber: o.orderNumber,
        date: o.createdAt.toISOString().split("T")[0],
        status: o.status,
        customerName: o.user?.name || o.shippingName,
        customerPhone: o.user?.phone || o.shippingPhone,
        customerEmail: o.user?.email || o.guestEmail || "",
        shippingAddress: `${o.shippingAddress || ""}, ${o.shippingDistrict || ""}, ${o.shippingDivision || ""}`.trim(),
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        subtotal: Number(o.subtotal || 0),
        discount: Number(o.discount || 0),
        shippingCharge: Number(o.shippingCharge || 0),
        total: Number(o.total || 0),
        estimatedCOGS: cogs,
        grossMargin: grossMargin,
        itemsCount: o.items.reduce((s, i) => s + i.quantity, 0),
        itemsSummary: o.items.map(i => `${i.productName} [${i.size || "-"}/${i.color || "-"}] x${i.quantity} @৳${Number(i.price)}`).join(" | "),
      }
    })
    csv = toCSV(rows)
    filename = `mini-bunny-orders-${Date.now()}.csv`

  } else if (type === "inventory") {
    const variants = await prisma.productVariant.findMany({
      include: {
        product: {
          select: { name: true, price: true, category: { select: { name: true } }, brand: { select: { name: true } } },
        },
      },
      orderBy: { sku: "asc" },
    })

    const rows = variants.map(v => {
      const retailPrice = Number(v.price ?? v.product.price ?? 0)
      const costPrice = Number(v.costPrice || 0)
      const totalValuation = v.stock * costPrice
      const potentialRevenue = v.stock * retailPrice
      const marginPerUnit = retailPrice - costPrice
      const marginPct = retailPrice > 0 ? Math.round((marginPerUnit / retailPrice) * 100) : 0

      return {
        sku: v.sku,
        productName: v.product.name,
        category: v.product.category?.name || "Uncategorized",
        brand: v.product.brand?.name || "Mini Bunny",
        size: v.size || "-",
        color: v.color || "-",
        stockUnits: v.stock,
        purchaseCostPrice: costPrice,
        sellingPrice: retailPrice,
        totalInventoryCost: totalValuation,
        potentialRetailValue: potentialRevenue,
        grossMarginPerUnit: marginPerUnit,
        marginPercentage: `${marginPct}%`,
      }
    })
    csv = toCSV(rows)
    filename = `mini-bunny-inventory-valuation-${Date.now()}.csv`

  } else if (type === "customers") {
    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: {
        orders: { select: { total: true, createdAt: true, status: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const rows = customers.map(c => {
      const validOrders = c.orders.filter(o => o.status !== "CANCELLED")
      const ltv = validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
      const lastOrder = validOrders.length
        ? validOrders.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0].createdAt.toISOString().split("T")[0]
        : "None"
      const vipTier = ltv >= 15000 ? "VIP Platinum" : ltv >= 7500 ? "VIP Gold" : ltv >= 3000 ? "Silver" : "Standard"

      return {
        customerId: c.id,
        name: c.name || "Customer",
        email: c.email,
        phone: c.phone || "—",
        registeredDate: c.createdAt.toISOString().split("T")[0],
        totalOrdersCount: c._count.orders,
        completedOrders: validOrders.length,
        lifetimeSpend: ltv,
        tier: vipTier,
        lastOrderDate: lastOrder,
      }
    })
    csv = toCSV(rows)
    filename = `mini-bunny-customers-${Date.now()}.csv`

  } else if (type === "products") {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        variants: { select: { sku: true, size: true, color: true, stock: true, price: true, costPrice: true } },
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const rows = products.map(p => {
      const totalStock = p.variants.reduce((s, v) => s + v.stock, 0)
      const variantSkus = p.variants.map(v => v.sku).filter(Boolean).join(", ")
      return {
        productId: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category?.name || "",
        brand: p.brand?.name || "Mini Bunny",
        defaultRetailPrice: Number(p.price || 0),
        comparePrice: Number(p.comparePrice || 0),
        totalStock: totalStock,
        variantsCount: p.variants.length,
        skus: variantSkus,
        isActive: p.isActive ? "YES" : "NO",
        totalSoldOrders: p._count.orderItems,
        createdAt: p.createdAt.toISOString().split("T")[0],
      }
    })
    csv = toCSV(rows)
    filename = `mini-bunny-products-${Date.now()}.csv`

  } else if (type === "pnl") {
    const [orders, expenses] = await Promise.all([
      prisma.order.findMany({
        where: {
          ...dateFilter,
          status: { not: "CANCELLED" },
        },
        include: {
          items: {
            include: {
              variant: { select: { costPrice: true } },
            },
          },
        },
      }).catch(() => []),

      prisma.expense.findMany({
        where: from || to ? {
          date: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to + "T23:59:59.999Z") } : {}),
          },
        } : {},
      }).catch(() => []),
    ])

    // Group by Date
    const dailyMap: Record<string, {
      date: string
      grossSales: number
      discounts: number
      shipping: number
      netRevenue: number
      cogs: number
      expenses: number
    }> = {}

    for (const o of orders) {
      const ds = o.createdAt.toISOString().split("T")[0]
      if (!dailyMap[ds]) {
        dailyMap[ds] = { date: ds, grossSales: 0, discounts: 0, shipping: 0, netRevenue: 0, cogs: 0, expenses: 0 }
      }
      dailyMap[ds].grossSales += Number(o.subtotal || 0)
      dailyMap[ds].discounts += Number(o.discount || 0)
      dailyMap[ds].shipping += Number(o.shippingCharge || 0)
      dailyMap[ds].netRevenue += Number(o.total || 0)

      for (const item of o.items) {
        dailyMap[ds].cogs += Number(item.variant?.costPrice || 0) * item.quantity
      }
    }

    for (const exp of expenses) {
      const ds = exp.date.toISOString().split("T")[0]
      if (!dailyMap[ds]) {
        dailyMap[ds] = { date: ds, grossSales: 0, discounts: 0, shipping: 0, netRevenue: 0, cogs: 0, expenses: 0 }
      }
      dailyMap[ds].expenses += Number(exp.amount || 0)
    }

    const rows = Object.values(dailyMap)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(d => {
        const grossProfit = (d.grossSales - d.discounts) - d.cogs
        const netProfit = d.netRevenue - d.cogs - d.expenses
        const marginPct = d.netRevenue > 0 ? `${Math.round((netProfit / d.netRevenue) * 100)}%` : "0%"
        return {
          date: d.date,
          grossSales: d.grossSales,
          discounts: d.discounts,
          shippingCollected: d.shipping,
          netRevenue: d.netRevenue,
          cogs: d.cogs,
          grossProfit: grossProfit,
          operatingExpenses: d.expenses,
          netProfit: netProfit,
          netMargin: marginPct,
        }
      })

    csv = toCSV(rows)
    filename = `mini-bunny-pnl-summary-${Date.now()}.csv`

  } else {
    return NextResponse.json({ error: "Invalid type. Use: orders | inventory | customers | products | pnl" }, { status: 400 })
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
