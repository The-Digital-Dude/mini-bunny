import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ profile: null })
    }

    // Check if custom field or tag exists for customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { customerTags: true },
    })

    if (!user) {
      return NextResponse.json({ profile: null })
    }

    // Retrieve from custom customer tags if saved
    const babyTag = user.customerTags.find((t) => t.tag.startsWith("baby:"))
    if (babyTag) {
      try {
        const decoded = JSON.parse(decodeURIComponent(babyTag.tag.replace("baby:", "")))
        return NextResponse.json({ profile: decoded })
      } catch {}
    }

    return NextResponse.json({ profile: null })
  } catch {
    return NextResponse.json({ profile: null })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ ok: true, note: "Saved locally" })
    }

    const data = await req.json()
    if (!data?.babyName) {
      return NextResponse.json({ error: "Baby name is required" }, { status: 400 })
    }

    const payload = JSON.stringify({
      babyName: data.babyName,
      birthday: data.birthday,
      gender: data.gender,
      parentNotes: data.parentNotes,
      savedAt: new Date().toISOString(),
    })

    // Store in CustomerTag for persistence without rigid table migrations
    const tagString = `baby:${encodeURIComponent(payload)}`

    // Remove older baby tags
    await prisma.customerTag.deleteMany({
      where: {
        userId: session.user.id,
        tag: { startsWith: "baby:" },
      },
    }).catch(() => {})

    await prisma.customerTag.create({
      data: {
        userId: session.user.id,
        tag: tagString,
      },
    }).catch(() => {})

    return NextResponse.json({ ok: true, profile: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save profile" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await auth()
    if (session?.user?.id) {
      await prisma.customerTag.deleteMany({
        where: {
          userId: session.user.id,
          tag: { startsWith: "baby:" },
        },
      }).catch(() => {})
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
