"use client"
import { useState } from "react"
import { Package, Search, Check, AlertTriangle, AlertCircle, Sparkles } from "lucide-react"

interface Variant {
  id: string
  size: string | null
  color: string | null
  stock: number
  price: number
  product: { name: string; slug: string }
}

const AGE_STAGE_PRESETS = [
  { label: "All Sizes", value: "ALL" },
  { label: "0-3M (Newborn)", value: "0-3M" },
  { label: "3-6M (Infant)", value: "3-6M" },
  { label: "6-12M (Baby)", value: "6-12M" },
  { label: "12-18M", value: "12-18M" },
  { label: "18-24M", value: "18-24M" },
  { label: "2-3Y", value: "2-3Y" },
  { label: "3-4Y", value: "3-4Y" },
  { label: "One Size", value: "One Size" },
]

export default function InventoryBulkClient({ variants }: { variants: Variant[] }) {
  const [rows, setRows] = useState(variants.map((v) => ({ ...v, dirty: false })))
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ succeeded: number; failed: number } | null>(null)
  const [search, setSearch] = useState("")
  const [selectedAge, setSelectedAge] = useState("ALL")
  const [stockFilter, setStockFilter] = useState<"ALL" | "LOW" | "OUT">("ALL")

  const update = (id: string, field: "stock" | "price", value: number) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value, dirty: true } : r)))
  }

  const save = async () => {
    const dirty = rows.filter((r) => r.dirty)
    if (dirty.length === 0) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/inventory/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: dirty.map((r) => ({ variantId: r.id, stock: r.stock, price: r.price })) }),
      })
      const data = await res.json()
      setResult(data)
      setRows((prev) => prev.map((r) => ({ ...r, dirty: false })))
    } catch {
      setResult({ succeeded: 0, failed: dirty.length })
    } finally {
      setSaving(false)
    }
  }

  const filtered = rows.filter((r) => {
    const matchesSearch =
      r.product.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.size ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (r.color ?? "").toLowerCase().includes(search.toLowerCase())

    const matchesAge =
      selectedAge === "ALL" || (r.size ?? "").toLowerCase().includes(selectedAge.toLowerCase())

    const matchesStock =
      stockFilter === "ALL" ||
      (stockFilter === "OUT" && r.stock === 0) ||
      (stockFilter === "LOW" && r.stock > 0 && r.stock <= 5)

    return matchesSearch && matchesAge && matchesStock
  })

  const dirtyCount = rows.filter((r) => r.dirty).length
  const outOfStockTotal = rows.filter((r) => r.stock === 0).length
  const lowStockTotal = rows.filter((r) => r.stock > 0 && r.stock <= 5).length

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Inventory & Stock Manager</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-[#2B5B7D]">
              Mini Bunny
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Track baby product stock, age sizing variants, and retail prices across warehouse.
          </p>
        </div>

        <button
          onClick={save}
          disabled={saving || dirtyCount === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#4A8DB7] hover:bg-[#3d7a9f] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 shadow-sm"
        >
          {saving ? "Saving Changes…" : `Save Updates ${dirtyCount > 0 ? `(${dirtyCount})` : ""}`}
        </button>
      </div>

      {result && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          Successfully saved {result.succeeded} variant(s). {result.failed > 0 && `(${result.failed} failed)`}
        </div>
      )}

      {/* Stock Health Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setStockFilter("ALL")}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            stockFilter === "ALL" ? "bg-white border-[#4A8DB7] ring-2 ring-[#4A8DB7]/20 shadow-xs" : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <p className="text-xs font-semibold text-gray-500">Total Variants</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{rows.length}</p>
        </button>
        <button
          type="button"
          onClick={() => setStockFilter("LOW")}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            stockFilter === "LOW" ? "bg-amber-50 border-amber-300 ring-2 ring-amber-200 shadow-xs" : "bg-white border-gray-200 hover:border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Low Stock (≤ 5)
            </p>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">{lowStockTotal}</span>
          </div>
          <p className="text-xl font-bold text-amber-900 mt-0.5">{lowStockTotal}</p>
        </button>
        <button
          type="button"
          onClick={() => setStockFilter("OUT")}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            stockFilter === "OUT" ? "bg-rose-50 border-rose-300 ring-2 ring-rose-200 shadow-xs" : "bg-white border-gray-200 hover:border-rose-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Out of Stock (0)
            </p>
            <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">{outOfStockTotal}</span>
          </div>
          <p className="text-xl font-bold text-rose-900 mt-0.5">{outOfStockTotal}</p>
        </button>
      </div>

      {/* Age Filter Chips */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Baby Age Stage Filter</label>
        <div className="flex flex-wrap items-center gap-1.5">
          {AGE_STAGE_PRESETS.map((preset) => {
            const active = selectedAge === preset.value
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => setSelectedAge(preset.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? "bg-[#4A8DB7] text-white shadow-xs"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="search"
          placeholder="Filter by baby product name, size (0-3M, 6-12M), or color…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A8DB7]"
        />
      </div>

      {/* Variants Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-xs text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Age / Size</th>
                <th className="px-5 py-3.5">Color</th>
                <th className="px-5 py-3.5 w-32">Stock</th>
                <th className="px-5 py-3.5 w-36">Price (৳)</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r) => {
                const isOut = r.stock === 0
                const isLow = r.stock > 0 && r.stock <= 5
                return (
                  <tr key={r.id} className={r.dirty ? "bg-amber-50/60" : "hover:bg-gray-50/50 transition-colors"}>
                    <td className="px-5 py-3 font-semibold text-gray-900 truncate max-w-[240px]">
                      {r.product.name}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-sky-50 text-[#2B5B7D] border border-sky-100">
                        {r.size ?? "Universal"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{r.color ?? "Standard"}</td>
                    <td className="px-5 py-3">
                      <input
                        type="number"
                        min={0}
                        value={r.stock}
                        onChange={(e) => update(r.id, "stock", parseInt(e.target.value) || 0)}
                        className={`w-full border rounded-lg px-2.5 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#4A8DB7] ${
                          isOut ? "border-rose-300 text-rose-700 bg-rose-50" : isLow ? "border-amber-300 text-amber-800 bg-amber-50" : "border-gray-200"
                        }`}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={r.price}
                        onChange={(e) => update(r.id, "price", parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#4A8DB7]"
                      />
                    </td>
                    <td className="px-5 py-3 text-right">
                      {isOut ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          Low ({r.stock} left)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                          In Stock ({r.stock})
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            No baby products or sizes match the current filters.
          </div>
        )}
      </div>
    </div>
  )
}
