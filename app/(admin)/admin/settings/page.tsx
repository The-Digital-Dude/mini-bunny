import prisma from "@/lib/prisma"
import { SettingsClient } from "./SettingsClient"
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const settings = await prisma.setting.findMany()
  const settingsMap = settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value
    return acc
  }, {} as Record<string, string>)

  const staff = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "STAFF"] },
    },
    orderBy: { createdAt: "desc" },
  })

  const formattedStaff = staff.map((s) => ({
    id: s.id,
    name: s.name || "Unnamed Staff",
    email: s.email,
    role: s.role,
  }))

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Store & System Settings"
        description="Configure general store metadata, bKash/Nagad payment gateways, shipping thresholds, SMTP, and staff roles."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings" },
        ]}
      />

      <SettingsClient
        initialSettings={settingsMap}
        initialStaff={formattedStaff}
      />
    </div>
  )
}
