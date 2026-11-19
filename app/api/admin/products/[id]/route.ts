import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"
import { notifyStockAlerts } from "@/lib/stockAlert"
import { sendAdminLowStockAlert } from "@/lib/email"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
      },
    })
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error
  try {
    const { id } = await params
    const body = await req.json()
    const { name, slug, description, price, comparePrice, categoryId, tags, isActive, isFeatured, seoTitle, seoDescription, seoKeywords, videoUrl, sizeChartImage, images, variants } = body

    // Update product fields
    const product = await prisma.product.update({
      where: { id },
      data: { name, slug, description, price, comparePrice: comparePrice ? Number(comparePrice) : null, categoryId, tags, isActive, isFeatured, seoTitle: seoTitle || null, seoDescription: seoDescription || null, seoKeywords: seoKeywords || null, videoUrl: videoUrl || null, sizeChartImage: sizeChartImage || null },
    })

    // Sync images: delete old, recreate
    if (Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } })
      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((img: any, i: number) => ({
            productId: id,
            url: img.url,
            alt: img.alt || "",
            sortOrder: i,
          })),
        })
      }
    }

    // Sync variants if provided: update existing, create new, remove deleted
    if (Array.isArray(variants)) {
      const variantIds = variants.filter((v: any) => v.id).map((v: any) => v.id)
      const existing = await prisma.productVariant.findMany({ where: { productId: id }, select: { id: true, stock: true } })
      const currentStockMap = Object.fromEntries(existing.map((v) => [v.id, v.stock]))
      const ts = Date.now()
      const num = (x: any) => (x === "" || x === null || x === undefined || Number(x) === 0 ? null : Number(x))

      for (const [i, v] of variants.entries()) {
        const data = {
          size: v.size,
          color: v.color,
          colorHex: v.colorHex || null,
          stock: Number(v.stock) || 0,
          price: num(v.price),
          comparePrice: num(v.comparePrice),
        }
        if (v.id && currentStockMap[v.id] !== undefined) {
          const prevStock = currentStockMap[v.id] ?? 0
          await prisma.productVariant.update({
            where: { id: v.id },
            data: { ...data, ...(v.sku?.trim() ? { sku: v.sku.trim() } : {}) },
          })
          if (data.stock > 0 && prevStock === 0) notifyStockAlerts(v.id).catch(() => {})
          if (data.stock > 0 && data.stock <= 5 && prevStock > 5) {
            sendAdminLowStockAlert({
              productName: product.name,
              sku: v.sku || v.id,
              size: v.size,
              color: v.color,
              stock: data.stock,
              productId: id,
            }).catch(() => {})
          }
        } else {
          await prisma.productVariant.create({
            data: {
              ...data,
              productId: id,
              sku: v.sku?.trim() || `${product.slug}-${v.size || "OS"}-${v.color || "DEF"}-${ts}-${i}`.toUpperCase().replace(/\s+/g, "-"),
            },
          })
        }
      }

      // Remove variants the admin deleted (skip ones that have order history)
      const removed = existing.filter((v) => !variantIds.includes(v.id))
      for (const v of removed) {
        await prisma.productVariant.delete({ where: { id: v.id } }).catch(() => {})
      }
    }

    revalidatePath("/", "layout")
    revalidatePath("/shop")
    revalidatePath("/shop/[slug]", "page")
    revalidatePath(`/shop/${product.slug}`)
    return NextResponse.json(product)
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Slug or SKU already exists. Please use a unique value." }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath("/", "layout")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    // P2003 = foreign key constraint (product has orders)
    if (error.code === "P2003") {
      // Soft-delete: deactivate instead of deleting
      await prisma.product.update({ where: { id }, data: { isActive: false } })
      revalidatePath("/", "layout")
      return NextResponse.json({ success: true, softDeleted: true, message: "Product has orders — it has been deactivated instead of deleted." })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
