"use client"

import { useState } from "react"
import Image from "next/image"
import { useCartStore } from "@/store/useCartStore"
import { toast } from "sonner"
import { ShoppingBag, ArrowLeft, Check, Sparkles, Gift } from "lucide-react"
import Link from "next/link"
import { BunnyIcon } from "@/components/store/BunnyLogo"

interface Variant { id: string; size: string | null; color: string | null; stock: number; price: number }
interface Product { id: string; name: string; slug: string; price: number; images: { url: string }[]; variants: Variant[] }
interface BundleItem { id: string; quantity: number; product: Product }
interface Bundle {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  type: string
  minItems: number | null
  maxItems: number | null
  items: BundleItem[]
}

export default function BundleDetail({ bundle }: { bundle: Bundle }) {
  const { addItem } = useCartStore()
  // For PICK_N: track which items are selected
  const isPickN = bundle.type === "PICK_N"
  const [selected, setSelected] = useState<Set<string>>(
    isPickN ? new Set() : new Set(bundle.items.map((i) => i.id))
  )
  // Per-item variant selection
  const [variantMap, setVariantMap] = useState<Record<string, string>>({})

  const setTotal = bundle.items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0)
  const wasTotal = bundle.items.reduce((s, i) => {
    const was = (i.product as any).comparePrice ? Number((i.product as any).comparePrice) : Number(i.product.price)
    return s + was * i.quantity
  }, 0)
  const savings = wasTotal > setTotal ? wasTotal - setTotal : null
  const minPick = bundle.minItems ?? bundle.items.length
  const maxPick = bundle.maxItems ?? bundle.items.length
  const canAdd = isPickN
    ? selected.size >= minPick && selected.size <= maxPick
    : true

  const toggleItem = (id: string) => {
    if (!isPickN) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < maxPick) next.add(id)
      return next
    })
  }

  const handleAddAll = () => {
    const itemsToAdd = bundle.items.filter((i) => selected.has(i.id))
    let allOk = true
    for (const item of itemsToAdd) {
      const variantId = variantMap[item.id]
      const variant = variantId
        ? item.product.variants.find((v) => v.id === variantId)
        : item.product.variants.find((v) => v.stock > 0)
      if (!variant) { allOk = false; continue }
      addItem({
        id: variant.id,
        productId: item.product.id,
        productSlug: item.product.slug,
        variantId: variant.id,
        name: item.product.name,
        price: Number(item.product.price),
        image: item.product.images[0]?.url ?? "",
        quantity: item.quantity,
        size: variant.size ?? "",
        color: variant.color ?? "",
      })
    }
    if (allOk) toast.success(`${itemsToAdd.length} items added to bag!`)
    else toast.error("Some items are out of stock")
  }

  const firstImage = bundle.image ?? bundle.items[0]?.product.images[0]?.url

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 animate-in fade-in duration-500">
      <div className="mb-6">
        <Link
          href="/bundles"
          className="text-xs font-bold text-[#4A8DB7] hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> All Baby Bundles
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Image */}
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#FAF9F5] border border-[#EDE8DF] shadow-sm">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={bundle.name}
              fill
              sizes="(max-width: 1024px) 100vw, 512px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="grid grid-cols-2 h-full gap-2 p-2">
              {bundle.items.slice(0, 4).map((item) => (
                <div key={item.id} className="relative overflow-hidden rounded-2xl bg-white border border-[#EDE8DF]">
                  {item.product.images[0] && (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 256px"
                      className="object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {savings && savings > 0 && (
            <div className="absolute top-4 left-4 bg-[#FF758F] text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              Save ৳{savings.toLocaleString()}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF5FB] text-[#4A8DB7] font-bold text-xs uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5" /> Curated Bundle
            </div>
            <h1 className="text-3xl lg:text-4xl font-heading font-black text-[#1E3E5B]">
              {bundle.name}
            </h1>
            {bundle.description && (
              <p className="text-sm text-[#6C7A89] leading-relaxed pt-1">
                {bundle.description}
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-3 pt-2">
            <span className="text-3xl font-mono font-black text-[#1E3E5B]">
              ৳{setTotal.toLocaleString()}
            </span>
            {savings && savings > 0 && (
              <>
                <span className="text-lg font-mono text-[#6C7A89] line-through">
                  ৳{wasTotal.toLocaleString()}
                </span>
                <span className="text-xs bg-[#FFF0F3] text-[#FF758F] font-black px-2.5 py-1 rounded-full">
                  Save ৳{savings.toLocaleString()}
                </span>
              </>
            )}
          </div>

          {isPickN && (
            <p className="text-xs font-medium text-[#4A8DB7] bg-[#EBF5FB] rounded-2xl px-4 py-2.5 border border-[#D0E8F7]">
              Choose {minPick === maxPick ? minPick : `${minPick}–${maxPick}`} items · {selected.size} selected
            </p>
          )}

          {/* Items list */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#1E3E5B] uppercase tracking-wider">Included in this Bundle</p>
            {bundle.items.map((item) => {
              const isSelected = selected.has(item.id)
              const inStockVariants = item.product.variants.filter((v) => v.stock > 0)
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`flex items-center gap-3.5 border rounded-2xl p-3.5 transition-all ${
                    isPickN ? "cursor-pointer" : ""
                  } ${isSelected ? "border-[#4A8DB7] bg-[#EBF5FB]/30 shadow-sm" : "border-[#EDE8DF] opacity-60 bg-white"}`}
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white border border-[#EDE8DF] shrink-0">
                    {item.product.images[0] && (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-[#1E3E5B] truncate">{item.product.name}</p>
                    <p className="text-[11px] text-[#6C7A89] mt-0.5">Qty: {item.quantity} · 100% Organic</p>
                  </div>
                  
                  {/* Variant picker */}
                  {isSelected && inStockVariants.length > 1 && (
                    <select
                      value={variantMap[item.id] ?? ""}
                      onChange={(e) => {
                        e.stopPropagation()
                        setVariantMap((p) => ({ ...p, [item.id]: e.target.value }))
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs border border-[#EDE8DF] rounded-xl px-2.5 py-1.5 bg-white text-[#1E3E5B] focus:border-[#4A8DB7] outline-none"
                    >
                      <option value="">Auto Size</option>
                      {inStockVariants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {[v.size, v.color].filter(Boolean).join(" / ")}
                        </option>
                      ))}
                    </select>
                  )}
                  {inStockVariants.length === 0 && (
                    <span className="text-xs text-red-500 font-medium shrink-0">Out of stock</span>
                  )}
                </div>
              )
            })}
          </div>

          <button
            onClick={handleAddAll}
            disabled={!canAdd}
            className="w-full py-4 bg-[#4A8DB7] hover:bg-[#367299] text-white rounded-2xl font-bold text-sm shadow-bunny hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <ShoppingBag className="w-4 h-4" />
            {isPickN ? `Add Selected (${selected.size}) to Bag` : "Add Bundle to Bag"}
          </button>

          <p className="text-[11px] text-[#6C7A89] text-center">
            All bundle items include <strong>7-Day Size Guarantee</strong> & sterile hygienic packaging.
          </p>
        </div>
      </div>
    </div>
  )
}
