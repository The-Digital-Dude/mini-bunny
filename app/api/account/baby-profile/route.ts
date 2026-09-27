import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized", profiles: [] }, { status: 401 })
    }

    const profiles = await prisma.babyProfile.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ profiles })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch baby profiles" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to save your baby profile." }, { status: 401 })
    }

    const body = await req.json()
    const { babyName, birthday, gender, fitPreference, parentNotes, children } = body

    // Support single profile creation or batch update
    if (Array.isArray(children)) {
      // Sync children array
      for (const child of children) {
        if (!child.babyName || !child.birthday) continue
        const bDate = new Date(child.birthday)
        if (isNaN(bDate.getTime())) continue

        const existing = child.id && !child.id.startsWith("child_")
          ? await prisma.babyProfile.findUnique({ where: { id: child.id } }).catch(() => null)
          : null

        if (existing && existing.userId === session.user.id) {
          await prisma.babyProfile.update({
            where: { id: child.id },
            data: {
              babyName: child.babyName.trim(),
              birthday: bDate,
              gender: child.gender || "Surprise",
              fitPreference: child.fitPreference || "standard",
              parentNotes: child.parentNotes || null,
            },
          })
        } else {
          await prisma.babyProfile.create({
            data: {
              userId: session.user.id,
              babyName: child.babyName.trim(),
              birthday: bDate,
              gender: child.gender || "Surprise",
              fitPreference: child.fitPreference || "standard",
              parentNotes: child.parentNotes || null,
            },
          })
        }
      }
    } else if (babyName && birthday) {
      const bDate = new Date(birthday)
      if (isNaN(bDate.getTime())) {
        return NextResponse.json({ error: "Invalid birthdate" }, { status: 400 })
      }

      const created = await prisma.babyProfile.create({
        data: {
          userId: session.user.id,
          babyName: babyName.trim(),
          birthday: bDate,
          gender: gender || "Surprise",
          fitPreference: fitPreference || "standard",
          parentNotes: parentNotes || null,
        },
      })

      // Award 100 VIP Points (৳50 value) for adding baby profile if not already given
      const existingPoints = await prisma.loyaltyPoint.findFirst({
        where: {
          userId: session.user.id,
          type: "BABY_PROFILE",
        },
      }).catch(() => null)

      if (!existingPoints) {
        await prisma.loyaltyPoint.create({
          data: {
            userId: session.user.id,
            points: 100,
            type: "BABY_PROFILE",
            description: `Welcome bonus for adding ${babyName}'s profile`,
          },
        }).catch(() => {})
      }

      return NextResponse.json({ profile: created, pointsAwarded: !existingPoints })
    }

    const all = await prisma.babyProfile.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ profiles: all })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save baby profile" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (id) {
      await prisma.babyProfile.deleteMany({
        where: { id, userId: session.user.id },
      })
    } else {
      await prisma.babyProfile.deleteMany({
        where: { userId: session.user.id },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete profile" }, { status: 500 })
  }
}
