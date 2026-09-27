"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles, ShoppingBag } from "lucide-react"
import ProductCard from "./ProductCard"

type Product = {
  id: string
  name: string
  slug: string
  price: number
  comparePrice: number | null
  images: { url: string }[]
  category: { name: string; slug?: string } | null
  variants: { size: string; color: string; stock: number }[]
}

const AGE_TABS = [
  { code: "0-3M", label: "0–3M Newborn", icon: "🍼", desc: "Kimonos, soft scratch mittens & swaddles" },
  { code: "3-6M", label: "3–6M Infant", icon: "🧸", desc: "2-way zip sleepsuits & playwear" },
  { code: "6-12M", label: "6–12M Crawler", icon: "👶", desc: "Stretch rompers & silicone feeding" },
  { code: "12-18M", label: "12–18M First Steps", icon: "👣", desc: "Dungaree sets & organic daywear" },
  { code: "18-24M", label: "18–24M Toddler", icon: "🎈", desc: "Two-piece cozy pajama sets" },
  { code: "2-4Y", label: "2–4Y Explore", icon: "🌟", desc: "Active playwear & toddler outfits" },
]

export default function HomeAgeFilter({ allProducts }: { allProducts: Product[] }) {
  const [activeCode, setActiveCode] = useState("0-3M")

  const currentTab = AGE_TABS.find((t) => t.code === activeCode) || AGE_TABS[0]

  // Filter products that have variants matching this size, or fallback to all
  const filteredProducts = allProducts.filter((p) =>
    p.variants.some((v) => v.size === activeCode)
  )

  const displayed = filteredProducts.length > 0 ? filteredProducts.slice(0, 4) : allProducts.slice(0, 4)

  return (
    <div className="space-y-8">
      {/* Age Stage Tabs */}
      <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {AGE_TABS.map((tab) => {
          const isActive = tab.code === activeCode
          return (
            <button
              key={tab.code}
              type="button"
              onClick={() => setActiveCode(tab.code)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#4A8DB7] text-white shadow-md shadow-[#4A8DB7]/20 scale-105"
                  : "bg-white text-[#1E3E5B] border border-[#EDE8DF] hover:border-[#4A8DB7] hover:bg-[#F0F7FB]"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Selected Stage Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-white border border-[#EDE8DF] shadow-xs gap-3">
        <div className="text-center sm:text-left">
          <p className="text-xs font-bold text-[#4A8DB7] uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Stage: {currentTab.label}
          </p>
          <p className="text-xs text-[#6C7A89] mt-0.5">{currentTab.desc}</p>
        </div>
        <Link
          href={`/shop?size=${activeCode}`}
          className="text-xs font-bold text-[#1E3E5B] hover:text-[#4A8DB7] flex items-center gap-1 transition-colors shrink-0"
        >
          <span>View All {currentTab.label} ({filteredProducts.length || allProducts.length} items)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-in fade-in duration-300">
        {displayed.map((product) => (
          <ProductCard key={product.id} product={product as any} />
        ))}
      </div>
    </div>
  )
}
