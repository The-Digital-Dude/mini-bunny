"use client"

import { useEffect, useRef, useState } from "react"
import { ShoppingBag } from "lucide-react"
import Image from "next/image"

export default function StickyAddToCart({
  productName,
  price,
  image,
}: {
  productName: string
  price: number
  image?: string
}) {
  const [visible, setVisible] = useState(false)
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [btnLabel, setBtnLabel] = useState("Add to Bag")
  const observerRef = useRef<IntersectionObserver | null>(null)
  const mutationRef = useRef<MutationObserver | null>(null)

  useEffect(() => {
    const target = document.getElementById("add-to-bag-btn")
    if (!target) return

    // Watch visibility of the real add-to-bag button
    observerRef.current = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observerRef.current.observe(target)

    // Mirror the button's disabled state and label into the sticky bar
    const sync = () => {
      const btn = document.getElementById("add-to-bag-btn") as HTMLButtonElement | null
      if (!btn) return
      setBtnDisabled(btn.disabled)
      setBtnLabel(btn.textContent?.trim() || "Add to Bag")
    }
    sync()

    mutationRef.current = new MutationObserver(sync)
    mutationRef.current.observe(target, { attributes: true, childList: true, subtree: true, characterData: true })

    return () => {
      observerRef.current?.disconnect()
      mutationRef.current?.disconnect()
    }
  }, [])

  const handleClickAdd = () => {
    const btn = document.getElementById("add-to-bag-btn") as HTMLButtonElement | null
    if (btn && !btn.disabled) {
      btn.click()
    } else {
      document.getElementById("variant-selector")?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const handleClickBuy = () => {
    const btn = document.getElementById("buy-now-btn") as HTMLButtonElement | null
    if (btn && !btn.disabled) {
      btn.click()
    } else {
      document.getElementById("variant-selector")?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md border-t border-[#EDE8DF] shadow-2xl px-4 py-2.5 flex items-center justify-between gap-3 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          {image && (
            <div className="relative w-10 h-12 shrink-0 overflow-hidden rounded-xl border border-[#EDE8DF] bg-[#FAF9F5]">
              <Image src={image} alt={productName} fill className="object-cover" sizes="40px" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#1E3E5B] truncate max-w-[140px] sm:max-w-xs">{productName}</p>
            <p className="text-sm font-mono font-black text-[#4A8DB7]">৳{price.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleClickAdd}
            disabled={btnDisabled}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl border border-[#4A8DB7] text-[#4A8DB7] bg-[#F0F7FB] hover:bg-[#4A8DB7] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add to Bag</span>
            <span className="sm:hidden">Add</span>
          </button>

          <button
            type="button"
            onClick={handleClickBuy}
            disabled={btnDisabled}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-[#1E3E5B] to-[#2C5E8A] hover:from-[#152c41] hover:to-[#1E3E5B] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  )
}
