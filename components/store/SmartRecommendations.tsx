"use client"

import { useState, useEffect } from "react"
import { useParentProfile } from "@/hooks/useParentProfile"
import ProductCard from "@/components/store/ProductCard"
import { BunnyIcon } from "@/components/store/BunnyLogo"
import { Sparkles, Baby, ArrowRight, Heart, RefreshCw } from "lucide-react"
import Link from "next/link"

export interface SmartRecommendationsProps {
  title?: string
  subtitle?: string
  limit?: number
  defaultAgeMonths?: number
  showStageFilter?: boolean
}

const AGE_STAGES = [
  { code: "0-3M", label: "0–3 Mo (Newborn)", minM: 0, maxM: 3, icon: "🍼", desc: "Kimonos, soft mittens & sleepsuits" },
  { code: "3-6M", label: "3–6 Mo", minM: 3, maxM: 6, icon: "🧸", desc: "Roll & play rompers & teethers" },
  { code: "6-12M", label: "6–12 Mo", minM: 6, maxM: 12, icon: "👶", desc: "Crawling wear & silicone weaning sets" },
  { code: "12-24M", label: "12–24 Mo", minM: 12, maxM: 24, icon: "👣", desc: "First steps clothing & day sets" },
  { code: "2-4Y", label: "2–4 Years", minM: 24, maxM: 48, icon: "🎈", desc: "Active play sets & breathable tees" },
]

export default function SmartRecommendations({
  title,
  subtitle,
  limit = 4,
  defaultAgeMonths,
  showStageFilter = true,
}: SmartRecommendationsProps) {
  const { profile, hasProfile } = useParentProfile()
  
  // Determine active stage
  const effectiveAgeMonths = defaultAgeMonths ?? profile?.ageMonths ?? 5
  
  const initialStage = AGE_STAGES.find(
    (s) => effectiveAgeMonths >= s.minM && effectiveAgeMonths < s.maxM
  ) || AGE_STAGES[2]

  const [activeStage, setActiveStage] = useState(initialStage)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false
    setLoading(true)

    // Fetch products filtered by size / category matching age
    fetch(`/api/store/products?size=${encodeURIComponent(activeStage.code)}&limit=${limit}`)
      .then((r) => r.json())
      .then((data) => {
        if (!isCancelled) {
          setProducts(data.products || [])
          setLoading(false)
        }
      })
      .catch(() => {
        // Fallback fetch all
        fetch(`/api/store/products?limit=${limit}`)
          .then((r) => r.json())
          .then((data) => {
            if (!isCancelled) {
              setProducts(data.products || [])
              setLoading(false)
            }
          })
          .catch(() => {
            if (!isCancelled) setLoading(false)
          })
      })

    return () => {
      isCancelled = true
    }
  }, [activeStage, limit])

  const headingTitle = title || (hasProfile && profile?.babyName
    ? `Recommended for ${profile.babyName}`
    : "Smart Age-Based Recommendations")

  const headingSubtitle = subtitle || (hasProfile && profile?.babyName
    ? `Tailored specifically for ${profile.babyName}'s stage (${profile.calculatedAgeText})`
    : "Discover the best outfits & essentials for your baby's exact development stage")

  return (
    <div className="w-full bg-white rounded-3xl border border-[#EDE8DF] p-6 md:p-10 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EDE8DF] pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF5FB] text-[#4A8DB7] font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Smart Fit & Stage Guide</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-heading font-black text-[#1E3E5B]">
            {headingTitle}
          </h2>
          <p className="text-xs md:text-sm text-[#6C7A89]">
            {headingSubtitle}
          </p>
        </div>

        <Link
          href={`/shop?size=${encodeURIComponent(activeStage.code)}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A8DB7] hover:text-[#367299] transition-colors self-start md:self-auto"
        >
          <span>View All in {activeStage.code}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stage Selector Tabs */}
      {showStageFilter && (
        <div className="flex overflow-x-auto gap-2.5 pb-2 hide-scrollbar">
          {AGE_STAGES.map((stg) => {
            const isSelected = activeStage.code === stg.code
            return (
              <button
                key={stg.code}
                type="button"
                onClick={() => setActiveStage(stg)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? "bg-[#4A8DB7] text-white border-[#4A8DB7] shadow-sm"
                    : "bg-[#FAF9F5] text-[#6C7A89] border-[#EDE8DF] hover:border-[#4A8DB7] hover:text-[#1E3E5B]"
                }`}
              >
                <span>{stg.icon}</span>
                <span>{stg.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isSelected ? "bg-white/20 text-white" : "bg-white text-[#6C7A89]"}`}>
                  {stg.code}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Stage Context Note */}
      <div className="p-3.5 bg-[#FAF9F5] rounded-2xl border border-[#EDE8DF] flex items-center justify-between text-xs text-[#6C7A89]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1E3E5B]">Stage Essentials:</span>
          <span>{activeStage.desc}</span>
        </div>
        <span className="font-mono font-bold text-[#4A8DB7]">{activeStage.code}</span>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-pulse">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-[#FAF9F5] rounded-3xl border border-[#EDE8DF]" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, limit).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 space-y-3 bg-[#FAF9F5] rounded-3xl border border-[#EDE8DF]">
          <BunnyIcon className="w-10 h-10 mx-auto text-[#4A8DB7]" />
          <p className="font-bold text-sm text-[#1E3E5B]">Discovering items for {activeStage.label}...</p>
          <Link
            href={`/shop?size=${encodeURIComponent(activeStage.code)}`}
            className="inline-block px-6 py-2.5 bg-[#4A8DB7] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#367299] transition-colors"
          >
            Browse All {activeStage.code} Products
          </Link>
        </div>
      )}
    </div>
  )
}
