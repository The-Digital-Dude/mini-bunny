import { withStoreRevalidate } from "@/lib/revalidateStore"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

async function PATCH_handler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const { name, slug, description, rules, isActive, sortOrder } = await req.json()

  const collection = await prisma.smartCollection.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      rules: rules !== undefined ? JSON.stringify(rules) : undefined,
      isActive,
      sortOrder,
    },
  })
  return NextResponse.json({ collection })
}

async function DELETE_handler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  await prisma.smartCollection.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

export const PATCH = withStoreRevalidate(PATCH_handler)
export const DELETE = withStoreRevalidate(DELETE_handler)
