"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { StatusBadge } from "@/components/admin/ui/StatusBadge"
import { EmptyState } from "@/components/admin/ui/EmptyState"
import { Eye, Printer, AlertTriangle, CheckSquare, Square, ShoppingCart, Sparkles } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Order = {
  id: string
  orderNumber: string
  shippingName: string
  shippingPhone?: string
  createdAt: string
  total: number
  paymentMethod: string
  paymentStatus: string
  status: string
  user?: { name: string; email?: string } | null
}

type RiskInfo = { riskLevel: string; successRate: number }

export default function OrdersBulkClient({
  orders,
  riskByPhone,
}: {
  orders: Order[]
  riskByPhone: Record<string, RiskInfo>
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState("")
  const [loading, setLoading] = useState(false)

  const allSelected = orders.length > 0 && selected.size === orders.length
  const someSelected = selected.size > 0

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(orders.map((o) => o.id)))
  }

  function toggle(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  async function applyBulk() {
    if (!bulkStatus || selected.size === 0) return
    setLoading(true)
    try {
      const res = await fetch("/api/admin/orders/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selected),
          action: "UPDATE_STATUS",
          status: bulkStatus,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(
        `${data.updated} order${data.updated !== 1 ? "s" : ""} updated to ${bulkStatus}`
      )
      setSelected(new Set())
      setBulkStatus("")
      router.refresh()
    } catch (e: any) {
      toast.error(e.message || "Failed to update orders")
    } finally {
      setLoading(false)
    }
  }

  function printSelected() {
    const ids = Array.from(selected).join(",")
    window.open(
      `/print/orders/bulk-packing-slip?ids=${encodeURIComponent(ids)}`,
      "_blank"
    )
  }

  return (
    <div>
      {/* Bulk action bar */}
      {someSelected && (
        <div className="flex items-center gap-3 px-5 py-3 bg-sky-50/80 border-b border-sky-100 animate-in fade-in duration-150">
          <span className="text-xs font-bold text-sky-900 min-w-[100px]">
            {selected.size} order{selected.size > 1 ? "s" : ""} selected
          </span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="h-8 rounded-xl border border-sky-200 bg-white px-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">Select bulk action…</option>
            <option value="CONFIRMED">Mark Confirmed</option>
            <option value="PROCESSING">Mark Processing</option>
            <option value="PACKED">Mark Packed</option>
            <option value="SHIPPED">Mark Shipped</option>
            <option value="DELIVERED">Mark Delivered</option>
            <option value="CANCELLED">Mark Cancelled</option>
          </select>
          <button
            onClick={applyBulk}
            disabled={!bulkStatus || loading}
            className="h-8 px-3.5 rounded-xl bg-sky-600 text-xs font-bold text-white hover:bg-sky-700 disabled:opacity-50 transition-colors shadow-2xs"
          >
            {loading ? "Updating…" : "Apply"}
          </button>
          <button
            onClick={printSelected}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl border border-sky-200 bg-white text-xs font-semibold text-slate-700 hover:bg-sky-100 transition-colors"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>Packing Slips</span>
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs font-semibold text-sky-700 hover:text-sky-900"
          >
            Deselect
          </button>
        </div>
      )}

      {/* Modern Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 pl-4 pr-2 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 h-4 w-4 cursor-pointer"
                  aria-label="Select all"
                />
              </th>
              <th className="py-3.5 px-3">Order</th>
              <th className="py-3.5 px-3">Customer</th>
              <th className="py-3.5 px-3">Date</th>
              <th className="py-3.5 px-3">Total</th>
              <th className="py-3.5 px-3">Payment</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-3">Risk</th>
              <th className="py-3.5 pr-4 pl-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-0">
                  <EmptyState
                    icon={ShoppingCart}
                    title="No orders found"
                    description="No customer orders matched the given search or filter criteria."
                    className="border-0 rounded-none py-12"
                  />
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isSelected = selected.has(order.id)
                const phone = (order as any).shippingPhone || ""
                const risk = riskByPhone[phone]

                return (
                  <tr
                    key={order.id}
                    className={cn(
                      "transition-colors duration-150 hover:bg-slate-50/80 group",
                      isSelected && "bg-sky-50/40"
                    )}
                  >
                    <td className="py-3.5 pl-4 pr-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(order.id)}
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 h-4 w-4 cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono hover:text-sky-600 transition-colors"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900 truncate max-w-[180px]">
                        {order.user?.name || order.shippingName || "Guest Parent"}
                      </div>
                      {phone && (
                        <div className="text-[11px] text-slate-400 truncate">
                          {phone}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-3 font-heading font-bold text-slate-900 whitespace-nowrap">
                      ৳{Number(order.total).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-800">
                          {order.paymentMethod}
                        </span>
                        <StatusBadge
                          status={order.paymentStatus}
                          size="sm"
                          dot={false}
                          className="w-fit"
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={order.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-3">
                      {risk && risk.riskLevel !== "NEW" ? (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
                            risk.riskLevel === "HIGH" &&
                              "bg-rose-50 text-rose-700 border-rose-200",
                            risk.riskLevel === "MEDIUM" &&
                              "bg-amber-50 text-amber-700 border-amber-200",
                            risk.riskLevel === "LOW" &&
                              "bg-emerald-50 text-emerald-700 border-emerald-200"
                          )}
                        >
                          {risk.riskLevel === "HIGH" && (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          {risk.riskLevel} · {Math.round((risk.successRate ?? 0) * 100)}%
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">
                          New Parent
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pr-4 pl-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition-all shadow-2xs"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
