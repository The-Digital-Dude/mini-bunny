import { PlusCircle, Download, Upload, Package } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import ProductsFilters from "./ProductsFilters"
import ProductsTable from "./ProductsTable"
import AdminPagination from "@/components/admin/AdminPagination"
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader"
import { AdminCard } from "@/components/admin/ui/AdminCard"

export const dynamic = "force-dynamic"

const PAGE_SIZE = 20

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    page?: string
    size?: string
    status?: string
  }>
}) {
  const params = await searchParams
  const search = params.search || ""
  const size = params.size || ""
  const status = params.status || ""
  const page = Math.max(1, parseInt(params.page || "1"))
  const skip = (page - 1) * PAGE_SIZE

  const where: any = {}
  if (search) {
    where.name = { contains: search, mode: "insensitive" }
  }
  if (size) {
    where.variants = { some: { size } }
  }
  if (status === "ACTIVE") {
    where.isActive = true
  } else if (status === "INACTIVE") {
    where.isActive = false
  }

  const [products, total] = await Promise.all([
    prisma.product
      .findMany({
        where,
        include: { category: true, brand: true, variants: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: PAGE_SIZE,
      })
      .catch(() => []),
    prisma.product.count({ where }).catch(() => 0),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products Catalog"
        description="Organize baby apparel, inventory variants, categories, and storefront pricing."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products" },
        ]}
        badge={
          <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 text-xs font-bold text-slate-700">
            {total} Items
          </span>
        }
        actions={
          <>
            <Link
              href="/admin/products/import"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <Upload className="h-3.5 w-3.5 text-slate-500" />
              <span>Import CSV</span>
            </Link>
            <a
              href="/api/admin/products/export"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export CSV</span>
            </a>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-xs font-semibold text-white hover:from-amber-600 hover:to-amber-700 transition-all shadow-md shadow-amber-500/20"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Add Product</span>
            </Link>
          </>
        }
      />

      <AdminCard noPadding>
        <ProductsFilters currentSearch={search} />
        <ProductsTable products={products} />
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <AdminPagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/products"
          />
        </div>
      </AdminCard>
    </div>
  )
}
