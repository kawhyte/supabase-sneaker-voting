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
import { TimeRangeToggle } from '@/components/shared/TimeRangeToggle'
import { TimeRange } from '@/types/TimeRange'
import { Skeleton } from '@/components/ui/skeleton'

interface WardrobeSizeChartProps {
  data: Array<{ month: string; count: number }>
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
  isLoading?: boolean
}

/**
 * Wardrobe Growth Chart
 * Shows cumulative wardrobe growth over time
 * Includes time range toggle (6mo/12mo/All)
 * Latest month highlighted in green, previous months in gray
 */
export function WardrobeSizeChart({
  data,
  timeRange,
  onTimeRangeChange,
  isLoading = false,
}: WardrobeSizeChartProps) {
  const [hasError, setHasError] = useState(false)
  const [chartKey, setChartKey] = useState(0)

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

  // Force chart re-render when data changes
  useEffect(() => {
    setChartKey((prev) => prev + 1)
  }, [data])

  const hasData = data && data.length > 0

  // Get colors for bars (latest green, others gray)
  const lastMonthIndex = data.length - 1
  const colors = data.map((_, index) => {
    return index === lastMonthIndex ? '#10b981' : '#d1d5db' // green for latest, gray for others
  })

  // Error state
  if (hasError) {
    return (
      <div className="w-full bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Wardrobe Growth</h3>
          <TimeRangeToggle
            value={timeRange}
            onChange={onTimeRangeChange}
            disabled={isLoading}
            isLoading={isLoading}
          />
        </div>
        <div className="h-60 flex flex-col items-center justify-center">
          <AlertCircle className="h-8 w-8 text-amber-500 mb-2" aria-hidden="true" />
          <p className="text-sm text-muted-foreground text-center">
            Unable to display chart. Please refresh the page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-card rounded-lg border border-border p-6">
      {/* Header with Time Toggle */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Wardrobe Growth</h3>
        <TimeRangeToggle
          value={timeRange}
          onChange={onTimeRangeChange}
          disabled={isLoading}
          isLoading={isLoading}
        />
      </div>

      {/* Chart or Skeleton */}
      <div className="w-full h-60">
        {isLoading ? (
          <Skeleton className="w-full h-full rounded-md" />
        ) : hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              key={chartKey}
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
                formatter={(value) => [value, 'Items']}
              />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                fill="#d1d5db"
              >
                {/* Color each bar individually */}
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-sm">No wardrobe growth data for this period</p>
          </div>
        )}
      </div>

      {/* Loading indicator below chart */}
      {isLoading && (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Updating data...
        </p>
      )}
    </div>
  )
}
