import { requireAdmin } from "@/lib/adminAuth"
import { redirect } from "next/navigation"
import { ReportsClient } from "./ReportsClient"

export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  const { error } = await requireAdmin()
  if (error) redirect("/admin/login")

  return <ReportsClient />
}
