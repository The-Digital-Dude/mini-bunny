"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { PlusCircle, Copy, Check, AlertCircle, CheckCircle2, XCircle, Clock, ShieldCheck, RefreshCw } from "lucide-react"
import { toast } from "sonner"

type GiftCard = {
  id: string
  code: string
  theme: string
  amount: number
  balance: number
  senderName: string | null
  senderEmail: string | null
  recipientName: string
  recipientEmail: string
  message: string | null
  paymentMethod: string | null
  paymentTrxId: string | null
  paymentStatus: string // PAID | PENDING_VERIFICATION | REJECTED
  isActive: boolean
  expiresAt: string | null
  createdAt: string
  transactions?: Array<{ id: string; amount: number; type: string; createdAt: string; order?: { orderNumber: string } }>
}

const empty = () => ({
  recipientEmail: "",
  recipientName: "",
  senderName: "",
  amount: "",
  message: "",
  expiresAt: "",
  sendEmail: true,
})

export default function GiftCardsClient({ data }: { data: GiftCard[] }) {
  const [cards, setCards] = useState<GiftCard[]>(data)
  const [activeFilter, setActiveFilter] = useState<"pending" | "active" | "all">("pending")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty())
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const pendingCards = cards.filter((c) => c.paymentStatus === "PENDING_VERIFICATION")
  const activeCards = cards.filter((c) => c.isActive && c.paymentStatus === "PAID")

  const filteredCards =
    activeFilter === "pending"
      ? pendingCards
      : activeFilter === "active"
      ? activeCards
      : cards

  async function refreshList() {
    try {
      const res = await fetch("/api/admin/gift-cards")
      if (res.ok) setCards(await res.json())
    } catch {}
  }

  async function handleCreate() {
    if (!form.recipientEmail || !form.amount) {
      toast.error("Recipient email and amount required")
      return
    }
    setSaving(true)
    const res = await fetch("/api/admin/gift-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, paymentStatus: "PAID", isActive: true }),
    })
    setSaving(false)
    if (!res.ok) {
      toast.error("Failed to create gift card")
      return
    }
    toast.success("Gift card created and email sent!")
    setOpen(false)
    setForm(empty())
    refreshList()
  }

  async function verifyPayment(id: string, approve: boolean) {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/gift-cards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: approve ? "PAID" : "REJECTED",
          isActive: approve,
          sendEmail: approve,
        }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      toast.success(approve ? "Payment verified & Gift Card activated!" : "Payment rejected.")
      await refreshList()
    } catch (err: any) {
      toast.error(err.message || "Action failed")
    } finally {
      setActionLoading(null)
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/gift-cards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    })
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, isActive } : c)))
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const totalIssued = cards.filter((c) => c.paymentStatus === "PAID").reduce((s, c) => s + Number(c.amount), 0)
  const totalBalance = cards.filter((c) => c.paymentStatus === "PAID").reduce((s, c) => s + Number(c.balance), 0)

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className={`rounded-2xl p-4 border transition-all ${
          pendingCards.length > 0 ? "bg-amber-50 border-amber-200 ring-2 ring-amber-400/20" : "bg-muted/40 border-border"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wide">
              Pending MFS
            </span>
            {pendingCards.length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <div className="text-2xl font-bold mt-1 text-amber-700">
            {pendingCards.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting TrxID verification</p>
        </div>

        <div className="bg-muted/40 rounded-2xl p-4 border border-border">
          <div className="text-xs text-muted-foreground uppercase font-bold tracking-wide">
            Active Cards
          </div>
          <div className="text-2xl font-bold mt-1 text-[#1E3E5B]">
            {activeCards.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Ready for redemption</p>
        </div>

        <div className="bg-muted/40 rounded-2xl p-4 border border-border">
          <div className="text-xs text-muted-foreground uppercase font-bold tracking-wide">
            Total Value Issued
          </div>
          <div className="text-2xl font-bold mt-1 text-[#1E3E5B] font-mono">
            ৳{totalIssued.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Paid vouchers</p>
        </div>

        <div className="bg-muted/40 rounded-2xl p-4 border border-border">
          <div className="text-xs text-muted-foreground uppercase font-bold tracking-wide">
            Outstanding Balance
          </div>
          <div className="text-2xl font-bold mt-1 text-emerald-700 font-mono">
            ৳{totalBalance.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Unused store balance</p>
        </div>
      </div>

      {/* Toolbar & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveFilter("pending")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === "pending"
                ? "bg-white text-[#1E3E5B] shadow-xs font-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Pending Verification</span>
            {pendingCards.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-black">
                {pendingCards.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("active")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeFilter === "active"
                ? "bg-white text-[#1E3E5B] shadow-xs font-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Active Cards ({activeCards.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeFilter === "all"
                ? "bg-white text-[#1E3E5B] shadow-xs font-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Cards ({cards.length})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" size="sm" onClick={refreshList} className="rounded-xl">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
          <Button onClick={() => setOpen(true)} className="rounded-xl bg-[#1E3E5B] hover:bg-[#152e44]">
            <PlusCircle className="w-4 h-4 mr-1.5" /> Issue Complimentary Card
          </Button>
        </div>
      </div>

      {/* Manual Issue Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Issue Direct Gift Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground">Recipient Email *</label>
              <Input
                value={form.recipientEmail}
                onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
                placeholder="parent@email.com"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Recipient Name</label>
              <Input
                value={form.recipientName}
                onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                placeholder="e.g. Tanzina & Baby Rayan"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">From (Sender Name)</label>
              <Input
                value={form.senderName}
                onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                placeholder="Mini Bunny Boutique"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Amount (BDT ৳) *</label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="1000"
                className="rounded-xl font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Personal Message</label>
              <Input
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Welcome to the Mini Bunny family!"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Expiry Date (Optional)</label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Switch checked={form.sendEmail} onCheckedChange={(v) => setForm({ ...form, sendEmail: v })} />
              <label className="text-xs font-medium">Send voucher email to recipient</label>
            </div>
            <Button
              className="w-full rounded-xl bg-[#1E3E5B] hover:bg-[#152e44] mt-2"
              onClick={handleCreate}
              disabled={saving}
            >
              {saving ? "Creating..." : "Issue & Activate Gift Card"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Table */}
      <div className="rounded-2xl border bg-white overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Code & Theme</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Payment & TrxID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCards.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  {activeFilter === "pending"
                    ? "No pending MFS payments to verify."
                    : "No gift cards found in this view."}
                </TableCell>
              </TableRow>
            )}
            {filteredCards.map((c) => {
              const isPending = c.paymentStatus === "PENDING_VERIFICATION"
              const isRejected = c.paymentStatus === "REJECTED"

              return (
                <TableRow key={c.id} className={isPending ? "bg-amber-50/40" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs font-bold text-[#1E3E5B] bg-muted/60 px-2 py-1 rounded-lg">
                        {c.code}
                      </code>
                      <button
                        onClick={() => copyCode(c.code)}
                        className="text-muted-foreground hover:text-foreground p-1"
                        title="Copy code"
                      >
                        {copied === c.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block mt-0.5">
                      {c.theme || "classic-gold"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="text-xs font-bold text-[#1E3E5B]">{c.recipientName}</div>
                    <div className="text-[11px] text-muted-foreground">{c.recipientEmail}</div>
                    {c.senderName && (
                      <div className="text-[10px] text-muted-foreground italic mt-0.5">
                        from {c.senderName}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="font-mono font-bold text-xs text-[#1E3E5B]">
                    ৳{Number(c.amount).toLocaleString()}
                  </TableCell>

                  <TableCell>
                    <span
                      className={`font-mono font-black text-xs ${
                        Number(c.balance) > 0 ? "text-emerald-600" : "text-muted-foreground"
                      }`}
                    >
                      ৳{Number(c.balance).toLocaleString()}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          c.paymentMethod === "BKASH" ? "bg-[#E2136E]/10 text-[#E2136E]" :
                          c.paymentMethod === "NAGAD" ? "bg-[#F7941D]/10 text-[#F7941D]" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {c.paymentMethod || "MFS"}
                        </span>
                      </div>
                      {c.paymentTrxId ? (
                        <div className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border inline-block">
                          Trx: {c.paymentTrxId}
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">No TrxID</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {isPending ? (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 gap-1 text-[10px]">
                        <Clock className="w-3 h-3" /> Awaiting Verification
                      </Badge>
                    ) : isRejected ? (
                      <Badge variant="destructive" className="text-[10px]">
                        Rejected
                      </Badge>
                    ) : c.isActive ? (
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300 gap-1 text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Active & Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Inactive / Spent
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    {isPending ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => verifyPayment(c.id, true)}
                          disabled={actionLoading === c.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl h-8 px-3"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifyPayment(c.id, false)}
                          disabled={actionLoading === c.id}
                          className="text-rose-600 hover:bg-rose-50 border-rose-200 text-xs rounded-xl h-8 px-2.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={c.isActive}
                          onCheckedChange={(v) => toggleActive(c.id, v)}
                          disabled={isRejected}
                        />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
