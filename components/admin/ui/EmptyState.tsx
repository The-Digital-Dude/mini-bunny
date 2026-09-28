import React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white border border-dashed border-slate-300 shadow-xs",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 mb-4">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="font-heading text-base font-bold text-slate-900 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-5">
          {description}
        </p>
      )}
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  )
}
