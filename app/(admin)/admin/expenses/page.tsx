import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"
import { redirect } from "next/navigation"
import { ExpenseClient } from "./ExpenseClient"

export const dynamic = "force-dynamic"

export default async function ExpensesPage() {
  const { error } = await requireAdmin()
  if (error) redirect("/admin/login")

  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" },
  }).catch(() => [])

  const formatted = expenses.map((e) => ({
    id: e.id,
    category: e.category,
    amount: Number(e.amount),
    date: e.date.toISOString(),
    note: e.note,
  }))

  return <ExpenseClient data={formatted} />
}
