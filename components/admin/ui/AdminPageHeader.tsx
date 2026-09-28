import React from "react"
import Link from "next/link"
import { ChevronRight, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface AdminPageHeaderProps {
  title: string
  description?: string
  badge?: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
  backHref?: string
  actions?: React.ReactNode
  className?: string
}

export function AdminPageHeader({
  title,
  description,
  badge,
  breadcrumbs,
  backHref,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:gap-4 mb-6", className)}>
      {/* Breadcrumbs or Back button */}
      {(breadcrumbs && breadcrumbs.length > 0) || backHref ? (
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors mr-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Link>
          )}

          {breadcrumbs &&
            breadcrumbs.map((bc, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                )}
                {bc.href ? (
                  <Link
                    href={bc.href}
                    className="hover:text-slate-900 transition-colors truncate"
                  >
                    {bc.label}
                  </Link>
                ) : (
                  <span className="text-slate-900 font-semibold truncate">
                    {bc.label}
                  </span>
                )}
              </React.Fragment>
            ))}
        </div>
      ) : null}

      {/* Main Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
