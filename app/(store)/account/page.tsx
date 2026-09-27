"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useSession, signOut } from "@/hooks/useSession"
import { useRouter } from "next/navigation"
import {
  User,
  Package,
  MapPin,
  Gift,
  LogOut,
  Wallet,
  Link2,
  Heart,
  Sparkles,
  Baby,
} from "lucide-react"
import { toast } from "sonner"
import AddressList from "@/components/store/account/AddressList"
import ParentProfileCard from "@/components/store/ParentProfileCard"
import SmartRecommendations from "@/components/store/SmartRecommendations"
import { BunnyIcon } from "@/components/store/BunnyLogo"

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("baby-profile")
  const [orders, setOrders] = useState<any[]>([])
  const [loyaltyBalance, setLoyaltyBalance] = useState(0)
  const [storeCreditBalance, setStoreCreditBalance] = useState(0)
  const [affiliate, setAffiliate] = useState<any>(null)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [giftCodeToClaim, setGiftCodeToClaim] = useState("")
  const [isClaimingGift, setIsClaimingGift] = useState(false)

  async function handleClaimGiftCardInAccount(e: React.FormEvent) {
    e.preventDefault()
    if (!giftCodeToClaim.trim()) return
    setIsClaimingGift(true)
    try {
      const res = await fetch("/api/store/gift-card/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: giftCodeToClaim.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to claim gift card")
      toast.success(`🎉 ৳${data.claimedAmount.toLocaleString()} added to your wallet!`)
      setStoreCreditBalance(data.newWalletBalance)
      setGiftCodeToClaim("")
    } catch (err: any) {
      toast.error(err.message || "Could not claim gift card")
    } finally {
      setIsClaimingGift(false)
    }
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/account")
    }
  }, [status, router])

  // Fetch orders
  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/account/orders")
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.orders || [])
        setOrdersLoading(false)
      })
      .catch(() => setOrdersLoading(false))
  }, [status])

  // Fetch loyalty balance, store credit, affiliate
  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/account/loyalty")
      .then((r) => r.json())
      .then((d) => setLoyaltyBalance(d.balance || 0))
      .catch(() => {})
    fetch("/api/account/store-credit")
      .then((r) => r.json())
      .then((d) => setStoreCreditBalance(d.balance || 0))
      .catch(() => {})
    fetch("/api/account/affiliate")
      .then((r) => r.json())
      .then((d) => setAffiliate(d.affiliate || null))
      .catch(() => {})
  }, [status])

  async function handleSignOut() {
    await signOut({ callbackUrl: "/" })
  }

  async function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProfileError("")
    const form = e.currentTarget
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value?.trim()

    if (!name) {
      setProfileError("Full Name is required.")
      return
    }

    setIsSavingProfile(true)
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        toast.success("Profile updated successfully")
      } else {
        const d = await res.json()
        toast.error(d.error || "Failed to update profile")
      }
    } catch {
      toast.error("Error updating profile")
    } finally {
      setIsSavingProfile(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#4A8DB7] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return null

  const user = session.user
  const firstName = user?.name?.split(" ")[0] || "Parent"

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] text-[#FF758F] font-bold text-xs uppercase tracking-wider mb-2">
            <BunnyIcon className="w-3.5 h-3.5" />
            <span>Mini Bunny Parent Portal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-black text-[#1E3E5B]">
            My Account
          </h1>
          <p className="text-sm text-[#6C7A89]">
            Welcome back, <strong className="text-[#1E3E5B]">{firstName}</strong>
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 space-y-1.5">
          {[
            { key: "baby-profile", label: "Baby & Parent Profile", icon: Heart, badge: "Smart" },
            { key: "recommendations", label: "Recommendations", icon: Sparkles },
            { key: "orders", label: "My Orders", icon: Package },
            { key: "profile", label: "Parent Details", icon: User },
            { key: "addresses", label: "Saved Addresses", icon: MapPin },
          ].map(({ key, label, icon: Icon, badge }: any) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === key
                  ? "bg-[#4A8DB7] text-white shadow-sm"
                  : "bg-white text-[#6C7A89] hover:text-[#1E3E5B] hover:bg-[#FAF9F5] border border-[#EDE8DF]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${activeTab === key ? "text-white" : "text-[#4A8DB7]"}`} />
                <span>{label}</span>
              </div>
              {badge && (
                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                  activeTab === key ? "bg-white/20 text-white" : "bg-[#FFF0F3] text-[#FF758F]"
                }`}>
                  {badge}
                </span>
              )}
            </button>
          ))}

          {/* Loyalty / Club Tab */}
          <button
            onClick={() => setActiveTab("loyalty")}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "loyalty"
                ? "bg-[#4A8DB7] text-white shadow-sm"
                : "bg-white text-[#6C7A89] hover:text-[#1E3E5B] hover:bg-[#FAF9F5] border border-[#EDE8DF]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Gift className={`w-4 h-4 ${activeTab === "loyalty" ? "text-white" : "text-[#FF758F]"}`} />
              <span>VIP Bunny Club</span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                activeTab === "loyalty" ? "bg-white text-[#4A8DB7]" : "bg-[#EBF5FB] text-[#4A8DB7]"
              }`}
            >
              {loyaltyBalance} pts
            </span>
          </button>

          {/* Store Credit */}
          {storeCreditBalance > 0 && (
            <button
              onClick={() => setActiveTab("credit")}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === "credit"
                  ? "bg-[#4A8DB7] text-white shadow-sm"
                  : "bg-white text-[#6C7A89] hover:text-[#1E3E5B] hover:bg-[#FAF9F5] border border-[#EDE8DF]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-4 h-4 text-[#2ECC71]" />
                <span>Store Credit</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#EBF8F2] text-[#2ECC71]">
                ৳{storeCreditBalance}
              </span>
            </button>
          )}

          {/* Referral */}
          {affiliate && (
            <button
              onClick={() => setActiveTab("affiliate")}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === "affiliate"
                  ? "bg-[#4A8DB7] text-white shadow-sm"
                  : "bg-white text-[#6C7A89] hover:text-[#1E3E5B] hover:bg-[#FAF9F5] border border-[#EDE8DF]"
              }`}
            >
              <Link2 className="w-4 h-4 text-[#D97706]" />
              <span>Referral Program</span>
            </button>
          )}

          {/* Sign Out */}
          <div className="pt-6 border-t border-[#EDE8DF]">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-[#E74C3C] hover:bg-[#FDEDEC] transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex-1 space-y-6">
          
          {/* TAB: BABY & PARENT PROFILE */}
          {activeTab === "baby-profile" && (
            <div className="space-y-6">
              <ParentProfileCard />
              <SmartRecommendations />
            </div>
          )}

          {/* TAB: SMART RECOMMENDATIONS */}
          {activeTab === "recommendations" && (
            <SmartRecommendations />
          )}

          {/* TAB: ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-heading font-black text-[#1E3E5B]">Order History</h2>
              {ordersLoading ? (
                <div className="text-[#6C7A89] text-sm">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 space-y-4 bg-white rounded-3xl border border-[#EDE8DF]">
                  <Package className="w-12 h-12 mx-auto text-[#6C7A89]/40" />
                  <p className="text-[#6C7A89] text-sm">No orders yet. Start your little one's wardrobe!</p>
                  <button
                    onClick={() => router.push("/shop")}
                    className="mt-2 px-6 py-3 bg-[#4A8DB7] text-white font-bold rounded-2xl hover:bg-[#367299] transition-colors text-xs"
                  >
                    Browse Babywear
                  </button>
                </div>
              ) : (
                orders.map((order: any) => (
                  <div key={order.id} className="border border-[#EDE8DF] rounded-3xl overflow-hidden bg-white shadow-sm">
                    <div className="bg-[#FAF9F5] px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#EDE8DF] text-xs">
                      <div>
                        <p className="text-[10px] text-[#6C7A89] uppercase tracking-wider font-bold">Placed On</p>
                        <p className="font-bold text-[#1E3E5B] mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-BD")}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#6C7A89] uppercase tracking-wider font-bold">Total</p>
                        <p className="font-mono font-bold text-[#1E3E5B] mt-0.5">৳{Number(order.total).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#6C7A89] uppercase tracking-wider font-bold">Status</p>
                        <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-[#EBF5FB] text-[#4A8DB7] font-bold">
                          {order.status}
                        </span>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-[10px] text-[#6C7A89] uppercase tracking-wider font-bold">Order #</p>
                        <p className="font-mono text-[#1E3E5B] mt-0.5">{order.orderNumber}</p>
                      </div>
                    </div>
                    {order.items?.slice(0, 2).map((item: any) => (
                      <div key={item.id} className="p-6 flex gap-4 border-b border-[#EDE8DF] last:border-0">
                        <div className="relative w-16 h-20 bg-[#FAF9F5] rounded-2xl shrink-0 overflow-hidden border border-[#EDE8DF]">
                          {item.product?.images?.[0]?.url && (
                            <Image src={item.product.images[0].url} alt={item.productName} fill sizes="64px" className="object-cover" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#1E3E5B]">{item.productName}</h4>
                          <p className="text-xs text-[#6C7A89] mt-0.5">Size: {item.size} | Color: {item.color}</p>
                          <p className="text-xs font-mono font-bold text-[#4A8DB7] mt-1">৳{Number(item.price).toLocaleString()} × {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: PARENT PROFILE DETAILS */}
          {activeTab === "profile" && (
            <div className="bg-white p-8 rounded-3xl border border-[#EDE8DF] space-y-6 shadow-sm">
              <h2 className="text-2xl font-heading font-black text-[#1E3E5B]">Parent Account Info</h2>
              <form className="max-w-md space-y-4" onSubmit={handleSaveProfile}>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1E3E5B]">Full Name</label>
                  <input
                    name="name"
                    defaultValue={user?.name || ""}
                    className={`w-full bg-[#FAF9F5] border ${profileError ? "border-red-500" : "border-[#EDE8DF]"} focus:bg-white focus:border-[#4A8DB7] rounded-2xl px-4 py-3 text-xs outline-none transition-all`}
                  />
                  {profileError && <p className="text-xs text-red-600 font-medium">{profileError}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1E3E5B]">Email Address</label>
                  <input
                    defaultValue={user?.email || ""}
                    disabled
                    className="w-full bg-[#FAF9F5] border border-[#EDE8DF] rounded-2xl px-4 py-3 text-xs opacity-60 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-[#6C7A89]">Email is tied to your login authentication.</p>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-3.5 bg-[#4A8DB7] text-white font-bold rounded-2xl hover:bg-[#367299] transition-colors text-xs disabled:opacity-50"
                  >
                    {isSavingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: ADDRESSES */}
          {activeTab === "addresses" && (
            <AddressList />
          )}

          {/* TAB: STORE CREDIT & GIFT WALLET */}
          {activeTab === "credit" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-heading font-black text-[#1E3E5B]">Parent Gift Wallet</h2>
                  <p className="text-xs text-[#6C7A89] mt-0.5">Use your store balance for seamless 1-click checkout on any order.</p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/gift-cards")}
                  className="px-4 py-2 bg-[#FAF9F5] border border-[#EDE8DF] hover:border-[#1E3E5B] text-xs font-bold text-[#1E3E5B] rounded-2xl transition-colors flex items-center gap-1.5"
                >
                  <Gift className="w-3.5 h-3.5 text-[#FF758F]" />
                  <span>Send a Gift Card</span>
                </button>
              </div>

              <div className="bg-gradient-to-br from-[#1E3E5B] to-[#2B567E] text-white rounded-3xl p-8 relative overflow-hidden shadow-md">
                <div className="absolute right-0 top-0 w-64 h-64 bg-[#2ECC71]/15 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <p className="text-white/70 uppercase tracking-wider text-xs font-bold mb-2">Available Balance</p>
                  <h3 className="text-4xl sm:text-5xl font-mono font-bold text-[#2ECC71] mb-2">৳{storeCreditBalance.toLocaleString()}</h3>
                  <p className="text-xs text-white/80">Automatically applied at checkout on your baby essentials.</p>
                </div>
              </div>

              {/* Quick Claim Gift Card Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDE8DF] shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFF0F3] text-[#FF758F] flex items-center justify-center">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base text-[#1E3E5B]">Have a Mini Bunny Gift Card?</h3>
                    <p className="text-xs text-[#6C7A89]">Enter your 16-character code to deposit the funds into this wallet.</p>
                  </div>
                </div>

                <form onSubmit={handleClaimGiftCardInAccount} className="flex flex-col sm:flex-row gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="BUNNY-XXXX-XXXX-XXXX"
                    value={giftCodeToClaim}
                    onChange={(e) => setGiftCodeToClaim(e.target.value.toUpperCase())}
                    className="flex-1 bg-[#FAF9F5] border border-[#EDE8DF] focus:bg-white focus:border-[#1E3E5B] rounded-2xl px-4 py-3 text-xs font-mono font-bold tracking-wider outline-none uppercase placeholder:tracking-normal placeholder:font-sans"
                  />
                  <button
                    type="submit"
                    disabled={isClaimingGift || !giftCodeToClaim.trim()}
                    className="px-6 py-3 bg-[#1E3E5B] text-white font-bold rounded-2xl hover:bg-[#152e44] transition-colors text-xs disabled:opacity-50 shrink-0 flex items-center justify-center gap-2"
                  >
                    {isClaimingGift ? "Claiming..." : "Claim to Wallet"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: AFFILIATE */}
          {activeTab === "affiliate" && affiliate && (
            <div className="space-y-6">
              <h2 className="text-2xl font-heading font-black text-[#1E3E5B]">Refer-a-Parent Dashboard</h2>
              <div className="bg-white border border-[#EDE8DF] rounded-3xl p-6 space-y-4">
                <div>
                  <p className="text-xs font-bold text-[#1E3E5B] mb-2">Your Personal Referral Link</p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={`${window.location.origin}?ref=${affiliate.code}`}
                      className="flex-1 bg-[#FAF9F5] border border-[#EDE8DF] rounded-2xl px-4 py-2 text-xs font-mono"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}?ref=${affiliate.code}`)
                        toast.success("Copied referral link!")
                      }}
                      className="px-4 py-2 bg-[#4A8DB7] text-white rounded-2xl text-xs font-bold hover:bg-[#367299] transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LOYALTY */}
          {activeTab === "loyalty" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-heading font-black text-[#1E3E5B]">Mini Bunny VIP Club</h2>
              <div className="bg-[#1E3E5B] text-white rounded-3xl p-8 md:p-12 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-[#FF758F]/20 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <p className="text-white/70 uppercase tracking-wider text-xs font-bold mb-2">Reward Points Balance</p>
                  <h3 className="text-5xl font-mono font-bold text-[#FF758F] mb-6">{loyaltyBalance}</h3>
                  <p className="text-xs md:text-sm text-white/90 max-w-sm">
                    {loyaltyBalance > 0
                      ? <>Redeem points for instant discount: <span className="text-white font-bold">৳{(loyaltyBalance * 0.1).toFixed(0)} off</span> at checkout.</>
                      : "Earn 1 point for every ৳10 spent on our store."}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
