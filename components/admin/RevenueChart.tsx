"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface RevenueData {
  name: string
  total: number
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-700/80 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-md">
        <p className="text-[11px] font-medium text-slate-400">{label}</p>
        <p className="text-sm font-bold text-sky-400 mt-0.5">
          ৳{Number(payload[0].value || 0).toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

export default function RevenueChart({ data }: { data: RevenueData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[280px] flex items-center justify-center text-xs text-slate-400">
        No sales data recorded this week
      </div>
    )
  }

  return (
    <div className="w-full h-[280px] sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity={1} />
              <stop offset="100%" stopColor="#2563EB" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            stroke="#94A3B8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `৳${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(226, 232, 240, 0.4)", radius: 8 }} />
          <Bar
            dataKey="total"
            fill="url(#revenueBarGradient)"
            radius={[6, 6, 0, 0]}
            maxBarSize={45}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
