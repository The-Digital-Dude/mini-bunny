"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AreaChart, Area, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart, Pie,
} from "recharts"
import {
  TrendingUp, Users, ShoppingCart, BarChart2,
  AlertCircle, Package, DollarSign, ArrowUpRight,
  FileSpreadsheet, Receipt, Layers, ArrowDownRight, CheckCircle2,
} from "lucide-react"
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader"
import { StatCard } from "@/components/admin/ui/StatCard"
import { AdminCard } from "@/components/admin/ui/AdminCard"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  revenueByDay: { date: string; total: number; orders: number }[]
  revenue7d: number
  revenue30d: number
  revenue90d: number
  aov: number
  orderCount30d: number
  newCustomers: number
  totalCustomers: number
  repeatCustomers: number
  funnelCounts: Record<string, number>
  topProductViews: { name: string; count: number }[]
  topProductCart: { name: string; count: number }[]
  topSearches: { query: string; count: number }[]
  zeroResultSearches: { query: string; count: number }[]
  ordersByStatus: { status: string; count: number }[]
  pnlData: {
    grossSales: number
    discounts: number
    shippingCollected: number
    netRevenue: number
    cogs: number
    grossProfit: number
    grossMarginPct: number
    expenses: number
    netProfit: number
    netMarginPct: number
    expensesByCategory: { name: string; amount: number }[]
  }
  topProductsByRevenue: { name: string; units: number; revenue: number; cogs: number }[]
}

// ─── Colours & labels ─────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  PENDING:    "#f59e0b",
  CONFIRMED:  "#0284c7",
  PROCESSING: "#8b5cf6",
  SHIPPED:    "#6366f1",
  DELIVERED:  "#10b981",
  CANCELLED:  "#ef4444",
  RETURNED:   "#f97316",
}
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending", CONFIRMED: "Confirmed", PROCESSING: "Processing",
  SHIPPED: "Shipped", DELIVERED: "Delivered", CANCELLED: "Cancelled", RETURNED: "Returned",
}

const FUNNEL_STEPS = [
  { key: "page_view",      label: "Page Views",     color: "#f59e0b", icon: Users },
  { key: "add_to_cart",   label: "Add to Cart",    color: "#0284c7", icon: ShoppingCart },
  { key: "checkout_start",label: "Checkout Start",  color: "#8b5cf6", icon: Layers },
  { key: "purchase",      label: "Orders Placed",  color: "#10b981", icon: CheckCircle2 },
]

function fmt(n: number) { return `৳${Math.round(n).toLocaleString()}` }

// ─── Custom Dark Glass Tooltip ────────────────────────────────────────────────

function CustomChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 text-xs text-white shadow-xl backdrop-blur-md">
      <p className="font-semibold text-slate-400 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || "#f59e0b" }} />
          <span className="text-slate-300 capitalize">{entry.name}:</span>
          <span className="font-bold font-mono text-white">
            {entry.name?.toLowerCase().includes("orders") ? entry.value : fmt(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnalyticsDashboard({
  revenueByDay, revenue7d, revenue30d, revenue90d, aov, orderCount30d,
  newCustomers, totalCustomers, repeatCustomers,
  funnelCounts, topProductViews, topProductCart,
  topSearches, zeroResultSearches, ordersByStatus,
  pnlData, topProductsByRevenue,
}: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "pnl" | "funnel" | "products_search">("overview")

  const maxViews = topProductViews[0]?.count ?? 1
  const maxCart  = topProductCart[0]?.count ?? 1
  const maxSearch = topSearches[0]?.count ?? 1

  // Funnel conversion rates
  const funnelRows = FUNNEL_STEPS.map((step, i) => {
    const count = funnelCounts[step.key] ?? 0
    const prev = i === 0 ? count : (funnelCounts[FUNNEL_STEPS[i - 1].key] ?? 0)
    const rate = i === 0 ? 100 : prev > 0 ? Math.round((count / prev) * 100) : 0
    const overallRate = (funnelCounts[FUNNEL_STEPS[0].key] ?? 0) > 0 
      ? Math.round((count / (funnelCounts[FUNNEL_STEPS[0].key] ?? 1)) * 100) 
      : 0
    return { ...step, count, rate, overallRate }
  })

  const pieData = ordersByStatus.filter(o => o.count > 0).map(o => ({
    name: STATUS_LABEL[o.status] ?? o.status,
    value: o.count,
    fill: STATUS_COLOR[o.status] ?? "#94a3b8",
  }))

  const repeatRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Analytics & Intelligence"
        description="Comprehensive e-commerce performance, P&L statements, conversion rates, and product insights (Last 30 Days)"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Analytics" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              Detailed Reports
            </Link>
            <Link
              href="/admin/expenses"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <Receipt className="w-3.5 h-3.5 text-slate-500" />
              Manage Expenses
            </Link>
            <Link
              href="/admin/export"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition shadow-sm"
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              Export Data
            </Link>
          </div>
        }
      />

      {/* ── Top Executive KPI Grid ────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Net Revenue (30d)"
          value={fmt(revenue30d)}
          sub={`৳${revenue7d.toLocaleString()} in last 7 days`}
          trend={{ value: `${pnlData.netMarginPct}% Net Margin`, positive: pnlData.netMarginPct >= 15 }}
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          title="Orders & AOV"
          value={orderCount30d}
          sub={`Avg order: ৳${aov.toLocaleString()}`}
          trend={{ value: `${orderCount30d} orders`, positive: true }}
          icon={ShoppingCart}
          color="sky"
        />
        <StatCard
          title="Net Profit (30d)"
          value={fmt(pnlData.netProfit)}
          sub={`COGS: ৳${Math.round(pnlData.cogs).toLocaleString()}`}
          trend={{ value: `${pnlData.grossMarginPct}% Gross Margin`, positive: pnlData.grossMarginPct >= 30 }}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Customer Retention"
          value={`${repeatRate}%`}
          sub={`${repeatCustomers} repeat of ${totalCustomers} buyers`}
          trend={{ value: `${newCustomers} new (30d)`, positive: true }}
          icon={Users}
          color="violet"
        />
      </div>

      {/* ── Navigation Tabs ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: "overview", label: "Overview & Revenue", icon: BarChart2 },
          { id: "pnl", label: "Sales & P&L Statement", icon: DollarSign },
          { id: "funnel", label: "Conversion Funnel", icon: Layers },
          { id: "products_search", label: "Product & Search Intel", icon: Package },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: OVERVIEW & REVENUE ──────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Revenue Chart */}
          <AdminCard
            title="Revenue & Daily Sales Trend"
            description="Daily orders and net income across the past 30 days (excluding cancelled orders)"
            actions={
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="hidden sm:inline">7d: <strong className="text-slate-900">{fmt(revenue7d)}</strong></span>
                <span className="hidden sm:inline">30d: <strong className="text-slate-900">{fmt(revenue30d)}</strong></span>
                <span>90d: <strong className="text-slate-900">{fmt(revenue90d)}</strong></span>
              </div>
            }
          >
            {revenueByDay.every(d => d.total === 0) ? (
              <div className="h-64 flex flex-col items-center justify-center text-sm text-slate-400">
                <Package className="w-8 h-8 text-slate-300 mb-2" />
                <p>No revenue data recorded yet</p>
              </div>
            ) : (
              <div className="pt-2">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={revenueByDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGradSaaS" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                      interval={Math.floor(revenueByDay.length / 6)}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={v => v === 0 ? "৳0" : `৳${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="Revenue"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      fill="url(#revGradSaaS)"
                      dot={false}
                      activeDot={{ r: 5, fill: "#f59e0b", stroke: "#ffffff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </AdminCard>

          {/* Status Breakdown & Quick Insights */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Orders by Status */}
            <AdminCard
              title="Order Fulfillment Status"
              description="Distribution of all recorded orders by operational status"
            >
              {pieData.length === 0 ? (
                <div className="h-52 flex items-center justify-center text-sm text-slate-400">
                  No order data yet
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
                  <div className="w-full sm:w-1/2 h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={78}
                          paddingAngle={3}
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full sm:w-1/2 space-y-2">
                    {pieData.map(entry => (
                      <div key={entry.name} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-50">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                          <span className="font-medium text-slate-700">{entry.name}</span>
                        </div>
                        <span className="font-bold font-mono text-slate-900">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </AdminCard>

            {/* Quick Profitability Snapshot */}
            <AdminCard
              title="30-Day Margin & Profitability Summary"
              description="Executive snapshot of store margins and operational costs"
            >
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Gross Profit</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">{fmt(pnlData.grossProfit)}</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                    {pnlData.grossMarginPct}% Gross Margin
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Total Operational Expenses</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">{fmt(pnlData.expenses)}</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800">
                    {pnlData.expensesByCategory.length} Categories
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div>
                    <p className="text-xs text-emerald-800 font-medium">Final Net Profit</p>
                    <p className="text-xl font-bold text-emerald-900 mt-0.5">{fmt(pnlData.netProfit)}</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-600 text-white shadow-xs">
                    {pnlData.netMarginPct}% Net Return
                  </span>
                </div>
              </div>
            </AdminCard>
          </div>
        </div>
      )}

      {/* ── TAB 2: SALES & P&L STATEMENT ───────────────────────────────────── */}
      {activeTab === "pnl" && (
        <div className="space-y-6">
          {/* P&L Waterfall Formula Card */}
          <AdminCard
            title="Income & Expenditure Breakdown (P&L)"
            description="Comprehensive financial calculation showing exact inflows, product costs (COGS), and operational expenses"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-xs font-semibold text-slate-500 uppercase">Gross Product Sales</p>
                <p className="text-xl font-bold font-mono text-slate-900 mt-1">{fmt(pnlData.grossSales)}</p>
                <p className="text-[11px] text-slate-400 mt-1">Catalog subtotal</p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/60">
                <p className="text-xs font-semibold text-rose-600 uppercase">Discounts & Promos</p>
                <p className="text-xl font-bold font-mono text-rose-700 mt-1">- {fmt(pnlData.discounts)}</p>
                <p className="text-[11px] text-rose-500 mt-1">Coupons & auto-rules</p>
              </div>

              <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200/60">
                <p className="text-xs font-semibold text-sky-600 uppercase">Shipping Collected</p>
                <p className="text-xl font-bold font-mono text-sky-700 mt-1">+ {fmt(pnlData.shippingCollected)}</p>
                <p className="text-[11px] text-sky-500 mt-1">Customer delivery fees</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
                <p className="text-xs font-semibold text-amber-700 uppercase">Cost of Goods (COGS)</p>
                <p className="text-xl font-bold font-mono text-amber-800 mt-1">- {fmt(pnlData.cogs)}</p>
                <p className="text-[11px] text-amber-600 mt-1">Product unit purchase costs</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300">
                <p className="text-xs font-semibold text-emerald-700 uppercase">Net Realized Profit</p>
                <p className="text-xl font-bold font-mono text-emerald-800 mt-1">{fmt(pnlData.netProfit)}</p>
                <p className="text-[11px] font-semibold text-emerald-600 mt-1">{pnlData.netMarginPct}% Net Margin</p>
              </div>
            </div>

            {/* Expenses Category Pills */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Operating Expenses by Category ({fmt(pnlData.expenses)})
                </h4>
                <Link
                  href="/admin/expenses"
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  Manage expenses <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
              {pnlData.expensesByCategory.length === 0 ? (
                <p className="text-xs text-slate-400">No operating expenses logged for this period.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {pnlData.expensesByCategory.map(c => (
                    <div key={c.name} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700">{c.name}</span>
                      <span className="text-xs font-bold font-mono text-slate-900">{fmt(c.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AdminCard>

          {/* Top Products Margin Table */}
          <AdminCard
            title="Top Revenue & Margin Generating Products"
            description="Unit volume, revenue generated, and estimated gross margin per item"
          >
            {topProductsByRevenue.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No product sales in this period</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3 text-center">Units Sold</th>
                      <th className="py-2.5 px-3 text-right">Revenue (৳)</th>
                      <th className="py-2.5 px-3 text-right">COGS (৳)</th>
                      <th className="py-2.5 px-3 text-right">Estimated Gross Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topProductsByRevenue.map((p, i) => {
                      const margin = p.revenue - p.cogs
                      const marginPct = p.revenue > 0 ? Math.round((margin / p.revenue) * 100) : 0
                      return (
                        <tr key={i} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 font-semibold text-slate-900">{p.name}</td>
                          <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">{p.units}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{fmt(p.revenue)}</td>
                          <td className="py-3 px-3 text-right font-mono text-slate-500">{fmt(p.cogs)}</td>
                          <td className="py-3 px-3 text-right">
                            <span className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-full text-[11px] ${
                              marginPct >= 40 ? "bg-emerald-50 text-emerald-700" : marginPct >= 20 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                            }`}>
                              {fmt(margin)} ({marginPct}%)
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </AdminCard>
        </div>
      )}

      {/* ── TAB 3: CONVERSION FUNNEL ───────────────────────────────────────── */}
      {activeTab === "funnel" && (
        <div className="space-y-6">
          <AdminCard
            title="E-Commerce Conversion Funnel (30d)"
            description="Tracking customer progression from storefront visits down to completed deliveries"
          >
            <div className="space-y-4 pt-2">
              {funnelRows.map((step, i) => (
                <div key={step.key} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: step.color }}
                      >
                        <step.icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{step.label}</p>
                        <p className="text-[11px] text-slate-500">
                          {i === 0 ? "Top of funnel" : `${step.rate}% conversion from ${FUNNEL_STEPS[i - 1].label}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold font-mono text-slate-900">{step.count.toLocaleString()}</p>
                      <p className="text-[11px] font-semibold text-slate-500">
                        {step.overallRate}% overall
                      </p>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: funnelRows[0].count > 0 ? `${(step.count / funnelRows[0].count) * 100}%` : "0%",
                        backgroundColor: step.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {funnelRows[0].count === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">Live funnel tracking active — metrics will accumulate with shopper visits.</p>
            )}
          </AdminCard>

          {/* Viewed vs Added to Cart Comparison */}
          <div className="grid gap-6 lg:grid-cols-2">
            <AdminCard
              title="Most Viewed Products"
              description="Top products attracting traffic on the storefront (30d)"
            >
              {topProductViews.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">No product view events logged yet</p>
              ) : (
                <div className="space-y-3 pt-1">
                  {topProductViews.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-400 w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                        <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-1.5 bg-amber-500 rounded-full"
                            style={{ width: `${(p.count / maxViews) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-bold font-mono text-slate-600 shrink-0">{p.count} views</span>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>

            <AdminCard
              title="Highest Add-to-Cart Intent"
              description="Products most frequently added to shopping carts (30d)"
            >
              {topProductCart.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">No cart events logged yet</p>
              ) : (
                <div className="space-y-3 pt-1">
                  {topProductCart.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-400 w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                        <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-1.5 bg-sky-500 rounded-full"
                            style={{ width: `${(p.count / maxCart) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-bold font-mono text-slate-600 shrink-0">{p.count} carts</span>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>
          </div>
        </div>
      )}

      {/* ── TAB 4: PRODUCT & SEARCH INTELLIGENCE ───────────────────────────── */}
      {activeTab === "products_search" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Searches */}
            <AdminCard
              title="Top Search Queries"
              description="What customers are searching for across the entire storefront"
            >
              {topSearches.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">No search query data recorded yet</p>
              ) : (
                <div className="space-y-2.5 pt-1">
                  {topSearches.map((s, i) => (
                    <div key={s.query} className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-400 w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{s.query}</p>
                        <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-1.5 bg-indigo-500 rounded-full"
                            style={{ width: `${(s.count / maxSearch) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-bold font-mono text-slate-600 shrink-0">{s.count}×</span>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>

            {/* Zero Result Searches Alert */}
            <AdminCard
              title="Zero-Result Searches (Missed Opportunities)"
              description="Searches where customers found 0 products — excellent for inventory planning"
            >
              {zeroResultSearches.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-emerald-800">Zero Unanswered Searches</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">Every customer search found matching products!</p>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <p>
                      Customers searched for these terms but left empty-handed. Consider adding corresponding baby clothes or keywords!
                    </p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {zeroResultSearches.map((s) => (
                      <div key={s.query} className="flex items-center justify-between py-2">
                        <span className="text-xs font-semibold text-slate-800">{s.query}</span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
                          {s.count} searches
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </AdminCard>
          </div>
        </div>
      )}
    </div>
  )
}
