import type { Metadata } from "next"
import GiftCardStore from "./GiftCardStore"

export const metadata: Metadata = {
  title: "Gift Cards — Mini Bunny",
  description: "Give the gift of adorable comfort. Mini Bunny gift cards are delivered instantly by email and never expire within a year.",
}

export default function GiftCardsPage() {
  return <GiftCardStore />
}
