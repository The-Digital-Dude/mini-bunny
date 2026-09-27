"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter, X } from "lucide-react"
import SizeQuiz from "./SizeQuiz"

type Category = {
  id: string
  name: string
  slug: string
  parentId?: string | null
  children?: { id: string; name: string; slug: string }[]
}
type Brand = { id: string; name: string }

const SIZES = ["0-3M", "3-6M", "6-12M", "12-18M", "18-24M", "2-3Y", "3-4Y"]
const COLORS = [
  { name: "Soft Pink", hex: "#FFB7B2" },
  { name: "Powder Blue", hex: "#A2D2FF" },
  { name: "Butter Yellow", hex: "#FEF08A" },
  { name: "Sage Mint", hex: "#A7D7C5" },
  { name: "Cloud White", hex: "#FFFFFF" },
  { name: "Oatmeal Beige", hex: "#E3D5CA" },
  { name: "Lavender Mist", hex: "#E0BBE4" },
]

export default function ShopFilters({ categories, brands }: { categories: Category[]; brands: Brand[] }) {
  const router = useRouter()
  const sp = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [mobileOpen, setMobileOpen] = useState(false)

  const category = sp.get("category") || ""
  const brandId  = sp.get("brandId")  || ""
  const size     = sp.get("size")     || ""
  const color    = sp.get("color")    || ""
  const minPriceParam = sp.get("minPrice") || ""
  const maxPriceParam = sp.get("maxPrice") || ""
  const sale     = sp.get("sale")     || ""
  const search   = sp.get("search")   || ""

  const [minPrice, setMinPrice] = useState(minPriceParam)
  const [maxPrice, setMaxPrice] = useState(maxPriceParam)

  const hasActiveFilters = !!(category || brandId || size || color || minPriceParam || maxPriceParam || sale)

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams(sp.toString())
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v); else p.delete(k)
    }
    return `/shop?${p.toString()}`
  }

  function navigate(overrides: Record<string, string>) {
    startTransition(() => {
      router.replace(buildUrl(overrides), { scroll: false })
    })
    setMobileOpen(false)
  }

  function clearAll() {
    setMinPrice(""); setMaxPrice("")
    startTransition(() => {
      const p = new URLSearchParams()
      if (search) p.set("search", search)
      router.replace(`/shop?${p.toString()}`, { scroll: false })
    })
    setMobileOpen(false)
  }

  function applyPrice() { navigate({ minPrice, maxPrice }) }
  function clearPrice() { setMinPrice(""); setMaxPrice(""); navigate({ minPrice: "", maxPrice: "" }) }

  // Root categories
  const rootCategories = categories.filter((c) => !c.parentId)

  const filterContent = (
    <div className="space-y-8">
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
        >
          <X className="w-3 h-3" /> Clear All Filters
        </button>
      )}

      {/* Category */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-widest text-bunny-text-muted">Category</h4>
        <ul className="space-y-2 text-sm">
          <li>
            <button
              onClick={() => navigate({ category: "" })}
              className={`flex items-center gap-2.5 w-full text-left hover:text-bunny-blue transition-colors ${!category ? "text-bunny-navy font-bold" : "text-bunny-text-muted"}`}
            >
              <div className={`w-3.5 h-3.5 rounded border shrink-0 ${!category ? "bg-bunny-blue border-bunny-blue" : "border-bunny-border"}`} />
              All Products
            </button>
          </li>
          {(rootCategories.length > 0 ? rootCategories : categories).map((cat) => {
            const isCatActive = category === cat.slug
            const isChildActive = cat.children?.some((child) => child.slug === category)
            const isParentOrChildActive = isCatActive || isChildActive

            return (
              <li key={cat.id} className="space-y-1.5">
                <button
                  onClick={() => navigate({ category: isCatActive ? "" : cat.slug })}
                  className={`flex items-center gap-2.5 w-full text-left hover:text-bunny-blue transition-colors ${isParentOrChildActive ? "text-bunny-navy font-bold" : "text-bunny-text-muted"}`}
                >
                  <div className={`w-3.5 h-3.5 rounded border shrink-0 ${isCatActive ? "bg-bunny-blue border-bunny-blue" : isChildActive ? "bg-[#4A8DB7]/30 border-bunny-blue" : "border-bunny-border"}`} />
                  <span>{cat.name}</span>
                </button>

                {/* Subcategories */}
                {cat.children && cat.children.length > 0 && (
                  <ul className="pl-6 space-y-1 border-l border-[#EDE8DF] ml-1.5 py-0.5">
                    {cat.children.map((sub) => {
                      const isSubActive = category === sub.slug
                      return (
                        <li key={sub.id}>
                          <button
                            onClick={() => navigate({ category: isSubActive ? cat.slug : sub.slug })}
                            className={`text-xs w-full text-left transition-colors flex items-center gap-1.5 py-0.5 ${
                              isSubActive ? "text-[#4A8DB7] font-bold" : "text-[#6C7A89] hover:text-[#4A8DB7]"
                            }`}
                          >
                            <span className="text-[10px] text-gray-300">↳</span>
                            {sub.name}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      {/* Brand */}
      {brands.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-widest text-bunny-text-muted">Brand</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <button
                onClick={() => navigate({ brandId: "" })}
                className={`flex items-center gap-3 w-full text-left hover:text-bunny-blue transition-colors ${!brandId ? "text-bunny-navy font-semibold" : "text-bunny-text-muted"}`}
              >
                <div className={`w-4 h-4 rounded border shrink-0 ${!brandId ? "bg-bunny-blue border-bunny-blue" : "border-bunny-border"}`} />
                All Brands
              </button>
            </li>
            {brands.map((b) => (
              <li key={b.id}>
                <button
                  onClick={() => navigate({ brandId: brandId === b.id ? "" : b.id })}
                  className={`flex items-center gap-3 w-full text-left hover:text-bunny-blue transition-colors ${brandId === b.id ? "text-bunny-navy font-semibold" : "text-bunny-text-muted"}`}
                >
                  <div className={`w-4 h-4 rounded border shrink-0 ${brandId === b.id ? "bg-bunny-blue border-bunny-blue" : "border-bunny-border"}`} />
                  {b.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Size */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase tracking-widest text-bunny-text-muted">Size</h4>
          <SizeQuiz
            variant="inline"
            buttonText="Baby Assistant"
            onSelect={(recSize) => navigate({ size: recSize })}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => {
            const isActive = size === s
            return (
              <button
                key={s}
                onClick={() => navigate({ size: isActive ? "" : s })}
                className={`border px-3 py-1.5 text-xs rounded-full transition-colors ${isActive ? "border-bunny-navy bg-bunny-navy text-white" : "border-bunny-border hover:border-bunny-blue text-bunny-text-muted"}`}
              >
                {s}
              </button>
            )
          })}
        </div>
      </div>

      {/* Color */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-widest text-bunny-text-muted">Color</h4>
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((c) => {
            const isActive = color === c.name
            return (
              <button
                key={c.name}
                onClick={() => navigate({ color: isActive ? "" : c.name })}
                title={c.name}
                className={`w-8 h-8 rounded-full transition-all ${isActive ? "ring-2 ring-offset-2 ring-bunny-blue scale-110" : "hover:scale-110"}`}
                style={{
                  backgroundColor: c.hex,
                  border: c.hex === "#FFFFFF" ? "1px solid #E8E8E4" : "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-widest text-bunny-text-muted">Price Range (৳)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min={0}
            className="w-full bg-bunny-muted border border-transparent focus:border-bunny-blue focus:bg-white rounded-lg px-3 py-2 text-sm outline-none transition-all"
          />
          <span className="text-bunny-text-muted text-xs shrink-0">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min={0}
            className="w-full bg-bunny-muted border border-transparent focus:border-bunny-blue focus:bg-white rounded-lg px-3 py-2 text-sm outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={applyPrice}
            className="flex-1 py-2 bg-bunny-navy text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-bunny-blue transition-colors"
          >
            Apply
          </button>
          {(minPriceParam || maxPriceParam) && (
            <button
              onClick={clearPrice}
              className="px-3 py-2 border border-bunny-border text-xs rounded-lg hover:border-bunny-navy transition-colors text-bunny-text-muted"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Sale toggle */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-widest text-bunny-text-muted">Offers</h4>
        <button
          onClick={() => navigate({ sale: sale === "true" ? "" : "true" })}
          className={`flex items-center gap-3 w-full text-left text-sm hover:text-bunny-blue transition-colors ${sale === "true" ? "text-bunny-navy font-semibold" : "text-bunny-text-muted"}`}
        >
          <div className={`w-4 h-4 rounded border shrink-0 ${sale === "true" ? "bg-bunny-blue border-bunny-blue" : "border-bunny-border"}`} />
          Sale Items Only
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile filter button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 text-sm font-medium border border-bunny-border px-4 py-2 rounded-full"
      >
        <Filter className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
        Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-bunny-blue inline-block" />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto w-80 max-w-full bg-white h-full overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Filters</h3>
              <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-bunny-muted rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <h3 className={`font-bold text-sm uppercase tracking-widest ${isPending ? "opacity-50" : ""}`}>
            Filters {isPending && <span className="ml-1 text-xs font-normal text-bunny-text-muted">(loading…)</span>}
          </h3>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-xs text-bunny-text-muted hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
        {filterContent}
      </div>
    </>
  )
}
