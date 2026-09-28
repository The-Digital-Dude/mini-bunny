"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useAdminStore } from "@/store/useAdminStore"
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  Package,
  BarChart2,
  Settings,
  Tag,
  RotateCcw,
  Ticket,
  Zap,
  CreditCard,
  Bell,
  Globe,
  MessageSquare,
  Building2,
  Truck,
  Warehouse,
  Mail,
  ChevronRight,
  ChevronLeft,
  Star,
  Users2,
  Wallet,
  Award,
  ScrollText,
  Receipt,
  Download,
  Layers,
  Search,
  PlusCircle,
  Gift,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: any
  exact?: boolean
  badgeKey?: "pendingOrders" | "stockAlerts" | "pendingReturns" | "pendingGiftCards"
  badgeColor?: "amber" | "rose" | "sky" | "violet"
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

const primaryItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ShoppingCart,
    badgeKey: "pendingOrders",
    badgeColor: "amber",
  },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  {
    href: "/admin/inventory",
    label: "Inventory",
    icon: Package,
    badgeKey: "stockAlerts",
    badgeColor: "rose",
  },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
]

const groups: NavGroup[] = [
  {
    label: "Catalog",
    items: [
      { href: "/admin/categories", label: "Categories", icon: Tag },
      { href: "/admin/bundles", label: "Bundles & Kits", icon: Package },
      { href: "/admin/brands", label: "Brands", icon: Award },
      { href: "/admin/collections", label: "Collections", icon: Layers },
      { href: "/admin/reviews", label: "Parent Reviews", icon: Star },
    ],
  },
  {
    label: "Sales & Fulfillment",
    items: [
      { href: "/admin/gifts", label: "Gift Orders & Wraps", icon: Gift },
      {
        href: "/admin/returns",
        label: "Exchanges & Returns",
        icon: RotateCcw,
        badgeKey: "pendingReturns",
        badgeColor: "violet",
      },
      { href: "/admin/abandoned-carts", label: "Abandoned Carts", icon: ShoppingCart },
    ],
  },
  {
    label: "Marketing & Growth",
    items: [
      { href: "/admin/coupons", label: "Promo Coupons", icon: Ticket },
      { href: "/admin/flash-sales", label: "Flash Drops", icon: Zap },
      {
        href: "/admin/gift-cards",
        label: "Gift Cards",
        icon: CreditCard,
        badgeKey: "pendingGiftCards",
        badgeColor: "sky",
      },
      { href: "/admin/campaigns", label: "Email Campaigns", icon: Mail },
      { href: "/admin/subscribers", label: "VIP Club Members", icon: Users2 },
    ],
  },
  {
    label: "Parent Loyalty",
    items: [
      { href: "/admin/store-credit", label: "Store Credit Wallets", icon: Wallet },
      { href: "/admin/loyalty", label: "Bunny Club Points", icon: Award },
      { href: "/admin/affiliates", label: "Parent Referrals", icon: Users2 },
    ],
  },
  {
    label: "Finance & Supply",
    items: [
      { href: "/admin/suppliers", label: "Suppliers", icon: Building2 },
      { href: "/admin/purchase-orders", label: "Purchase Orders", icon: Receipt },
      { href: "/admin/expenses", label: "Expenses & P&L", icon: Receipt },
    ],
  },
  {
    label: "Shipping & Logistics",
    items: [
      { href: "/admin/shipping-zones", label: "Delivery Zones", icon: Truck },
      { href: "/admin/delivery", label: "Shipping Methods", icon: Truck },
      { href: "/admin/locations", label: "Fulfillment Hubs", icon: Warehouse },
    ],
  },
  {
    label: "Content & Storefront",
    items: [
      { href: "/admin/blog", label: "Journal & Blog", icon: Globe },
      { href: "/admin/pages", label: "Custom Pages", icon: Globe },
      { href: "/admin/contact", label: "Customer Inquiries", icon: MessageSquare },
    ],
  },
  {
    label: "System & Tools",
    items: [
      { href: "/admin/reports", label: "Reports Hub", icon: BarChart2 },
      { href: "/admin/export", label: "Export Data", icon: Download },
      { href: "/admin/audit-log", label: "Audit Trails", icon: ScrollText },
      { href: "/admin/settings", label: "Store Settings", icon: Settings },
    ],
  },
]

