"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Sparkles, Layers } from "lucide-react"

type NavCategory = {
  id: string
  name: string
  slug: string
  description?: string | null
  parentId?: string | null
  parent?: { id: string; name: string; slug: string } | null
  children?: { id: string; name: string; slug: string; description?: string | null }[]
}

export default function ShopHeading({ categories = [] }: { categories?: NavCategory[] }) {
  const sp = useSearchParams()
  const router = useRouter()
  const search = sp.get("search") || ""
  const currentCategorySlug = sp.get("category") || ""

  // Find selected category (could be parent or child)
  let activeCat: NavCategory | undefined
  let parentCat: NavCategory | undefined
  let childPills: { name: string; slug: string }[] = []

  if (currentCategorySlug) {
    for (const c of categories) {
      if (c.slug === currentCategorySlug) {
        activeCat = c
        if (c.children && c.children.length > 0) {
          parentCat = c
          childPills = [{ name: `All ${c.name}`, slug: c.slug }, ...c.children]
        }
        break
      }
      if (c.children) {
        const child = c.children.find((ch) => ch.slug === currentCategorySlug)
        if (child) {
          activeCat = { ...child, parentId: c.id }
          parentCat = c
          childPills = [{ name: `All ${c.name}`, slug: c.slug }, ...c.children]
          break
        }
      }
    }
  }

  function getCategoryPillUrl(slug: string) {
    const p = new URLSearchParams(sp.toString())
    p.set("category", slug)
    return `/shop?${p.toString()}`
  }

  return (
    <div className="w-full space-y-3">
      {/* Breadcrumb / Super-category note */}
      {parentCat && activeCat && parentCat.id !== activeCat.id && (
        <div className="flex items-center gap-1.5 text-xs text-[#6C7A89] font-medium">
          <Link href={`/shop?category=${parentCat.slug}`} className="hover:text-[#4A8DB7] transition-colors">
            {parentCat.name}
          </Link>
          <span>/</span>
          <span className="text-[#1E3E5B] font-bold">{activeCat.name}</span>
        </div>
      )}

      <div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-[#1E3E5B]">
          {search
            ? `Results for "${search}"`
            : activeCat
            ? activeCat.name
            : "Shop All Little Wonders"}
        </h1>
        {activeCat?.description && (
          <p className="text-sm text-[#6C7A89] mt-1 max-w-2xl">{activeCat.description}</p>
        )}
      </div>

      {/* Subcategory Filter Pills */}
      {childPills.length > 0 && (
        <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-[#4A8DB7] shrink-0 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Subcategories:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {childPills.map((pill) => {
              const isSelected = currentCategorySlug === pill.slug
              return (
                <Link
                  key={pill.slug}
                  href={getCategoryPillUrl(pill.slug)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                    isSelected
                      ? "bg-[#4A8DB7] text-white shadow-sm"
                      : "bg-[#FAF9F5] text-[#1E3E5B] hover:bg-[#F0F7FB] hover:text-[#4A8DB7] border border-[#EDE8DF]"
                  }`}
                >
                  {pill.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
