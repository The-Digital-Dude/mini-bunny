"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { StatusBadge } from "@/components/admin/ui/StatusBadge"
import { AdminCard } from "@/components/admin/ui/AdminCard"
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader"
import {
  Printer,
  AlertTriangle,
  ShieldCheck,
  MessageCircle,
  Truck,
  CreditCard,
  Package,
  Clock,
  CheckCircle2,
  Phone,
  MapPin,
  Tag,
  FileText,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  Check,
  RotateCcw,
  XCircle,
  ShoppingBag,
  Zap,
  RefreshCw,
  Loader2,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { CustomerRisk } from "@/lib/customerRisk"

const ORDER_STEPS = [
  { key: "PENDING", label: "Pending", icon: Clock },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { key: "PROCESSING", label: "Processing", icon: Package },
  { key: "PACKED", label: "Packed", icon: Package },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: Check },
]

const COURIER_LINKS: Record<string, (code: string) => string> = {
  PATHAO: (code) => `https://merchant.pathao.com/tracking?consignment_id=${code}`,
  STEADFAST: (code) => `https://steadfast.com.bd/t/${code}`,
  REDX: (code) => `https://redx.com.bd/track-order/?trackingId=${code}`,
  PAPERFLY: (code) => `https://paperfly.com.bd/tracking?order_id=${code}`,
}

