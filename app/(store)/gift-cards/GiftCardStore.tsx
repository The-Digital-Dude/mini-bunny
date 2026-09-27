"use client"

import { useState } from "react"
import { Gift, Mail, User, MessageSquare, Check, Sparkles } from "lucide-react"
import { toast } from "sonner"

const DENOMINATIONS = [500, 1000, 2000, 3000, 5000, 10000]

export default function GiftCardStore() {
  const [amount, setAmount] = useState(1000)
  const [form, setForm] = useState({
    recipientEmail: "",
    recipientName: "",
    senderName: "",
    senderEmail: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<"select" | "success">("select")
  const [result, setResult] = useState<{ code: string; amount: number } | null>(null)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/store/gift-card/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to purchase gift card")
      setResult({ code: data.code, amount: data.amount })
      setStep("success")
      toast.success("Gift card created successfully!")
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || "Failed to purchase gift card")
    } finally {
      setLoading(false)
    }
  }

  if (step === "success" && result) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-[#FFF0F3] rounded-full flex items-center justify-center mx-auto mb-6 text-[#FF758F]">
          <Check className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-heading font-black text-[#1E3E5B] mb-2">Gift Card Sent! 🎁</h1>
        <p className="text-[#6C7A89] text-sm mb-6">
          We&apos;ve sent the gift card and redemption instructions to <strong>{form.recipientEmail}</strong>.
        </p>
        <div className="bg-[#FAF9F5] border border-[#EDE8DF] rounded-3xl p-8 mb-8">
          <p className="text-xs uppercase tracking-widest text-[#6C7A89] mb-2 font-bold">Gift Card Code</p>
          <p className="font-mono text-2xl font-black tracking-widest text-[#1E3E5B]">{result.code}</p>
          <p className="text-[#4A8DB7] text-xl font-extrabold mt-3 font-mono">৳{result.amount.toLocaleString()}</p>
        </div>
        <button
          onClick={() => { setStep("select"); setForm({ recipientEmail:"", recipientName:"", senderName:"", senderEmail:"", message:"" }); setResult(null) }}
          className="px-6 py-3 border border-[#EDE8DF] bg-white rounded-2xl text-xs font-bold text-[#1E3E5B] hover:bg-[#FAF9F5] transition-colors"
        >
          Send Another Gift Card
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-12 space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#FFF0F3] rounded-2xl mb-2">
          <Gift className="w-7 h-7 text-[#FF758F]" />
        </div>
        <h1 className="text-4xl font-heading font-black text-[#1E3E5B]">Mini Bunny Gift Cards</h1>
        <p className="text-[#6C7A89] text-sm max-w-md mx-auto">
          Give the gift of choice for new parents and growing little ones. Delivered instantly by email and valid for one year.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {/* Left — preview card */}
        <div className="flex flex-col gap-6">
          <div className="relative bg-gradient-to-br from-[#1E3E5B] to-[#2B567E] rounded-3xl p-8 overflow-hidden aspect-[1.6/1] flex flex-col justify-between shadow-xl text-white">
            {/* Decorative glows */}
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-[#4A8DB7]/30 blur-2xl" />
            <div className="absolute -right-4 -bottom-12 w-56 h-56 rounded-full bg-[#FF758F]/20 blur-2xl" />
            <div className="relative">
              <p className="text-white font-black text-xl tracking-[0.2em] uppercase font-heading">Mini Bunny</p>
              <p className="text-white/60 text-[11px] mt-1 tracking-widest font-bold">BABY BOUTIQUE GIFT CARD</p>
            </div>
            <div className="relative flex items-end justify-between">
              <div>
                <p className="text-white/60 text-[11px] font-bold uppercase tracking-wider mb-1">Value</p>
                <p className="text-white text-3xl sm:text-4xl font-black font-mono">৳{amount.toLocaleString()}</p>
              </div>
              {form.recipientName && (
                <div className="text-right">
                  <p className="text-white/60 text-[11px] font-bold uppercase tracking-wider mb-1">For</p>
                  <p className="text-white font-bold text-sm truncate max-w-[140px]">{form.recipientName}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#FAF9F5] border border-[#EDE8DF] rounded-3xl p-5 text-xs text-[#6C7A89] space-y-2">
            <p className="font-bold text-[#1E3E5B]">How it works</p>
            <ul className="space-y-1.5 list-none">
              {["Choose a denomination below", "Fill in the recipient's details", "They receive the code by email instantly", "They enter the code at checkout to redeem"].map((t, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#F0F7FB] text-[#4A8DB7] font-bold flex items-center justify-center shrink-0 text-[10px]">{i+1}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right — form */}
        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-3xl border border-[#EDE8DF] shadow-xs">
          {/* Amount picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1E3E5B] mb-2">Select Amount</label>
            <div className="grid grid-cols-3 gap-2">
              {DENOMINATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setAmount(d)}
                  className={`py-3 rounded-2xl border font-mono font-bold text-sm transition-all ${
                    amount === d
                      ? "border-[#4A8DB7] bg-[#4A8DB7] text-white shadow-sm"
                      : "border-[#EDE8DF] bg-[#FAF9F5] text-[#1E3E5B] hover:border-[#4A8DB7]"
                  }`}
                >
                  ৳{d >= 1000 ? `${d/1000}k` : d}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#1E3E5B] flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#4A8DB7]" /> Recipient</p>
            <input
              required
              type="email"
              placeholder="recipient@email.com"
              value={form.recipientEmail}
              onChange={set("recipientEmail")}
              className="w-full border border-[#EDE8DF] rounded-2xl px-4 py-2.5 text-xs text-[#1E3E5B] focus:outline-none focus:border-[#4A8DB7]"
            />
            <input
              type="text"
              placeholder="Recipient's baby name or parent name"
              value={form.recipientName}
              onChange={set("recipientName")}
              className="w-full border border-[#EDE8DF] rounded-2xl px-4 py-2.5 text-xs text-[#1E3E5B] focus:outline-none focus:border-[#4A8DB7]"
            />
          </div>

          {/* Sender */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#1E3E5B] flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-[#FF758F]" /> From</p>
            <input
              type="text"
              placeholder="Your name"
              value={form.senderName}
              onChange={set("senderName")}
              className="w-full border border-[#EDE8DF] rounded-2xl px-4 py-2.5 text-xs text-[#1E3E5B] focus:outline-none focus:border-[#4A8DB7]"
            />
            <input
              type="email"
              placeholder="your@email.com (get confirmation)"
              value={form.senderEmail}
              onChange={set("senderEmail")}
              className="w-full border border-[#EDE8DF] rounded-2xl px-4 py-2.5 text-xs text-[#1E3E5B] focus:outline-none focus:border-[#4A8DB7]"
            />
          </div>

          {/* Message */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#1E3E5B] flex items-center gap-1.5 mb-1.5"><MessageSquare className="w-3.5 h-3.5 text-[#4A8DB7]" /> Greeting Note</p>
            <textarea
              rows={2}
              placeholder="Congratulations on your little bundle of joy! 💕"
              value={form.message}
              onChange={set("message")}
              className="w-full border border-[#EDE8DF] rounded-2xl px-4 py-2.5 text-xs text-[#1E3E5B] resize-none focus:outline-none focus:border-[#4A8DB7]"
            />
          </div>

          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#4A8DB7] hover:bg-[#3d779c] text-white rounded-2xl font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition-all shadow-md shadow-[#4A8DB7]/20 flex items-center justify-center gap-2"
          >
            <Gift className="w-4 h-4" />
            <span>{loading ? "Sending Gift Card…" : `Send ৳${amount.toLocaleString()} Gift Card`}</span>
          </button>

          <p className="text-center text-[11px] text-[#6C7A89]">
            Gift cards are delivered instantly and valid for 1 year across all products.
          </p>
        </form>
      </div>
    </div>
  )
}
