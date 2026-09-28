"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Receipt, Plus, Search, Filter, Trash2, Edit2,
  DollarSign, TrendingUp, Tag, Calendar, AlertCircle,
  Sparkles, Layers
} from "lucide-react"
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader"
import { StatCard } from "@/components/admin/ui/StatCard"
import { AdminCard } from "@/components/admin/ui/AdminCard"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const CATEGORIES = [
  { id: "Marketing & Ads", label: "Marketing & Ads (Meta/Google)", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "Packaging", label: "Packaging & Poly Bags", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "Delivery", label: "Courier & Shipping Fees", color: "bg-sky-50 text-sky-700 border-sky-200" },
  { id: "Supplier Restock", label: "Supplier / Restock", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "Rent & Utilities", label: "Rent & Utilities", color: "bg-rose-50 text-rose-700 border-rose-200" },
  { id: "Salaries", label: "Salaries & Wages", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { id: "Software & Tech", label: "Software & Hosting", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { id: "Other", label: "Other Operational Costs", color: "bg-slate-50 text-slate-700 border-slate-200" },
]

type Expense = {
  id: string
  category: string
  amount: number
  date: string
  note: string | null
}

function fmt(n: number) {
  return `৳${Math.round(n || 0).toLocaleString()}`
}

export function ExpenseClient({ data }: { data: Expense[] }) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("Marketing & Ads")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Filters
  const [filterCategory, setFilterCategory] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  const total = data.reduce((s, e) => s + e.amount, 0)
  
  // This month's expenses
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthExpenses = data
    .filter(e => {
      const d = new Date(e.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .reduce((s, e) => s + e.amount, 0)

  // Top category
  const categoryTotals: Record<string, number> = {}
  data.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount
  })
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

  // Filtered expenses
  const filtered = data.filter(e => {
    const matchesCategory = filterCategory === "ALL" || e.category.toLowerCase().includes(filterCategory.toLowerCase())
    const matchesSearch = !searchQuery || 
      (e.note && e.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  function openCreate() {
    setEditing(null)
    setSelectedCategory("Marketing & Ads")
    setAmount("")
    setDate(new Date().toISOString().slice(0, 10))
    setNote("")
    setIsDialogOpen(true)
  }

  function openEdit(e: Expense) {
    setEditing(e)
    setSelectedCategory(e.category)
    setAmount(String(e.amount))
    setDate(e.date.slice(0, 10))
    setNote(e.note || "")
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const url = editing ? `/api/admin/expenses/${editing.id}` : "/api/admin/expenses"
      const method = editing ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedCategory, amount: parseFloat(amount), date, note }),
      })
      if (res.ok) {
        toast.success(editing ? "Expense entry updated" : "New expense logged successfully")
        setIsDialogOpen(false)
        router.refresh()
      } else {
        const d = await res.json()
        toast.error(d.error || "Failed to save expense")
      }
    } catch {
      toast.error("Error saving expense")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this expense entry?")) return
    try {
      const res = await fetch(`/api/admin/expenses/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Expense deleted successfully")
        router.refresh()
      } else {
        toast.error("Failed to delete expense")
      }
    } catch {
      toast.error("Error deleting expense")
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Expense Management"
        description="Track operational overhead, advertising spend, packaging, courier expenses, and supplier payouts"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Analytics", href: "/admin/analytics" },
          { label: "Expenses" },
        ]}
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Log New Expense
          </button>
        }
      />

      {/* ── KPI Stat Cards ────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Recorded Expenses"
          value={fmt(total)}
          sub="All-time cumulative burn"
          trend={{ value: `${data.length} entries`, positive: true }}
          icon={Receipt}
          color="amber"
        />
        <StatCard
          title="This Month's Overhead"
          value={fmt(thisMonthExpenses)}
          sub="Current billing cycle spend"
          trend={{ value: "Operating costs", positive: false }}
          icon={TrendingUp}
          color="rose"
        />
        <StatCard
          title="Top Expense Category"
          value={topCategory ? topCategory[0] : "None"}
          sub={topCategory ? `${fmt(topCategory[1])} total spend` : "No records"}
          trend={{ value: "Highest outlay", positive: false }}
          icon={Tag}
          color="violet"
        />
        <StatCard
          title="Average Entry Size"
          value={data.length > 0 ? fmt(total / data.length) : "৳0"}
          sub={`${data.length} total entries`}
          trend={{ value: "Per transaction", positive: true }}
          icon={DollarSign}
          color="sky"
        />
      </div>

      {/* ── Filter Bar & Search ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {["ALL", "Marketing", "Packaging", "Delivery", "Supplier", "Rent", "Salaries", "Software", "Other"].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                filterCategory === cat
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
              }`}
            >
              {cat === "ALL" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
          />
        </div>
      </div>

      {/* ── Expenses Table ────────────────────────────────────────────────── */}
      <AdminCard
        title="Expense Ledger"
        description={`Displaying ${filtered.length} of ${data.length} recorded expenses`}
        actions={
          <span className="text-xs font-bold font-mono text-slate-900">
            Filtered Total: {fmt(filtered.reduce((s, e) => s + e.amount, 0))}
          </span>
        }
      >
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-600">No expenses found</p>
            <p className="mt-0.5">Try clearing your search or category filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Description / Note</th>
                  <th className="py-2.5 px-3 text-right">Amount (৳)</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((e) => {
                  const catConfig = CATEGORIES.find(c => c.id === e.category || c.label.includes(e.category))
                  return (
                    <tr key={e.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {new Date(e.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-md text-[11px] border ${catConfig?.color || "bg-slate-50 text-slate-700 border-slate-200"}`}>
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {e.note || <span className="text-slate-300 italic">No notes added</span>}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {fmt(e.amount)}
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => openEdit(e)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="p-1 rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-50 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* ── Add / Edit Expense Dialog ─────────────────────────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              {editing ? "Edit Expense Entry" : "Log New Operational Expense"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Expense Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Amount (৳)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Expense Date</label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Description / Reference Note</label>
              <input
                type="text"
                placeholder="e.g. Facebook campaign for Winter Onesies / Receipt #8492"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition shadow-sm disabled:opacity-50"
              >
                {submitting ? "Saving..." : editing ? "Update Expense" : "Save Expense"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
