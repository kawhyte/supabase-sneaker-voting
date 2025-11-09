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
import { AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface SpendingTrendsChartProps {
  data: SpendingTrend[]
}

export function SpendingTrendsChart({ data }: SpendingTrendsChartProps) {
  const [hasError, setHasError] = useState(false)

  // Error boundary for chart rendering
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      if (event.message.includes('recharts') || event.message.includes('chart')) {
        console.error('Chart rendering error:', event.message)
        setHasError(true)
        event.preventDefault()
      }
    }
    window.addEventListener('error', errorHandler)
    return () => window.removeEventListener('error', errorHandler)
  }, [])

  // Error state
  if (hasError) {
    return (
      <div className="h-[240px] flex flex-col items-center justify-center bg-muted rounded-lg p-4">
        <AlertCircle className="h-8 w-8 text-amber-500 mb-2" aria-hidden="true" />
        <p className="text-sm text-muted-foreground text-center">
          Unable to display chart. Please refresh the page.
        </p>
      </div>
    )
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center bg-muted rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center max-w-[200px]">
          No purchase history yet. Start adding items to see your spending trends.
        </p>
      </div>
    )
  }

  // Format month labels (e.g., "Jan 25")
  const formattedData = data.map((item) => ({
    ...item,
    month: new Date(item.date + '-01').toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    }),
  }))

  // Calculate Y-axis domain for better scaling
  const amounts = data.map((d) => d.amount)
  const maxAmount = Math.max(...amounts)
  const yAxisMax = Math.ceil(maxAmount * 1.1) // 10% padding

  return (
    <div
      role="img"
      aria-label="Spending over time line chart"
      className="w-full h-[240px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#94A3B8' }}
            stroke="#CBD5E1"
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#94A3B8' }}
            stroke="#CBD5E1"
            tickLine={false}
            tickFormatter={(value) => `$${value}`}
            domain={[0, yAxisMax]}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '12px',
              padding: '8px 12px',
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
    </div>
  )
}
