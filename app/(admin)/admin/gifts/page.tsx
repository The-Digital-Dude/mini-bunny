import prisma from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Gift, Heart, Printer, CheckCircle2, Clock, Truck, Sparkles, MessageSquare } from "lucide-react"
import { serialize } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminGiftsPage() {
  const [giftOrders, settings] = await Promise.all([
    prisma.order.findMany({
      where: { giftWrap: true },
      include: { items: { include: { product: true } }, user: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }).catch(() => []),
    prisma.setting.findMany({
      where: { key: { in: ["gift_wrap_enabled", "gift_wrap_charge"] } },
    }).catch(() => []),
  ])

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]))
  const giftWrapEnabled = settingsMap.gift_wrap_enabled === "true"
  const giftWrapCharge = Number(settingsMap.gift_wrap_charge || 150)

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] text-[#FF758F] font-bold text-xs uppercase tracking-wider mb-2">
            <Gift className="w-3.5 h-3.5" />
            <span>Fulfillment & Packaging</span>
          </div>
          <h1 className="text-3xl font-heading font-black text-[#1E3E5B]">
            Gift Orders & Keepsake Packaging
          </h1>
          <p className="text-xs md:text-sm text-[#6C7A89]">
            Manage baby shower gifts, handwritten cards, and signature deluxe packaging orders.
          </p>
        </div>

        {/* Gift Status Summary Card */}
        <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#FF758F] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Active Gift Orders</p>
            <p className="text-lg font-heading font-black text-[#1E3E5B]">
              {giftOrders.length} Orders
            </p>
          </div>
        </div>
      </div>

      {/* Gift Configuration Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Gift Service Status</span>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${giftWrapEnabled ? "bg-emerald-500" : "bg-gray-400"}`} />
            <p className="text-sm font-bold text-[#1E3E5B]">{giftWrapEnabled ? "Active & Accepting Orders" : "Disabled"}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Packaging Fee</span>
          <p className="text-sm font-mono font-bold text-[#4A8DB7]">৳{giftWrapCharge} per Box</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Keepsake Box Specs</span>
          <p className="text-sm font-bold text-[#1E3E5B]">Signature Bunny Box + Satin Ribbon</p>
        </div>
      </div>

      {/* Gift Orders List */}
      <div className="space-y-4">
        <h2 className="text-lg font-heading font-bold text-[#1E3E5B] flex items-center gap-2">
          <span>🎁</span> Orders Requiring Gift Packaging ({giftOrders.length})
        </h2>

        {giftOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 space-y-3">
            <Gift className="w-12 h-12 mx-auto text-gray-300" />
            <p className="text-sm font-bold text-gray-600">No active gift wrapped orders</p>
            <p className="text-xs text-gray-400">Orders marked with gift wrap at checkout will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {giftOrders.map((order: any) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-6 hover:border-[#FF758F] transition-colors"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#1E3E5B]">
                        #{order.orderNumber}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF0F3] text-[#FF758F]">
                        Gift Wrapped (৳{Number(order.giftWrapCharge || giftWrapCharge)})
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Ordered on {new Date(order.createdAt).toLocaleDateString("en-BD", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={`/admin/orders/${order.id}`}
                      className="text-xs font-bold text-[#4A8DB7] hover:underline"
                    >
                      View Order Details →
                    </a>
                  </div>
                </div>

                {/* Recipient & Handwritten Card Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recipient info */}
                  <div className="space-y-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                    <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px] block">
                      Recipient / Delivery Details
                    </span>
                    <p className="font-bold text-sm text-[#1E3E5B]">{order.shippingName}</p>
                    <p className="text-gray-600">📞 {order.shippingPhone}</p>
                    <p className="text-gray-600">
                      📍 {order.shippingAddress}, {order.shippingArea}, {order.shippingDistrict}
                    </p>
                    {order.user && (
                      <p className="text-gray-400 pt-1 border-t border-gray-200">
                        Placed by: {order.user.name} ({order.user.email})
                      </p>
                    )}
                  </div>

                  {/* Handwritten Message Card */}
                  <div className="space-y-2 p-4 bg-[#FFF9F0] rounded-2xl border border-[#EDE8DF] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1E3E5B] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-[#FF758F] fill-[#FF758F]" /> Handwritten Card Message
                      </span>
                      <span className="text-[10px] text-amber-700 font-bold">Print Card</span>
                    </div>
                    {order.giftMessage ? (
                      <div className="p-3 bg-white rounded-xl border border-amber-200/60 font-serif italic text-sm text-[#24303E] leading-relaxed shadow-sm">
                        "{order.giftMessage}"
                      </div>
                    ) : (
                      <p className="text-gray-400 italic">No custom message requested (Standard Mini Bunny Greeting Card).</p>
                    )}
                  </div>
                </div>

                {/* Items in Gift Box */}
                <div className="space-y-2">
                  <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                    Items to Pack in Keepsake Box:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                          {item.product?.images?.[0]?.url ? (
                            <img src={item.product.images[0].url} alt={item.productName} className="w-full h-full object-cover" />
                          ) : (
                            <Gift className="w-5 h-5 m-2.5 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs truncate text-[#1E3E5B]">{item.productName}</p>
                          <p className="text-[10px] text-gray-500">Size: {item.size} · Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
