import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminLayoutClient from "@/components/admin/AdminLayoutClient"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <AdminLayoutClient email={session.user.email ?? "admin@minibunny.com"}>
      {children}
    </AdminLayoutClient>
  )
}
