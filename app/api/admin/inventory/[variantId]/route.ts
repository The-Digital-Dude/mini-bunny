import { withStoreRevalidate } from "@/lib/revalidateStore"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

async function PATCH_handler(
  request: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error
  try {
    const { variantId } = await params
    const body = await request.json()
    const { stock } = body

    if (typeof stock !== "number" || stock < 0) {
      return NextResponse.json({ error: "Invalid stock value" }, { status: 400 })
    }

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
    })

    return NextResponse.json({ variant })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export const PATCH = withStoreRevalidate(PATCH_handler)
