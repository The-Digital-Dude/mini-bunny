"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Search,
  ShoppingCart,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  Settings,
  ExternalLink,
  ChevronRight,
  Package,
  RotateCcw,
  CreditCard,
  CheckCircle2,
  Sparkles,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/admin/Sidebar"
import { useAdminStore } from "@/store/useAdminStore"
import { BunnyIcon } from "@/components/store/BunnyLogo"
import { cn } from "@/lib/utils"

export default function AdminTopbar({ email }: { email: string }) {
  const pathname = usePathname()
  const { setCommandPaletteOpen, badges, fetchBadges } = useAdminStore()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)

  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch("/api/admin/notifications")
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications || [])
        }
      } catch (err) {
        console.warn("Failed to load notifications:", err)
      }
    }
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdowns on click outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false)
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Dynamic breadcrumb generation
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/")
    let label = seg
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
    if (seg === "admin") label = "Admin"
    return { label, href, isLast: idx === segments.length - 1 }
  })

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 lg:px-6 backdrop-blur-md transition-all">
      {/* Left Area: Mobile Trigger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger render={
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors md:hidden">
              <Menu className="w-5 h-5" />
            </button>
          } />
          <SheetContent side="left" className="p-0 w-[260px] bg-[#0F1E36] text-white border-r border-white/10">
            <div className="flex h-14 items-center gap-2.5 border-b border-white/10 px-4">
              <BunnyIcon className="w-7 h-7" />
              <span className="font-heading font-extrabold text-sm tracking-tight text-white">
                Mini<span className="text-sky-400">Bunny</span>
              </span>
              <span className="ml-auto rounded bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-sky-300">
                Admin
              </span>
            </div>
            <div className="flex-1 overflow-y-auto py-3">
              <Sidebar isMobile onClose={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Dynamic Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
          {breadcrumbs.map((bc, idx) => (
            <div key={bc.href} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
              {bc.isLast ? (
                <span className="font-semibold text-slate-900 truncate max-w-[150px] lg:max-w-[200px]">
                  {bc.label}
                </span>
              ) : (
                <Link
                  href={bc.href}
                  className="hover:text-slate-900 transition-colors truncate max-w-[100px]"
                >
                  {bc.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Center/Right Area: Command Bar & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button (triggers Command Palette) */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="group flex h-9 w-44 sm:w-64 lg:w-80 items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/90 px-3 text-xs text-slate-400 hover:border-slate-300 hover:bg-white hover:text-slate-600 transition-all shadow-2xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
            <span className="truncate">Search or type ⌘K...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-500 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Quick New Order */}
        <Link
          href="/admin/orders/new"
          className="hidden md:flex items-center gap-1.5 h-8.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all shadow-2xs"
        >
          <ShoppingCart className="w-3.5 h-3.5 text-sky-600" />
          <span>New Order</span>
        </Link>

        {/* View Live Store */}
        <Link
          href="/"
          target="_blank"
          className="hidden lg:flex items-center gap-1.5 h-8.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          <span>Live Store</span>
        </Link>

        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotificationsOpen((v) => !v)}
            className="relative flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all shadow-2xs"
            title="Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {badges.totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-white">
                {badges.totalAlerts > 9 ? "9+" : badges.totalAlerts}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/60 overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-100">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-sm font-bold text-slate-900">
                    Store Alerts
                  </span>
                  {badges.totalAlerts > 0 && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                      {badges.totalAlerts} New
                    </span>
                  )}
                </div>
                <button
                  onClick={() => fetchBadges()}
                  className="text-[11px] font-medium text-sky-600 hover:text-sky-800"
                >
                  Refresh
                </button>
              </div>

              <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    All clear! No pending alerts or stockouts.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => setNotificationsOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1",
                          n.severity === "danger"
                            ? "bg-rose-50 text-rose-600 ring-rose-200"
                            : n.severity === "warning"
                            ? "bg-amber-50 text-amber-600 ring-amber-200"
                            : "bg-sky-50 text-sky-600 ring-sky-200"
                        )}
                      >
                        {n.type === "order" && <ShoppingCart className="w-4 h-4" />}
                        {n.type === "inventory" && <Package className="w-4 h-4" />}
                        {n.type === "return" && <RotateCcw className="w-4 h-4" />}
                        {n.type === "gift_card" && <CreditCard className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                          {n.title}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {n.message}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-center">
                <Link
                  href="/admin/orders"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  View All Orders →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User / Profile Menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 h-8.5 pl-1 pr-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-2xs"
          >
            <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 text-[11px] font-extrabold text-white uppercase shadow-2xs">
              {email?.[0] ?? "A"}
            </div>
            <span className="hidden lg:block text-xs font-semibold text-slate-700 max-w-[110px] truncate">
              {email.split("@")[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-100">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                <p className="text-xs font-bold text-slate-900 truncate">{email}</p>
                <span className="inline-block mt-0.5 text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                  Store Administrator
                </span>
              </div>
              <div className="p-1 space-y-0.5">
                <Link
                  href="/admin/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Store Settings
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  Customer Storefront
                </Link>
              </div>
              <div className="border-t border-slate-100 p-1">
                <Link
                  href="/api/auth/signout"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
