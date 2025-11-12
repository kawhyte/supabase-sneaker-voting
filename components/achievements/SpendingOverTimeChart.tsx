'use client'

import { useMemo } from 'react'
import { SpendingTrend } from '@/lib/financial-stats'

interface SpendingOverTimeChartProps {
  data: SpendingTrend[]
}

export function SpendingOverTimeChart({ data }: SpendingOverTimeChartProps) {
  const { maxAmount, points } = useMemo(() => {
    if (data.length === 0) return { maxAmount: 0, points: '' }

    const amounts = data.map((d) => d.amount)
    const maxAmount = Math.max(...amounts, 1)

    // Generate SVG path points (area chart)
    const points = data
      .map((point, i) => {
        const x = (i / (data.length - 1 || 1)) * 100
        const y = 100 - (point.amount / maxAmount) * 100
        return `${x},${y}`
      })
      .join(' ')

    return { maxAmount, points }
  }, [data])

  if (data.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">
          Spending Over Time
        </p>
        <div className="flex items-center justify-center h-[148px] bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">No spending data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">
        Spending Over Time
      </p>
      <div className="flex flex-col justify-end flex-1">
        <svg
          fill="none"
          height="148"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary"
        >
          {/* Area fill */}
          <defs>
            <linearGradient id="spending-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points={`0,100 ${points} 100,100`}
            fill="url(#spending-gradient)"
          />
          {/* Line stroke */}
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
