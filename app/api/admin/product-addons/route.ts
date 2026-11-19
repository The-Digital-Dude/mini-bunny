import { withStoreRevalidate } from "@/lib/revalidateStore"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const productId = req.nextUrl.searchParams.get("productId")
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 })
  const addons = await prisma.productAddon.findMany({
    where: { productId },
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json(addons)
}

async function POST_handler(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const addon = await prisma.productAddon.create({
    data: {
      productId: body.productId,
      label: body.label,
      type: body.type || "TEXT",
      options: body.options || [],
      priceModifier: body.priceModifier || 0,
      isRequired: body.isRequired || false,
      sortOrder: body.sortOrder || 0,
    },
  })
  return NextResponse.json(addon)
}

export const POST = withStoreRevalidate(POST_handler)
