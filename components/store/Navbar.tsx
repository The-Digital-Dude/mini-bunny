"use client"

import Link from "next/link"
import { Search, Heart, User, Menu, X, Zap, ChevronDown, Sparkles, Gift, Baby, Package, Flame } from "lucide-react"
import { useState, useEffect } from "react"
import { useCartStore } from "@/store/useCartStore"
import { useWishlistStore } from "@/store/useWishlistStore"
import CartDrawer from "@/components/store/CartDrawer"
import SearchModal from "@/components/store/SearchModal"
import BunnyLogo from "@/components/store/BunnyLogo"
import ChildSwitcher from "@/components/store/ChildSwitcher"

type NavCategory = {
  id: string
  name: string
  slug: string
  children?: { id: string; name: string; slug: string }[]
}

type NavFlashSale = {
  name: string
  discountType: string
  discountValue: number
  endsAt: string
}

const AGE_STAGES = [
  { label: "0-3 Months", stage: "Newborn", slug: "0-3M" },
  { label: "3-6 Months", stage: "Infant", slug: "3-6M" },
  { label: "6-12 Months", stage: "Crawler", slug: "6-12M" },
  { label: "12-18 Months", stage: "First Steps", slug: "12-18M" },
  { label: "18-24 Months", stage: "Toddler", slug: "18-24M" },
  { label: "2-4 Years", stage: "Play & Explore", slug: "2-4Y" },
]

