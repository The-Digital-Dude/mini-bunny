import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"
import { notifyStockAlerts } from "@/lib/stockAlert"

// PATCH body: { updates: [{ variantId, stock?, price?, costPrice?, sku? }] }
export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { updates } = await req.json()
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: "updates array required" }, { status: 400 })
    }

    // Fetch current stock levels to detect 0→positive transitions
    const currentVariants = await prisma.productVariant.findMany({
      where: { id: { in: updates.map((u: any) => u.variantId) } },
      select: { id: true, stock: true },
    })
    const currentStockMap = Object.fromEntries(currentVariants.map((v) => [v.id, v.stock]))

    const results = await Promise.allSettled(
      updates.map(
        ({
          variantId,
          stock,
          price,
          costPrice,
          sku,
        }: {
          variantId: string
          stock?: number
          price?: number | null
          costPrice?: number
          sku?: string
        }) =>
          prisma.productVariant.update({
            where: { id: variantId },
            data: {
              ...(stock !== undefined ? { stock: Math.max(0, Math.floor(stock)) } : {}),
              ...(price !== undefined ? { price: price === null ? null : price } : {}),
              ...(costPrice !== undefined ? { costPrice: Math.max(0, costPrice) } : {}),
              ...(sku !== undefined && sku.trim() ? { sku: sku.trim().toUpperCase() } : {}),
            },
          })
      )
    )

    // Notify back-in-stock subscribers for variants that just came back in stock
    for (const update of updates) {
      const { variantId, stock } = update as { variantId: string; stock?: number }
      if (stock !== undefined && stock > 0 && (currentStockMap[variantId] ?? 0) === 0) {
        notifyStockAlerts(variantId).catch(() => {})
      }
    }

    const succeeded = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length

    return NextResponse.json({ succeeded, failed })
  } catch (err: any) {
    console.error("Bulk inventory update error:", err)
    return NextResponse.json({ error: err.message || "Failed to update inventory" }, { status: 500 })
  }
}
