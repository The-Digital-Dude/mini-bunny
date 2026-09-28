import prisma from "@/lib/prisma"
import OrdersFilters from "./OrdersFilters"
import OrdersBulkClient from "./OrdersBulkClient"
import AdminPagination from "@/components/admin/AdminPagination"
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader"
import { AdminCard } from "@/components/admin/ui/AdminCard"
import { getCustomerRiskBatch } from "@/lib/customerRisk"
import { serialize } from "@/lib/utils"
import { Download, ShoppingCart, PlusCircle } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

const PAGE_SIZE = 20

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    status?: string
    paymentMethod?: string
    page?: string
  }>
}) {
  const params = await searchParams
  const search = params.search || ""
  const status = params.status || ""
  const paymentMethod = params.paymentMethod || ""
  const page = Math.max(1, parseInt(params.page || "1"))
  const skip = (page - 1) * PAGE_SIZE

  const where: any = {
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: "insensitive" } },
            { shippingName: { contains: search, mode: "insensitive" } },
            { shippingPhone: { contains: search } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
    ...(paymentMethod ? { paymentMethod } : {}),
  }

  const [orders, total] = await Promise.all([
    prisma.order
      .findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: PAGE_SIZE,
      })
      .catch(() => []),
    prisma.order.count({ where }).catch(() => 0),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const serializedOrders = serialize(orders)

  const riskMap = await getCustomerRiskBatch(
    orders.map((o: any) => o.shippingPhone)
  ).catch(() => new Map())
  const riskByPhone = Object.fromEntries(riskMap)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders & Fulfillment"
        description="Monitor, update, and bulk-process customer purchases and shipping workflows."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Orders" },
        ]}
        badge={
          <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 text-xs font-bold text-slate-700">
            {total} Total
          </span>
        }
        actions={
          <>
            <a
              href={`/api/admin/orders/export${
                status ? `?status=${status}` : ""
              }`}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export CSV</span>
            </a>
            <Link
              href="/admin/orders/new"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-xs font-semibold text-white hover:from-sky-700 hover:to-indigo-700 transition-all shadow-md shadow-sky-500/20"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Create Order</span>
            </Link>
          </>
        }
      />

      <AdminCard noPadding>
        <OrdersFilters
          currentSearch={search}
          currentStatus={status}
          currentPayment={paymentMethod}
        />
        <OrdersBulkClient
          orders={serializedOrders as any}
          riskByPhone={riskByPhone}
        />
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <AdminPagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/orders"
          />
        </div>
      </AdminCard>
    </div>
  )
}
