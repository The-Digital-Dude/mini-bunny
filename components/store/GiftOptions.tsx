"use client"

import { useState } from "react"
import { useCartStore } from "@/store/useCartStore"
import { Gift, Heart, Sparkles, Check, Smile } from "lucide-react"

export default function GiftOptions({
  charge = 150,
  compact = false,
}: {
  charge?: number
  compact?: boolean
}) {
  const { isGiftWrapped, giftMessage, setGiftWrap, setGiftMessage } = useCartStore()
  const [openMessageInput, setOpenMessageInput] = useState(isGiftWrapped)

  const quickMessages = [
    "Welcome to the world, little angel! 💕",
    "Sending so much love and cuddles to your little bundle of joy!",
    "Congratulations on your precious new arrival! 🍼✨",
    "Happy 1st Birthday to our favorite little star! 🎈",
  ]

  const toggleWrap = (checked: boolean) => {
    setGiftWrap(checked)
    setOpenMessageInput(checked)
  }

  return (
    <div className={`rounded-3xl border transition-all ${
      isGiftWrapped
        ? "bg-gradient-to-r from-[#FFF0F3]/70 to-[#FFF9F0]/80 border-[#FF758F]/40 shadow-sm"
        : "bg-[#FAF9F5] border-[#EDE8DF]"
    } ${compact ? "p-4" : "p-6"}`}>
      
      {/* Checkbox Header */}
      <div className="flex items-start justify-between gap-3">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isGiftWrapped}
            onChange={(e) => toggleWrap(e.target.checked)}
            className="mt-1 w-4 h-4 rounded accent-[#FF758F] cursor-pointer"
          />
          <div>
            <span className="font-heading font-extrabold text-sm text-[#1E3E5B] flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-[#FF758F]" />
              Signature Mini Bunny Gift Wrap
            </span>
            <p className="text-xs text-[#6C7A89] mt-0.5">
              Includes luxury keepsake bunny box, satin ribbon & handwritten card.
            </p>
          </div>
        </label>
        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-full bg-white border border-[#EDE8DF] text-[#FF758F] shrink-0">
          +৳{charge}
        </span>
      </div>

      {/* Gift Message Card Editor */}
      {isGiftWrapped && (
        <div className="mt-4 pt-4 border-t border-[#FFCCD5]/60 space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#1E3E5B] flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-[#FF758F] fill-[#FF758F]" /> Handwritten Greeting Note
            </span>
            <span className="text-[11px] text-[#6C7A89]">{giftMessage.length}/180</span>
          </div>

          <textarea
            rows={2}
            maxLength={180}
            placeholder="Write your heartfelt note to the parents / baby..."
            value={giftMessage}
            onChange={(e) => setGiftMessage(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#EDE8DF] focus:border-[#FF758F] rounded-2xl text-xs text-[#1E3E5B] focus:outline-none transition-all placeholder:text-[#6C7A89]/60"
          />

          {/* Quick Message Suggestions */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-[#6C7A89] uppercase tracking-wider">Quick Suggestions:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickMessages.map((msg, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setGiftMessage(msg)}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white border border-[#EDE8DF] hover:border-[#FF758F] text-[#6C7A89] hover:text-[#1E3E5B] transition-colors"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