export function Sidebar({ isMobile = false, onClose }: { isMobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const { isSidebarCollapsed, toggleSidebar, badges, fetchBadges } = useAdminStore()

  const defaultOpen = groups.reduce<Record<string, boolean>>((acc, g) => {
    acc[g.label] = g.items.some((i) => isActive(pathname, i.href, false))
    return acc
  }, {})

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(defaultOpen)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchBadges()
    const interval = setInterval(fetchBadges, 30000)
    return () => clearInterval(interval)
  }, [fetchBadges])

  const toggle = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))

  const q = search.toLowerCase().trim()
  const allItems = [...primaryItems, ...groups.flatMap((g) => g.items)]
  const filtered = q ? allItems.filter((i) => i.label.toLowerCase().includes(q)) : null

  const isCollapsed = !isMobile && isSidebarCollapsed

  return (
    <div className="flex flex-col h-full select-none">
      {/* Search Bar - Hidden in collapsed icon mode */}
      {!isCollapsed && (
        <div className="px-3.5 pb-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter menu..."
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-white/7 border border-white/10 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400/50 focus:bg-white/10 transition-all"
            />
          </div>
        </div>
      )}

      {/* Quick Action Shortcuts */}
      {!isCollapsed && (
        <div className="px-3.5 pb-3 flex gap-1.5">
          <Link
            href="/admin/orders/new"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 h-7.5 rounded-lg bg-white/7 border border-white/10 text-[11px] font-semibold text-slate-300 hover:bg-white/15 hover:text-white transition-all shadow-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-sky-400" />
            <span>+ Order</span>
          </Link>
          <Link
            href="/admin/products/new"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 h-7.5 rounded-lg bg-amber-500/15 border border-amber-500/25 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/25 hover:text-amber-200 transition-all shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Product</span>
          </Link>
        </div>
      )}

      {/* Navigation Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {filtered ? (
          /* Search results */
          <div className="space-y-0.5 py-1">
            {filtered.length === 0 && (
              <p className="px-3 py-6 text-xs text-slate-400 text-center">
                No items found for "{search}"
              </p>
            )}
            {filtered.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                badgeCount={item.badgeKey ? badges[item.badgeKey] : 0}
                isCollapsed={isCollapsed}
                onClick={() => {
                  setSearch("")
                  if (onClose) onClose()
                }}
              />
            ))}
          </div>
        ) : (
          <>
            {/* Primary Nav Items */}
            <div className="space-y-0.5 mb-2">
              {primaryItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  primary
                  badgeCount={item.badgeKey ? badges[item.badgeKey] : 0}
                  isCollapsed={isCollapsed}
                  onClick={onClose}
                />
              ))}
            </div>

            {/* Divider */}
            <div className="mx-2 my-2 border-t border-white/8" />

            {/* Groups */}
            {groups.map((group) => {
              const isOpen = !!openGroups[group.label]
              const hasActive = group.items.some((i) =>
                isActive(pathname, i.href, false)
              )

              if (isCollapsed) {
                return (
                  <div key={group.label} className="space-y-0.5 mb-2">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.href}
                        item={item}
                        pathname={pathname}
                        badgeCount={item.badgeKey ? badges[item.badgeKey] : 0}
                        isCollapsed={true}
                        onClick={onClose}
                      />
                    ))}
                  </div>
                )
              }

              return (
                <div key={group.label} className="mb-1">
                  <button
                    onClick={() => toggle(group.label)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors",
                      hasActive
                        ? "text-sky-400 font-extrabold"
                        : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    <span>{group.label}</span>
                    <ChevronRight
                      className={cn(
                        "w-3 h-3 text-slate-400 transition-transform duration-200",
                        isOpen && "rotate-90"
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="space-y-0.5 mt-0.5 mb-1.5 pl-1.5">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.href}
                          item={item}
                          pathname={pathname}
                          indent
                          badgeCount={item.badgeKey ? badges[item.badgeKey] : 0}
                          isCollapsed={false}
                          onClick={onClose}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* Collapse/Expand Toggle on Desktop */}
      {!isMobile && (
        <div className="p-2 border-t border-white/10 mt-auto">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 h-8 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

function isActive(pathname: string, href: string, exact = false) {
  if (exact || href === "/admin") return pathname === href
  return pathname === href || pathname.startsWith(href + "/")
}

function NavLink({
  item,
  pathname,
  primary,
  indent,
  badgeCount = 0,
  isCollapsed,
  onClick,
}: {
  item: NavItem
  pathname: string
  primary?: boolean
  indent?: boolean
  badgeCount?: number
  isCollapsed?: boolean
  onClick?: () => void
}) {
  const active = isActive(pathname, item.href, item.exact)

  const badgeTheme = {
    amber: "bg-amber-500 text-slate-950 font-extrabold",
    rose: "bg-rose-500 text-white font-bold",
    sky: "bg-sky-400 text-slate-950 font-extrabold",
    violet: "bg-violet-400 text-slate-950 font-bold",
  }[item.badgeColor || "amber"]

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={isCollapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center rounded-xl transition-all duration-150",
        isCollapsed
          ? "h-9 w-9 mx-auto justify-center"
          : "gap-2.5 px-3 py-2 text-sm",
        indent && !isCollapsed && "pl-3.5 text-[13px]",
        primary && "font-medium",
        active
          ? "bg-[#2563EB]/25 text-white font-semibold shadow-xs border border-sky-400/30 backdrop-blur-xs"
          : "text-slate-300 hover:bg-white/8 hover:text-white"
      )}
    >
      {/* Active Indicator bar */}
      {active && !isCollapsed && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
      )}

      <item.icon
        className={cn(
          "shrink-0 transition-transform duration-150 group-hover:scale-105",
          active ? "text-sky-400" : "text-slate-400 group-hover:text-slate-200",
          indent ? "w-3.5 h-3.5" : "w-4 h-4"
        )}
      />

      {!isCollapsed && (
        <span className="flex-1 truncate tracking-tight">{item.label}</span>
      )}

      {/* Dynamic Notification Badge */}
      {badgeCount > 0 && (
        <>
          {isCollapsed ? (
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          ) : (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px] leading-tight shrink-0 shadow-xs",
                badgeTheme
              )}
            >
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          )}
        </>
      )}
    </Link>
  )
}
