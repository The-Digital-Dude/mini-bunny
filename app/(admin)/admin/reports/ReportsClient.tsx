"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart, Pie,
} from "recharts"
import {
  TrendingUp, ShoppingCart, DollarSign, Users, Download,
  FileSpreadsheet, ArrowUpRight, Receipt, Package, CheckCircle2,
  Calendar, CreditCard, ChevronRight, Layers,
} from "lucide-react"
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader"
import { StatCard } from "@/components/admin/ui/StatCard"
import { AdminCard } from "@/components/admin/ui/AdminCard"
import { toast } from "sonner"

function fmt(n: number) {
  return `৳${Math.round(n || 0).toLocaleString()}`
}

function CustomChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 text-xs text-white shadow-xl backdrop-blur-md">
      <p className="font-semibold text-slate-400 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || "#0284c7" }} />
          <span className="text-slate-300 capitalize">{entry.name}:</span>
          <span className="font-bold font-mono text-white">
            {entry.name?.toLowerCase().includes("orders") ? entry.value : fmt(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ReportsClient() {
  const [range, setRange] = useState("30")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [range])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reports?range=${range}`)
      const json = await res.json()
      setData(json)
    } catch (error) {
      toast.error("Failed to load financial reports")
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (!data?.exportData || data.exportData.length === 0) {
      toast.error("No report data available to export")
      return
    }

    const headers = ["OrderNumber", "Date", "Status", "Customer", "Phone", "PaymentMethod", "PaymentStatus", "Subtotal", "Discount", "Shipping", "Total"]
    const csvContent = [
      headers.join(","),
      ...data.exportData.map((row: any) => [
        `"${row.OrderNumber || ""}"`,
        `"${row.Date || ""}"`,
        `"${row.Status || ""}"`,
        `"${(row.Customer || "").replace(/"/g, '""')}"`,
        `"${row.Phone || ""}"`,
        `"${row.PaymentMethod || ""}"`,
        `"${row.PaymentStatus || ""}"`,
        row.Subtotal,
        row.Discount,
        row.Shipping,
        row.Total,
      ].join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", `mini_bunny_financial_report_${range}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Financial report downloaded successfully!")
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sales & Financial Reports"
        description="Audited financial statements, itemized P&L, payment settlement breakdown, and top-selling product margins"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Analytics", href: "/admin/analytics" },
          { label: "Financial Reports" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Range quick filter pills */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
              {[
                { id: "today", label: "Today" },
                { id: "7", label: "7 Days" },
                { id: "30", label: "30 Days" },
                { id: "90", label: "90 Days" },
                { id: "this_month", label: "This Month" },
                { id: "all", label: "All Time" },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setRange(item.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    range === item.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCSV}
              disabled={loading || !data}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-sm text-slate-400">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p>Compiling audited financial data...</p>
        </div>
      ) : !data ? (
        <div className="py-16 text-center text-rose-500 text-sm font-medium">
          Failed to load reports. Please try refreshing.
        </div>
      ) : (
        <>
          {/* ── KPI Stat Cards ──────────────────────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Net Revenue"
              value={fmt(data.pnl.revenue)}
              sub={`${data.summary.totalOrders} total completed orders`}
              trend={{ value: `Avg ৳${data.summary.averageOrderValue.toLocaleString()}`, positive: true }}
              icon={TrendingUp}
              color="amber"
            />
            <StatCard
              title="Cost of Goods (COGS)"
              value={fmt(data.pnl.cogs)}
              sub="Inventory unit cost deductions"
              trend={{ value: `${data.pnl.grossMarginPct}% Gross Margin`, positive: data.pnl.grossMarginPct >= 30 }}
              icon={Package}
              color="slate"
            />
            <StatCard
              title="Operating Expenses"
              value={fmt(data.pnl.expenses)}
              sub={`${data.pnl.expensesByCategory.length} active expense categories`}
              trend={{ value: "Operating overhead", positive: false }}
              icon={Receipt}
              color="rose"
            />
            <StatCard
              title="Final Net Profit"
              value={fmt(data.pnl.netProfit)}
              sub={`${data.pnl.netMarginPct}% Net Return on Revenue`}
              trend={{ value: `${data.pnl.netMarginPct}% Margin`, positive: data.pnl.netProfit >= 0 }}
              icon={DollarSign}
              color="emerald"
            />
          </div>

          {/* ── Comprehensive P&L Flow Card ───────────────────────────────── */}
          <AdminCard
            title="Itemized Profit & Loss (P&L) Statement"
            description="Clear auditable breakdown from gross sales down to net profit after product costs and operating expenses"
            actions={
              <Link
                href="/admin/expenses"
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                Log an expense <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase">Gross Sales</p>
                <p className="text-xl font-bold font-mono text-slate-900 mt-1">{fmt(data.pnl.grossSales)}</p>
                <p className="text-[11px] text-slate-400 mt-1">Catalog pricing subtotal</p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/60">
                <p className="text-xs font-semibold text-rose-600 uppercase">Discounts Applied</p>
                <p className="text-xl font-bold font-mono text-rose-700 mt-1">- {fmt(data.pnl.discounts)}</p>
                <p className="text-[11px] text-rose-500 mt-1">Promo codes & rules</p>
              </div>

              <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200/60">
                <p className="text-xs font-semibold text-sky-600 uppercase">Shipping Fees</p>
                <p className="text-xl font-bold font-mono text-sky-700 mt-1">+ {fmt(data.pnl.shippingCollected)}</p>
                <p className="text-[11px] text-sky-500 mt-1">Collected from buyers</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
                <p className="text-xs font-semibold text-amber-700 uppercase">Product COGS</p>
                <p className="text-xl font-bold font-mono text-amber-800 mt-1">- {fmt(data.pnl.cogs)}</p>
                <p className="text-[11px] text-amber-600 mt-1">Cost price of items sold</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300">
                <p className="text-xs font-semibold text-emerald-700 uppercase">Net Realized Profit</p>
                <p className="text-xl font-bold font-mono text-emerald-800 mt-1">{fmt(data.pnl.netProfit)}</p>
                <p className="text-[11px] font-semibold text-emerald-600 mt-1">{data.pnl.netMarginPct}% Net Return</p>
              </div>
            </div>

            {/* Expenses breakdown */}
            {data.pnl.expensesByCategory.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Operating Expenses Recorded in Period ({fmt(data.pnl.expenses)})
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {data.pnl.expensesByCategory.map((c: any) => (
                    <div key={c.name} className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs flex items-center gap-2">
                      <span className="text-slate-600">{c.name}:</span>
                      <span className="font-bold font-mono text-slate-900">{fmt(c.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </AdminCard>

          {/* ── Daily Revenue Area Chart ────────────────────────────────────── */}
          <AdminCard
            title="Revenue Timeline"
            description="Daily income curve across selected date period"
          >
            {data.revenueData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-slate-400">
                No revenue records in this timeframe
              </div>
            ) : (
              <div className="pt-2">
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={data.revenueData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                      interval={Math.floor(data.revenueData.length / 7)}
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
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#0284c7"
                      strokeWidth={2.5}
                      fill="url(#reportGrad)"
                      dot={false}
                      activeDot={{ r: 5, fill: "#0284c7", stroke: "#ffffff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </AdminCard>

          {/* ── Top 10 Products & Payment Methods ──────────────────────────── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Top 10 Best Sellers */}
            <div className="lg:col-span-2">
              <AdminCard
                title="Top 10 Best Selling Products"
                description="Ranked by total revenue with units sold and estimated gross margin"
              >
                {data.topProducts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">No product sales in this period</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                          <th className="py-2.5 px-3">Product Name</th>
                          <th className="py-2.5 px-3 text-center">Units</th>
                          <th className="py-2.5 px-3 text-right">Revenue</th>
                          <th className="py-2.5 px-3 text-right">Est. Gross Margin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.topProducts.map((p: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{p.name}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-700">{p.units}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{fmt(p.revenue)}</td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px] ${
                                p.marginPct >= 40 ? "bg-emerald-50 text-emerald-700" : p.marginPct >= 20 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                              }`}>
                                {fmt(p.grossProfit)} ({p.marginPct}%)
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </AdminCard>
            </div>

            {/* Payment Methods */}
            <div className="lg:col-span-1">
              <AdminCard
                title="Payment Distribution"
                description="Orders split by payment channel"
              >
                {data.paymentData.length === 0 ? (
                  <div className="h-52 flex items-center justify-center text-xs text-slate-400">
                    No payment data recorded
                  </div>
                ) : (
                  <div className="space-y-4 pt-1">
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.paymentData}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            innerRadius={36}
                            outerRadius={64}
                            paddingAngle={3}
                          >
                            {data.paymentData.map((entry: any, i: number) => (
                              <Cell key={i} fill={entry.fill} stroke="transparent" />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {data.paymentData.map((entry: any) => (
                        <div key={entry.name} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                            <span className="font-medium text-slate-700">{entry.name}</span>
                          </div>
                          <span className="font-bold font-mono text-slate-900">{entry.value} orders</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </AdminCard>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
