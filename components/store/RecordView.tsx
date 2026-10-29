"use client"

import { useEffect } from "react"
import { recordView } from "./RecentlyViewed"

interface Props {
  product: { id: string; name: string; slug: string; price: number; image?: string }
}

export default function RecordView({ product }: Props) {
  useEffect(() => {
    recordView(product)

    const sendView = () => {
      fetch("/api/store/product-views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
        keepalive: true,
      }).catch(() => {})
    }

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const handle = (window as any).requestIdleCallback(sendView, { timeout: 3000 })
      return () => (window as any).cancelIdleCallback(handle)
    } else {
      const timer = setTimeout(sendView, 2000)
      return () => clearTimeout(timer)
    }
  }, [product.id])
  return null
}
