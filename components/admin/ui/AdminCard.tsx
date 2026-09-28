import React from "react"
import { cn } from "@/lib/utils"

export interface AdminCardProps {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
  noPadding?: boolean
}

export function AdminCard({
  title,
  description,
  action,
  actions,
  children,
  className,
  contentClassName,
  noPadding = false,
}: AdminCardProps) {
  const actionSlot = actions ?? action

  return (
    <div
      className={cn(
        "rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden",
        className
      )}
    >
      {(title || description || actionSlot) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            {title && (
              <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
          {actionSlot && <div className="flex items-center gap-2">{actionSlot}</div>}
        </div>
      )}
      <div className={cn(!noPadding && "p-5 sm:p-6", contentClassName)}>
        {children}
      </div>
    </div>
  )
}
