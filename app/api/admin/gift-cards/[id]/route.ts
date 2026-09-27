import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { sendGiftCardEmail } from "@/lib/email"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const data = await req.json()

  const card = await prisma.giftCard.update({
    where: { id },
    data: {
      isActive: data.isActive !== undefined ? data.isActive : undefined,
      paymentStatus: data.paymentStatus !== undefined ? data.paymentStatus : undefined,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      balance: data.balance !== undefined ? Number(data.balance) : undefined,
    },
  })

  // If newly approved & email not explicitly disabled, send email to recipient
  if (data.paymentStatus === "PAID" && data.sendEmail !== false && card.recipientEmail) {
    sendGiftCardEmail({
      to: card.recipientEmail,
      recipientName: card.recipientName,
      senderName: card.senderName || "Mini Bunny",
      code: card.code,
      amount: Number(card.amount),
      message: card.message,
      expiresAt: card.expiresAt,
    }).catch((err) => {
      console.error("Gift card verification email error:", err)
    })
  }

  return NextResponse.json(card)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  await prisma.giftCard.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
