'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface WardrobeSizeChartProps {
  data: Array<{ date: string; count: number }>
}

export function WardrobeSizeChart({ data }: WardrobeSizeChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">
          No wardrobe history yet. Start adding items to see your collection grow over time.
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
      <AreaChart data={formattedData}>
        <defs>
          <linearGradient id="wardrobeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          stroke="#94A3B8"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#94A3B8"
          tickFormatter={(value) => value.toString()}
        />
        <Tooltip
          formatter={(value: number) => [`${value} items`, 'Wardrobe Size']}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#3B82F6"
          strokeWidth={3}
          fill="url(#wardrobeGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
