import type { Metadata } from "next"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import GiftCardStore from "./GiftCardStore"

export const metadata: Metadata = {
  title: "Gift Cards & Wallet — Mini Bunny",
  description: "Give the gift of adorable comfort. Mini Bunny gift cards are delivered instantly and claimed securely to your parent account wallet.",
}

export default async function GiftCardsPage() {
  const session = await auth()
  const userId = session?.user?.id

  const [settings, storeCredit, userTransactions] = await Promise.all([
    prisma.setting.findMany({
      where: { key: { in: ["bkash_merchant_number", "nagad_merchant_number"] } },
    }).catch(() => []),
    userId
      ? prisma.storeCredit.findUnique({
          where: { userId },
        }).catch(() => null)
      : null,
    userId
      ? prisma.storeCreditTransaction.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 10,
        }).catch(() => [])
      : [],
  ])

  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))
  const bkashMerchantNumber = map.bkash_merchant_number || "01700-000000"
  const nagadMerchantNumber = map.nagad_merchant_number || "01800-000000"
  const walletBalance = Number(storeCredit?.balance ?? 0)

  return (
    <GiftCardStore
      bkashMerchantNumber={bkashMerchantNumber}
      nagadMerchantNumber={nagadMerchantNumber}
      isLoggedIn={!!userId}
      userEmail={session?.user?.email || null}
      userName={session?.user?.name || null}
      walletBalance={walletBalance}
      userTransactions={JSON.parse(JSON.stringify(userTransactions))}
    />
  )
}
