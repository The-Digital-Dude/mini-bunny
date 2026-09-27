import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { sendGiftCardEmail } from "@/lib/email"
import crypto from "crypto"

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const part = (len: number) =>
    Array.from({ length: len }, () => chars[crypto.randomInt(0, chars.length)]).join("")
  return `BUNNY-${part(4)}-${part(4)}-${part(4)}`
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cards = await prisma.giftCard.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      transactions: {
        include: {
          order: {
            select: {
              orderNumber: true,
              total: true,
              shippingName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })
  return NextResponse.json(cards)
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await req.json()
  const code = data.code ? data.code.trim().toUpperCase() : generateCode()

  const card = await prisma.giftCard.create({
    data: {
      code,
      theme: data.theme || "classic-gold",
      amount: Number(data.amount),
      balance: Number(data.amount),
      senderName: data.senderName || "Mini Bunny Boutique",
      senderEmail: data.senderEmail || null,
      recipientName: data.recipientName || "Valued Customer",
      recipientEmail: data.recipientEmail.trim().toLowerCase(),
      message: data.message || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  })

  if (data.sendEmail !== false && card.recipientEmail) {
    sendGiftCardEmail({
      to: card.recipientEmail,
      recipientName: card.recipientName,
      senderName: card.senderName || "Mini Bunny",
      code: card.code,
      amount: Number(card.amount),
      message: card.message,
      expiresAt: card.expiresAt,
    }).catch(() => {})
  }

  return NextResponse.json(card)
}
