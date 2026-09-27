import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { code, totalAmount } = await req.json()

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json(
        { error: "Please enter a gift card code." },
        { status: 400 }
      )
    }

    const cleanCode = code.trim().toUpperCase()

    const giftCard = await prisma.giftCard.findUnique({
      where: { code: cleanCode },
    })

    if (!giftCard) {
      return NextResponse.json(
        { error: "Invalid gift card code. Please check and try again." },
        { status: 404 }
      )
    }

    if (!giftCard.isActive) {
      return NextResponse.json(
        { error: "This gift card is inactive or has been disabled." },
        { status: 400 }
      )
    }

    const now = new Date()
    if (giftCard.expiresAt && new Date(giftCard.expiresAt) < now) {
      return NextResponse.json(
        { error: `This gift card expired on ${new Date(giftCard.expiresAt).toLocaleDateString()}.` },
        { status: 400 }
      )
    }

    const availableBalance = Number(giftCard.balance)
    if (availableBalance <= 0) {
      return NextResponse.json(
        { error: "This gift card has a ৳0 remaining balance." },
        { status: 400 }
      )
    }

    const payable = typeof totalAmount === "number" && totalAmount > 0 ? totalAmount : availableBalance
    const appliedAmount = Math.min(availableBalance, payable)
    const remainingBalanceAfter = availableBalance - appliedAmount

    return NextResponse.json({
      success: true,
      code: giftCard.code,
      availableBalance,
      appliedAmount,
      remainingBalanceAfter,
      recipientName: giftCard.recipientName,
      senderName: giftCard.senderName,
      message: `৳${appliedAmount.toLocaleString()} applied from Gift Card (${giftCard.code})`,
    })
  } catch (error: any) {
    console.error("Gift card apply error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to validate gift card" },
      { status: 500 }
    )
  }
}
