"use client"

import { MessageCircle, X, Sparkles, Baby, Gift, ShoppingBag, Truck } from "lucide-react"
import { useState } from "react"
import { buildWaLink, OFFICIAL_WHATSAPP_NUMBER } from "@/lib/whatsapp"
import { BunnyIcon } from "./BunnyLogo"
import { useParentProfile } from "@/hooks/useParentProfile"

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false)
  const { activeChild } = useParentProfile()

  const handleChat = (initialMessage: string) => {
    const link = buildWaLink(OFFICIAL_WHATSAPP_NUMBER, initialMessage)
    window.open(link, "_blank", "noopener,noreferrer")
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 print:hidden">
      {/* Popover Bubble */}
      {isOpen && (
        <div className="w-84 max-w-[92vw] bg-white rounded-3xl border border-[#EDE8DF] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xs">
                <BunnyIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-heading font-black text-sm">Mini Bunny Concierge</p>
                <p className="text-[10px] text-white/90 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live Sizing & WhatsApp Orders
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 bg-[#FAF9F5]/70 text-xs">
            <div className="p-3 bg-white rounded-2xl border border-[#EDE8DF] shadow-xs text-[#1E3E5B] space-y-1">
              <p className="font-bold flex items-center gap-1">
                <span>Assalamu Alaikum!</span>
                <span>🐰</span>
              </p>
              <p className="text-[11px] text-[#6C7A89] leading-relaxed">
                Welcome to Mini Bunny. How can our baby care specialists assist you today?
              </p>
            </div>

            {/* Quick Action Prompts */}
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() =>
                  handleChat(
                    activeChild?.babyName
                      ? `Hi Mini Bunny! I need size and fabric advice for my baby ${activeChild.babyName} (${activeChild.recommendedSize || "0-3M"}).`
                      : "Hi Mini Bunny! I need size and fabric advice for my baby."
                  )
                }
                className="w-full text-left p-2.5 bg-white hover:bg-[#FFF0F3] border border-[#EDE8DF] hover:border-[#FF758F] rounded-2xl text-[11px] font-bold text-[#1E3E5B] transition-all flex items-center gap-2.5 group shadow-2xs"
              >
                <div className="w-7 h-7 rounded-xl bg-[#FFF0F3] text-[#FF758F] flex items-center justify-center shrink-0">
                  <Baby className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate">Baby Sizing & Fabric Advice</p>
                  <p className="text-[9px] text-[#6C7A89] font-normal">GOTS Organic & hypoallergenic specs</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleChat(
                    "Hi Mini Bunny! Can you help me select a luxury gift hamper / newborn gift set for a baby shower?"
                  )
                }
                className="w-full text-left p-2.5 bg-white hover:bg-[#F0F7FB] border border-[#EDE8DF] hover:border-[#4A8DB7] rounded-2xl text-[11px] font-bold text-[#1E3E5B] transition-all flex items-center gap-2.5 group shadow-2xs"
              >
                <div className="w-7 h-7 rounded-xl bg-[#F0F7FB] text-[#4A8DB7] flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate">Baby Shower & Gift Sets</p>
                  <p className="text-[9px] text-[#6C7A89] font-normal">Keepsake boxes & custom cards</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleChat(
                    "Hi Mini Bunny! I would like to place a quick Cash-on-Delivery (COD) order via WhatsApp."
                  )
                }
                className="w-full text-left p-2.5 bg-white hover:bg-[#EBF8F2] border border-[#EDE8DF] hover:border-[#2ECC71] rounded-2xl text-[11px] font-bold text-[#1E3E5B] transition-all flex items-center gap-2.5 group shadow-2xs"
              >
                <div className="w-7 h-7 rounded-xl bg-[#EBF8F2] text-[#2ECC71] flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate">Quick Cash-on-Delivery Order</p>
                  <p className="text-[9px] text-[#6C7A89] font-normal">Fast order placement in 1 minute</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleChat(
                    "Hi Mini Bunny! Could you please help me track my courier order status?"
                  )
                }
                className="w-full text-left p-2.5 bg-white hover:bg-[#FAF5FF] border border-[#EDE8DF] hover:border-[#9333EA] rounded-2xl text-[11px] font-bold text-[#1E3E5B] transition-all flex items-center gap-2.5 group shadow-2xs"
              >
                <div className="w-7 h-7 rounded-xl bg-[#FAF5FF] text-[#9333EA] flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate">Track Courier Delivery</p>
                  <p className="text-[9px] text-[#6C7A89] font-normal">Dhaka 24-48h · Nationwide 2-4 days</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
        aria-label="WhatsApp Shopping Concierge"
      >
        <MessageCircle className="w-5 h-5 fill-white" />
        <span className="hidden sm:inline font-bold text-xs tracking-wide">
          WhatsApp Concierge
        </span>
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF758F] border-2 border-white rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF758F] border-2 border-white rounded-full" />
      </button>
    </div>
  )
}