function useCountdown(endsAt: string) {
  const [label, setLabel] = useState("")
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now()
      if (diff <= 0) {
        setLabel("")
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      const pad = (n: number) => String(n).padStart(2, "0")
      setLabel(`${pad(h)}:${pad(m)}:${pad(s)}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endsAt])
  return label
}

export default function Navbar({
  freeShippingThreshold = null,
  storeName = "Mini Bunny",
  storeTagline = "Made with Love for Little Ones",
  categories = [],
  activeFlashSale = null,
}: {
  freeShippingThreshold?: number | null
  storeName?: string
  storeTagline?: string
  categories?: NavCategory[]
  activeFlashSale?: NavFlashSale | null
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [catDropdownOpen, setCatDropdownOpen] = useState(false)
  const [ageDropdownOpen, setAgeDropdownOpen] = useState(false)

  const itemCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0))
  const wishlistCount = useWishlistStore((s) => s.items.length)
  const flashCountdown = useCountdown(activeFlashSale?.endsAt || "")
  const flashLabel = activeFlashSale
    ? activeFlashSale.discountType === "PERCENTAGE"
      ? `${activeFlashSale.discountValue}% off`
      : `৳${activeFlashSale.discountValue} off`
    : ""

  return (
    <>
      {/* Announcement Bar */}
      <div
        className={`text-white text-center py-2 text-xs md:text-sm font-medium tracking-wide overflow-hidden transition-colors ${
          activeFlashSale && flashCountdown ? "bg-[#FF758F]" : "bg-[#1E3E5B]"
        }`}
      >
        {activeFlashSale && flashCountdown ? (
          <p className="flex items-center justify-center gap-2 flex-wrap">
            <Zap className="w-3 h-3 inline shrink-0" />
            <span>
              {activeFlashSale.name} — {flashLabel} sitewide!
            </span>
            <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-[11px] font-bold">
              Ends in {flashCountdown}
            </span>
            <Zap className="w-3 h-3 inline shrink-0" />
          </p>
        ) : freeShippingThreshold ? (
          <p className="flex items-center justify-center gap-2">
            <span>Free delivery across Bangladesh on orders above ৳{freeShippingThreshold.toLocaleString()}</span>
            <span className="hidden sm:inline">🚚</span>
          </p>
        ) : (
          <p>Hygienic sterile packing · 7-Day size exchange · Made with Love</p>
        )}
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#EDE8DF] bg-white/95 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          {/* Logo & Mobile Menu Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              className="lg:hidden p-2 -ml-2 text-[#1E3E5B] hover:text-[#4A8DB7] transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="inline-flex items-center">
              <BunnyLogo showTagline={false} />
            </Link>
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 mx-6">
            <Link
              href="/"
              className="text-sm font-bold text-[#1E3E5B] hover:text-[#4A8DB7] transition-colors whitespace-nowrap"
            >
              Home
            </Link>

            {/* Categories & Subcategories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCatDropdownOpen(true)}
              onMouseLeave={() => setCatDropdownOpen(false)}
            >
              <button
                type="button"
                className={`text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 py-2 ${
                  catDropdownOpen ? "text-[#4A8DB7]" : "text-[#1E3E5B] hover:text-[#4A8DB7]"
                }`}
              >
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${catDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Mega Dropdown Panel */}
              {catDropdownOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[820px] max-w-[95vw] animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="bg-white border border-[#EDE8DF] rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[85vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#EDE8DF]">
                      <span className="text-xs font-bold text-[#4A8DB7] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> All 9 Mini Bunny Departments
                      </span>
                      <Link
                        href="/shop"
                        className="text-xs font-bold text-[#6C7A89] hover:text-[#4A8DB7] transition-colors"
                      >
                        View All Products →
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {categories.map((cat) => (
                        <div
                          key={cat.id}
                          className="p-3 rounded-2xl bg-[#FAF9F5] hover:bg-[#F0F7FB] border border-[#EDE8DF] transition-colors group flex flex-col justify-between"
                        >
                          <div>
                            <Link
                              href={`/shop?category=${cat.slug}`}
                              className="font-bold text-xs sm:text-sm text-[#1E3E5B] group-hover:text-[#4A8DB7] flex items-center justify-between"
                            >
                              <span className="truncate">{cat.name}</span>
                              <span className="text-xs text-[#6C7A89] group-hover:translate-x-0.5 transition-transform">→</span>
                            </Link>

                            {/* Subcategories */}
                            {cat.children && cat.children.length > 0 && (
                              <div className="mt-2 pt-1.5 border-t border-[#EDE8DF]/70 flex flex-wrap gap-1">
                                {cat.children.slice(0, 3).map((sub) => (
                                  <Link
                                    key={sub.id}
                                    href={`/shop?category=${sub.slug}`}
                                    className="text-[10px] font-medium bg-white hover:bg-[#4A8DB7] hover:text-white text-[#6C7A89] px-2 py-0.5 rounded-md border border-[#EDE8DF] transition-colors"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                                {cat.children.length > 3 && (
                                  <Link
                                    href={`/shop?category=${cat.slug}`}
                                    className="text-[9px] font-bold text-[#4A8DB7] hover:underline px-1 py-0.5"
                                  >
                                    +{cat.children.length - 3} more
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Shop by Age Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setAgeDropdownOpen(true)}
              onMouseLeave={() => setAgeDropdownOpen(false)}
            >
              <button
                type="button"
                className={`text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 py-2 ${
                  ageDropdownOpen ? "text-[#4A8DB7]" : "text-[#1E3E5B] hover:text-[#4A8DB7]"
                }`}
              >
                <span>Shop by Age</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${ageDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {ageDropdownOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-72 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="bg-white border border-[#EDE8DF] rounded-2xl shadow-xl p-3 space-y-1">
                    <div className="px-3 py-1.5 border-b border-[#EDE8DF] mb-1">
                      <span className="text-[10px] font-bold text-[#4A8DB7] uppercase tracking-wider flex items-center gap-1">
                        <Baby className="w-3 h-3" /> Growth Milestones
                      </span>
                    </div>
                    {AGE_STAGES.map((age) => (
                      <Link
                        key={age.slug}
                        href={`/shop?age=${age.slug}`}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-[#F0F7FB] transition-colors group"
                      >
                        <span className="font-bold text-[#1E3E5B] group-hover:text-[#4A8DB7]">{age.label}</span>
                        <span className="text-[10px] font-medium text-[#6C7A89] bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                          {age.stage}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/shop"
              className="text-sm font-bold text-[#1E3E5B] hover:text-[#4A8DB7] transition-colors whitespace-nowrap"
            >
              All Products
            </Link>

            <Link
              href="/bundles"
              className="text-sm font-bold text-[#1E3E5B] hover:text-[#4A8DB7] transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5 text-[#4A8DB7]" />
              <span>Bundles</span>
            </Link>

            <Link
              href="/gifts"
              className="text-sm font-bold text-[#1E3E5B] hover:text-[#FF758F] transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <Gift className="w-3.5 h-3.5 text-[#FF758F]" />
              <span>Gifts</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#FFF0F3] text-[#FF758F] font-bold">New</span>
            </Link>

            <Link
              href="/shop?sale=true"
              className="text-sm font-bold text-[#FF758F] hover:text-[#e0546e] transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Sale</span>
            </Link>
          </nav>

          {/* User, Child Switcher & Cart Icons */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
            {/* Child / Baby Profile Quick Switcher */}
            <ChildSwitcher className="hidden sm:inline-flex" />

            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 text-[#1E3E5B] hover:text-[#4A8DB7] hover:bg-gray-50 rounded-xl transition-colors"
              aria-label="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/wishlist"
              className="p-2.5 hidden sm:flex relative text-[#1E3E5B] hover:text-[#FF758F] hover:bg-pink-50/50 rounded-xl transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute 1 top-1.5 right-1.5 bg-[#FF758F] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/account"
              className="p-2.5 hidden sm:flex text-[#1E3E5B] hover:text-[#4A8DB7] hover:bg-gray-50 rounded-xl transition-colors"
              aria-label="Parent Account & Profile"
            >
              <User className="w-5 h-5" />
            </Link>

            <CartDrawer itemCount={itemCount} freeShippingThreshold={freeShippingThreshold} />
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white p-6 flex flex-col gap-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EDE8DF] pb-4">
              <BunnyLogo showTagline={false} />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Child Switcher */}
            <div className="pt-1">
              <ChildSwitcher className="w-full justify-between" />
            </div>

            <nav className="flex flex-col gap-4 text-sm font-semibold">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="text-[#1E3E5B] hover:text-[#4A8DB7] py-1.5"
              >
                Home
              </Link>
              <Link
                href="/shop"
                onClick={() => setMobileOpen(false)}
                className="text-[#1E3E5B] hover:text-[#4A8DB7] py-1.5"
              >
                All Products
              </Link>

              {/* Categories with Subcategories Accordion */}
              <div className="space-y-2 pt-2 border-t border-[#EDE8DF]">
                <span className="text-[11px] font-bold text-[#4A8DB7] uppercase tracking-wider block mb-1">
                  Categories
                </span>
                {categories.map((cat) => (
                  <div key={cat.id} className="space-y-1">
                    <Link
                      href={`/shop?category=${cat.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="text-[#1E3E5B] hover:text-[#4A8DB7] block font-bold py-1"
                    >
                      {cat.name}
                    </Link>
                    {cat.children && cat.children.length > 0 && (
                      <div className="pl-3 space-y-1 border-l-2 border-[#EBF5FB]">
                        {cat.children.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/shop?category=${sub.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="text-xs text-[#6C7A89] hover:text-[#4A8DB7] block py-0.5"
                          >
                            ↳ {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Shop By Age Group */}
              <div className="space-y-1.5 pt-3 border-t border-[#EDE8DF]">
                <span className="text-[11px] font-bold text-[#4A8DB7] uppercase tracking-wider block mb-1">
                  Shop by Age
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {AGE_STAGES.map((age) => (
                    <Link
                      key={age.slug}
                      href={`/shop?age=${age.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="text-xs text-[#1E3E5B] bg-[#FAF9F5] p-2 rounded-xl text-center hover:bg-[#EBF5FB] font-medium"
                    >
                      {age.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Direct Links */}
              <div className="space-y-2 pt-3 border-t border-[#EDE8DF]">
                <Link
                  href="/bundles"
                  onClick={() => setMobileOpen(false)}
                  className="text-[#1E3E5B] hover:text-[#4A8DB7] flex items-center justify-between py-1"
                >
                  <span>Bundles & Kits</span>
                  <Package className="w-4 h-4 text-[#4A8DB7]" />
                </Link>
                <Link
                  href="/gifts"
                  onClick={() => setMobileOpen(false)}
                  className="text-[#1E3E5B] hover:text-[#FF758F] flex items-center justify-between py-1"
                >
                  <div className="flex items-center gap-2">
                    <span>Gifts</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#FFF0F3] text-[#FF758F] font-bold">
                      New
                    </span>
                  </div>
                  <Gift className="w-4 h-4 text-[#FF758F]" />
                </Link>
                <Link
                  href="/shop?sale=true"
                  onClick={() => setMobileOpen(false)}
                  className="text-[#FF758F] font-bold flex items-center justify-between py-1"
                >
                  <span>Special Offers & Sale</span>
                  <Flame className="w-4 h-4 fill-current" />
                </Link>
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="text-[#1E3E5B] hover:text-[#4A8DB7] flex items-center justify-between py-1"
                >
                  <span>Parent Profile & Orders</span>
                  <User className="w-4 h-4 text-gray-500" />
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
