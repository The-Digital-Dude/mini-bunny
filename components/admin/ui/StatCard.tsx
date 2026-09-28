import React from "react"
import Link from "next/link"
import { LucideIcon, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StatCardProps {
  title: string
  value: string | number
  sub?: string
  trend?: {
    value: number | string
    positive?: boolean
    label?: string
  }
  icon: LucideIcon
  color?: "amber" | "sky" | "indigo" | "violet" | "emerald" | "rose" | "slate"
  href?: string
  className?: string
}

const colorStyles = {
  amber: {
    bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20",
    gradient: "from-amber-500/5 to-transparent",
    accent: "bg-amber-500",
  },
  sky: {
    bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-sky-500/20",
    gradient: "from-sky-500/5 to-transparent",
    accent: "bg-sky-500",
  },
  indigo: {
    bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-indigo-500/20",
    gradient: "from-indigo-500/5 to-transparent",
    accent: "bg-indigo-500",
  },
  violet: {
    bg: "bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-violet-500/20",
    gradient: "from-violet-500/5 to-transparent",
    accent: "bg-violet-500",
  },
  emerald: {
    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
    gradient: "from-emerald-500/5 to-transparent",
    accent: "bg-emerald-500",
  },
  rose: {
    bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20",
    gradient: "from-rose-500/5 to-transparent",
    accent: "bg-rose-500",
  },
  slate: {
    bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 ring-slate-500/20",
    gradient: "from-slate-500/5 to-transparent",
    accent: "bg-slate-500",
  },
}

export function StatCard({
  title,
  value,
  sub,
  trend,
  icon: Icon,
  color = "amber",
  href,
  className,
}: StatCardProps) {
  const theme = colorStyles[color] || colorStyles.amber

  const innerContent = (
    <>
      {/* Background ambient gradient */}
      <div
        className={cn(
          "absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-bl blur-2xl opacity-70 pointer-events-none transition-opacity duration-300 group-hover:opacity-100",
          theme.gradient
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
              {value}
            </span>
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-semibold rounded-full px-2 py-0.5 border",
                  trend.positive !== false
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                    : "bg-rose-50 text-rose-700 border-rose-200/70"
                )}
              >
                {trend.positive !== false ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trend.value}
              </span>
            )}
          </div>
          {sub && (
            <span className="mt-1 text-xs font-medium text-slate-500 line-clamp-1">
              {sub}
            </span>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 shadow-xs transition-transform duration-200 group-hover:scale-105",
              theme.bg
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          {href && (
            <ArrowUpRight className="h-4 w-4 text-slate-300 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-slate-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          )}
        </div>
      </div>
    </>
  )

  const cardClasses = cn(
    "group relative overflow-hidden rounded-2xl bg-white p-5.5 border border-slate-200/80 shadow-xs transition-all duration-200 hover:shadow-md hover:border-slate-300",
    href && "cursor-pointer",
    className
  )

  if (href) {
    return (
      <Link href={href} className={cardClasses}>
        {innerContent}
      </Link>
    )
  }

  return <div className={cardClasses}>{innerContent}</div>
}
