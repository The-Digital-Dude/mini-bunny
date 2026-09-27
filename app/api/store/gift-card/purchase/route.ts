import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"

function generateGiftCardCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const part = (len: number) =>
    Array.from({ length: len }, () => chars[crypto.randomInt(0, chars.length)]).join("")
  return `BUNNY-${part(4)}-${part(4)}-${part(4)}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      amount,
      theme = "classic-gold",
      senderName,
      senderEmail,
      recipientName,
      recipientEmail,
      message,
      paymentMethod = "BKASH",
      paymentTrxId,
    } = body

    const numericAmount = Number(amount)
    if (!numericAmount || numericAmount < 100) {
      return NextResponse.json(
        { error: "Please specify a valid gift card amount of at least ৳100." },
        { status: 400 }
      )
    }

    if (!recipientEmail || !recipientEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid recipient email address is required." },
        { status: 400 }
      )
    }

    if (!recipientName || recipientName.trim().length === 0) {
      return NextResponse.json(
        { error: "Recipient name is required." },
        { status: 400 }
      )
    }

    // Payment validation: require transaction ID for manual MFS payments
    const cleanTrxId = paymentTrxId ? paymentTrxId.trim().toUpperCase() : null
    if (["BKASH", "NAGAD"].includes(paymentMethod) && (!cleanTrxId || cleanTrxId.length < 6)) {
      return NextResponse.json(
        { error: `Please enter a valid ${paymentMethod === "BKASH" ? "bKash" : "Nagad"} Transaction ID (TrxID).` },
        { status: 400 }
      )
    }

    // Generate a unique code
    let code = generateGiftCardCode()
    let attempts = 0
    while (attempts < 5) {
      const existing = await prisma.giftCard.findUnique({ where: { code } })
      if (!existing) break
      code = generateGiftCardCode()
      attempts++
    }

    // Expiry: 1 year from now
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    // Manual MFS payments start as PENDING_VERIFICATION and INACTIVE until admin verifies in dashboard
    const isManualMFS = ["BKASH", "NAGAD"].includes(paymentMethod)
    const paymentStatus = isManualMFS ? "PENDING_VERIFICATION" : "PAID"
    const isActive = !isManualMFS

    const giftCard = await prisma.giftCard.create({
      data: {
        code,
        theme,
        amount: numericAmount,
        balance: numericAmount,
        senderName: senderName?.trim() || "A Special Friend",
        senderEmail: senderEmail?.trim() || null,
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim().toLowerCase(),
        message: message?.trim() || null,
        paymentMethod,
        paymentTrxId: cleanTrxId,
        paymentStatus,
        isActive,
        expiresAt,
      },
    })

    return NextResponse.json({
      success: true,
      id: giftCard.id,
      code: giftCard.code,
      amount: Number(giftCard.amount),
      balance: Number(giftCard.balance),
      theme: giftCard.theme,
      recipientName: giftCard.recipientName,
      recipientEmail: giftCard.recipientEmail,
      senderName: giftCard.senderName,
      message: giftCard.message,
      paymentMethod: giftCard.paymentMethod,
      paymentTrxId: giftCard.paymentTrxId,
      paymentStatus: giftCard.paymentStatus,
      isActive: giftCard.isActive,
      expiresAt: giftCard.expiresAt,
    })
  } catch (error: any) {
    console.error("Gift card purchase error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to submit gift card purchase" },
      { status: 500 }
    )
  }
}
