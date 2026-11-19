"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DuplicateButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDuplicate = async () => {
    if (!confirm("Duplicate this product?")) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/duplicate`, { method: "POST" })
      const data = await res.json().catch(() => ({}))
      const newId = data?.product?.id ?? data?.id
      if (res.ok && newId) {
        router.push(`/admin/products/${newId}`)
        router.refresh()
        return
      }
      alert(data?.error ?? "Failed to duplicate")
    } catch {
      alert("Failed to duplicate")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={loading}
      className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
    >
      {loading ? "Duplicating…" : "Duplicate"}
    </button>
  )
}
