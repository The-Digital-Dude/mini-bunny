"use client"

import { MessageCircle, ShoppingBag } from "lucide-react"
import { buildWhatsAppOrderLink } from "@/lib/whatsapp"

export default function WhatsAppOrderButton({
  productName,
  productUrl,
  size,
  color,
  price,
  quantity = 1,
  className = "",
  variant = "full",
}: {
  productName: string
  productUrl?: string
  size?: string
  color?: string
  price: number
  quantity?: number
  className?: string
  variant?: "full" | "button" | "pill"
}) {
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const link = buildWhatsAppOrderLink({
      productName,
      productUrl: productUrl || (typeof window !== "undefined" ? window.location.href : undefined),
      size,
      color,
      price,
      quantity,
    })
    window.open(link, "_blank", "noopener,noreferrer")
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleWhatsAppClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold text-xs transition-colors ${className}`}
        aria-label="Order on WhatsApp"
      >
        <MessageCircle className="w-3.5 h-3.5 fill-[#25D366] text-[#25D366]" />
        <span>Order on WhatsApp</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleWhatsAppClick}
      className={`w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm ${className}`}
    >
      <MessageCircle className="w-4 h-4 fill-white" />
      <span>Order on WhatsApp (Instant Support)</span>
    </button>
  )
}
