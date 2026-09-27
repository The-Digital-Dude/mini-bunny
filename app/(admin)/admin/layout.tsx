import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/admin/Sidebar"
import AdminTopbar from "@/components/admin/AdminTopbar"
import { BunnyIcon } from "@/components/store/BunnyLogo"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f4f5f7]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[220px] lg:w-[240px] shrink-0 flex-col bg-[#1E3E5B] text-white overflow-hidden border-r border-white/10">
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center gap-2.5 px-4 border-b border-white/10">
          <BunnyIcon className="w-7 h-7" />
          <span className="font-heading font-extrabold text-sm tracking-tight text-white">Mini<span className="text-[#96C5E3]">Bunny</span></span>
          <span className="text-[9px] text-[#96C5E3] font-semibold tracking-widest uppercase ml-auto bg-white/10 px-1.5 py-0.5 rounded">Admin</span>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          <Sidebar />
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/8 px-4 py-2.5">
          <p className="text-[10px] text-slate-600 truncate">{session.user.email}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <AdminTopbar email={session.user.email ?? ""} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-7 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