export default function OrderDetailsClient({
  initialOrder,
  customerRisk,
}: {
  initialOrder: any
  customerRisk?: CustomerRisk | null
}) {
  const router = useRouter()
  const [order, setOrder] = useState(initialOrder)
  const [loading, setLoading] = useState(false)
  const [pendingWaLink, setPendingWaLink] = useState<string | null>(null)
  const [codNote, setCodNote] = useState(order.codCallNote ?? "")
  const [tagsInput, setTagsInput] = useState(
    (order.tags ?? "").split(",").filter(Boolean).join(", ")
  )
  const [deliveryData, setDeliveryData] = useState({
    courier: order.delivery?.courier || "PATHAO",
    consignmentId: order.delivery?.consignmentId || "",
    trackingCode: order.delivery?.trackingCode || "",
  })

  const updateStatus = async (status: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const updated = await res.json()
        setOrder({ ...order, status: updated.status })
        if (updated.waLink) setPendingWaLink(updated.waLink)
        toast.success(`Order status updated to ${status}`)
        router.refresh()
      } else {
        toast.error("Failed to update status")
      }
    } catch {
      toast.error("An error occurred while updating status")
    } finally {
      setLoading(false)
    }
  }

  const updatePaymentStatus = async (paymentStatus: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      })
      if (res.ok) {
        const updated = await res.json()
        setOrder({ ...order, paymentStatus: updated.paymentStatus })
        toast.success(`Payment status marked as ${paymentStatus}`)
        router.refresh()
      } else {
        toast.error("Failed to update payment status")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const [autoDispatching, setAutoDispatching] = useState(false)
  const [syncingStatus, setSyncingStatus] = useState(false)

  const autoBookSteadfast = async () => {
    setAutoDispatching(true)
    try {
      const res = await fetch("/api/courier/steadfast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setDeliveryData({
          courier: "STEADFAST",
          consignmentId: data.consignment.consignment_id,
          trackingCode: data.consignment.tracking_code,
        })
        if (order.status === "PENDING" || order.status === "CONFIRMED") {
          setOrder({ ...order, status: "PROCESSING" })
        }
        toast.success(`⚡ Booked with Steadfast! Consignment ID: #${data.consignment.consignment_id}`)
        router.refresh()
      } else {
        toast.error(data.error || "Failed to book parcel with Steadfast")
      }
    } catch {
      toast.error("Failed to connect to Steadfast API")
    } finally {
      setAutoDispatching(false)
    }
  }

  const syncSteadfastStatus = async () => {
    if (!deliveryData.consignmentId) {
      toast.error("No Consignment ID to sync")
      return
    }
    setSyncingStatus(true)
    try {
      const res = await fetch(`/api/courier/steadfast?consignmentId=${encodeURIComponent(deliveryData.consignmentId)}`)
      const data = await res.json()
      if (res.ok && data.status) {
        toast.success(`Steadfast Live Status: ${data.status.toUpperCase()} (${data.internalStatus})`)
        router.refresh()
      } else {
        toast.error(data.error || "Failed to sync status from Steadfast")
      }
    } catch {
      toast.error("Network error while syncing status")
    } finally {
      setSyncingStatus(false)
    }
  }

  const saveDelivery = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/delivery`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deliveryData),
      })
      if (res.ok) {
        toast.success("Delivery & courier information saved")
        router.refresh()
      } else {
        toast.error("Failed to save delivery info")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const phone = (order.shippingPhone || order.customerPhone || "").replace(/[^0-9]/g, "")
  const formattedPhone = phone.startsWith("88") ? phone : `88${phone}`
  const itemsSummary = (order.items || [])
    .map((i: any) => `${i.productName || i.title || "Item"} (${i.size || "Standard"}) x${i.quantity}`)
    .join(", ")

  const whatsappMsg = `Assalamu Alaikum ${order.shippingName || order.customerName || "Dear Parent"}! 🐰\nThank you for shopping with Mini Bunny.\n\nWe received your Order #${order.orderNumber} (Total: ৳${Number(order.total).toLocaleString()}).\nItems: ${itemsSummary}\nAddress: ${order.shippingAddress || ""}\n\nPlease reply *YES* to confirm so we can pack and dispatch your baby essentials immediately!`

  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.key === order.status)
  const isCancelled = order.status === "CANCELLED"
  const isReturned = order.status === "RETURNED"

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumbs & Action Toolbar */}
      <AdminPageHeader
        title={`Order ${order.orderNumber}`}
        description={`Placed on ${new Date(order.createdAt).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`}
        backHref="/admin/orders"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Orders", href: "/admin/orders" },
          { label: order.orderNumber },
        ]}
        badge={<StatusBadge status={order.status} size="md" />}
        actions={
          <>
            {phone && (
              <button
                onClick={() => {
                  window.open(
                    `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsappMsg)}`,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#25D366] text-xs font-bold text-white hover:bg-[#1EBE5D] transition-all shadow-md shadow-emerald-500/20"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp COD Verify</span>
              </button>
            )}

            <a
              href={`/order/${order.id}/invoice`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>Invoice</span>
            </a>

            <a
              href={`/print/orders/${order.id}/packing-slip`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>Packing Slip</span>
            </a>
          </>
        }
      />

      {/* WhatsApp manual link fallback if configured */}
      {pendingWaLink && (
        <div className="flex items-center justify-between gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-900 shadow-xs">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Customer WhatsApp message ready to be dispatched</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={pendingWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              Open Chat
            </a>
            <button
              onClick={() => setPendingWaLink(null)}
              className="px-2 py-1 text-emerald-700 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Visual Order Stepper Timeline */}
      <AdminCard noPadding className="p-5 sm:p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Fulfillment Progression
          </h3>
          {isCancelled && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-bold text-rose-700">
              <XCircle className="w-3.5 h-3.5" /> Order Cancelled
            </span>
          )}
          {isReturned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-xs font-bold text-orange-700">
              <RotateCcw className="w-3.5 h-3.5" /> Order Returned
            </span>
          )}
        </div>

        {!isCancelled && !isReturned ? (
          <div className="relative">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {ORDER_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx
                const isCurrent = currentStepIndex === idx
                const Icon = step.icon

                return (
                  <button
                    key={step.key}
                    onClick={() => updateStatus(step.key)}
                    disabled={loading}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-2xl border text-center transition-all duration-200 group relative",
                      isCurrent
                        ? "bg-sky-50/80 border-sky-400 ring-2 ring-sky-400/20 shadow-xs"
                        : isPassed
                        ? "bg-slate-50/60 border-slate-200 hover:border-sky-300"
                        : "bg-white border-slate-100 opacity-60 hover:opacity-100 hover:border-slate-300"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl mb-2 transition-transform duration-200 group-hover:scale-105",
                        isCurrent
                          ? "bg-sky-600 text-white shadow-md shadow-sky-500/20"
                          : isPassed
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-400"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-bold truncate max-w-full",
                        isCurrent
                          ? "text-sky-900"
                          : isPassed
                          ? "text-slate-800"
                          : "text-slate-400"
                      )}
                    >
                      {step.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
            <span>
              This order has been marked as <strong>{order.status}</strong>. You can revert it to active processing if needed.
            </span>
            <button
              onClick={() => updateStatus("PENDING")}
              disabled={loading}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
            >
              Reopen to Pending
            </button>
          </div>
        )}
      </AdminCard>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Items & Courier Dispatch */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Card */}
          <AdminCard
            title={`Ordered Items (${(order.items || []).length})`}
            description="Baby clothing and essentials selected by parent"
            noPadding
          >
            <div className="divide-y divide-slate-100">
              {(order.items || []).map((item: any) => {
                const itemImg =
                  item.product?.images?.[0]?.url ||
                  item.product?.images?.[0] ||
                  item.image ||
                  null

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-4 sm:p-5 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100">
                        {itemImg ? (
                          <Image
                            src={itemImg}
                            alt={item.productName || item.title || "Product"}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <ShoppingBag className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading text-sm font-bold text-slate-900 truncate">
                          {item.productName || item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {item.size && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-100">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-xs text-slate-500">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">
                        ৳{Number(item.price).toLocaleString()} × {item.quantity}
                      </p>
                      <p className="font-heading text-sm font-bold text-slate-900 mt-0.5">
                        ৳{(Number(item.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Financial Summary */}
            <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/50 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  ৳{Number(order.subtotal || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery / Shipping Fee</span>
                <span className="font-semibold text-slate-900">
                  +৳{Number(order.shippingCharge || 0).toLocaleString()}
                </span>
              </div>
              {Number(order.discount || 0) > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon & Promo Discount</span>
                  <span>-৳{Number(order.discount).toLocaleString()}</span>
                </div>
              )}
              {Number(order.storeCreditUsed || 0) > 0 && (
                <div className="flex justify-between text-indigo-700 font-semibold">
                  <span>Store Credit / Wallet</span>
                  <span>-৳{Number(order.storeCreditUsed).toLocaleString()}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline font-heading text-base font-bold text-slate-900">
                <span>Grand Total</span>
                <span className="text-lg text-sky-600">
                  ৳{Number(order.total || 0).toLocaleString()}
                </span>
              </div>

              {Number(order.depositAmount) > 0 && (
                <div
                  className={cn(
                    "flex justify-between p-3 rounded-xl border text-xs font-semibold mt-2",
                    order.depositPaid
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  )}
                >
                  <span>
                    {order.depositPaid
                      ? "Advance Deposit Paid (bKash/Nagad)"
                      : "Advance Deposit Pending"}
                  </span>
                  <span>৳{Number(order.depositAmount).toLocaleString()}</span>
                </div>
              )}

              {order.depositPaid && (
                <div className="flex justify-between text-xs font-bold text-slate-700 pt-1">
                  <span>Net Cash Due on Delivery</span>
                  <span>
                    ৳{(Number(order.total) - Number(order.depositAmount)).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </AdminCard>

          {/* Courier & Delivery Dispatch Card */}
          <AdminCard
            title="Courier & Shipment Dispatch"
            description="Assign delivery partner and track courier consignments with 1-click automation"
          >
            {/* Courier Selection */}
            <div className="mb-4">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Courier Partner
              </label>
              <select
                value={deliveryData.courier}
                onChange={(e) =>
                  setDeliveryData({ ...deliveryData, courier: e.target.value })
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              >
                <option value="STEADFAST">⚡ Steadfast Courier (Automated 1-Click Dispatch & Sync)</option>
                <option value="PATHAO">Pathao Courier</option>
                <option value="REDX">RedX Logistics</option>
                <option value="PAPERFLY">Paperfly</option>
                <option value="SELF">In-House / Self Delivery</option>
              </select>
            </div>

            {/* Steadfast Automated Dispatch / Active Status Widget */}
            {deliveryData.courier === "STEADFAST" && (
              <div className="mb-5">
                {deliveryData.consignmentId ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/80 border border-emerald-200/90 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-950">Booked with Steadfast API</p>
                          <p className="text-[11px] text-emerald-700 font-mono">Consignment ID: #{deliveryData.consignmentId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={syncSteadfastStatus}
                          disabled={syncingStatus}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white border border-emerald-200 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors shadow-2xs disabled:opacity-50"
                        >
                          <RefreshCw className={cn("w-3.5 h-3.5", syncingStatus && "animate-spin text-emerald-600")} />
                          <span>{syncingStatus ? "Syncing..." : "Sync Live Status"}</span>
                        </button>
                        {deliveryData.trackingCode && (
                          <a
                            href={COURIER_LINKS.STEADFAST(deliveryData.trackingCode)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Steadfast Tracking</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-sky-50/80 to-blue-50/80 border border-indigo-200/90 shadow-2xs space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Zap className="w-4 h-4 fill-current text-amber-300" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-indigo-950">
                          Automated 1-Click Steadfast Dispatch
                        </p>
                        <p className="text-[11px] text-indigo-700 leading-relaxed">
                          Auto-submits recipient name ({order.shippingName || "Customer"}), phone ({order.shippingPhone || "N/A"}), address & COD amount (৳{(order.paymentMethod === "COD" && order.paymentStatus !== "PAID" ? Math.round(Number(order.total || 0) - Number(order.depositAmount || 0)) : 0).toLocaleString()}) straight to Steadfast API.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={autoBookSteadfast}
                      disabled={autoDispatching || loading}
                      className="w-full h-10 rounded-xl bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/20 hover:scale-[1.005] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {autoDispatching ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Dispatching to Steadfast API...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-current text-amber-300" />
                          <span>⚡ 1-Click Auto-Dispatch to Steadfast</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Manual Consignment & Tracking Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Consignment ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. PTH-9823429 or 123456"
                  value={deliveryData.consignmentId}
                  onChange={(e) =>
                    setDeliveryData({
                      ...deliveryData,
                      consignmentId: e.target.value,
                    })
                  }
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tracking Code / URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter carrier tracking code"
                    value={deliveryData.trackingCode}
                    onChange={(e) =>
                      setDeliveryData({
                        ...deliveryData,
                        trackingCode: e.target.value,
                      })
                    }
                    className="h-9 flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                  {deliveryData.trackingCode &&
                    COURIER_LINKS[deliveryData.courier] && (
                      <a
                        href={COURIER_LINKS[deliveryData.courier](
                          deliveryData.trackingCode
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Track</span>
                      </a>
                    )}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">
                {deliveryData.courier === "STEADFAST" ? "Supports real-time webhooks & 1-click dispatch" : "Manual courier assignment"}
              </span>
              <button
                onClick={saveDelivery}
                disabled={loading}
                className="h-9 px-5 rounded-xl bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Delivery Information"}
              </button>
            </div>
          </AdminCard>
        </div>

        {/* Right 1 Column: Customer Risk, Payment, Notes, Tags & Timeline */}
        <div className="space-y-6">
          {/* Customer & Delivery Address Card */}
          <AdminCard
            title="Customer & Delivery Profile"
            description="Parent contact and delivery address details"
          >
            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <p className="font-heading text-sm font-bold text-slate-900">
                    {order.shippingName || "Guest Parent"}
                  </p>
                  <p className="text-slate-400 mt-0.5">
                    {order.user?.email || order.guestEmail || "No email provided"}
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700 font-extrabold text-xs">
                  {order.shippingName?.[0] || "P"}
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-mono font-bold text-slate-900">
                    {order.shippingPhone || "—"}
                  </span>
                </div>
                {phone && (
                  <a
                    href={`https://wa.me/${formattedPhone}?text=${encodeURIComponent(
                      `Hi ${order.shippingName}, Mini Bunny regarding order #${order.orderNumber}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 pt-2 border-t border-slate-100">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">{order.shippingAddress}</p>
                  <p className="text-slate-500 mt-0.5">
                    {[order.shippingArea, order.shippingDistrict, order.shippingDivision]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>

              {/* Customer Delivery Risk Badge */}
              {customerRisk && customerRisk.riskLevel !== "NEW" && (
                <div
                  className={cn(
                    "p-3.5 rounded-2xl border text-xs space-y-1.5",
                    customerRisk.riskLevel === "HIGH" &&
                      "bg-rose-50 border-rose-200 text-rose-900",
                    customerRisk.riskLevel === "MEDIUM" &&
                      "bg-amber-50 border-amber-200 text-amber-900",
                    customerRisk.riskLevel === "LOW" &&
                      "bg-emerald-50 border-emerald-200 text-emerald-900"
                  )}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {customerRisk.riskLevel === "HIGH" ? (
                      <AlertTriangle className="h-4 w-4 text-rose-600" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    )}
                    <span>{customerRisk.riskLevel} Risk Profile</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {customerRisk.delivered} delivered / {customerRisk.returnedOrCancelled}{" "}
                    returned or cancelled (
                    {Math.round((customerRisk.successRate ?? 0) * 100)}% delivery
                    success rate across {customerRisk.totalOrders} past orders)
                  </p>
                </div>
              )}
            </div>
          </AdminCard>

          {/* Payment & Verification Card */}
          <AdminCard
            title="Payment Management"
            description="Verify transaction receipts and update settlement"
          >
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Method
                  </span>
                  <p className="font-heading text-sm font-bold text-slate-900 mt-0.5">
                    {order.paymentMethod}
                  </p>
                </div>
                <StatusBadge status={order.paymentStatus} size="sm" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Update Payment Status
                </label>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => updatePaymentStatus(e.target.value)}
                  disabled={loading}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                >
                  <option value="UNPAID">Unpaid</option>
                  <option value="PENDING_VERIFICATION">Pending Verification</option>
                  <option value="PARTIAL">Partial (Advance only)</option>
                  <option value="PAID">Paid</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              {/* Payment Evidence / Screenshot */}
              {order.payment &&
                (order.payment.transactionId || order.payment.screenshotUrl) && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    {order.payment.transactionId && (
                      <p className="font-mono text-xs font-bold text-slate-900">
                        Trx ID: {order.payment.transactionId}
                      </p>
                    )}
                    {order.payment.screenshotUrl && (
                      <a
                        href={order.payment.screenshotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg overflow-hidden border border-slate-200 hover:opacity-90"
                      >
                        <img
                          src={order.payment.screenshotUrl}
                          alt="Payment receipt screenshot"
                          className="w-full max-h-36 object-contain"
                        />
                      </a>
                    )}
                    {order.paymentStatus === "PENDING_VERIFICATION" && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => updatePaymentStatus("PAID")}
                          disabled={loading}
                          className="flex-1 h-8 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700 transition-colors"
                        >
                          Confirm Paid
                        </button>
                        <button
                          onClick={() => updatePaymentStatus("UNPAID")}
                          disabled={loading}
                          className="flex-1 h-8 rounded-xl bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </AdminCard>

          {/* COD Call Notes & Tags */}
          <AdminCard title="Internal Notes & Tags">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  COD Confirmation Call Notes
                </label>
                <textarea
                  value={codNote}
                  onChange={(e) => setCodNote(e.target.value)}
                  placeholder="e.g. Parent requested afternoon delivery, confirmed by mother…"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all resize-none"
                />
                <button
                  onClick={async () => {
                    await fetch(`/api/admin/orders/${order.id}/note`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ codCallNote: codNote }),
                    })
                    toast.success("COD note saved")
                  }}
                  className="inline-flex items-center gap-1 h-7.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Save Note
                </button>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Order Tags
                </label>
                <div className="flex gap-2">
                  <input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="vip, gift, urgent (comma-separated)"
                    className="h-8.5 flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                  <button
                    onClick={async () => {
                      const tags = tagsInput
                        .split(",")
                        .map((t: string) => t.trim())
                        .filter(Boolean)
                      await fetch(`/api/admin/orders/${order.id}/tags`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ tags }),
                      })
                      toast.success("Tags updated")
                    }}
                    className="h-8.5 px-3 rounded-xl bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shrink-0"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </AdminCard>

          {/* Audit Timeline */}
          <AdminCard title="Activity Timeline">
            <div className="space-y-3 text-xs">
              {(order.statusLogs || []).length === 0 ? (
                <p className="text-slate-400 py-4 text-center">
                  No activity logged yet.
                </p>
              ) : (
                (order.statusLogs || []).map((log: any, i: number) => (
                  <div
                    key={log.id || i}
                    className="flex items-start gap-2.5 pb-2.5 border-b border-slate-100 last:border-0 last:pb-0"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-700 shrink-0 mt-0.5">
                      <Clock className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900">
                          {log.status}
                        </span>
                        <time className="text-[10px] text-slate-400">
                          {new Date(log.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>
                      {log.note && (
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {log.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  )
}
