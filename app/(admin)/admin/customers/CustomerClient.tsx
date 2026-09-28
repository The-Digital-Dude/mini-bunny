"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { StatusBadge } from "@/components/admin/ui/StatusBadge"
import { EmptyState } from "@/components/admin/ui/EmptyState"
import {
  Search,
  Users,
  ShoppingBag,
  Lock,
  Unlock,
  Eye,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  X,
  ShieldCheck,
  UserCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

type Order = {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
}

type Customer = {
  id: string
  name: string
  email: string
  phone: string
  role: string
  isLocked: boolean
  joinedDate: string
  totalOrders: number
  totalSpent: number
  orders: Order[]
  lastOrderAt?: string
}

export function CustomerClient({ data }: { data: Customer[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [lockLoading, setLockLoading] = useState(false)

  const toggleLock = async (customer: Customer) => {
    if (!customer.id.startsWith("guest:")) {
      setLockLoading(true)
      try {
        await fetch(`/api/admin/customers/${customer.id}/lock`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locked: !customer.isLocked }),
        })
        router.refresh()
      } finally {
        setLockLoading(false)
      }
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/admin/customers?search=${encodeURIComponent(searchTerm.trim())}`)
    } else {
      router.push(`/admin/customers`)
    }
  }

  const filteredData = data.filter((c) => {
    if (!selectedRole) return true
    if (selectedRole === "REGISTERED") return c.role === "CUSTOMER"
    if (selectedRole === "GUEST") return c.role === "GUEST"
    if (selectedRole === "VIP") return c.totalOrders >= 3 || c.totalSpent >= 5000
    return true
  })

  return (
    <div>
      {/* Search & Filter Header Bar */}
      <div className="p-4 border-b border-slate-100 bg-white space-y-3.5">
        {/* Quick Role / Segment Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { value: "", label: "All Parents & Guests" },
            { value: "REGISTERED", label: "Registered Accounts" },
            { value: "VIP", label: "VIP Club / Repeat Parents" },
            { value: "GUEST", label: "Guest Shoppers" },
          ].map((tab) => {
            const isActive = selectedRole === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedRole(tab.value)}
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

        {/* Live Search Input */}
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search parent name, email address, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="h-9 px-4 rounded-xl bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs shrink-0"
          >
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("")
                router.push("/admin/customers")
              }}
              className="inline-flex items-center gap-1 h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
              <span>Clear</span>
            </button>
          )}
        </form>
      </div>

      {/* Modern Customers Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 pl-5 pr-3">Parent / Customer</th>
              <th className="py-3.5 px-3">Contact</th>
              <th className="py-3.5 px-3">Type</th>
              <th className="py-3.5 px-3">First Seen</th>
              <th className="py-3.5 px-3">Orders</th>
              <th className="py-3.5 px-3">Total Spent</th>
              <th className="py-3.5 pr-5 pl-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-0">
                  <EmptyState
                    icon={Users}
                    title="No customers found"
                    description="No parent or shopper profiles matched the search criteria."
                    className="border-0 rounded-none py-14"
                  />
                </td>
              </tr>
            ) : (
              filteredData.map((customer) => {
                const isGuest = customer.id.startsWith("guest:")
                const isVip = customer.totalOrders >= 3 || customer.totalSpent >= 5000

                return (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className="cursor-pointer transition-colors duration-150 hover:bg-slate-50/80 group"
                  >
                    {/* Name & Avatar */}
                    <td className="py-3.5 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold uppercase shadow-2xs",
                            isGuest
                              ? "bg-slate-100 text-slate-600"
                              : isVip
                              ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white"
                              : "bg-gradient-to-br from-sky-400 to-indigo-600 text-white"
                          )}
                        >
                          {customer.name?.[0] || "P"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors truncate max-w-[160px]">
                              {customer.name}
                            </span>
                            {isVip && (
                              <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-extrabold text-amber-800">
                                VIP
                              </span>
                            )}
                            {customer.isLocked && (
                              <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[9px] font-bold text-rose-700">
                                Locked
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {customer.email || "No email on record"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-3">
                      <span className="font-mono text-xs text-slate-700">
                        {customer.phone || "—"}
                      </span>
                    </td>

                    {/* Role Pill */}
                    <td className="py-3.5 px-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          customer.role === "ADMIN"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : customer.role === "STAFF"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : isGuest
                            ? "bg-slate-100 text-slate-600 border-slate-200"
                            : "bg-sky-50 text-sky-700 border-sky-200"
                        )}
                      >
                        {customer.role}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                      {format(new Date(customer.joinedDate), "MMM d, yyyy")}
                    </td>

                    {/* Orders Count */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-800">
                        {customer.totalOrders}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="py-3.5 px-3 font-heading font-bold text-slate-900 whitespace-nowrap">
                      ৳{customer.totalSpent.toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pr-5 pl-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCustomer(customer)
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition-all shadow-2xs"
                        title="View orders history"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Order History Modal Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/75">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 font-extrabold text-white">
                  {selectedCustomer.name?.[0] || "P"}
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedCustomer.email || "No email"} · {selectedCustomer.phone || "No phone"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!selectedCustomer.id.startsWith("guest:") && (
                  <button
                    onClick={() => toggleLock(selectedCustomer)}
                    disabled={lockLoading}
                    className={cn(
                      "inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold border transition-all",
                      selectedCustomer.isLocked
                        ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {selectedCustomer.isLocked ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unlock Account</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Lock Account</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Order List */}
            <div className="max-h-[55vh] overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-3 px-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Past Orders ({selectedCustomer.orders.length})
                </h4>
                <span className="text-xs font-bold text-slate-900">
                  Total Spent: ৳{selectedCustomer.totalSpent.toLocaleString()}
                </span>
              </div>

              {selectedCustomer.orders.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No orders recorded for this customer.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {selectedCustomer.orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-mono text-xs font-bold text-slate-900 hover:text-sky-600"
                          >
                            {order.orderNumber}
                          </Link>
                          <StatusBadge status={order.status} size="sm" />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {format(new Date(order.createdAt), "MMM d, yyyy · h:mm a")}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-heading text-xs font-bold text-slate-900">
                          ৳{Number(order.total).toLocaleString()}
                        </span>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-sky-600 hover:border-sky-300 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-right">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="h-8.5 px-4 rounded-xl bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
