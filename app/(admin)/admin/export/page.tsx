import { requireAdmin } from "@/lib/adminAuth"
import { redirect } from "next/navigation"
import ExportClient from "./ExportClient"

export const dynamic = "force-dynamic"

export default async function ExportPage() {
  const { error } = await requireAdmin()
  if (error) redirect("/admin/login")

  return <ExportClient />
}
