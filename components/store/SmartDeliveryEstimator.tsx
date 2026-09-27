"use client"

import { useState, useEffect } from "react"
import { Truck, Clock, ShieldCheck, Sparkles, CheckCircle2, RotateCcw } from "lucide-react"

export default function SmartDeliveryEstimator({
  subtotal = 0,
  freeShippingThreshold = 2000,
  className = "",
}: {
  subtotal?: number
  freeShippingThreshold?: number
  className?: string
}) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 3,
    minutes: 42,
    seconds: 15,
  })

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      // Cutoff time 4:00 PM (16:00)
      const cutoff = new Date(now)
      cutoff.setHours(16, 0, 0, 0)

      if (now > cutoff) {
        cutoff.setDate(cutoff.getDate() + 1)
      }

      const diff = cutoff.getTime() - now.getTime()
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setTimeLeft({ hours, minutes, seconds })
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [])

  // Calculate estimated delivery dates
  const today = new Date()
  const dhakaDelivery = new Date(today)
  dhakaDelivery.setDate(today.getDate() + 1)

  const outsideDhakaDelivery = new Date(today)
  outsideDhakaDelivery.setDate(today.getDate() + 3)

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-BD", { weekday: "short", month: "short", day: "numeric" })

  const isFreeUnlocked = subtotal >= freeShippingThreshold
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal)
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))

  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-br from-[#FAF9F5] via-white to-[#F0F7FB] border border-[#EDE8DF] shadow-xs space-y-3.5 ${className}`}>
      {/* Free Shipping Progress Meter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#1E3E5B] flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#4A8DB7]" />
            {isFreeUnlocked ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Free Delivery Unlocked!
              </span>
            ) : (
              <span>
                Add <span className="font-mono text-[#FF758F] font-black">৳{remainingForFree.toLocaleString()}</span> more for Free Delivery
              </span>
            )}
          </span>
          <span className="font-mono text-[11px] font-bold text-[#6C7A89]">{progressPercent}%</span>
        </div>

        <div className="w-full h-2 bg-[#EDE8DF]/60 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#4A8DB7] via-[#74B3CE] to-[#FF758F] rounded-full transition-all duration-500 shadow-2xs"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Dispatch Countdown */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#EDE8DF] text-xs text-[#1E3E5B]">
        <Clock className="w-4 h-4 text-[#FF758F] shrink-0 animate-pulse" />
        <p className="leading-tight">
          Order within{" "}
          <span className="font-mono font-bold text-[#FF758F]">
            {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </span>{" "}
          for <strong className="text-[#1E3E5B]">Same-Day Dispatch</strong>
        </p>
      </div>

      {/* Timeline Estimates Grid */}
      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#EDE8DF]/70">
        <div className="space-y-0.5">
          <span className="text-[#6C7A89] block">Dhaka Express (24-48h):</span>
          <p className="font-bold text-[#1E3E5B]">{formatDate(dhakaDelivery)}</p>
        </div>
        <div className="space-y-0.5">
          <span className="text-[#6C7A89] block">Outside Dhaka (2-4 Days):</span>
          <p className="font-bold text-[#1E3E5B]">{formatDate(outsideDhakaDelivery)}</p>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#EDE8DF]/60 text-[10px] text-[#6C7A89] font-medium">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Sterile Packed
        </span>
        <span className="flex items-center gap-1">
          <RotateCcw className="w-3.5 h-3.5 text-[#4A8DB7]" /> 7-Day Size Exchange
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#FF758F]" /> 100% Baby Safe
        </span>
      </div>
    </div>
  )
}
