'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface WardrobeSizeChartProps {
  data: Array<{ date: string; count: number }>
}

export function WardrobeSizeChart({ data }: WardrobeSizeChartProps) {
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
          No wardrobe history yet. Start adding items to see your collection grow over time.
        </p>
      </div>
    )
  }

  // Format month labels (e.g., "Jan")
  const formattedData = data.map((item) => ({
    ...item,
    month: new Date(item.date + '-01').toLocaleDateString('en-US', {
      month: 'short',
    }),
  }))

  // Color latest month differently (green)
  const latestIndex = formattedData.length - 1

  return (
    <div
      role="img"
      aria-label="Wardrobe growth bar chart"
      className="w-full h-[240px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
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
            tickFormatter={(value) => value.toString()}
          />
          <Tooltip
            formatter={(value: number) => [`${value} items`, 'Wardrobe Size']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '12px',
              padding: '8px 12px',
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {formattedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === latestIndex ? '#10b981' : '#d1d5db'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
