"use client"

import { useState, useRef, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader"
import { StatCard } from "@/components/admin/ui/StatCard"
import { StatusBadge } from "@/components/admin/ui/StatusBadge"
import { EmptyState } from "@/components/admin/ui/EmptyState"
import AdminPagination from "@/components/admin/AdminPagination"
import {
  Package,
  Search,
  Check,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Save,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Minus,
  Wand2,
  X,
  TrendingUp,
  FileSpreadsheet,
  Baby,
  Tag,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface InventoryVariant {
  id: string
  size: string
  color: string
  sku: string
  stock: number
  price: number | null
  costPrice: number
  product: {
    id: string
    name: string
    slug: string
    price: number
    comparePrice?: number | null
    category?: { id: string; name: string } | null
  }
}

interface CategoryOption {
  id: string
  name: string
  slug: string
}

const AGE_STAGE_PRESETS = [
  { label: "All Ages", value: "" },
  { label: "0-3M", value: "0-3M" },
  { label: "3-6M", value: "3-6M" },
  { label: "6-12M", value: "6-12M" },
  { label: "12-18M", value: "12-18M" },
  { label: "18-24M", value: "18-24M" },
  { label: "2-3Y", value: "2-3Y" },
  { label: "3-4Y", value: "3-4Y" },
]

export default function InventoryBulkClient({
  variants,
  categories,
  total,
  page,
  totalPages,
  metrics,
}: {
  variants: InventoryVariant[]
  categories: CategoryOption[]
  total: number
  page: number
  totalPages: number
  metrics: {
    totalVariants: number
    lowStockCount: number
    outOfStockCount: number
    totalValuation: number
  }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Local editable rows state
  const [rows, setRows] = useState(
    variants.map((v) => ({
      ...v,
      effectivePrice: v.price !== null ? v.price : v.product.price,
      isPriceOverridden: v.price !== null,
      dirty: false,
    }))
  )

  const [saving, setSaving] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Current query params
  const currentSearch = searchParams.get("search") || ""
  const currentCategory = searchParams.get("category") || ""
  const currentSize = searchParams.get("size") || ""
  const currentStock = searchParams.get("stock") || ""

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    startTransition(() => {
      router.push(`/admin/inventory?${params.toString()}`)
    })
  }

  // Update cell field
  const updateRow = (
    id: string,
    field: "stock" | "price" | "costPrice" | "sku",
    value: any
  ) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const updated = { ...r, [field]: value, dirty: true }
        if (field === "price") {
          updated.isPriceOverridden = true
          updated.effectivePrice = value
        }
        return updated
      })
    )
  }

  // Quick increment/decrement modifiers
  const modifyStock = (id: string, delta: number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const newStock = Math.max(0, r.stock + delta)
        return { ...r, stock: newStock, dirty: true }
      })
    )
  }

  // Auto-generate SKU based on product & variant attributes
  const generateSku = (id: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const cleanName = r.product.name
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 4)
        const cleanSize = (r.size || "STD").toUpperCase().replace(/[^A-Z0-9]/g, "")
        const cleanColor = (r.color || "DEF").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3)
        const newSku = `MB-${cleanName}-${cleanSize}-${cleanColor}`
        return { ...r, sku: newSku, dirty: true }
      })
    )
    toast.success("SKU code generated")
  }

  // Save batch updates
  const saveBatch = async () => {
    const dirtyRows = rows.filter((r) => r.dirty)
    if (dirtyRows.length === 0) return

    setSaving(true)
    try {
      const updates = dirtyRows.map((r) => ({
        variantId: r.id,
        stock: r.stock,
        costPrice: r.costPrice,
        price: r.isPriceOverridden ? r.effectivePrice : null,
        sku: r.sku,
      }))

      const res = await fetch("/api/admin/inventory/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save updates")

      toast.success(`${data.succeeded} variant(s) updated successfully!`)
      setRows((prev) => prev.map((r) => ({ ...r, dirty: false })))
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to update inventory")
    } finally {
      setSaving(false)
    }
  }

  // Handle CSV Import
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFile) {
      toast.error("Please select a CSV file to upload")
      return
    }

    setImporting(true)
    try {
      const formData = new FormData()
      formData.append("file", importFile)

      const res = await fetch("/api/admin/inventory/import", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Import failed")

      toast.success(data.message || "Inventory imported successfully!")
      setImportModalOpen(false)
      setImportFile(null)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to process CSV file")
    } finally {
      setImporting(false)
    }
  }

  const dirtyCount = rows.filter((r) => r.dirty).length

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <AdminPageHeader
        title="Inventory & Stock Suite"
        description="Comprehensive warehouse inventory control, SKU management, cost & retail price synchronization."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Inventory" },
        ]}
        badge={
          <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 text-xs font-bold text-slate-700">
            {metrics.totalVariants} Variants
          </span>
        }
        actions={
          <>
            <a
              href="/api/admin/inventory/export"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export CSV</span>
            </a>

            <button
              type="button"
              onClick={() => setImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <Upload className="h-3.5 w-3.5 text-slate-500" />
              <span>Import CSV</span>
            </button>

            <button
              type="button"
              onClick={saveBatch}
              disabled={saving || dirtyCount === 0}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-semibold text-white hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-40"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>
                {saving
                  ? "Saving Updates…"
                  : `Save Changes ${dirtyCount > 0 ? `(${dirtyCount})` : ""}`}
              </span>
            </button>
          </>
        }
      />

      {/* KPI Metric Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Catalog Stock"
          value={metrics.totalVariants.toLocaleString()}
          sub="Active product variant SKUs"
          icon={Package}
          color="sky"
        />

        <StatCard
          title="Critical Stockouts"
          value={metrics.outOfStockCount}
          sub={
            metrics.outOfStockCount > 0
              ? "Unavailable for customer checkout"
              : "Zero inventory stockouts"
          }
          icon={AlertCircle}
          color="rose"
          href="/admin/inventory?stock=OUT"
        />

        <StatCard
          title="Low Stock Watchlist"
          value={metrics.lowStockCount}
          sub={
            metrics.lowStockCount > 0
              ? "Running low (≤ 5 units remaining)"
              : "All variants safely stocked"
          }
          icon={AlertTriangle}
          color="amber"
          href="/admin/inventory?stock=LOW"
        />

        <StatCard
          title="Estimated Valuation"
          value={`৳${metrics.totalValuation.toLocaleString()}`}
          sub="Total inventory wholesale value"
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Main Table Card Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {/* Filters & Search Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-3.5">
          {/* Baby Age Stage filter chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              <Baby className="w-3.5 h-3.5 text-sky-500" />
              <span>Stage:</span>
            </div>
            {AGE_STAGE_PRESETS.map((stg) => {
              const isActive = currentSize === stg.value
              return (
                <button
                  key={stg.value}
                  type="button"
                  onClick={() => updateParam("size", stg.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0",
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                  )}
                >
                  {stg.label}
                </button>
              )
            })}
          </div>

          {/* Search, Category, and Stock Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="search"
                defaultValue={currentSearch}
                placeholder="Search by product name, SKU, or color..."
                onChange={(e) => {
                  const v = e.target.value
                  clearTimeout((window as any)._inventorySearchTimer)
                  ;(window as any)._inventorySearchTimer = setTimeout(
                    () => updateParam("search", v),
                    350
                  )
                }}
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>

            {/* Category Filter */}
            <select
              value={currentCategory}
              onChange={(e) => updateParam("category", e.target.value)}
              className="h-9 w-full sm:w-44 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Stock Health Filter */}
            <select
              value={currentStock}
              onChange={(e) => updateParam("stock", e.target.value)}
              className="h-9 w-full sm:w-44 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            >
              <option value="">All Stock Levels</option>
              <option value="OUT">Stockout (0 units)</option>
              <option value="LOW">Low Stock (≤ 5 units)</option>
              <option value="IN_STOCK">Healthy (5+ units)</option>
            </select>

            {(currentSearch || currentCategory || currentSize || currentStock) && (
              <button
                type="button"
                onClick={() => router.push("/admin/inventory")}
                className="inline-flex items-center gap-1 h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Editable Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-5 pr-3">Product & Category</th>
                <th className="py-3.5 px-3 w-48">SKU Code</th>
                <th className="py-3.5 px-3">Size / Age</th>
                <th className="py-3.5 px-3">Color</th>
                <th className="py-3.5 px-3 w-52">Stock & Modifiers</th>
                <th className="py-3.5 px-3 w-36">Purchase Cost</th>
                <th className="py-3.5 px-3 w-36">Selling Price</th>
                <th className="py-3.5 px-3 text-center">Margin</th>
                <th className="py-3.5 pr-5 pl-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-0">
                    <EmptyState
                      icon={Package}
                      title="No inventory variants found"
                      description="No items match your active search, category, or stock level criteria."
                      className="border-0 rounded-none py-14"
                    />
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const isOut = row.stock === 0
                  const isLow = row.stock > 0 && row.stock <= 5
                  const sellingPrice = row.effectivePrice
                  const costPrice = row.costPrice || 0
                  const profit = sellingPrice - costPrice
                  const marginPercent =
                    sellingPrice > 0 ? Math.round((profit / sellingPrice) * 100) : 0

                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "transition-colors duration-150 hover:bg-slate-50/60",
                        row.dirty && "bg-amber-50/70"
                      )}
                    >
                      {/* Product Name & Category */}
                      <td className="py-3.5 pl-5 pr-3">
                        <div className="min-w-0 max-w-[200px]">
                          <Link
                            href={`/admin/products/${row.product.id}`}
                            className="font-semibold text-slate-900 hover:text-sky-600 transition-colors truncate block"
                            title={row.product.name}
                          >
                            {row.product.name}
                          </Link>
                          <span className="inline-block text-[11px] text-slate-400 mt-0.5">
                            {row.product.category?.name || "Uncategorized"}
                          </span>
                        </div>
                      </td>

                      {/* SKU with Auto-generate tool */}
                      <td className="py-3.5 px-3">
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={row.sku}
                            onChange={(e) =>
                              updateRow(row.id, "sku", e.target.value.toUpperCase())
                            }
                            placeholder="SKU-XXXX"
                            className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 pr-7 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 transition-all uppercase"
                          />
                          <button
                            type="button"
                            onClick={() => generateSku(row.id)}
                            title="Auto-generate SKU"
                            className="absolute right-1.5 p-1 text-slate-400 hover:text-sky-600 transition-colors"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Size / Age */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-100">
                          {row.size || "Standard"}
                        </span>
                      </td>

                      {/* Color */}
                      <td className="py-3.5 px-3">
                        <span className="text-slate-600">{row.color || "Default"}</span>
                      </td>

                      {/* Stock with quick modifier buttons */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => modifyStock(row.id, -1)}
                              className="h-7 w-6 flex items-center justify-center rounded-l-lg border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold"
                              title="-1 unit"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={0}
                              value={row.stock}
                              onChange={(e) =>
                                updateRow(
                                  row.id,
                                  "stock",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className={cn(
                                "h-7 w-14 border-y border-slate-200 px-1 text-center text-xs font-bold font-heading focus:bg-white focus:outline-none focus:ring-1 transition-all",
                                isOut
                                  ? "bg-rose-50 text-rose-700"
                                  : isLow
                                  ? "bg-amber-50 text-amber-800"
                                  : "bg-slate-50/50 text-slate-900"
                              )}
                            />
                            <button
                              type="button"
                              onClick={() => modifyStock(row.id, 1)}
                              className="h-7 w-6 flex items-center justify-center rounded-r-lg border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold"
                              title="+1 unit"
                            >
                              +
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => modifyStock(row.id, 5)}
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-sky-100 hover:text-sky-700 border border-slate-200"
                              title="+5 units"
                            >
                              +5
                            </button>
                            <button
                              type="button"
                              onClick={() => modifyStock(row.id, 10)}
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-sky-100 hover:text-sky-700 border border-slate-200"
                              title="+10 units"
                            >
                              +10
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Purchase Cost Price */}
                      <td className="py-3.5 px-3">
                        <div className="relative flex items-center">
                          <span className="absolute left-2.5 text-xs font-semibold text-slate-400">
                            ৳
                          </span>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={row.costPrice}
                            onChange={(e) =>
                              updateRow(
                                row.id,
                                "costPrice",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-6 pr-2 text-xs font-bold font-heading text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 transition-all"
                          />
                        </div>
                      </td>

                      {/* Selling Price (Inherited from product or custom) */}
                      <td className="py-3.5 px-3">
                        <div className="relative flex items-center">
                          <span className="absolute left-2.5 text-xs font-semibold text-slate-400">
                            ৳
                          </span>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={row.effectivePrice}
                            onChange={(e) =>
                              updateRow(
                                row.id,
                                "price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className={cn(
                              "h-8 w-full rounded-lg border pl-6 pr-2 text-xs font-bold font-heading text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-400 transition-all",
                              row.isPriceOverridden
                                ? "border-sky-300 bg-sky-50/50"
                                : "border-slate-200 bg-slate-50/70"
                            )}
                          />
                        </div>
                      </td>

                      {/* Profit Margin Indicator */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold border",
                            marginPercent >= 40
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : marginPercent > 0
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          )}
                          title={`Profit: ৳${profit.toFixed(0)} per unit`}
                        >
                          {marginPercent}%
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 pr-5 pl-3 text-right">
                        <StatusBadge
                          status={
                            isOut
                              ? "OUT_OF_STOCK"
                              : isLow
                              ? "LOW_STOCK"
                              : "IN_STOCK"
                          }
                          size="sm"
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-side Pagination footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <AdminPagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/inventory"
          />
        </div>
      </div>

      {/* CSV Import Modal Dialog */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/75">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-sky-600" />
                <h3 className="font-heading text-base font-bold text-slate-900">
                  Bulk CSV Inventory Import
                </h3>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload a CSV spreadsheet with updated stock quantities, wholesale purchase costs, and retail prices. Column headers can include{" "}
                <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">
                  SKU
                </code>
                ,{" "}
                <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">
                  Stock
                </code>
                ,{" "}
                <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">
                  Purchase Cost
                </code>
                , and{" "}
                <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">
                  Selling Price
                </code>
                .
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-sky-50/30 transition-all"
              >
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-800">
                  {importFile ? importFile.name : "Click to select or drop CSV file"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supported format: .csv (Max 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing || !importFile}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-2xs"
                >
                  {importing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{importing ? "Processing CSV…" : "Upload & Sync"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
