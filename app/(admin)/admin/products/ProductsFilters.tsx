"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Search, Filter, Baby } from "lucide-react"

const BABY_AGE_STAGES = [
  { code: "", label: "All Ages" },
  { code: "0-3M", label: "0–3M (Newborn)" },
  { code: "3-6M", label: "3–6M" },
  { code: "6-12M", label: "6–12M" },
  { code: "12-18M", label: "12–18M" },
  { code: "18-24M", label: "18–24M" },
  { code: "2-3Y", label: "2–3Y" },
  { code: "3-4Y", label: "3–4Y" },
]

export default function ProductsFilters({ currentSearch }: { currentSearch: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSize = searchParams.get("size") || ""

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    router.push(`/admin/products?${params.toString()}`)
  }, [router, searchParams])

  return (
    <div className="p-4 border-b space-y-3 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="search"
            defaultValue={currentSearch}
            placeholder="Search baby clothes, rompers, sets..."
            onChange={(e) => {
              const v = e.target.value
              clearTimeout((window as any)._productSearchTimer)
              ;(window as any)._productSearchTimer = setTimeout(() => update("search", v), 400)
            }}
            className="flex h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-3 py-1 text-xs transition-colors focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4A8DB7]"
          />
        </div>

        {/* Baby Sizing Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4A8DB7]">
          <Baby className="w-4 h-4" />
          <span>Baby Age Sizing Filter</span>
        </div>
      </div>

      {/* Age Stage Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
        {BABY_AGE_STAGES.map((stg) => {
          const isActive = currentSize === stg.code
          return (
            <button
              key={stg.code}
              type="button"
              onClick={() => update("size", stg.code)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? "bg-[#4A8DB7] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {stg.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
