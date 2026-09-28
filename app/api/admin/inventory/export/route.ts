import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

export const dynamic = "force-dynamic"

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const variants = await prisma.productVariant.findMany({
      include: {
        product: {
          select: {
            name: true,
            price: true,
            category: { select: { name: true } },
            brand: { select: { name: true } },
          },
        },
      },
      orderBy: [{ product: { name: "asc" } }, { size: "asc" }],
    })

    const headers = [
      "Variant ID",
      "SKU",
      "Product Name",
      "Category",
      "Brand",
      "Size / Age",
      "Color",
      "Stock",
      "Purchase Cost (BDT)",
      "Selling Price (BDT)",
      "Parent Default Price (BDT)",
    ]

    const csvRows = [
      headers.join(","),
      ...variants.map((v) => {
        const sellingPrice =
          v.price !== null && v.price !== undefined
            ? Number(v.price)
            : Number(v.product.price)
        const costPrice = Number(v.costPrice || 0)
        const parentPrice = Number(v.product.price)

        const escape = (str: string | null | undefined) =>
          `"${(str || "").replace(/"/g, '""')}"`

        return [
          escape(v.id),
          escape(v.sku),
          escape(v.product.name),
          escape(v.product.category?.name || "Uncategorized"),
          escape(v.product.brand?.name || ""),
          escape(v.size),
          escape(v.color),
          v.stock,
          costPrice,
          sellingPrice,
          parentPrice,
        ].join(",")
      }),
    ]

    const csvString = csvRows.join("\r\n")
    const dateStr = new Date().toISOString().split("T")[0]

    return new NextResponse(csvString, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="minibunny-inventory-${dateStr}.csv"`,
      },
    })
  } catch (err: any) {
    console.error("Inventory CSV export error:", err)
    return NextResponse.json({ error: "Failed to generate CSV" }, { status: 500 })
  }
}
