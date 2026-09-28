import Link from "next/link"
import prisma from "@/lib/prisma"
import RevenueChart from "@/components/admin/RevenueChart"
import { StatCard } from "@/components/admin/ui/StatCard"
import { StatusBadge } from "@/components/admin/ui/StatusBadge"
import { AdminCard } from "@/components/admin/ui/AdminCard"
import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Clock,
  AlertTriangle,
  RotateCcw,
  ArrowUpRight,
  ChevronRight,
  PlusCircle,
  ExternalLink,
  CreditCard,
  Ticket,
  Truck,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

  const fourteenDaysAgo = new Date(today)
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13)

  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)

  const prevWeekSameDayStart = new Date(today)
  prevWeekSameDayStart.setDate(prevWeekSameDayStart.getDate() - 7)

  const prevWeekSameDayEnd = new Date(today)
  prevWeekSameDayEnd.setDate(prevWeekSameDayEnd.getDate() - 6)

  const [
    ordersToday,
    ordersPrevWeekSameDay,
    pendingOrders,
    customersTotal,
    newCustomersToday,
    lowStockCount,
    outOfStockCount,
    pendingReturns,
    pendingGiftCards,
    revenueOrdersLast7d,
    revenueOrdersPrev7d,
    revenue30d,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }).catch(() => 0),
    prisma.order
      .count({
        where: {
          createdAt: {
            gte: prevWeekSameDayStart,
            lt: prevWeekSameDayEnd,
          },
        },
      })
      .catch(() => 0),
    prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED"] } } }).catch(() => 0),
    prisma.user.count({ where: { role: "CUSTOMER" } }).catch(() => 0),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: today } } }).catch(() => 0),
    prisma.productVariant.count({ where: { stock: { lte: 5, gt: 0 } } }).catch(() => 0),
    prisma.productVariant.count({ where: { stock: 0 } }).catch(() => 0),
    prisma.returnRequest.count({ where: { status: "PENDING" } }).catch(() => 0),
    prisma.giftCard.count({ where: { paymentStatus: "PENDING_VERIFICATION" } }).catch(() => 0),
    prisma.order
      .findMany({
        where: { createdAt: { gte: sevenDaysAgo }, status: { not: "CANCELLED" } },
        select: { createdAt: true, total: true },
      })
      .catch(() => []),
    prisma.order
      .findMany({
        where: {
          createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
          status: { not: "CANCELLED" },
        },
        select: { total: true },
      })
      .catch(() => []),
    prisma.order
      .aggregate({
        where: { createdAt: { gte: thirtyDaysAgo }, status: { not: "CANCELLED" } },
        _sum: { total: true },
      })
      .catch(() => ({ _sum: { total: 0 } })),
    prisma.order
      .findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: { take: 1, select: { productName: true, quantity: true } },
        },
      })
      .catch(() => []),
  ])

  // Revenue calculation & day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const revenueByDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(sevenDaysAgo)
    date.setDate(date.getDate() + i)
    const total = revenueOrdersLast7d
      .filter((o) => new Date(o.createdAt).toDateString() === date.toDateString())
      .reduce((s, o) => s + Number(o.total), 0)
    return { name: dayNames[date.getDay()], total }
  })

  const revenueToday = revenueOrdersLast7d
    .filter((o) => new Date(o.createdAt).toDateString() === today.toDateString())
    .reduce((s, o) => s + Number(o.total), 0)

  const revenueLast7dTotal = revenueOrdersLast7d.reduce((s, o) => s + Number(o.total), 0)
  const revenuePrev7dTotal = revenueOrdersPrev7d.reduce((s, o) => s + Number(o.total), 0)

  const revenueGrowth =
    revenuePrev7dTotal > 0
      ? Math.round(((revenueLast7dTotal - revenuePrev7dTotal) / revenuePrev7dTotal) * 100)
      : revenueLast7dTotal > 0
      ? 100
      : 0

  const revenue30dTotal = Number(revenue30d._sum.total || 0)
  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  // Actionable Alerts
  const alerts = [
    pendingOrders > 0 && {
      href: "/admin/orders",
      icon: Clock,
      color: "amber",
      title: "Pending Orders",
      text: `${pendingOrders} order${pendingOrders > 1 ? "s" : ""} need review & confirmation`,
    },
    outOfStockCount > 0 && {
      href: "/admin/inventory",
      icon: AlertTriangle,
      color: "rose",
      title: "Stockouts",
      text: `${outOfStockCount} variant${outOfStockCount > 1 ? "s" : ""} completely out of stock`,
    },
    lowStockCount > 0 && {
      href: "/admin/inventory",
      icon: Package,
      color: "orange",
      title: "Low Inventory",
      text: `${lowStockCount} variant${lowStockCount > 1 ? "s" : ""} running low (≤ 5 units)`,
    },
    pendingReturns > 0 && {
      href: "/admin/returns",
      icon: RotateCcw,
      color: "violet",
      title: "Returns",
      text: `${pendingReturns} customer exchange/return request${pendingReturns > 1 ? "s" : ""}`,
    },
    pendingGiftCards > 0 && {
      href: "/admin/gift-cards",
      icon: CreditCard,
      color: "sky",
      title: "Gift Cards",
      text: `${pendingGiftCards} gift card purchase${pendingGiftCards > 1 ? "s" : ""} awaiting verification`,
    },
  ].filter(Boolean) as {
    href: string
    icon: any
    color: string
    title: string
    text: string
  }[]

  const alertColors: Record<string, string> = {
    amber: "bg-amber-500/10 border-amber-500/25 text-amber-900 hover:bg-amber-500/15",
    rose: "bg-rose-500/10 border-rose-500/25 text-rose-900 hover:bg-rose-500/15",
    orange: "bg-orange-500/10 border-orange-500/25 text-orange-900 hover:bg-orange-500/15",
    violet: "bg-violet-500/10 border-violet-500/25 text-violet-900 hover:bg-violet-500/15",
    sky: "bg-sky-500/10 border-sky-500/25 text-sky-900 hover:bg-sky-500/15",
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">
              Overview Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{dateLabel}</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/orders/new"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-sky-600" />
            <span>Create Order</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-xs font-semibold text-white hover:from-amber-600 hover:to-amber-700 transition-all shadow-md shadow-amber-500/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Priority Store Action Banners */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {alerts.map((a, i) => (
            <Link
              key={i}
              href={a.href}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-xs font-medium transition-all group ${
                alertColors[a.color]
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <a.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{a.text}</span>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Revenue Today"
          value={`৳${revenueToday.toLocaleString()}`}
          sub={`৳${revenue30dTotal.toLocaleString()} · past 30 days`}
          trend={{
            value: `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth}% 7d`,
            positive: revenueGrowth >= 0,
          }}
          icon={TrendingUp}
          color="amber"
          href="/admin/reports"
        />

        <StatCard
          title="Orders Today"
          value={ordersToday}
          sub={pendingOrders > 0 ? `${pendingOrders} orders pending confirmation` : "All orders confirmed"}
          trend={{
            value: `${ordersToday >= ordersPrevWeekSameDay ? "+" : ""}${
              ordersToday - ordersPrevWeekSameDay
            } vs lw`,
            positive: ordersToday >= ordersPrevWeekSameDay,
          }}
          icon={ShoppingCart}
          color="sky"
          href="/admin/orders"
        />

        <StatCard
          title="Active Parents / VIPs"
          value={customersTotal.toLocaleString()}
          sub={newCustomersToday > 0 ? `+${newCustomersToday} registered today` : "No new registrations today"}
          icon={Users}
          color="violet"
          href="/admin/customers"
        />

        <StatCard
          title="Stock Watchlist"
          value={lowStockCount + outOfStockCount}
          sub={outOfStockCount > 0 ? `${outOfStockCount} critical stockouts` : "Inventory healthy"}
          icon={Package}
          color={outOfStockCount > 0 ? "rose" : "emerald"}
          href="/admin/inventory"
        />
      </div>

      {/* Analytics Chart & Recent Orders Split View */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Revenue Analytics Chart */}
        <div className="lg:col-span-3">
          <AdminCard
            title="Revenue Performance"
            description="Daily sales aggregate over the last 7 days"
            action={
              <Link
                href="/admin/reports"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <span>Full Reports</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <RevenueChart data={revenueByDay} />
          </AdminCard>
        </div>

        {/* Recent Orders Live Stream */}
        <div className="lg:col-span-2">
          <AdminCard
            title="Recent Orders"
            description="Live feed of incoming customer purchases"
            noPadding
            action={
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors"
              >
                <span>View all</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No orders placed yet
                </div>
              ) : (
                recentOrders.map((order: any) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                          {order.orderNumber}
                        </span>
                        <StatusBadge status={order.status} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {order.user?.name || order.shippingName || "Guest Parent"}
                        {order.items?.[0] ? ` · ${order.items[0].productName}` : ""}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-heading text-xs font-bold text-slate-900">
                        ৳{Number(order.total).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </AdminCard>
        </div>
      </div>

      {/* Quick Access Utility Grid */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">
          Quick Workspaces
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { href: "/admin/products", label: "Catalog", icon: Package, count: "Products" },
            { href: "/admin/orders", label: "Fulfillment", icon: ShoppingCart, count: "Orders" },
            { href: "/admin/customers", label: "Parents", icon: Users, count: "Profiles" },
            { href: "/admin/gift-cards", label: "Gift Cards", icon: CreditCard, count: "Vouchers" },
            { href: "/admin/coupons", label: "Coupons", icon: Ticket, count: "Discounts" },
            { href: "/admin/shipping-zones", label: "Logistics", icon: Truck, count: "Delivery" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-sky-300 hover:shadow-sm hover:shadow-sky-50 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-sky-500/10 flex items-center justify-center transition-colors">
                <item.icon className="w-4.5 h-4.5 text-slate-500 group-hover:text-sky-600 transition-colors" />
              </div>
              <span className="font-heading text-xs font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                {item.label}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {item.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
