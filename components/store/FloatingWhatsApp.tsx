"use client"

import { MessageCircle, X } from "lucide-react"
import { useState } from "react"
import { buildWaLink, OFFICIAL_WHATSAPP_NUMBER } from "@/lib/whatsapp"
import { BunnyIcon } from "./BunnyLogo"

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false)

  const handleChat = (initialMessage: string) => {
    const link = buildWaLink(OFFICIAL_WHATSAPP_NUMBER, initialMessage)
    window.open(link, "_blank", "noopener,noreferrer")
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 print:hidden">
      {/* Popover Bubble */}
      {isOpen && (
        <div className="w-80 bg-white rounded-3xl border border-[#EDE8DF] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BunnyIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-heading font-black text-sm">Mini Bunny Support</p>
                <p className="text-[10px] text-white/85 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Online for Sizing & Orders
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 bg-[#FAF9F5]/50 text-xs">
            <div className="p-3 bg-white rounded-2xl border border-[#EDE8DF] shadow-sm text-[#24303E] space-y-1">
              <p className="font-bold text-[#1E3E5B]">Assalamu Alaikum! 🐰</p>
              <p className="text-[#6C7A89] leading-relaxed">
                Need help picking baby sizes, tracking your courier package, or placing a quick Cash-on-Delivery order?
              </p>
            </div>

            {/* Quick Action Prompts */}
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleChat("Hi Mini Bunny team! I'd like to place an order via WhatsApp.")}
                className="w-full text-left px-3 py-2 bg-white hover:bg-[#EBF5FB] border border-[#EDE8DF] hover:border-[#4A8DB7] rounded-xl text-[11px] font-bold text-[#1E3E5B] transition-colors flex items-center justify-between"
              >
                <span>📦 Place an Order via WhatsApp</span>
                <span className="text-xs">→</span>
              </button>

              <button
                type="button"
                onClick={() => handleChat("Hi! I need help selecting the right size for my baby.")}
                className="w-full text-left px-3 py-2 bg-white hover:bg-[#FFF0F3] border border-[#EDE8DF] hover:border-[#FF758F] rounded-xl text-[11px] font-bold text-[#1E3E5B] transition-colors flex items-center justify-between"
              >
                <span>📏 Baby Sizing & Fit Help</span>
                <span className="text-xs">→</span>
              </button>

              <button
                type="button"
                onClick={() => handleChat("Hi! Could you check the status of my order delivery?")}
                className="w-full text-left px-3 py-2 bg-white hover:bg-[#EBF8F2] border border-[#EDE8DF] hover:border-[#2ECC71] rounded-xl text-[11px] font-bold text-[#1E3E5B] transition-colors flex items-center justify-between"
              >
                <span>🚚 Track My Delivery (Pathao / Steadfast)</span>
                <span className="text-xs">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
        aria-label="WhatsApp Chat & Order"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
        <span className="hidden sm:inline font-bold text-xs tracking-wide">
          Order on WhatsApp
        </span>
      </button>
    </div>
  )
}
