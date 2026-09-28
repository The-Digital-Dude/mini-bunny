"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Search, Baby, X } from "lucide-react"
import { cn } from "@/lib/utils"

const BABY_AGE_STAGES = [
  { code: "", label: "All Ages" },
  { code: "0-3M", label: "0–3M" },
  { code: "3-6M", label: "3–6M" },
  { code: "6-12M", label: "6–12M" },
  { code: "12-18M", label: "12–18M" },
  { code: "18-24M", label: "18–24M" },
  { code: "2-3Y", label: "2–3Y" },
  { code: "3-4Y", label: "3–4Y" },
]

export default function ProductsFilters({
  currentSearch,
}: {
  currentSearch: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSize = searchParams.get("size") || ""
  const currentStatus = searchParams.get("status") || ""

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      params.delete("page")
      router.push(`/admin/products?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearAll = () => {
    router.push("/admin/products")
  }

  const hasActiveFilters = Boolean(currentSearch || currentSize || currentStatus)

  return (
    <div className="border-b border-slate-100 bg-white p-4 space-y-3.5">
      {/* Age Stage Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
          <Baby className="w-3.5 h-3.5 text-sky-500" />
          <span>Stage:</span>
        </div>
        {BABY_AGE_STAGES.map((stg) => {
          const isActive = currentSize === stg.code
          return (
            <button
              key={stg.code}
              type="button"
              onClick={() => update("size", stg.code)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0",
                isActive
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
              )}
            >
              {stg.label}
            </button>
          )
        })}
      </div>

      {/* Search Bar and Status Selector */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="search"
            defaultValue={currentSearch}
            placeholder="Search products by title, SKU, or tags..."
            onChange={(e) => {
              const v = e.target.value
              clearTimeout((window as any)._productSearchTimer)
              ;(window as any)._productSearchTimer = setTimeout(
                () => update("search", v),
                350
              )
            }}
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
          <select
            value={currentStatus}
            onChange={(e) => update("status", e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          >
            <option value="">All Visibility</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive / Draft</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
