import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"
import { redirect } from "next/navigation"
import InventoryBulkClient from "./InventoryBulkClient"

export const dynamic = "force-dynamic"

const PAGE_SIZE = 25

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    category?: string
    size?: string
    stock?: string
    page?: string
  }>
}) {
  const { error } = await requireAdmin()
  if (error) redirect("/admin/login")

  const params = await searchParams
  const search = params.search || ""
  const category = params.category || ""
  const size = params.size || ""
  const stockFilter = params.stock || ""
  const page = Math.max(1, parseInt(params.page || "1", 10))
  const skip = (page - 1) * PAGE_SIZE

  // Build filter condition
  const where: any = {}

  if (search) {
    where.OR = [
      { product: { name: { contains: search, mode: "insensitive" } } },
      { sku: { contains: search, mode: "insensitive" } },
      { color: { contains: search, mode: "insensitive" } },
    ]
  }

  if (category) {
    where.product = {
      ...(where.product || {}),
      category: { slug: category },
    }
  }

  if (size) {
    where.size = size
  }

  if (stockFilter === "OUT") {
    where.stock = 0
  } else if (stockFilter === "LOW") {
    where.stock = { gt: 0, lte: 5 }
  } else if (stockFilter === "IN_STOCK") {
    where.stock = { gt: 5 }
  }

  const [
    variants,
    total,
    categories,
    totalVariantsCount,
    lowStockCount,
    outOfStockCount,
    allVariantsForValuation,
  ] = await Promise.all([
    prisma.productVariant.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            comparePrice: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: [{ product: { name: "asc" } }, { size: "asc" }],
      skip,
      take: PAGE_SIZE,
    }).catch(() => []),
    prisma.productVariant.count({ where }).catch(() => 0),
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }).catch(() => []),
    prisma.productVariant.count().catch(() => 0),
    prisma.productVariant.count({ where: { stock: { gt: 0, lte: 5 } } }).catch(() => 0),
    prisma.productVariant.count({ where: { stock: 0 } }).catch(() => 0),
    prisma.productVariant.findMany({
      select: {
        stock: true,
        costPrice: true,
        price: true,
        product: { select: { price: true } },
      },
    }).catch(() => []),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Calculate inventory valuation
  const totalValuation = allVariantsForValuation.reduce((sum, v) => {
    const cost = Number(v.costPrice) > 0 ? Number(v.costPrice) : Number(v.price || v.product.price) * 0.6
    return sum + (v.stock || 0) * cost
  }, 0)

  // Serialize objects for client component
  const serializedVariants = variants.map((v) => ({
    id: v.id,
    size: v.size,
    color: v.color,
    sku: v.sku,
    stock: v.stock,
    price: v.price !== null ? Number(v.price) : null,
    costPrice: Number(v.costPrice || 0),
    product: {
      id: v.product.id,
      name: v.product.name,
      slug: v.product.slug,
      price: Number(v.product.price),
      comparePrice: v.product.comparePrice ? Number(v.product.comparePrice) : null,
      category: v.product.category,
    },
  }))

  return (
    <InventoryBulkClient
      variants={serializedVariants}
      categories={categories}
      total={total}
      page={page}
      totalPages={totalPages}
      metrics={{
        totalVariants: totalVariantsCount,
        lowStockCount,
        outOfStockCount,
        totalValuation: Math.round(totalValuation),
      }}
    />
  )
}
