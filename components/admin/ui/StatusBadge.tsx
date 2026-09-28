import React from "react"
import { cn } from "@/lib/utils"

export type StatusType =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED"
  | "PAID"
  | "UNPAID"
  | "REFUNDED"
  | "ACTIVE"
  | "INACTIVE"
  | "DRAFT"
  | "OUT_OF_STOCK"
  | "LOW_STOCK"
  | "IN_STOCK"
  | string

interface StatusBadgeProps {
  status: StatusType
  label?: string
  className?: string
  dot?: boolean
  size?: "sm" | "md" | "lg"
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  // Orders / General
  PENDING: {
    label: "Pending",
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
  },
  CONFIRMED: {
    label: "Confirmed",
    bg: "bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-400",
    border: "border-sky-500/20",
    dot: "bg-sky-500",
  },
  PROCESSING: {
    label: "Processing",
    bg: "bg-purple-500/10",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-500/20",
    dot: "bg-purple-500",
  },
  SHIPPED: {
    label: "Shipped",
    bg: "bg-indigo-500/10",
    text: "text-indigo-700 dark:text-indigo-400",
    border: "border-indigo-500/20",
    dot: "bg-indigo-500",
  },
  DELIVERED: {
    label: "Delivered",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-500/20",
    dot: "bg-rose-500",
  },
  RETURNED: {
    label: "Returned",
    bg: "bg-orange-500/10",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-500/20",
    dot: "bg-orange-500",
  },

  // Payment / Financial
  PAID: {
    label: "Paid",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  UNPAID: {
    label: "Unpaid",
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
  },
  REFUNDED: {
    label: "Refunded",
    bg: "bg-slate-500/10",
    text: "text-slate-700 dark:text-slate-400",
    border: "border-slate-500/20",
    dot: "bg-slate-400",
  },

  // Product / Inventory
  ACTIVE: {
    label: "Active",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  INACTIVE: {
    label: "Inactive",
    bg: "bg-slate-500/10",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-500/20",
    dot: "bg-slate-400",
  },
  DRAFT: {
    label: "Draft",
    bg: "bg-zinc-500/10",
    text: "text-zinc-600 dark:text-zinc-400",
    border: "border-zinc-500/20",
    dot: "bg-zinc-400",
  },
  IN_STOCK: {
    label: "In Stock",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  LOW_STOCK: {
    label: "Low Stock",
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-500 animate-pulse",
  },
  OUT_OF_STOCK: {
    label: "Out of Stock",
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-500/20",
    dot: "bg-rose-500",
  },
}

export function StatusBadge({
  status,
  label,
  className,
  dot = true,
  size = "md",
}: StatusBadgeProps) {
  const normalized = (status || "").toUpperCase()
  const config = statusConfig[normalized] || {
    label: label || status || "Unknown",
    bg: "bg-slate-500/10",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-500/20",
    dot: "bg-slate-400",
  }

  const displayLabel = label || config.label

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  }

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-1.5 h-1.5",
    lg: "w-2 h-2",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full border shadow-xs transition-colors",
        config.bg,
        config.text,
        config.border,
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn("rounded-full shrink-0", config.dot, dotSizes[size])}
        />
      )}
      <span>{displayLabel}</span>
    </span>
  )
}
