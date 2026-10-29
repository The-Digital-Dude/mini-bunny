"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Ban, Loader2, X } from "lucide-react"
import { toast } from "sonner"

interface CancelOrderButtonProps {
  orderId: string
  orderNumber: string
  shippingPhone?: string
  className?: string
  variant?: "primary" | "secondary" | "danger" | "outline"
  onCancelled?: () => void
}

const CANCEL_REASONS = [
  "Changed my mind",
  "Ordered wrong size or color",
  "Ordered by mistake / duplicate order",
  "Need to change shipping address or phone",
  "Found another product at Mini Bunny",
  "Delivery time is too long",
  "Other reason",
]

export default function CancelOrderButton({
  orderId,
  orderNumber,
  shippingPhone,
  className = "",
  onCancelled,
}: CancelOrderButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState(CANCEL_REASONS[0])
  const [customReason, setCustomReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleCancel() {
    setIsLoading(true)
    const finalReason = reason === "Other reason" && customReason.trim()
      ? customReason.trim()
      : reason

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: finalReason,
          phone: shippingPhone,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to cancel order")
      }

      toast.success("Order cancelled successfully. Stock has been restored.")
      setIsOpen(false)

      if (onCancelled) {
        onCancelled()
      } else {
        router.refresh()
      }
    } catch (err: any) {
      toast.error(err.message || "Could not cancel order. Please contact support.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-colors shadow-2xs ${className}`}
      >
        <Ban className="w-3.5 h-3.5" />
        <span>Cancel Order</span>
      </button>

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-black text-[#1E3E5B]">Cancel Order</h3>
                  <p className="text-xs text-[#6C7A89] font-mono">Order #{orderNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel this order? Once cancelled, reserved items will be released back into stock.
            </p>

            {/* Reason selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#1E3E5B]">
                Reason for cancellation <span className="text-rose-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#FAF9F5] border border-[#EDE8DF] rounded-xl px-3.5 py-2.5 text-xs text-[#1E3E5B] font-medium outline-none focus:border-[#4A8DB7] transition-all"
              >
                {CANCEL_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              {reason === "Other reason" && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please specify why you are cancelling..."
                  disabled={isLoading}
                  rows={2}
                  className="w-full mt-2 bg-[#FAF9F5] border border-[#EDE8DF] rounded-xl p-3 text-xs text-[#1E3E5B] outline-none focus:border-[#4A8DB7] resize-none"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-md shadow-rose-500/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <Ban className="w-3.5 h-3.5" />
                    <span>Confirm Cancel</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
