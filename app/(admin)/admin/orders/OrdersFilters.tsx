"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Search, X, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_TABS = [
  { value: "", label: "All Orders" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
]

export default function OrdersFilters({
  currentSearch,
  currentStatus,
  currentPayment,
}: {
  currentSearch: string
  currentStatus: string
  currentPayment: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      params.delete("page")
      router.push(`/admin/orders?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearAll = () => {
    router.push("/admin/orders")
  }

  const hasActiveFilters = Boolean(currentSearch || currentStatus || currentPayment)

  return (
    <div className="border-b border-slate-100 bg-white p-4 space-y-3.5">
      {/* Quick Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isActive = currentStatus === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => update("status", tab.value)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150",
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Search Input & Select Filter Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="search"
            defaultValue={currentSearch}
            placeholder="Search by order #, parent name, or phone..."
            onChange={(e) => {
              const v = e.target.value
              clearTimeout((window as any)._orderSearchTimer)
              ;(window as any)._orderSearchTimer = setTimeout(
                () => update("search", v),
                350
              )
            }}
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
          <select
            value={currentPayment}
            onChange={(e) => update("paymentMethod", e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          >
            <option value="">All Payment Methods</option>
            <option value="BKASH">bKash</option>
            <option value="NAGAD">Nagad</option>
            <option value="ROCKET">Rocket</option>
            <option value="COD">Cash On Delivery (COD)</option>
            <option value="STORE_CREDIT">Store Credit</option>
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
