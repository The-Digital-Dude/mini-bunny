"use client"

import { useState, useMemo, useEffect } from "react"
import { toast } from "sonner"
import { useCartStore } from "@/store/useCartStore"
import { useCompareStore } from "@/store/useCompareStore"
import { useParentProfile } from "@/hooks/useParentProfile"
import { calculateBabySize } from "@/components/store/SizeQuiz"
import NotifyMeForm from "@/components/store/NotifyMeForm"
import SizeGuideModal from "@/components/store/SizeGuideModal"
import WhatsAppOrderButton from "@/components/store/WhatsAppOrderButton"
import { Columns2, Truck, Clock, Sparkles, Baby, Calculator, Check, ArrowRight, Heart } from "lucide-react"

export default function VariantSelector({
  product,
  flashSale,
  attr1Label = "Size",
  attr2Label = "Color",
  categoryId,
  sizeChartImage,
}: {
  product: any
  flashSale?: any
  attr1Label?: string
  attr2Label?: string
  categoryId?: string
  sizeChartImage?: string | null
}) {
  const variants = product.variants || []
  const addItem = useCartStore((s) => s.addItem)
  const { toggleItem: toggleCompare, hasItem: inCompare } = useCompareStore()
  const comparing = inCompare(product.id)
  const { profile } = useParentProfile()

  const sizes = Array.from(new Set(variants.map((v: any) => v.size))) as string[]
  const colors = Array.from(new Set(variants.map((v: any) => v.color))) as string[]

  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] || null)
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] || null)
  const [showAssistant, setShowAssistant] = useState(false)
  const [assistantAge, setAssistantAge] = useState(6)
  const [assistantWeight, setAssistantWeight] = useState(7.5)

  // Auto-apply saved baby profile recommendation if available
  useEffect(() => {
    if (profile && profile.recommendedSize && sizes.includes(profile.recommendedSize)) {
      setSelectedSize(profile.recommendedSize)
    }
  }, [profile, sizes])

  const calculatedAssistant = useMemo(() => {
    return calculateBabySize({ ageMonths: assistantAge, weightKg: assistantWeight })
  }, [assistantAge, assistantWeight])

  const activeVariant = useMemo(() => {
    return variants.find((v: any) => v.size === selectedSize && v.color === selectedColor)
  }, [selectedSize, selectedColor, variants])

  const stock = activeVariant?.stock || 0
  const isOutOfStock = stock === 0
  const isLowStock = stock > 0 && stock <= 5
  const variantEffectivePrice = Number(activeVariant?.price ?? product.price) || 0
  const variantComparePriceRaw = activeVariant?.comparePrice ? Number(activeVariant.comparePrice) : null
  const variantComparePrice = variantComparePriceRaw && variantComparePriceRaw > variantEffectivePrice ? variantComparePriceRaw : null

  // Delivery estimate: order before 3pm -> ships today
  const now = new Date()
  const cutoffHour = 15
  const shipsToday = now.getHours() < cutoffHour
  const dispatchDay = shipsToday ? "today" : "tomorrow"
  const arrivalDays = "2–4 business days across Bangladesh"

  const addToCart = () => {
    if (!activeVariant) return toast.error("Please select a size and color.")
    if (isOutOfStock) return toast.error("This item is currently out of stock.")

    const basePrice = activeVariant.price ?? product.price
    const finalPrice = flashSale ? (
      flashSale.discountType === "PERCENTAGE" 
        ? Math.max(0, basePrice - Math.round((basePrice * flashSale.discountValue) / 100))
        : Math.max(0, basePrice - flashSale.discountValue)
    ) : basePrice

    const image = product.images?.[0]?.url || ""

    addItem({
      id: activeVariant.id,
      variantId: activeVariant.id,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      price: Number(finalPrice),
      size: selectedSize!,
      color: selectedColor!,
      image,
      quantity: 1,
    })

    toast.success(`Added to bag!`, {
      description: `${product.name} — ${selectedSize} / ${selectedColor}`,
    })
  }

  return (
    <div id="variant-selector" className="space-y-6">
      {/* Saved Baby Profile Recommendation Banner */}
      {profile && profile.babyName && (
        <div className="p-3.5 bg-gradient-to-r from-[#F0F7FB] to-[#FFF0F3] border border-[#4A8DB7]/30 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl shrink-0">👶</span>
            <div className="text-xs min-w-0">
              <p className="font-bold text-[#1E3E5B] truncate">
                Fit for {profile.babyName} ({profile.calculatedAgeText})
              </p>
              <p className="text-[#6C7A89] text-[11px]">
                Recommended size: <strong className="text-[#4A8DB7] font-extrabold">{profile.recommendedSize}</strong>
              </p>
            </div>
          </div>
          {sizes.includes(profile.recommendedSize) && selectedSize !== profile.recommendedSize && (
            <button
              type="button"
              onClick={() => setSelectedSize(profile.recommendedSize)}
              className="px-3 py-1.5 bg-[#4A8DB7] hover:bg-[#3d779c] text-white text-[11px] font-bold rounded-xl transition-colors shrink-0 shadow-xs"
            >
              Select {profile.recommendedSize}
            </button>
          )}
        </div>
      )}

      {/* Colors Selector */}
      {colors.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E3E5B] flex items-center gap-1.5">
              <span>{attr2Label}:</span>
              <span className="font-medium text-[#4A8DB7] normal-case">{selectedColor}</span>
            </h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((color) => {
              const hasStock = variants.some((v: any) => v.color === color && v.stock > 0)
              const variant = variants.find((v: any) => v.color === color)
              const isActive = selectedColor === color

              const hexMap: Record<string, string> = {
                'Soft Pink': '#FFB7B2',
                'Powder Blue': '#A2D2FF',
                'Buttercup Yellow': '#FEF08A',
                'Pastel Yellow': '#FEF08A',
                'Sage Mint': '#A7D7C5',
                'Cloud White': '#FFFFFF',
                'Pure White': '#FFFFFF',
                'Oatmeal Beige': '#E3D5CA',
                'Lavender Mist': '#E0BBE4',
                'Denim Blue': '#1E3A8A',
                'Dusty Rose': '#FDA4AF',
                'Sage Green': '#A7D7C5',
                'Warm Mustard': '#FDE047',
              }
              const colorHex = variant?.colorHex || hexMap[color] || '#E3D5CA'

              return (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  disabled={!hasStock}
                  title={color}
                  className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                    isActive
                      ? 'border-[#4A8DB7] bg-[#F0F7FB] text-[#1E3E5B] font-bold shadow-xs'
                      : 'border-[#EDE8DF] bg-white text-[#6C7A89] hover:border-[#4A8DB7] hover:text-[#1E3E5B]'
                  } ${!hasStock ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: colorHex }}
                  />
                  <span className="text-xs">{color}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Sizes Selector */}
      {sizes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E3E5B] flex items-center gap-1.5">
              <span>{attr1Label}:</span>
              <span className="font-medium text-[#4A8DB7] normal-case">{selectedSize}</span>
            </h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAssistant(!showAssistant)}
                className="text-xs font-bold text-[#4A8DB7] hover:text-[#3d779c] flex items-center gap-1 hover:underline"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Size Assistant</span>
              </button>
              {categoryId && <SizeGuideModal categoryId={categoryId} sizeChartImage={sizeChartImage} />}
            </div>
          </div>

          {/* Inline Interactive Baby Size Assistant */}
          {showAssistant && (
            <div className="p-4 bg-[#FAF9F5] border border-[#EDE8DF] rounded-3xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#EDE8DF] pb-2">
                <span className="text-xs font-bold text-[#1E3E5B] flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-[#4A8DB7]" /> Mini Bunny Size Calculator
                </span>
                <button
                  type="button"
                  onClick={() => setShowAssistant(false)}
                  className="text-xs text-[#6C7A89] hover:text-[#1E3E5B]"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#6C7A89] block mb-1">Baby Age (Months)</label>
                  <input
                    type="number"
                    min="0"
                    max="48"
                    value={assistantAge}
                    onChange={(e) => setAssistantAge(Number(e.target.value))}
                    className="w-full h-8 px-2.5 bg-white border border-[#EDE8DF] rounded-xl text-xs font-bold text-[#1E3E5B] focus:outline-none focus:border-[#4A8DB7]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#6C7A89] block mb-1">Baby Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="2"
                    max="25"
                    value={assistantWeight}
                    onChange={(e) => setAssistantWeight(Number(e.target.value))}
                    className="w-full h-8 px-2.5 bg-white border border-[#EDE8DF] rounded-xl text-xs font-bold text-[#1E3E5B] focus:outline-none focus:border-[#4A8DB7]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between bg-white p-3 rounded-2xl border border-[#EDE8DF]">
                <div>
                  <span className="text-[11px] text-[#6C7A89] block">Recommended Size:</span>
                  <span className="text-sm font-extrabold text-[#4A8DB7]">{calculatedAssistant.sizeLabel}</span>
                </div>
                {sizes.includes(calculatedAssistant.sizeCode) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSize(calculatedAssistant.sizeCode)
                      setShowAssistant(false)
                      toast.success(`Selected recommended size: ${calculatedAssistant.sizeCode}`)
                    }}
                    className="px-3.5 py-1.5 bg-[#4A8DB7] hover:bg-[#3d779c] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>Apply Size</span>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Size Pill Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
            {sizes.map((size) => {
              const specificVariant = variants.find((v: any) => v.size === size && v.color === selectedColor)
              const hasStock = specificVariant && specificVariant.stock > 0
              const isActive = selectedSize === size

              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  disabled={!hasStock}
                  className={`relative flex flex-col items-center justify-center rounded-2xl border py-2.5 px-2 transition-all ${
                    isActive
                      ? "border-[#4A8DB7] bg-[#4A8DB7] text-white font-bold shadow-md shadow-[#4A8DB7]/20 scale-[1.02]"
                      : "border-[#EDE8DF] bg-white text-[#1E3E5B] hover:border-[#4A8DB7] hover:bg-[#F0F7FB]"
                  } ${!hasStock ? "opacity-35 cursor-not-allowed bg-[#FAF9F5]" : ""}`}
                >
                  <span className="text-xs">{size}</span>
                  {hasStock && specificVariant.stock <= 5 && (
                    <span className={`text-[9px] font-semibold mt-0.5 ${isActive ? "text-white/80" : "text-[#FF758F]"}`}>
                      {specificVariant.stock} left
                    </span>
                  )}
                  {hasStock && specificVariant.stock > 5 && (
                    <span className={`text-[9px] mt-0.5 ${isActive ? "text-white/80" : "text-[#6C7A89]"}`}>
                      In Stock
                    </span>
                  )}
                  {!hasStock && (
                    <span className="text-[9px] text-[#6C7A89]/60 mt-0.5">Sold Out</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Sale / Compare Price Callout */}
      {variantComparePrice && activeVariant && (
        <div className="flex items-center gap-2 pt-1">
          <span className="text-sm text-[#6C7A89] line-through">৳{variantComparePrice.toLocaleString()}</span>
          <span className="text-xs bg-[#FFF0F3] text-[#FF758F] font-extrabold px-2.5 py-0.5 rounded-full border border-[#FF758F]/20">
            Save {Math.round((1 - Number(activeVariant.price ?? product.price) / variantComparePrice) * 100)}%
          </span>
        </div>
      )}

      {/* Add To Cart & Ordering Actions */}
      <div className="pt-2 space-y-3">
        {/* Low Stock Warning */}
        {isLowStock && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#FFF0F3] border border-[#FF758F]/30 rounded-2xl">
            <span className="w-2 h-2 rounded-full bg-[#FF758F] shrink-0 animate-pulse" />
            <p className="text-xs font-semibold text-[#FF758F]">
              Low Stock: Only {stock} pieces left in warehouse!
            </p>
          </div>
        )}

        {/* Add to bag button */}
        {!isOutOfStock ? (
          <>
            <button
              id="add-to-bag-btn"
              onClick={addToCart}
              disabled={!activeVariant}
              className="w-full py-4 text-sm font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 bg-[#4A8DB7] hover:bg-[#3d779c] text-white rounded-2xl shadow-md hover:shadow-lg shadow-[#4A8DB7]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!activeVariant ? "Select a size" : `Add to Bag · ৳${variantEffectivePrice.toLocaleString()}`}
            </button>

            {/* Direct WhatsApp Ordering */}
            <WhatsAppOrderButton
              productName={product.name}
              size={selectedSize || undefined}
              color={selectedColor || undefined}
              price={variantEffectivePrice}
            />
          </>
        ) : (
          <NotifyMeForm variantId={activeVariant?.id || ""} />
        )}

        {/* Delivery info */}
        {!isOutOfStock && (
          <div className="flex items-center justify-between gap-2 pt-2 text-xs text-[#6C7A89] px-1">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#4A8DB7] shrink-0" />
              <span>Ships {dispatchDay} across Bangladesh</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#4A8DB7] shrink-0" />
              <span>{arrivalDays}</span>
            </div>
          </div>
        )}

        {/* Compare */}
        <button
          type="button"
          onClick={() => {
            toggleCompare({ id: product.id, name: product.name, slug: product.slug, price: Number(product.price), image: product.images?.[0]?.url })
            toast.success(comparing ? "Removed from compare" : "Added to compare", { action: { label: "View compare", onClick: () => window.location.href = "/compare" } })
          }}
          className={`w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-2xl border transition-all flex items-center justify-center gap-2 ${
            comparing
              ? "border-[#4A8DB7] text-[#4A8DB7] bg-[#F0F7FB]"
              : "border-[#EDE8DF] text-[#6C7A89] hover:border-[#1E3E5B] hover:text-[#1E3E5B] bg-white"
          }`}
        >
          <Columns2 className="w-3.5 h-3.5" />
          <span>{comparing ? "In Comparison" : "Compare Product"}</span>
        </button>
      </div>
    </div>
  )
}
