import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No CSV file uploaded" }, { status: 400 })
    }

    const text = await file.text()
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV file is empty or missing data rows" }, { status: 400 })
    }

    // Parse header to detect column indexes
    const parseCsvRow = (line: string): string[] => {
      const result: string[] = []
      let current = ""
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"' && line[i + 1] === '"') {
          current += '"'
          i++
        } else if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          result.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    const headers = parseCsvRow(lines[0]).map((h) => h.toLowerCase().replace(/["']/g, ""))
    
    // Find column indexes
    const idIdx = headers.findIndex((h) => h.includes("variant id") || h === "id")
    const skuIdx = headers.findIndex((h) => h === "sku" || h.includes("sku"))
    const stockIdx = headers.findIndex((h) => h === "stock" || h.includes("quantity") || h.includes("stock"))
    const costIdx = headers.findIndex((h) => h.includes("purchase") || h.includes("cost"))
    const priceIdx = headers.findIndex((h) => h.includes("selling") || h === "price" || h.includes("price (bdt)"))

    if (idIdx === -1 && skuIdx === -1) {
      return NextResponse.json(
        { error: "CSV must contain either 'Variant ID' or 'SKU' column to match items." },
        { status: 400 }
      )
    }

    let updatedCount = 0
    let failedCount = 0

    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvRow(lines[i])
      if (row.length === 0 || !row.some((cell) => cell.length > 0)) continue

      const variantId = idIdx !== -1 ? row[idIdx]?.replace(/["']/g, "") : null
      const sku = skuIdx !== -1 ? row[skuIdx]?.replace(/["']/g, "") : null
      const stockStr = stockIdx !== -1 ? row[stockIdx]?.replace(/["']/g, "") : null
      const costStr = costIdx !== -1 ? row[costIdx]?.replace(/["']/g, "") : null
      const priceStr = priceIdx !== -1 ? row[priceIdx]?.replace(/["']/g, "") : null

      const updateData: any = {}
      if (stockStr && !isNaN(parseInt(stockStr))) {
        updateData.stock = Math.max(0, parseInt(stockStr))
      }
      if (costStr && !isNaN(parseFloat(costStr))) {
        updateData.costPrice = Math.max(0, parseFloat(costStr))
      }
      if (priceStr && !isNaN(parseFloat(priceStr))) {
        updateData.price = Math.max(0, parseFloat(priceStr))
      }
      if (sku && sku.trim()) {
        updateData.sku = sku.trim().toUpperCase()
      }

      if (Object.keys(updateData).length === 0) continue

      try {
        if (variantId) {
          await prisma.productVariant.update({
            where: { id: variantId },
            data: updateData,
          })
          updatedCount++
        } else if (sku) {
          await prisma.productVariant.update({
            where: { sku: sku.trim().toUpperCase() },
            data: updateData,
          })
          updatedCount++
        }
      } catch (err) {
        failedCount++
      }
    }

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      failed: failedCount,
      message: `Processed CSV: ${updatedCount} variants updated successfully (${failedCount} failed).`,
    })
  } catch (err: any) {
    console.error("Inventory CSV import error:", err)
    return NextResponse.json({ error: err.message || "Failed to process CSV import" }, { status: 500 })
  }
}
