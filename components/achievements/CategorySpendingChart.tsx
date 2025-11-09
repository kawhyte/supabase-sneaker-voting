'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { CategorySpending } from '@/lib/financial-stats'
import { AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface CategorySpendingChartProps {
  data: CategorySpending[]
}

export function CategorySpendingChart({ data }: CategorySpendingChartProps) {
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
          No purchase data yet. Add items with prices to see your spending breakdown.
        </p>
      </div>
    )
  }

  const total = data.reduce((sum, cat) => sum + cat.amount, 0)

  // Fallback colors if category colors missing
  const FALLBACK_COLORS = [
    '#10b981', // green
    '#3b82f6', // blue
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
  ]

  return (
    <div
      className="relative w-full h-[240px]"
      role="img"
      aria-label={`Spending by category pie chart. Total spent: $${total.toLocaleString()}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="amount"
            nameKey="category"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
              />
            ))}
          </Pie>
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
        </PieChart>
      </ResponsiveContainer>

      {/* Center Total - Absolute positioned */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        aria-live="polite"
      >
        <div className="text-2xl font-bold text-foreground">
          ${total.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          This Year
        </div>
      </div>
    </div>
  )
}
