import { create } from "zustand"

export interface AdminBadges {
  pendingOrders: number
  stockAlerts: number
  outOfStock: number
  lowStock: number
  pendingReturns: number
  pendingGiftCards: number
  totalAlerts: number
}

interface AdminStore {
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (val: boolean) => void
  isCommandPaletteOpen: boolean
  setCommandPaletteOpen: (val: boolean) => void
  badges: AdminBadges
  setBadges: (badges: Partial<AdminBadges>) => void
  fetchBadges: () => Promise<void>
}

export const useAdminStore = create<AdminStore>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => {
      const next = !state.isSidebarCollapsed
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("minibunny_admin_sidebar_collapsed", next ? "1" : "0")
        } catch {}
      }
      return { isSidebarCollapsed: next }
    }),
  setSidebarCollapsed: (val: boolean) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("minibunny_admin_sidebar_collapsed", val ? "1" : "0")
      } catch {}
    }
    set({ isSidebarCollapsed: val })
  },
  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (val: boolean) => set({ isCommandPaletteOpen: val }),
  badges: {
    pendingOrders: 0,
    stockAlerts: 0,
    outOfStock: 0,
    lowStock: 0,
    pendingReturns: 0,
    pendingGiftCards: 0,
    totalAlerts: 0,
  },
  setBadges: (badges) =>
    set((state) => ({ badges: { ...state.badges, ...badges } })),
  fetchBadges: async () => {
    try {
      const res = await fetch("/api/admin/notifications")
      if (res.ok) {
        const data = await res.json()
        if (data.badges) {
          set({ badges: data.badges })
        }
      }
    } catch (e) {
      console.warn("Failed to fetch admin badges:", e)
    }
  },
}))
