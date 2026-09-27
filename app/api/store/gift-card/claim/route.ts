import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in or create an account to claim this gift card." },
        { status: 401 }
      )
    }

    const { code } = await req.json()
    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json(
        { error: "Please enter a valid gift card code." },
        { status: 400 }
      )
    }

    const cleanCode = code.trim().toUpperCase()

    const giftCard = await prisma.giftCard.findUnique({
      where: { code: cleanCode },
    })

    if (!giftCard) {
      return NextResponse.json(
        { error: "Gift card not found. Please verify the code and try again." },
        { status: 404 }
      )
    }

    if (giftCard.paymentStatus === "PENDING_VERIFICATION") {
      return NextResponse.json(
        { error: "This gift card is currently awaiting admin payment verification before activation." },
        { status: 400 }
      )
    }

    if (giftCard.paymentStatus === "REJECTED") {
      return NextResponse.json(
        { error: "This gift card purchase was rejected or canceled." },
        { status: 400 }
      )
    }

    if (giftCard.claimedByUserId) {
      return NextResponse.json(
        { error: "This gift card has already been claimed into an account wallet." },
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

    const claimAmount = Number(giftCard.balance)
    if (claimAmount <= 0) {
      return NextResponse.json(
        { error: "This gift card has a ৳0 remaining balance." },
        { status: 400 }
      )
    }

    // Atomically transfer funds to user's Store Credit Wallet
    const result = await prisma.$transaction(async (tx) => {
      const storeCredit = await tx.storeCredit.upsert({
        where: { userId },
        create: {
          userId,
          balance: claimAmount,
        },
        update: {
          balance: { increment: claimAmount },
        },
      })

      await tx.storeCreditTransaction.create({
        data: {
          userId,
          storeCreditId: storeCredit.id,
          amount: claimAmount,
          type: "GIFT_CARD_CLAIM",
          reason: `Claimed Gift Card ${giftCard.code} (from ${giftCard.senderName || "Special Friend"})`,
        },
      })

      const updatedCard = await tx.giftCard.update({
        where: { id: giftCard.id },
        data: {
          claimedByUserId: userId,
          claimedAt: new Date(),
          isActive: false,
          balance: 0,
          redeemedAt: new Date(),
        },
      })

      await tx.giftCardTransaction.create({
        data: {
          giftCardId: giftCard.id,
          amount: claimAmount,
          type: "WALLET_DEPOSIT",
        },
      })

      return {
        claimedAmount: claimAmount,
        newWalletBalance: Number(storeCredit.balance),
        theme: updatedCard.theme,
        senderName: updatedCard.senderName,
        recipientName: updatedCard.recipientName,
        message: updatedCard.message,
        code: updatedCard.code,
      }
    })

    return NextResponse.json({
      success: true,
      ...result,
      message: `৳${result.claimedAmount.toLocaleString()} successfully added to your Mini Bunny Wallet!`,
    })
  } catch (error: any) {
    console.error("Gift card claim error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to claim gift card" },
      { status: 500 }
    )
  }
}
