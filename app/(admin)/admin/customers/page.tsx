import prisma from "@/lib/prisma"
import { CustomerClient } from "./CustomerClient"
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader"
import { AdminCard } from "@/components/admin/ui/AdminCard"
import { Users, Download } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search = "" } = await searchParams

  const searchWhere = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
        ],
      }
    : {}

  // Registered users
  const users = await prisma.user.findMany({
    where: searchWhere,
    include: {
      orders: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  })

  // Guest orders (no user account)
  const guestOrders = await prisma.order.findMany({
    where: {
      userId: null,
      ...(search
        ? {
            OR: [
              { shippingName: { contains: search, mode: "insensitive" } },
              { guestEmail: { contains: search, mode: "insensitive" } },
              { shippingPhone: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  })

  // Group guest orders
  const guestMap = new Map<string, typeof guestOrders>()
  for (const o of guestOrders) {
    const key = o.guestEmail
      ? `email:${o.guestEmail}`
      : `name:${(o.shippingName || "Guest").toLowerCase().trim()}|${(
          o.shippingPhone || ""
        ).trim()}`
    if (!guestMap.has(key)) guestMap.set(key, [])
    guestMap.get(key)!.push(o)
  }

  const registeredCustomers = users.map((user) => {
    const totalSpent = user.orders
      .filter((o) => o.paymentStatus === "PAID" || o.status === "DELIVERED")
      .reduce((sum, o) => sum + Number(o.total), 0)
    return {
      id: user.id,
      name: user.name || "Unnamed Customer",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role,
      isLocked: user.isLocked,
      joinedDate: user.createdAt.toISOString(),
      totalOrders: user.orders.length,
      totalSpent,
      orders: user.orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        total: Number(o.total),
        createdAt: o.createdAt.toISOString(),
      })),
      lastOrderAt: user.orders[0]?.createdAt.toISOString(),
    }
  })

  const guestCustomers = Array.from(guestMap.entries()).map(([key, orders]) => {
    const first = orders[0]
    const totalSpent = orders
      .filter((o) => o.paymentStatus === "PAID" || o.status === "DELIVERED")
      .reduce((sum, o) => sum + Number(o.total), 0)
    return {
      id: `guest:${key}`,
      name: first.shippingName || "Guest Shopper",
      email: first.guestEmail || "",
      phone: first.shippingPhone || "",
      role: "GUEST",
      isLocked: false,
      joinedDate: orders[orders.length - 1].createdAt.toISOString(),
      totalOrders: orders.length,
      totalSpent,
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        total: Number(o.total),
        createdAt: o.createdAt.toISOString(),
      })),
      lastOrderAt: first.createdAt.toISOString(),
    }
  })

  const allCustomers = [...registeredCustomers, ...guestCustomers]
  const total = allCustomers.length

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Parents & Customers"
        description="View customer profiles, order history, VIP tiers, and account status."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Customers" },
        ]}
        badge={
          <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 text-xs font-bold text-slate-700">
            {total} Profiles
          </span>
        }
      />

      <AdminCard noPadding>
        <CustomerClient data={allCustomers} />
      </AdminCard>
    </div>
  )
}
