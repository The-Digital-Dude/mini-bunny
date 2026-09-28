import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

export async function GET(req: Request) {
  const { error } = await requireAdmin()
  if (error) return error
  try {
    const settings = await prisma.setting.findMany()
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)
    return NextResponse.json({ settings: settingsMap })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const { error } = await requireAdmin()
  if (error) return error
  try {
    const body = await req.json()
    const { settings } = body

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Invalid settings data" }, { status: 400 })
    }

    const updatePromises = Object.entries(settings).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )

    await Promise.all(updatePromises)

    // Automatically synchronize Coupon table if recovery coupon settings were modified
    if (settings.abandoned_cart_coupon_code) {
      const code = String(settings.abandoned_cart_coupon_code).trim().toUpperCase()
      const type = settings.abandoned_cart_discount_type === "FLAT" ? "FLAT" : "PERCENTAGE"
      const value = Number(settings.abandoned_cart_discount_value || 10)
      const minOrder = settings.abandoned_cart_min_order ? Number(settings.abandoned_cart_min_order) : null

      if (code) {
        await prisma.coupon.upsert({
          where: { code },
          update: {
            type,
            value,
            minOrderAmount: minOrder,
            isActive: true,
          },
          create: {
            code,
            type,
            value,
            minOrderAmount: minOrder,
            isActive: true,
          },
        }).catch(() => {})
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
