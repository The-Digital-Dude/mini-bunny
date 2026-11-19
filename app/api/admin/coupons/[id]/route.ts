import { withStoreRevalidate } from "@/lib/revalidateStore"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

async function PATCH_handler(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error
  try {
    const { id } = await params
    const body = await request.json()
    const { isActive } = body

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Invalid active status" }, { status: 400 })
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive },
    })

    return NextResponse.json({ coupon })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function DELETE_handler(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error
  try {
    const { id } = await params
    await prisma.coupon.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export const PATCH = withStoreRevalidate(PATCH_handler)
export const DELETE = withStoreRevalidate(DELETE_handler)
