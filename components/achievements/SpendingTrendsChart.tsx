'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { SpendingTrend } from '@/lib/financial-stats'

interface SpendingTrendsChartProps {
  data: SpendingTrend[]
}

export function SpendingTrendsChart({ data }: SpendingTrendsChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">
          No purchase history yet. Start adding items to see your spending trends.
        </p>
      </div>
    )
  }

  // Format month labels (e.g., "Jan 2025")
  const formattedData = data.map((item) => ({
    ...item,
    month: new Date(item.date + '-01').toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    }),
  }))

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          stroke="#94A3B8"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#94A3B8"
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
          }}
        />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#FFC700"
          strokeWidth={3}
          dot={{ fill: '#FFC700', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
