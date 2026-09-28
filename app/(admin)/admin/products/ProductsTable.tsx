"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { StatusBadge } from "@/components/admin/ui/StatusBadge"
import { EmptyState } from "@/components/admin/ui/EmptyState"
import { Edit, Trash2, ShoppingBag, Package, ExternalLink, MoreVertical } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function ProductsTable({ products }: { products: any[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete product "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Delete failed")
      if (data.softDeleted) {
        toast.warning(`"${name}" has existing customer orders — archived instead.`)
      } else {
        toast.success(`"${name}" removed successfully`)
      }
      router.refresh()
    } catch (e: any) {
      toast.error(e.message || "Failed to delete product")
    } finally {
      setDeleting(null)
    }
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No products found"
        description="No catalog items matched your active search or stage filter."
        className="border-0 rounded-none py-14"
        action={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-amber-500 text-xs font-semibold text-white hover:bg-amber-600 transition-colors shadow-2xs"
          >
            <span>Add New Product</span>
          </Link>
        }
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <th className="py-3.5 pl-5 pr-3">Product</th>
            <th className="py-3.5 px-3">Category</th>
            <th className="py-3.5 px-3">Price</th>
            <th className="py-3.5 px-3">Inventory</th>
            <th className="py-3.5 px-3">Status</th>
            <th className="py-3.5 pr-5 pl-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
          {products.map((product) => {
            const totalStock = (product.variants || []).reduce(
              (acc: number, v: any) => acc + (v.stock || 0),
              0
            )
            const thumbnail =
              product.images?.[0] || product.featuredImage || "/placeholder-product.png"

            return (
              <tr
                key={product.id}
                className="transition-colors duration-150 hover:bg-slate-50/80 group"
              >
                {/* Product Name & Image */}
                <td className="py-3.5 pl-5 pr-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-semibold text-slate-900 hover:text-sky-600 transition-colors line-clamp-1"
                      >
                        {product.name}
                      </Link>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        {product.brand?.name && (
                          <span className="font-medium text-slate-500">
                            {product.brand.name} ·
                          </span>
                        )}
                        <span>{product.variants?.length || 0} sizes/variants</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3.5 px-3">
                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    {product.category?.name || "Uncategorized"}
                  </span>
                </td>

                {/* Price */}
                <td className="py-3.5 px-3 font-heading font-bold text-slate-900 whitespace-nowrap">
                  ৳{Number(product.price).toLocaleString()}
                </td>

                {/* Inventory / Stock */}
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 font-heading font-bold text-xs",
                        totalStock === 0
                          ? "text-rose-600"
                          : totalStock <= 5
                          ? "text-amber-600"
                          : "text-slate-800"
                      )}
                    >
                      {totalStock} in stock
                    </span>
                  </div>
                </td>

                {/* Visibility Status */}
                <td className="py-3.5 px-3">
                  <StatusBadge
                    status={
                      product.isActive
                        ? totalStock === 0
                          ? "OUT_OF_STOCK"
                          : "ACTIVE"
                        : "INACTIVE"
                    }
                    size="sm"
                  />
                </td>

                {/* Actions */}
                <td className="py-3.5 pr-5 pl-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/products/${product.slug || product.id}`}
                      target="_blank"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-700 transition-all shadow-2xs"
                      title="View on storefront"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition-all shadow-2xs"
                      title="Edit product"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={deleting === product.id}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-rose-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition-all shadow-2xs disabled:opacity-50"
                      title="Delete product"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
