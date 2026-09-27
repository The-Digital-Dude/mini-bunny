"use client"

import { useState } from "react"
import {
  Gift,
  Check,
  Sparkles,
  Copy,
  Share2,
  Printer,
  Search,
  RotateCcw,
  Heart,
  ShieldCheck,
  Clock,
  Send,
  PartyPopper,
  Baby,
  Star,
  Leaf,
  Layers,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  QrCode,
  Smartphone,
  Lock,
  Wallet,
  UserCheck,
  LogIn,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import FadeIn from "@/components/ui/FadeIn"
import { BunnyIcon } from "@/components/store/BunnyLogo"
import AuthPromptModal from "@/components/store/AuthPromptModal"

const THEMES = [
  {
    id: "classic-gold",
    name: "Signature Navy & Gold",
    tagline: "Timeless Luxury",
    gradient: "from-[#1E3E5B] via-[#244b6e] to-[#0f2438]",
    accent: "#D4AF37",
    textColor: "text-amber-300",
    badgeBg: "bg-amber-400/20 text-amber-200 border-amber-400/30",
    icon: Sparkles,
  },
  {
    id: "baby-pink",
    name: "Baby Shower Rose",
    tagline: "Blossom & Sweetness",
    gradient: "from-[#8E3B56] via-[#B85D7B] to-[#5C1E34]",
    accent: "#FFB5C5",
    textColor: "text-rose-200",
    badgeBg: "bg-rose-400/20 text-rose-200 border-rose-400/30",
    icon: Heart,
  },
  {
    id: "celestial-blue",
    name: "Celestial Starlight",
    tagline: "Dreamy Clouds",
    gradient: "from-[#1B3B6F] via-[#2E5E9E] to-[#0D2346]",
    accent: "#A7D2FF",
    textColor: "text-sky-200",
    badgeBg: "bg-sky-400/20 text-sky-200 border-sky-400/30",
    icon: Star,
  },
  {
    id: "organic-sage",
    name: "Organic Botanical",
    tagline: "Earthy & Pure",
    gradient: "from-[#2D5A43] via-[#3F7558] to-[#1C3B2C]",
    accent: "#B8E0C8",
    textColor: "text-emerald-200",
    badgeBg: "bg-emerald-400/20 text-emerald-200 border-emerald-400/30",
    icon: Leaf,
  },
  {
    id: "birthday-confetti",
    name: "First Birthday Joy",
    tagline: "Celebration & Magic",
    gradient: "from-[#5B2C6F] via-[#7D3C98] to-[#3B174B]",
    accent: "#F8C471",
    textColor: "text-amber-200",
    badgeBg: "bg-purple-400/20 text-purple-200 border-purple-400/30",
    icon: PartyPopper,
  },
]

const PRESET_AMOUNTS = [500, 1000, 2000, 3000, 5000, 10000]

export default function GiftCardStore({
  bkashMerchantNumber = "01700-000000",
  nagadMerchantNumber = "01800-000000",
  isLoggedIn = false,
  userEmail = null,
  userName = null,
  walletBalance = 0,
  userTransactions = [],
}: {
  bkashMerchantNumber?: string
  nagadMerchantNumber?: string
  isLoggedIn?: boolean
  userEmail?: string | null
  userName?: string | null
  walletBalance?: number
  userTransactions?: any[]
}) {
  const [activeTab, setActiveTab] = useState<"purchase" | "claim">("purchase")
  const [purchaseStep, setPurchaseStep] = useState<"details" | "payment" | "success">("details")
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0].id)
  const [selectedAmount, setSelectedAmount] = useState<number>(2000)
  const [customAmount, setCustomAmount] = useState<string>("")
  const [isCustom, setIsCustom] = useState(false)

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // Purchase form state
  const [form, setForm] = useState({
    recipientName: "",
    recipientEmail: "",
    senderName: userName || "",
    senderEmail: userEmail || "",
    message: "",
  })

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"BKASH" | "NAGAD" | "CARD">("BKASH")
  const [paymentTrxId, setPaymentTrxId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [issuedCard, setIssuedCard] = useState<{
    code: string
    amount: number
    theme: string
    recipientName: string
    recipientEmail: string
    senderName: string
    message: string | null
    paymentMethod?: string | null
    paymentTrxId?: string | null
    paymentStatus?: string
    expiresAt: string
  } | null>(null)

  // Claim gift card state
  const [claimCode, setClaimCode] = useState("")
  const [claiming, setClaiming] = useState(false)
  const [currentWallet, setCurrentWallet] = useState(walletBalance)
  const [transactions, setTransactions] = useState(userTransactions)
  const [claimSuccess, setClaimSuccess] = useState<{
    claimedAmount: number
    newWalletBalance: number
    theme: string
    senderName: string
    message: string | null
    code: string
  } | null>(null)

  const activeThemeObj = THEMES.find((t) => t.id === (issuedCard?.theme || selectedTheme)) || THEMES[0]

  const finalAmount = isCustom ? Number(customAmount) || 0 : selectedAmount

  const handleFieldChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!finalAmount || finalAmount < 100) {
      toast.error("Please enter a valid gift amount of at least ৳100.")
      return
    }
    if (!form.recipientName.trim()) {
      toast.error("Please enter the recipient's name.")
      return
    }
    if (!form.recipientEmail.trim() || !form.recipientEmail.includes("@")) {
      toast.error("Please enter a valid recipient email address.")
      return
    }
    setPurchaseStep("payment")
  }

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (["BKASH", "NAGAD"].includes(paymentMethod) && (!paymentTrxId.trim() || paymentTrxId.trim().length < 6)) {
      toast.error(`Please enter your ${paymentMethod === "BKASH" ? "bKash" : "Nagad"} Transaction ID (TrxID).`)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/store/gift-card/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          theme: selectedTheme,
          ...form,
          paymentMethod,
          paymentTrxId: paymentMethod === "CARD" ? "CARD-" + Date.now().toString().slice(-8) : paymentTrxId.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit gift card purchase")

      setIssuedCard(data)
      setPurchaseStep("success")
      toast.success("🎁 Payment submitted for admin verification!")
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleClaimCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn) {
      setAuthModalOpen(true)
      return
    }
    if (!claimCode.trim()) {
      toast.error("Please enter your 16-character gift card code.")
      return
    }

    setClaiming(true)
    setClaimSuccess(null)
    try {
      const res = await fetch("/api/store/gift-card/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: claimCode.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not claim gift card")

      setClaimSuccess(data)
      setCurrentWallet(data.newWalletBalance)
      setTransactions((prev) => [
        {
          id: "tx-" + Date.now(),
          amount: data.claimedAmount,
          type: "GIFT_CARD_CLAIM",
          note: `Claimed Gift Card ${data.code} from ${data.senderName || "Special Friend"}`,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ])
      setClaimCode("")
      toast.success(`🎉 ৳${data.claimedAmount.toLocaleString()} added to your wallet!`)
    } catch (err: any) {
      toast.error(err.message || "Failed to claim gift card")
    } finally {
      setClaiming(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Gift Card code copied to clipboard!")
  }

  const shareViaWhatsApp = () => {
    if (!issuedCard) return
    const text = encodeURIComponent(
      `🎁 *Special Gift for ${issuedCard.recipientName}!*\n\n` +
      `You've received a ৳${issuedCard.amount.toLocaleString()} Mini Bunny digital gift card from ${issuedCard.senderName || "someone special"}.\n\n` +
      (issuedCard.message ? `💌 "${issuedCard.message}"\n\n` : "") +
      `🔑 *Gift Card Code:* ${issuedCard.code}\n\n` +
      `Log in and claim your gift into your parent wallet at:\n` +
      `${typeof window !== "undefined" ? window.location.origin : "https://minibunny.com"}/gift-cards`
    )
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  const printCertificate = () => {
    window.print()
  }

  return (
    <>
      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign In to Claim Gift Card"
        description="Gift cards are securely deposited directly into your Mini Bunny Parent Wallet for 1-click checkout. Please sign in or register to claim your gift."
      />

      {/* Print Specific CSS to isolate the certificate on a single page */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide non-certificate chrome */
          nav, header, footer, .print-hide, [data-sonner-toaster], .no-print {
            display: none !important;
          }
          .printable-certificate-container {
            display: block !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
          }
          .printable-card {
            border: 2px solid #D4AF37 !important;
            page-break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-[#FAF9F5] py-12 md:py-16 print:py-0 print:bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header Hero */}
          <div className="print-hide">
            <FadeIn>
              <div className="text-center max-w-3xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF0F3] border border-[#FFD2DC] text-[#FF758F] text-xs font-black uppercase tracking-widest mb-4 shadow-sm">
                  <Gift className="w-3.5 h-3.5" />
                  The Gift of Choice
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-[#1E3E5B] tracking-tight mb-4">
                  Mini Bunny Gift Cards & Wallet
                </h1>
                <p className="text-[#6C7A89] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                  Give new parents and growing little ones the freedom to choose. Send luxury digital cards or claim received vouchers securely into your Mini Bunny account wallet.
                </p>

                {/* Tab switchers */}
                <div className="flex items-center justify-center gap-2 mt-8 p-1.5 bg-[#EDE8DF]/80 rounded-2xl w-fit mx-auto border border-[#E0D9CC]">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("purchase")
                      setPurchaseStep("details")
                      setIssuedCard(null)
                    }}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
                      activeTab === "purchase"
                        ? "bg-[#1E3E5B] text-white shadow-md"
                        : "text-[#6C7A89] hover:text-[#1E3E5B]"
                    }`}
                  >
                    <Gift className="w-4 h-4" />
                    Send a Gift Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("claim")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
                      activeTab === "claim"
                        ? "bg-[#1E3E5B] text-white shadow-md"
                        : "text-[#6C7A89] hover:text-[#1E3E5B]"
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    Claim to Account Wallet
                  </button>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Tab 1: PURCHASE & PAYMENT & SUCCESS */}
          {activeTab === "purchase" && (
            <>
              {purchaseStep === "success" && issuedCard ? (
                /* Success Certificate View */
                <FadeIn>
                  <div className="printable-certificate-container max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-[#EDE8DF] shadow-2xl relative overflow-hidden">
                    <div className="text-center mb-8 print-hide">
                      {issuedCard.paymentStatus === "PENDING_VERIFICATION" ? (
                        <>
                          <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                            <Clock className="w-8 h-8" />
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#1E3E5B] mb-2">
                            Payment Submitted for Verification ⏳
                          </h2>
                          <p className="text-xs sm:text-sm text-[#6C7A89] max-w-lg mx-auto">
                            We received your {issuedCard.paymentMethod || "MFS"} payment (TrxID: <strong className="font-mono text-[#1E3E5B]">{issuedCard.paymentTrxId}</strong>).
                            Our accounts team will verify the payment and activate the gift card shortly (usually 15–30 mins).
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-[#E8F8F0] border border-[#B7EBD0] rounded-full flex items-center justify-center mx-auto mb-4 text-[#2D9A65]">
                            <Check className="w-8 h-8" />
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#1E3E5B] mb-2">
                            Gift Card Created & Ready! 🎁
                          </h2>
                          <p className="text-xs sm:text-sm text-[#6C7A89]">
                            Payment confirmed. Voucher generated for <strong>{issuedCard.recipientName}</strong>.
                          </p>
                        </>
                      )}
                    </div>

                    {/* Luxury Digital Certificate Preview */}
                    <div
                      className={`printable-card relative rounded-3xl p-8 sm:p-10 bg-gradient-to-br ${activeThemeObj.gradient} text-white shadow-xl overflow-hidden mb-8 border border-white/15`}
                    >
                      {/* Background Sheen & Circles */}
                      <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                      <div className="relative z-10 flex items-center justify-between border-b border-white/20 pb-5 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-sm">
                            <BunnyIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-heading font-black text-base tracking-widest uppercase text-white">
                              Mini Bunny
                            </p>
                            <p className="text-[10px] text-white/80 uppercase tracking-wider font-bold">
                              Luxury Baby Boutique Voucher
                            </p>
                          </div>
                        </div>
                        <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full border backdrop-blur-md ${
                          issuedCard.paymentStatus === "PENDING_VERIFICATION"
                            ? "bg-amber-500/30 text-amber-200 border-amber-400/40"
                            : activeThemeObj.badgeBg
                        }`}>
                          {issuedCard.paymentStatus === "PENDING_VERIFICATION" ? "Pending Admin Verification" : activeThemeObj.tagline}
                        </span>
                      </div>

                      <div className="relative z-10 space-y-5">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-white/70 font-bold">Prepared With Love For</p>
                          <p className="text-2xl sm:text-3xl font-heading font-black text-white mt-0.5">
                            {issuedCard.recipientName}
                          </p>
                        </div>

                        {issuedCard.message && (
                          <div className="bg-black/25 backdrop-blur-sm rounded-2xl p-4 border border-white/15 text-xs sm:text-sm italic text-white/95 leading-relaxed">
                            &ldquo;{issuedCard.message}&rdquo;
                          </div>
                        )}

                        <div className="pt-3 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-white/20">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-white/70 font-bold mb-1">
                              Claim Code
                            </p>
                            <p className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-amber-200">
                              {issuedCard.code}
                            </p>
                          </div>
                          <div className="sm:text-right">
                            <p className="text-[10px] uppercase tracking-widest text-white/70 font-bold mb-0.5">Gift Value</p>
                            <p className="text-3xl sm:text-4xl font-heading font-black text-white font-mono">
                              ৳{issuedCard.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Certificate Footer for Print */}
                        <div className="pt-4 border-t border-white/15 flex items-center justify-between text-[10px] text-white/80">
                          <span>Claim online at <strong>minibunny.com/gift-cards</strong></span>
                          <span>From: <strong>{issuedCard.senderName || "Special Friend"}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print-hide">
                      <button
                        type="button"
                        onClick={() => copyCode(issuedCard.code)}
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#1E3E5B] text-white text-xs font-black hover:bg-[#152e44] transition-all shadow-md active:scale-95"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </button>
                      <button
                        type="button"
                        onClick={shareViaWhatsApp}
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#25D366] text-white text-xs font-black hover:bg-[#20bd5a] transition-all shadow-md active:scale-95"
                      >
                        <Share2 className="w-4 h-4" />
                        WhatsApp Share
                      </button>
                      <button
                        type="button"
                        onClick={printCertificate}
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-[#EDE8DF] bg-[#FAF9F5] text-[#1E3E5B] text-xs font-black hover:bg-[#EDE8DF] transition-all active:scale-95"
                      >
                        <Printer className="w-4 h-4" />
                        Print Certificate
                      </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[#EDE8DF] text-center print-hide">
                      <button
                        type="button"
                        onClick={() => {
                          setPurchaseStep("details")
                          setIssuedCard(null)
                          setPaymentTrxId("")
                          setForm({
                            recipientName: "",
                            recipientEmail: "",
                            senderName: "",
                            senderEmail: "",
                            message: "",
                          })
                        }}
                        className="text-xs font-bold text-[#6C7A89] hover:text-[#1E3E5B] transition-colors"
                      >
                        ← Issue Another Gift Card
                      </button>
                    </div>
                  </div>
                </FadeIn>
              ) : purchaseStep === "payment" ? (
                /* Step 2: MFS & Digital Payment View */
                <FadeIn>
                  <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-9 border border-[#EDE8DF] shadow-lg">
                    <div className="flex items-center justify-between border-b border-[#EDE8DF] pb-4 mb-6">
                      <button
                        type="button"
                        onClick={() => setPurchaseStep("details")}
                        className="text-xs font-bold text-[#6C7A89] hover:text-[#1E3E5B] flex items-center gap-1"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back to Details
                      </button>
                      <span className="text-xs font-black uppercase text-[#FF758F] bg-[#FFF0F3] px-3 py-1 rounded-full border border-[#FFD2DC]">
                        Step 2 of 2: Payment
                      </span>
                    </div>

                    {/* Order Summary Pill */}
                    <div className="bg-[#FAF9F5] rounded-2xl p-4 border border-[#EDE8DF] mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#1E3E5B]">Gift Card for {form.recipientName}</p>
                        <p className="text-[11px] text-[#6C7A89]">{activeThemeObj.name} Theme</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-[#6C7A89]">Payable Amount</p>
                        <p className="text-xl font-heading font-black text-[#1E3E5B] font-mono">
                          ৳{finalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleCompletePayment} className="space-y-6">
                      {/* Payment Method Selector */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-[#1E3E5B] mb-3">
                          Select Payment Method
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("BKASH")}
                            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                              paymentMethod === "BKASH"
                                ? "border-[#E2136E] bg-[#E2136E]/5 ring-2 ring-[#E2136E]/20"
                                : "border-[#EDE8DF] hover:border-[#E2136E]/40"
                            }`}
                          >
                            <span className="w-8 h-8 rounded-full bg-[#E2136E] text-white flex items-center justify-center font-black text-xs">
                              ৳
                            </span>
                            <span className="text-xs font-black text-[#1E3E5B]">bKash MFS</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod("NAGAD")}
                            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                              paymentMethod === "NAGAD"
                                ? "border-[#F7941D] bg-[#F7941D]/5 ring-2 ring-[#F7941D]/20"
                                : "border-[#EDE8DF] hover:border-[#F7941D]/40"
                            }`}
                          >
                            <span className="w-8 h-8 rounded-full bg-[#F7941D] text-white flex items-center justify-center font-black text-xs">
                              ৳
                            </span>
                            <span className="text-xs font-black text-[#1E3E5B]">Nagad MFS</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod("CARD")}
                            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                              paymentMethod === "CARD"
                                ? "border-[#1E3E5B] bg-[#1E3E5B]/5 ring-2 ring-[#1E3E5B]/20"
                                : "border-[#EDE8DF] hover:border-[#1E3E5B]/40"
                            }`}
                          >
                            <span className="w-8 h-8 rounded-full bg-[#1E3E5B] text-white flex items-center justify-center">
                              <CreditCard className="w-4 h-4" />
                            </span>
                            <span className="text-xs font-black text-[#1E3E5B]">Card / Bank</span>
                          </button>
                        </div>
                      </div>

                      {/* Payment Instructions per Method */}
                      {paymentMethod === "BKASH" && (
                        <div className="bg-[#FFF0F5] border border-[#FCD6E5] rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-[#E2136E]">bKash Merchant Payment</span>
                            <span className="font-mono text-xs font-black bg-white px-2.5 py-1 rounded-lg border border-[#FCD6E5] text-[#1E3E5B]">
                              {bkashMerchantNumber}
                            </span>
                          </div>
                          <ol className="text-[11px] text-[#6C7A89] space-y-1 list-decimal list-inside leading-relaxed">
                            <li>Open bKash App or dial <kbd className="font-mono text-[10px] bg-white px-1 border rounded">*247#</kbd></li>
                            <li>Select <strong>Payment</strong> and enter Merchant Number: <strong className="text-[#1E3E5B]">{bkashMerchantNumber}</strong></li>
                            <li>Enter Amount: <strong className="text-[#1E3E5B]">৳{finalAmount.toLocaleString()}</strong></li>
                            <li>Enter Reference: <strong className="text-[#1E3E5B]">GIFT</strong> and complete payment with PIN</li>
                            <li>Copy the <strong>TrxID</strong> from the confirmation SMS and paste below</li>
                          </ol>
                          <div>
                            <label className="block text-[11px] font-bold text-[#1E3E5B] mb-1">
                              bKash Transaction ID (TrxID) *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. BLM871239X"
                              value={paymentTrxId}
                              onChange={(e) => setPaymentTrxId(e.target.value.toUpperCase())}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#FCD6E5] rounded-xl text-xs font-mono font-black text-[#1E3E5B] focus:border-[#E2136E] focus:outline-none uppercase"
                            />
                          </div>
                        </div>
                      )}

                      {paymentMethod === "NAGAD" && (
                        <div className="bg-[#FFF9F2] border border-[#FFE2C2] rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-[#F7941D]">Nagad Merchant Payment</span>
                            <span className="font-mono text-xs font-black bg-white px-2.5 py-1 rounded-lg border border-[#FFE2C2] text-[#1E3E5B]">
                              {nagadMerchantNumber}
                            </span>
                          </div>
                          <ol className="text-[11px] text-[#6C7A89] space-y-1 list-decimal list-inside leading-relaxed">
                            <li>Open Nagad App or dial <kbd className="font-mono text-[10px] bg-white px-1 border rounded">*167#</kbd></li>
                            <li>Select <strong>Payment</strong> and enter Merchant Number: <strong className="text-[#1E3E5B]">{nagadMerchantNumber}</strong></li>
                            <li>Enter Amount: <strong className="text-[#1E3E5B]">৳{finalAmount.toLocaleString()}</strong></li>
                            <li>Enter Reference: <strong className="text-[#1E3E5B]">GIFT</strong> and confirm PIN</li>
                            <li>Copy the <strong>TrxID</strong> from confirmation SMS and paste below</li>
                          </ol>
                          <div>
                            <label className="block text-[11px] font-bold text-[#1E3E5B] mb-1">
                              Nagad Transaction ID (TrxID) *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 71A9B48CK"
                              value={paymentTrxId}
                              onChange={(e) => setPaymentTrxId(e.target.value.toUpperCase())}
                              className="w-full px-3.5 py-2.5 bg-white border border-[#FFE2C2] rounded-xl text-xs font-mono font-black text-[#1E3E5B] focus:border-[#F7941D] focus:outline-none uppercase"
                            />
                          </div>
                        </div>
                      )}

                      {paymentMethod === "CARD" && (
                        <div className="bg-[#F0F7FB] border border-[#D0E8F7] rounded-2xl p-4 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-black text-[#1E3E5B]">
                            <Lock className="w-4 h-4 text-[#4A8DB7]" />
                            <span>Instant Secure Card Checkout</span>
                          </div>
                          <p className="text-[11px] text-[#6C7A89] leading-relaxed">
                            Visa, Mastercard, American Express, and internet banking cards accepted. Instant authorization.
                          </p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 px-6 rounded-2xl bg-[#1E3E5B] text-white text-sm font-black hover:bg-[#152e44] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Submitting Payment Verification...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            Submit Payment & Issue Card (৳{finalAmount.toLocaleString()})
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </FadeIn>
              ) : (
                /* Step 1: Configure & Personalize Card Form */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Interactive Form (7 cols) */}
                  <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#EDE8DF] shadow-sm">
                    <form onSubmit={handleProceedToPayment} className="space-y-6">
                      {/* 1. Pick Visual Theme */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-[#1E3E5B] mb-3">
                          1. Choose Gift Card Theme
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {THEMES.map((theme) => {
                            const IconComp = theme.icon
                            const isSelected = selectedTheme === theme.id
                            return (
                              <button
                                key={theme.id}
                                type="button"
                                onClick={() => setSelectedTheme(theme.id)}
                                className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                                  isSelected
                                    ? "border-[#1E3E5B] bg-[#1E3E5B]/5 ring-2 ring-[#1E3E5B]/20 shadow-sm"
                                    : "border-[#EDE8DF] hover:border-[#1E3E5B]/40 bg-[#FAF9F5]"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1.5 w-full">
                                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                                    <IconComp className="w-3.5 h-3.5" />
                                  </div>
                                  <p className="text-xs font-black text-[#1E3E5B] truncate">{theme.name}</p>
                                </div>
                                <p className="text-[10px] text-[#6C7A89] font-medium">{theme.tagline}</p>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* 2. Select Denomination */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-xs font-black uppercase tracking-wider text-[#1E3E5B]">
                            2. Select Amount (BDT ৳)
                          </label>
                          <span className="text-[11px] font-bold text-[#FF758F]">Valid for 1 full year</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                          {PRESET_AMOUNTS.map((amt) => {
                            const isSelected = !isCustom && selectedAmount === amt
                            return (
                              <button
                                key={amt}
                                type="button"
                                onClick={() => {
                                  setIsCustom(false)
                                  setSelectedAmount(amt)
                                }}
                                className={`py-3 px-2 rounded-2xl border text-center font-mono font-black text-xs sm:text-sm transition-all ${
                                  isSelected
                                    ? "bg-[#1E3E5B] text-white border-[#1E3E5B] shadow-md scale-[1.02]"
                                    : "bg-[#FAF9F5] border-[#EDE8DF] text-[#1E3E5B] hover:border-[#1E3E5B]/40"
                                }`}
                              >
                                ৳{amt.toLocaleString()}
                              </button>
                            )
                          })}
                        </div>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsCustom(true)}
                            className={`w-full py-2.5 px-4 rounded-2xl border text-xs font-bold text-left transition-all flex items-center justify-between ${
                              isCustom
                                ? "bg-white border-[#1E3E5B] ring-2 ring-[#1E3E5B]/20"
                                : "bg-[#FAF9F5] border-[#EDE8DF] text-[#6C7A89]"
                            }`}
                          >
                            <span>Enter Custom Amount:</span>
                            {isCustom ? (
                              <input
                                type="number"
                                min="100"
                                max="100000"
                                placeholder="e.g. 7500"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                className="w-32 py-1 px-2.5 bg-white border border-[#1E3E5B] rounded-xl text-right font-mono font-black text-[#1E3E5B] text-sm focus:outline-none"
                                autoFocus
                              />
                            ) : (
                              <span className="text-[11px] font-bold underline">Custom ৳</span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* 3. Recipient Information */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-[#1E3E5B] mb-3">
                          3. Recipient & Gifting Details
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-[11px] font-bold text-[#6C7A89] mb-1">
                              Recipient Full Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Sarah & Baby Liam"
                              value={form.recipientName}
                              onChange={handleFieldChange("recipientName")}
                              className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#EDE8DF] rounded-2xl text-xs sm:text-sm font-semibold text-[#1E3E5B] focus:bg-white focus:border-[#1E3E5B] focus:outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-[#6C7A89] mb-1">
                              Recipient Email Address *
                            </label>
                            <input
                              type="email"
                              required
                              placeholder="sarah@example.com"
                              value={form.recipientEmail}
                              onChange={handleFieldChange("recipientEmail")}
                              className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#EDE8DF] rounded-2xl text-xs sm:text-sm font-semibold text-[#1E3E5B] focus:bg-white focus:border-[#1E3E5B] focus:outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-[11px] font-bold text-[#6C7A89] mb-1">
                              Your Name (Sender)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Auntie Maya"
                              value={form.senderName}
                              onChange={handleFieldChange("senderName")}
                              className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#EDE8DF] rounded-2xl text-xs sm:text-sm font-semibold text-[#1E3E5B] focus:bg-white focus:border-[#1E3E5B] focus:outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-[#6C7A89] mb-1">
                              Your Email (Optional)
                            </label>
                            <input
                              type="email"
                              placeholder="maya@example.com"
                              value={form.senderEmail}
                              onChange={handleFieldChange("senderEmail")}
                              className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#EDE8DF] rounded-2xl text-xs sm:text-sm font-semibold text-[#1E3E5B] focus:bg-white focus:border-[#1E3E5B] focus:outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#6C7A89] mb-1">
                            Personalized Greeting Message (Optional)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Wishing you and your adorable little one so much joy and cuddles! Enjoy picking out something sweet."
                            value={form.message}
                            onChange={handleFieldChange("message")}
                            maxLength={300}
                            className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#EDE8DF] rounded-2xl text-xs sm:text-sm font-medium text-[#1E3E5B] focus:bg-white focus:border-[#1E3E5B] focus:outline-none transition-all resize-none"
                          />
                          <p className="text-[10px] text-[#6C7A89] text-right font-medium">
                            {form.message.length}/300 characters
                          </p>
                        </div>
                      </div>

                      {/* Continue to Payment Button */}
                      <button
                        type="submit"
                        className="w-full py-4 px-6 rounded-2xl bg-[#1E3E5B] text-white text-sm font-black hover:bg-[#152e44] transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
                      >
                        <span>Continue to Payment (৳{finalAmount.toLocaleString()})</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Live Interactive Preview (5 cols) */}
                  <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                    <div>
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-xs font-black uppercase tracking-wider text-[#1E3E5B]">
                          Live Card Preview
                        </span>
                        <span className="text-[10px] font-bold text-[#6C7A89]">Interactive Digital Voucher</span>
                      </div>

                      {/* Luxury Card */}
                      <div
                        className={`relative rounded-3xl p-7 bg-gradient-to-br ${activeThemeObj.gradient} text-white shadow-2xl overflow-hidden border border-white/10 transition-all duration-500`}
                      >
                        {/* Sheen & glow */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                        <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-4 mb-5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                              <BunnyIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-heading font-black text-xs tracking-widest uppercase">Mini Bunny</p>
                              <p className="text-[9px] text-white/70 uppercase tracking-wider font-bold">
                                Luxury Baby Boutique
                              </p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border backdrop-blur-md ${activeThemeObj.badgeBg}`}>
                            {activeThemeObj.name}
                          </span>
                        </div>

                        <div className="relative z-10 space-y-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-white/60 font-bold">For</p>
                            <p className="text-lg sm:text-xl font-heading font-black text-white truncate">
                              {form.recipientName || "Recipient Name"}
                            </p>
                          </div>

                          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10 min-h-[60px] flex items-center">
                            <p className="text-xs italic text-white/90 line-clamp-2">
                              {form.message ? `"${form.message}"` : '"Wishing you and your little one pure comfort & joy..."'}
                            </p>
                          </div>

                          <div className="pt-2 flex items-end justify-between border-t border-white/15">
                            <div>
                              <p className="text-[9px] uppercase tracking-widest text-white/60 font-bold mb-0.5">From</p>
                              <p className="text-xs font-bold text-white/90">
                                {form.senderName || "A Special Friend"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] uppercase tracking-widest text-white/60 font-bold mb-0.5">Amount</p>
                              <p className="text-2xl font-heading font-black text-white font-mono">
                                ৳{finalAmount > 0 ? finalAmount.toLocaleString() : "0"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Highlights Box */}
                    <div className="bg-white rounded-3xl p-6 border border-[#EDE8DF] space-y-3 text-xs text-[#6C7A89]">
                      <div className="flex items-center gap-2.5 font-bold text-[#1E3E5B]">
                        <ShieldCheck className="w-4 h-4 text-[#2D9A65]" />
                        <span>Secure MFS Payment with Admin Verification</span>
                      </div>
                      <div className="flex items-center gap-2.5 font-bold text-[#1E3E5B]">
                        <Lock className="w-4 h-4 text-[#4A8DB7]" />
                        <span>Account-Bound Wallet Security (Login Required to Claim)</span>
                      </div>
                      <div className="flex items-center gap-2.5 font-bold text-[#1E3E5B]">
                        <Send className="w-4 h-4 text-[#FF758F]" />
                        <span>Instant 1-click WhatsApp share & print certificate</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tab 2: CLAIM CARD TO ACCOUNT WALLET (LOGIN REQUIRED) */}
          {activeTab === "claim" && (
            <FadeIn>
              <div className="max-w-2xl mx-auto space-y-8">
                {/* Account Wallet Status Banner */}
                {isLoggedIn ? (
                  <div className="bg-gradient-to-br from-[#1E3E5B] to-[#2B567E] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-white/70 uppercase tracking-widest mb-1">
                          <Wallet className="w-4 h-4 text-amber-300" />
                          <span>Mini Bunny Parent Wallet</span>
                        </div>
                        <p className="text-sm text-white/90">
                          Logged in as <strong>{userName || userEmail}</strong>
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-[10px] uppercase tracking-wider text-white/60 font-bold block mb-0.5">
                          Available Store Balance
                        </span>
                        <span className="text-3xl sm:text-4xl font-heading font-black text-amber-200 font-mono">
                          ৳{currentWallet.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Guest Auth Gate */
                  <div className="bg-white rounded-3xl p-8 border border-[#EDE8DF] text-center shadow-sm space-y-4">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 border border-amber-200">
                      <Lock className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl font-heading font-black text-[#1E3E5B]">
                      Sign In to Claim Gift Card
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6C7A89] max-w-md mx-auto leading-relaxed">
                      To prevent unauthorized use, all Mini Bunny gift cards are claimed directly into your parent account wallet and applied automatically at checkout.
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAuthModalOpen(true)}
                        className="px-6 py-3 bg-[#1E3E5B] text-white rounded-2xl text-xs font-black hover:bg-[#152e44] transition-all shadow-md flex items-center gap-2"
                      >
                        <LogIn className="w-4 h-4" /> Sign In / Register
                      </button>
                    </div>
                  </div>
                )}

                {/* Claim Input Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDE8DF] shadow-sm">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF0F3] flex items-center justify-center mx-auto mb-3 text-[#FF758F]">
                      <Gift className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-heading font-black text-[#1E3E5B] mb-1">
                      Add Gift Card to Your Wallet
                    </h2>
                    <p className="text-xs text-[#6C7A89]">
                      Enter your 16-character code (e.g. <code>BUNNY-XXXX-XXXX-XXXX</code>) to deposit 100% of the funds into your account.
                    </p>
                  </div>

                  <form onSubmit={handleClaimCard} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="BUNNY-XXXX-XXXX-XXXX"
                        value={claimCode}
                        onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                        className="w-full py-3.5 px-4 text-center font-mono font-black text-lg bg-[#FAF9F5] border border-[#EDE8DF] rounded-2xl text-[#1E3E5B] tracking-widest focus:bg-white focus:border-[#1E3E5B] focus:outline-none uppercase placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:text-[#6C7A89]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={claiming}
                      className="w-full py-3.5 px-6 rounded-2xl bg-[#1E3E5B] text-white text-xs font-black hover:bg-[#152e44] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                    >
                      {claiming ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Claiming Gift Card to Wallet...
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4 text-amber-300" />
                          Claim to My Account Wallet
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Claim Success Celebration Card */}
                {claimSuccess && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 bg-emerald-50/20 shadow-xl animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-lg text-[#1E3E5B]">
                          Gift Card Successfully Claimed! 🎉
                        </h3>
                        <p className="text-xs text-[#6C7A89]">
                          ৳{claimSuccess.claimedAmount.toLocaleString()} has been added to your Mini Bunny wallet.
                        </p>
                      </div>
                    </div>

                    {claimSuccess.message && (
                      <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 text-xs italic text-[#1E3E5B] mb-4">
                        &ldquo;{claimSuccess.message}&rdquo; — {claimSuccess.senderName || "Special Friend"}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-emerald-100 text-xs font-bold text-[#1E3E5B]">
                      <span>New Available Wallet Balance:</span>
                      <span className="font-mono text-base font-black text-emerald-700">
                        ৳{claimSuccess.newWalletBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Wallet History Ledger */}
                {isLoggedIn && transactions.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDE8DF] shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#1E3E5B] mb-4">
                      Recent Wallet & Gift History
                    </h3>
                    <div className="space-y-2.5">
                      {transactions.map((tx: any) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3.5 bg-[#FAF9F5] rounded-2xl text-xs border border-[#EDE8DF]"
                        >
                          <div>
                            <p className="font-bold text-[#1E3E5B]">{tx.note || "Wallet Transaction"}</p>
                            <p className="text-[10px] text-[#6C7A89]">
                              {new Date(tx.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <span
                            className={`font-mono font-black text-sm ${
                              Number(tx.amount) >= 0 ? "text-emerald-700" : "text-rose-600"
                            }`}
                          >
                            {Number(tx.amount) >= 0 ? `+৳${Number(tx.amount).toLocaleString()}` : `-৳${Math.abs(Number(tx.amount)).toLocaleString()}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </>
  )
}
