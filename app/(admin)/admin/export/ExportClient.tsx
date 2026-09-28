"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Download, FileText, Users, ShoppingBag, DollarSign,
  PackageCheck, Calendar, ArrowRight, ShieldCheck, CheckCircle2,
  FileSpreadsheet, Receipt, Sparkles
} from "lucide-react"
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader"
import { AdminCard } from "@/components/admin/ui/AdminCard"
import { toast } from "sonner"

const EXPORT_PRESETS = [
  {
    id: "orders",
    title: "Full Orders Ledger",
    subtitle: "Complete transaction and courier fulfillment records",
    icon: FileText,
    accent: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    badge: "Most Popular",
    fields: [
      "Order Number & Date", "Customer Contact & Phone", "Full Shipping Address",
      "Payment Method & Status", "Subtotal, Discount & Shipping", "Estimated COGS & Gross Margin",
      "Item Breakdown & Sizes"
    ],
  },
  {
    id: "inventory",
    title: "Stock Valuation & Margins",
    subtitle: "Active variant inventory, cost prices & total valuation in ৳",
    icon: PackageCheck,
    accent: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    badge: "Financial Audit",
    fields: [
      "SKU & Product Name", "Size & Color Attributes", "Current Stock Units",
      "Unit Purchase Cost (COGS)", "Selling Retail Price", "Total Stock Valuation (৳)",
      "Gross Profit Margin %"
    ],
  },
  {
    id: "customers",
    title: "Customer Lifetime Value (LTV)",
    subtitle: "Customer acquisition, order frequency, and VIP buyer segmentation",
    icon: Users,
    accent: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    badge: "Marketing",
    fields: [
      "Customer ID & Full Name", "Email & Verified Phone", "Registration Date",
      "Total Orders Count", "Lifetime Spend (৳)", "VIP Loyalty Tier",
      "Most Recent Order Date"
    ],
  },
  {
    id: "products",
    title: "Product Catalog Master",
    subtitle: "Complete product catalog with variants, pricing & units sold",
    icon: ShoppingBag,
    accent: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    badge: "Catalog",
    fields: [
      "Product Title & Slug", "Category & Brand", "Base & Compare Pricing",
      "Total Inventory Count", "Variant Count & SKUs", "Published Status",
      "Lifetime Units Sold"
    ],
  },
  {
    id: "pnl",
    title: "P&L Financial Ledger",
    subtitle: "Daily & monthly accounting sheet with revenue, COGS, expenses & net profit",
    icon: DollarSign,
    accent: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    badge: "Accounting",
    fields: [
      "Date / Billing Cycle", "Gross Catalog Sales", "Discounts & Promo Deductions",
      "Shipping Collected", "Inventory Product COGS", "Operating Expenses",
      "Net Realized Profit & Margin %"
    ],
  },
]

export default function ExportClient() {
  const [selectedPreset, setSelectedPreset] = useState("orders")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [loading, setLoading] = useState(false)

  // Quick date ranges
  function applyQuickDate(days: number) {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - (days - 1))
    setFrom(start.toISOString().split("T")[0])
    setTo(end.toISOString().split("T")[0])
  }

  function clearDates() {
    setFrom("")
    setTo("")
  }

  async function handleExport() {
    setLoading(true)
    const params = new URLSearchParams({ type: selectedPreset })
    if (from) params.set("from", from)
    if (to) params.set("to", to)

    try {
      const res = await fetch(`/api/admin/export?${params}`)
      if (!res.ok) {
        toast.error("Export failed. Please check your date range.")
        setLoading(false)
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const dateSuffix = new Date().toISOString().split("T")[0]
      a.download = `mini-bunny-${selectedPreset}-${dateSuffix}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(linkCleaner(url))
      toast.success(`${EXPORT_PRESETS.find(p => p.id === selectedPreset)?.title} exported successfully!`)
    } catch {
      toast.error("Error generating export file")
    } finally {
      setLoading(false)
    }
  }

  function linkCleaner(url: string) {
    const dummy = document.createElement("span")
    URL.revokeObjectURL(url)
    return dummy
  }

  const currentPreset = EXPORT_PRESETS.find(p => p.id === selectedPreset) || EXPORT_PRESETS[0]

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="1-Click Data Export Center"
        description="Download complete business intelligence spreadsheets, inventory valuation, customer LTV, and accounting ledgers in standard CSV format"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Analytics", href: "/admin/analytics" },
          { label: "Export Center" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              Analytics Dashboard
            </Link>
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              Financial Reports
            </Link>
          </div>
        }
      />

      {/* ── Preset Selection Grid ─────────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          Select Export Dataset Preset
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXPORT_PRESETS.map((p) => {
            const isSelected = selectedPreset === p.id
            const Icon = p.icon
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPreset(p.id)}
                className={`relative p-5 rounded-2xl border text-left transition-all duration-200 ${
                  isSelected
                    ? "bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-md scale-[1.01]"
                    : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl border ${p.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                    isSelected ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                  }`}>
                    {p.badge}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.subtitle}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold">
                  <span className={isSelected ? "text-amber-600" : "text-slate-400"}>
                    {isSelected ? "Selected" : "Click to select"}
                  </span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "text-amber-600 translate-x-0.5" : "text-slate-300"}`} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Export Configuration & Download Box ──────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Date Filter & Trigger */}
        <div className="lg:col-span-2">
          <AdminCard
            title={`Configure: ${currentPreset.title}`}
            description="Select an optional date range to filter your export file"
          >
            <div className="space-y-5 pt-2">
              {/* Quick Range Buttons */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Quick Date Presets
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => applyQuickDate(7)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => applyQuickDate(30)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                  >
                    Last 30 Days
                  </button>
                  <button
                    onClick={() => applyQuickDate(90)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                  >
                    Last 90 Days
                  </button>
                  <button
                    onClick={clearDates}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  >
                    All Historical Records
                  </button>
                </div>
              </div>

              {/* Custom Date Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Start Date (From)</label>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">End Date (To)</label>
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Download Trigger */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={handleExport}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {loading ? "Generating CSV file..." : `Download ${currentPreset.title} (.CSV)`}
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Standard UTF-8 CSV formatted file compatible with Microsoft Excel, Google Sheets, and accounting software.
                </p>
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Dataset Schema & Included Columns */}
        <div className="lg:col-span-1">
          <AdminCard
            title="Included Data Fields"
            description="Columns and attributes compiled into this export"
          >
            <div className="space-y-2.5 pt-2">
              {currentPreset.fields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium text-slate-700">{field}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2 text-xs text-amber-800">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px]">
                Exported files contain live database records. Please handle customer contact info securely in compliance with data privacy.
              </p>
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  )
}
