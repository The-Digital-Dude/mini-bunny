"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Minus, Plus, Trash2, Tag, ChevronRight, Layers, Sparkles, Gift } from "lucide-react"
import { useCartStore, CartItem } from "@/store/useCartStore"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import GiftOptions from "@/components/store/GiftOptions"

// Renders cart items, grouping items that share a setGroupId
function CartItemList({
  items,
  removeItem,
  updateQuantity,
}: {
  items: CartItem[]
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, qty: number) => void
}) {
  const setGroups: Record<string, CartItem[]> = {}
  const standalone: CartItem[] = []

  for (const item of items) {
    if (item.setGroupId) {
      setGroups[item.setGroupId] = [...(setGroups[item.setGroupId] || []), item]
    } else {
      standalone.push(item)
    }
  }

  const renderItem = (item: CartItem) => (
    <div key={item.variantId} className="flex gap-3.5 p-3.5 bg-white rounded-2xl border border-[#EDE8DF] shadow-xs">
      <Link href={`/shop/${item.productSlug}`} className="relative h-24 w-20 shrink-0 overflow-hidden bg-[#FAF9F5] rounded-xl border border-[#EDE8DF] block">
        <Image src={item.image || "/placeholder.jpg"} alt={item.name} fill sizes="80px" className="object-cover" />
      </Link>
      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
        <div>
          <div className="flex justify-between items-start gap-1">
            <Link href={`/shop/${item.productSlug}`} className="font-bold text-xs sm:text-sm text-[#1E3E5B] line-clamp-2 hover:text-[#4A8DB7] transition-colors leading-tight">
              {item.name}
            </Link>
            <button
              onClick={() => removeItem(item.variantId)}
              className="p-1 text-[#6C7A89] hover:text-red-500 transition-colors shrink-0"
              aria-label="Remove item"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[11px] font-semibold text-[#4A8DB7] mt-1 uppercase tracking-wider">
            {item.size} <span className="text-[#6C7A89]/40">·</span> {item.color}
          </p>
        </div>
        <div className="flex justify-between items-center mt-2 pt-1 border-t border-[#EDE8DF]/60">
          <div className="flex items-center border border-[#EDE8DF] rounded-full overflow-hidden bg-[#FAF9F5]">
            <button
              className="px-2.5 py-1 text-[#6C7A89] hover:text-[#1E3E5B] hover:bg-[#F0F7FB] transition-colors"
              onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center text-xs font-bold text-[#1E3E5B]">{item.quantity}</span>
            <button
              className="px-2.5 py-1 text-[#6C7A89] hover:text-[#1E3E5B] hover:bg-[#F0F7FB] transition-colors"
              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <span className="font-mono text-sm font-extrabold text-[#1E3E5B]">
            ৳{(item.price * item.quantity).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-3">
      {standalone.map(renderItem)}

      {Object.entries(setGroups).map(([groupId, groupItems]) => (
        <div key={groupId} className="border border-[#4A8DB7]/30 bg-[#F0F7FB]/40 rounded-2xl overflow-hidden p-3 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4A8DB7]">
            <Layers className="w-3.5 h-3.5" />
            <span>Set Bundle ({groupItems.length} items)</span>
          </div>
          <div className="space-y-2">
            {groupItems.map(renderItem)}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CartDrawer({
  itemCount: propItemCount,
  freeShippingThreshold = 2000,
}: {
  itemCount?: number
  freeShippingThreshold?: number | null
}) {
  const { items, removeItem, updateQuantity, isGiftWrapped, isOpen, setIsOpen } = useCartStore()
  const [coupon, setCoupon] = useState("")
  const [useLoyalty, setUseLoyalty] = useState(false)

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const itemCount = propItemCount ?? items.reduce((acc, item) => acc + item.quantity, 0)
  const loyaltyPoints = 0
  const loyaltyValue = useLoyalty ? Math.min(loyaltyPoints * 0.1, subtotal * 0.2) : 0
  const giftWrapFee = isGiftWrapped ? 150 : 0
  const finalTotal = subtotal + giftWrapFee - loyaltyValue

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="relative text-[#1E3E5B] hover:text-[#4A8DB7]" aria-label="Open cart">
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF758F] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                {itemCount}
              </span>
            )}
          </Button>
        }
      />

      <SheetContent className="flex flex-col w-full sm:max-w-md p-0 gap-0 border-l border-[#EDE8DF] bg-white h-full max-h-screen overflow-hidden shadow-2xl">
        {/* Header */}
        <SheetHeader className="p-5 border-b border-[#EDE8DF] bg-white shrink-0">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <SheetTitle className="font-heading text-xl font-black text-[#1E3E5B]">Your Bag</SheetTitle>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF9F5] text-[#4A8DB7] border border-[#EDE8DF]">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>
          </div>

          {/* Free Shipping Bar */}
          {freeShippingThreshold && (
            <div className="mt-3 pt-2.5 border-t border-[#EDE8DF]/60 space-y-1.5">
              <p className="text-xs text-[#6C7A89] flex items-center justify-between">
                <span>
                  {subtotal >= freeShippingThreshold ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500 inline" /> You unlocked Free Delivery!
                    </span>
                  ) : (
                    <span>Add ৳{(freeShippingThreshold - subtotal).toLocaleString()} more for Free Delivery</span>
                  )}
                </span>
                <span className="font-bold text-[11px] font-mono">{Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%</span>
              </p>
              <div className="w-full h-1.5 bg-[#FAF9F5] border border-[#EDE8DF] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4A8DB7] to-[#FF758F] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </SheetHeader>

        {/* Scrollable Center Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-5 bg-[#FCFBF7]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#FAF9F5] border border-[#EDE8DF] flex items-center justify-center text-[#6C7A89]">
                <ShoppingBag className="w-8 h-8 opacity-40" />
              </div>
              <div>
                <p className="font-heading text-lg font-bold text-[#1E3E5B]">Your bag is empty</p>
                <p className="text-xs text-[#6C7A89] mt-1">Explore our soft organic baby essentials!</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-2 px-5 py-2.5 bg-[#4A8DB7] hover:bg-[#3d779c] text-white text-xs font-bold rounded-full transition-colors shadow-sm"
              >
                Browse Baby Collection
              </button>
            </div>
          ) : (
            <>
              {/* Product Items */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#6C7A89] uppercase tracking-wider">Cart Items</span>
                <CartItemList items={items} removeItem={removeItem} updateQuantity={updateQuantity} />
              </div>

              {/* Promo Code Input */}
              <div className="flex items-center border border-[#EDE8DF] rounded-2xl bg-white overflow-hidden p-1 shadow-xs">
                <Tag className="w-4 h-4 text-[#6C7A89] ml-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Promo Code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 bg-transparent px-3 text-xs focus:outline-none placeholder:text-[#6C7A89]/60 uppercase font-medium"
                />
                <button
                  type="button"
                  className="bg-[#1E3E5B] hover:bg-[#4A8DB7] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors shrink-0"
                >
                  Apply
                </button>
              </div>

              {/* Loyalty Club */}
              <div className="flex items-center justify-between border border-[#EDE8DF] rounded-2xl bg-white p-3.5 shadow-xs">
                <div>
                  <p className="text-xs font-bold text-[#1E3E5B] flex items-center gap-1">
                    Mini Bunny <span className="text-[#4A8DB7]">Club</span>
                  </p>
                  <p className="text-[11px] text-[#6C7A89] mt-0.5">Use 0 points for ৳0 off</p>
                </div>
                <Switch checked={useLoyalty} onCheckedChange={setUseLoyalty} />
              </div>

              {/* Gift Options Component */}
              <div>
                <GiftOptions compact={true} charge={150} />
              </div>
            </>
          )}
        </div>

        {/* Sticky Bottom Footer */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-[#EDE8DF] bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] space-y-3 shadow-lg">
            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#6C7A89]">
                <span>Items Subtotal</span>
                <span className="font-mono font-medium text-[#1E3E5B]">৳{subtotal.toLocaleString()}</span>
              </div>
              {isGiftWrapped && (
                <div className="flex justify-between text-[#FF758F] font-medium">
                  <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> Gift Wrapping</span>
                  <span className="font-mono">+৳150</span>
                </div>
              )}
              {useLoyalty && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Loyalty Discount</span>
                  <span className="font-mono">-৳{loyaltyValue.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-base text-[#1E3E5B] pt-2 border-t border-[#EDE8DF]">
                <span>Estimated Total</span>
                <span className="font-mono text-lg text-[#1E3E5B]">৳{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <Link href="/checkout" onClick={() => setIsOpen(false)} className="block">
                <button className="w-full py-3.5 bg-[#4A8DB7] hover:bg-[#3d779c] text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg shadow-[#4A8DB7]/20">
                  <span>Proceed to Checkout</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="block text-center text-xs text-[#6C7A89] hover:text-[#1E3E5B] font-semibold transition-colors py-1"
              >
                View Detailed Cart Page →
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
