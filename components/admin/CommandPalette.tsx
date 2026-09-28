"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  ShoppingCart,
  ShoppingBag,
  Users,
  Package,
  BarChart2,
  Tag,
  CreditCard,
  Zap,
  Ticket,
  PlusCircle,
  ExternalLink,
  Settings,
  Sparkles,
  ArrowRight,
  Loader2,
  Gift,
  RotateCcw,
  Wallet,
  Receipt,
  X,
} from "lucide-react"
import { useAdminStore } from "@/store/useAdminStore"
import { cn } from "@/lib/utils"

type SearchResult = {
  type: "order" | "product" | "customer"
  id: string
  label: string
  sub: string
  href: string
}

const quickNavItems = [
  { label: "Dashboard", href: "/admin", icon: BarChart2, category: "Overview" },
  { label: "Orders List", href: "/admin/orders", icon: ShoppingCart, category: "Sales" },
  { label: "Create New Order", href: "/admin/orders/new", icon: PlusCircle, category: "Actions" },
  { label: "Products Catalog", href: "/admin/products", icon: ShoppingBag, category: "Catalog" },
  { label: "Add New Product", href: "/admin/products/new", icon: PlusCircle, category: "Actions" },
  { label: "Inventory & Stock", href: "/admin/inventory", icon: Package, category: "Catalog" },
  { label: "Stock Alerts", href: "/admin/stock-alerts", icon: Zap, category: "Catalog" },
  { label: "Customers & Parents", href: "/admin/customers", icon: Users, category: "Customers" },
  { label: "Gift Cards", href: "/admin/gift-cards", icon: CreditCard, category: "Marketing" },
  { label: "Promo Coupons", href: "/admin/coupons", icon: Ticket, category: "Marketing" },
  { label: "Flash Sales", href: "/admin/flash-sales", icon: Zap, category: "Marketing" },
  { label: "Store Credit Wallets", href: "/admin/store-credit", icon: Wallet, category: "VIP & Loyalty" },
  { label: "Loyalty & Bunny Club", href: "/admin/loyalty", icon: Gift, category: "VIP & Loyalty" },
  { label: "Returns & Exchanges", href: "/admin/returns", icon: RotateCcw, category: "Orders" },
  { label: "Expenses & P&L", href: "/admin/expenses", icon: Receipt, category: "Finance" },
  { label: "Store Settings", href: "/admin/settings", icon: Settings, category: "System" },
]

export function CommandPalette() {
  const router = useRouter()
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useAdminStore()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setCommandPaletteOpen(!isCommandPaletteOpen)
      }
      if (e.key === "Escape" && isCommandPaletteOpen) {
        setCommandPaletteOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isCommandPaletteOpen, setCommandPaletteOpen])

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setSelectedIndex(0)
    } else {
      setQuery("")
      setResults([])
    }
  }, [isCommandPaletteOpen])

  // Live search query
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.results || [])
        }
      } catch (err) {
        console.error("Search error:", err)
      } finally {
        setLoading(false)
      }
    }, 200)
  }, [query])

  if (!isCommandPaletteOpen) return null

  const filteredNav = query.trim()
    ? quickNavItems.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : quickNavItems.slice(0, 8)

  const handleNavigate = (href: string) => {
    setCommandPaletteOpen(false)
    router.push(href)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200/80 ring-1 ring-black/5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-100 px-4 py-3.5 bg-slate-50/50">
          {loading ? (
            <Loader2 className="w-5 h-5 text-amber-500 animate-spin shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders, products, customers, or jump to page..."
            className="w-full bg-transparent pl-3 pr-8 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results / Navigation Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Live Search Results */}
          {results.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Search Results
              </div>
              <div className="mt-1 space-y-1">
                {results.map((r) => (
                  <button
                    key={`${r.type}-${r.id}`}
                    onClick={() => handleNavigate(r.href)}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={cn(
                          "rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0",
                          r.type === "order" && "bg-sky-100 text-sky-700",
                          r.type === "product" && "bg-emerald-100 text-emerald-700",
                          r.type === "customer" && "bg-violet-100 text-violet-700"
                        )}
                      >
                        {r.type}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {r.label}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{r.sub}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-slate-600 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Navigation Items */}
          <div>
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>{query.trim() ? "Matching Pages & Actions" : "Quick Actions & Pages"}</span>
              <span className="text-[10px] font-normal lowercase text-slate-400">
                press Esc to exit
              </span>
            </div>
            <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1">
              {filteredNav.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavigate(item.href)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 transition-colors group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {item.category}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 bg-slate-50 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white px-1.5 py-0.5 border border-slate-200 text-[10px] font-mono text-slate-600">
                ↑
              </kbd>
              <kbd className="rounded bg-white px-1.5 py-0.5 border border-slate-200 text-[10px] font-mono text-slate-600">
                ↓
              </kbd>{" "}
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white px-1.5 py-0.5 border border-slate-200 text-[10px] font-mono text-slate-600">
                ↵
              </kbd>{" "}
              select
            </span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <span>Live Store</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
