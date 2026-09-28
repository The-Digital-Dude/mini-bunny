"use client"

import React, { useEffect, useState } from "react"
import { Sidebar } from "@/components/admin/Sidebar"
import AdminTopbar from "@/components/admin/AdminTopbar"
import { CommandPalette } from "@/components/admin/CommandPalette"
import { BunnyIcon } from "@/components/store/BunnyLogo"
import { useAdminStore } from "@/store/useAdminStore"
import { cn } from "@/lib/utils"

export default function AdminLayoutClient({
  email,
  children,
}: {
  email: string
  children: React.ReactNode
}) {
  const { isSidebarCollapsed, setSidebarCollapsed } = useAdminStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem("minibunny_admin_sidebar_collapsed")
      if (saved === "1") {
        setSidebarCollapsed(true)
      }
    } catch {}
  }, [setSidebarCollapsed])

  const collapsed = mounted ? isSidebarCollapsed : false

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100/70 font-sans text-slate-900 antialiased selection:bg-amber-500/20 selection:text-amber-900">
      {/* Command Palette Global Modal */}
      <CommandPalette />

      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden md:flex shrink-0 flex-col bg-[#0B1528] text-white overflow-hidden border-r border-slate-800/80 shadow-xl transition-all duration-300 ease-in-out z-40",
          collapsed ? "w-[68px]" : "w-[245px] lg:w-[255px]"
        )}
      >
        {/* Logo Banner */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-white/8 transition-all px-3.5",
            collapsed ? "justify-center" : "gap-2.5"
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 shadow-md shadow-sky-500/20 shrink-0">
            <BunnyIcon className="w-5 h-5 text-white" />
          </div>

          {!collapsed && (
            <div className="flex items-center justify-between flex-1 min-w-0">
              <span className="font-heading font-extrabold text-sm tracking-tight text-white truncate">
                Mini<span className="text-sky-400">Bunny</span>
              </span>
              <span className="text-[9px] text-sky-300 font-extrabold tracking-widest uppercase bg-sky-500/15 border border-sky-400/20 px-1.5 py-0.5 rounded">
                Admin
              </span>
            </div>
          )}
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto py-2.5">
          <Sidebar />
        </div>

        {/* Footer info in Sidebar */}
        {!collapsed && (
          <div className="shrink-0 border-t border-white/8 px-4 py-2.5 bg-black/15">
            <p className="text-[10px] font-medium text-slate-400 truncate">{email}</p>
            <p className="text-[9px] text-slate-500">v1.2.0 · Mini Bunny Suite</p>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <AdminTopbar email={email} />
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto animate-in fade-in-50 duration-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
