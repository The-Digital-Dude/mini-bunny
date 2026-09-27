import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { code } = await req.json()

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json(
        { error: "Please enter a gift card code." },
        { status: 400 }
      )
    }

    const cleanCode = code.trim().toUpperCase()

    const giftCard = await prisma.giftCard.findUnique({
      where: { code: cleanCode },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    })

    if (!giftCard) {
      return NextResponse.json(
        { error: "Gift card not found. Please verify the code and try again." },
        { status: 404 }
      )
    }

    if (!giftCard.isActive) {
      return NextResponse.json(
        { error: "This gift card has been disabled or voided." },
        { status: 400 }
      )
    }

    const now = new Date()
    if (giftCard.expiresAt && new Date(giftCard.expiresAt) < now) {
      return NextResponse.json(
        { error: `This gift card expired on ${new Date(giftCard.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      code: giftCard.code,
      initialAmount: Number(giftCard.amount),
      currentBalance: Number(giftCard.balance),
      theme: giftCard.theme,
      recipientName: giftCard.recipientName,
      senderName: giftCard.senderName,
      expiresAt: giftCard.expiresAt,
      isExpired: false,
      transactions: giftCard.transactions.map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        type: t.type,
        createdAt: t.createdAt,
      })),
    })
  } catch (error: any) {
    console.error("Gift card balance check error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to check gift card balance" },
      { status: 500 }
    )
  }
}
