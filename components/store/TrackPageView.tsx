"use client"

import { useEffect } from "react"

export default function TrackPageView({ productId }: { productId: string }) {
  useEffect(() => {
    const sendTracking = () => {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "page_view", productId }),
        keepalive: true,
      }).catch(() => {})
    }

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const handle = (window as any).requestIdleCallback(sendTracking, { timeout: 3000 })
      return () => (window as any).cancelIdleCallback(handle)
    } else {
      const timer = setTimeout(sendTracking, 2000)
      return () => clearTimeout(timer)
    }
  }, [productId])

  return null
}
