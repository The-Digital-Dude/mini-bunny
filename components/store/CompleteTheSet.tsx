"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Check, ChevronDown, Sparkles, Layers, ShoppingBag } from "lucide-react"
import { useCartStore } from "@/store/useCartStore"
import { toast } from "sonner"

type Variant = { id: string; size: string; color: string; colorHex?: string | null; stock: number; price?: number | null }
type CompanionProduct = {
  id: string
  name: string
  slug: string
  price: number
  images: { url: string }[]
  variants: Variant[]
}
type BundleItem = { id: string; product: CompanionProduct }
type Bundle = { id: string; discountPct?: number | null; items: BundleItem[] }

export default function CompleteTheSet({
  bundle,
  primaryName,
  primaryPrice,
  primaryColors = [],
}: {
  bundle: Bundle
  primaryName: string
  primaryPrice: number
  primaryColors?: string[]
}) {
  const addItem = useCartStore((s) => s.addItem)

  // Per-companion state: selected? + chosen variant
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [chosenVariant, setChosenVariant] = useState<Record<string, string>>({})

  const companions = bundle.items.map((bi) => bi.product)

  const toggle = (productId: string) => {
    setSelected((prev) => {
      const next = { ...prev, [productId]: !prev[productId] }
      // Auto-select first in-stock variant when toggling on
      if (next[productId] && !chosenVariant[productId]) {
        const product = companions.find((p) => p.id === productId)
        const first = product?.variants.find((v) => v.stock > 0)
        if (first) setChosenVariant((pv) => ({ ...pv, [productId]: first.id }))
      }
      return next
    })
  }

  const selectVariant = (productId: string, variantId: string) =>
    setChosenVariant((prev) => ({ ...prev, [productId]: variantId }))

  const selectedCompanions = companions.filter((p) => selected[p.id])

  // Pricing
  const companionTotal = selectedCompanions.reduce((sum, p) => {
    const v = p.variants.find((v) => v.id === chosenVariant[p.id])
    return sum + Number(v?.price ?? p.price)
  }, 0)
  const subtotal = Number(primaryPrice) + companionTotal
  const discountPct = bundle.discountPct ? Number(bundle.discountPct) : 10
  const discount = selectedCompanions.length > 0 ? Math.round(subtotal * (discountPct / 100)) : 0
  const total = subtotal - discount

  const selectAll = () => {
    const newSelected: Record<string, boolean> = {}
    const newChosen: Record<string, string> = { ...chosenVariant }
    for (const p of companions) {
      newSelected[p.id] = true
      if (!newChosen[p.id]) {
        const firstInStock = p.variants.find((v) => v.stock > 0)
        if (firstInStock) newChosen[p.id] = firstInStock.id
      }
    }
    setSelected(newSelected)
    setChosenVariant(newChosen)
  }

  const addAllToCart = () => {
    if (selectedCompanions.length === 0) {
      toast.error("Please select at least one matching piece.")
      return
    }
    // Validate all have a chosen in-stock variant
    for (const p of selectedCompanions) {
      const v = p.variants.find((v) => v.id === chosenVariant[p.id])
      if (!v || v.stock === 0) {
        toast.error(`Please pick an in-stock size/color for ${p.name}.`)
        return
      }
    }

    const setGroupId = crypto.randomUUID()

    for (const p of selectedCompanions) {
      const v = p.variants.find((vv) => vv.id === chosenVariant[p.id])!
      addItem({
        id: v.id,
        variantId: v.id,
        productId: p.id,
        productSlug: p.slug,
        name: p.name,
        price: Number(v.price ?? p.price),
        size: v.size,
        color: v.color,
        image: p.images[0]?.url || "",
        quantity: 1,
        setGroupId,
      })
    }

    toast.success(`Bundle added! ${selectedCompanions.length} matching piece${selectedCompanions.length > 1 ? "s" : ""} in bag!`, {
      description: selectedCompanions.map((p) => p.name).join(" · "),
    })
  }

  if (companions.length === 0) return null

  return (
    <div className="mt-8 border border-[#EDE8DF] rounded-3xl overflow-hidden bg-white shadow-xs">
      <div className="bg-gradient-to-r from-[#F0F7FB] to-[#FFF0F3] px-5 py-4 border-b border-[#EDE8DF] flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#1E3E5B] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF758F]" />
            <span>Complete The Look & Save</span>
          </p>
          <p className="text-xs text-[#6C7A89] mt-0.5">
            Add matching accessories or nursery essentials & get {discountPct}% off the bundle!
          </p>
        </div>
        <button
          type="button"
          onClick={selectAll}
          className="text-xs font-bold text-[#4A8DB7] hover:underline whitespace-nowrap"
        >
          Select All
        </button>
      </div>

      <div className="divide-y divide-[#EDE8DF]">
        {companions.map((product) => {
          const isOn = !!selected[product.id]
          const inStockVariants = product.variants.filter((v) => v.stock > 0)
          const outOfStock = inStockVariants.length === 0
          const currentVariant = product.variants.find((v) => v.id === chosenVariant[product.id])

          const sizes = Array.from(new Set(inStockVariants.map((v) => v.size)))
          const selectedSize = currentVariant?.size || sizes[0]
          const colorsForSize = inStockVariants.filter((v) => v.size === selectedSize).map((v) => v.color)
          const uniqueColors = Array.from(new Set(colorsForSize))

          const handleSizeChange = (size: string) => {
            const v = inStockVariants.find((vv) => vv.size === size)
            if (v) selectVariant(product.id, v.id)
          }
          const handleColorChange = (color: string) => {
            const v = inStockVariants.find((vv) => vv.size === selectedSize && vv.color === color)
            if (v) selectVariant(product.id, v.id)
          }

          return (
            <div key={product.id} className={`px-5 py-4 transition-colors ${isOn ? "bg-[#F0F7FB]/50" : "bg-white"}`}>
              <div className="flex items-center gap-3">
                {/* Toggle checkbox */}
                <button
                  type="button"
                  onClick={() => !outOfStock && toggle(product.id)}
                  disabled={outOfStock}
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                    outOfStock
                      ? "border-[#EDE8DF] opacity-40 cursor-not-allowed"
                      : isOn
                      ? "bg-[#4A8DB7] border-[#4A8DB7]"
                      : "border-[#EDE8DF] hover:border-[#4A8DB7]"
                  }`}
                >
                  {isOn && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </button>

                {/* Image */}
                {product.images[0] && (
                  <div className="relative w-14 h-16 rounded-xl overflow-hidden shrink-0 border border-[#EDE8DF] bg-[#FAF9F5]">
                    <Image src={product.images[0].url} alt={product.name} fill sizes="56px" className="object-cover" />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/shop/${product.slug}`}
                      className="text-xs sm:text-sm font-bold text-[#1E3E5B] hover:text-[#4A8DB7] transition-colors truncate"
                    >
                      {product.name}
                    </Link>
                    <span className="font-mono text-xs font-bold text-[#1E3E5B] shrink-0">
                      ৳{Number(product.price).toLocaleString()}
                    </span>
                  </div>

                  {outOfStock ? (
                    <span className="text-[11px] text-[#6C7A89]">Out of stock</span>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {sizes.length > 1 && (
                        <div className="relative">
                          <select
                            value={selectedSize}
                            onChange={(e) => handleSizeChange(e.target.value)}
                            className="text-xs bg-white border border-[#EDE8DF] rounded-lg px-2 py-1 pr-6 focus:outline-none focus:border-[#4A8DB7] text-[#1E3E5B] appearance-none"
                          >
                            {sizes.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 text-[#6C7A89] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      )}

                      {uniqueColors.length > 1 && (
                        <div className="relative">
                          <select
                            value={currentVariant?.color || uniqueColors[0]}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="text-xs bg-white border border-[#EDE8DF] rounded-lg px-2 py-1 pr-6 focus:outline-none focus:border-[#4A8DB7] text-[#1E3E5B] appearance-none"
                          >
                            {uniqueColors.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 text-[#6C7A89] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer / Add Set Action */}
      {selectedCompanions.length > 0 && (
        <div className="p-5 bg-[#FAF9F5] border-t border-[#EDE8DF] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6C7A89] font-medium">
              Bundle: {primaryName} + {selectedCompanions.length} matching piece{selectedCompanions.length > 1 ? "s" : ""}
            </span>
            <div className="text-right">
              {discount > 0 && (
                <span className="font-mono line-through text-[#6C7A89] text-[11px] mr-1.5">
                  ৳{subtotal.toLocaleString()}
                </span>
              )}
              <span className="font-mono font-black text-sm text-[#1E3E5B]">
                ৳{total.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={addAllToCart}
            className="w-full py-3.5 bg-[#FF758F] hover:bg-[#e05f77] text-white text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#FF758F]/20"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add Matching Pieces to Bag (+ {discountPct}% Off)</span>
          </button>
        </div>
      )}
    </div>
  )
}
