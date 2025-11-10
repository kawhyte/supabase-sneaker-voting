'use client'

import { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'
import { CategorySpendingChart } from './CategorySpendingChart'
import { WardrobeSizeChart } from './WardrobeSizeChart'
import {
  getCategorySpending,
  getWardrobeSizeOverTime,
  type TimePeriod,
} from '@/lib/financial-stats'
import { TimeRange } from '@/types/TimeRange'
import { Skeleton } from '@/components/ui/skeleton'

interface FinancialInsightsProps {
  userId: string
}

/**
 * Financial Insights Section
 * Displays category spending (pie chart) and wardrobe growth (bar chart)
 * Spending Over Time chart has been removed
 * Wardrobe Growth includes time range toggle
 */
export function FinancialInsights({ userId }: FinancialInsightsProps) {
  const period: TimePeriod = 'year'

  const [categoryData, setCategoryData] = useState<any[]>([])
  const [wardrobeSizeData, setWardrobeSizeData] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange>('12mo')
  const [loading, setLoading] = useState(true)
  const [loadingWardrobeSize, setLoadingWardrobeSize] = useState(false)

  // Load category spending data (once on mount)
  useEffect(() => {
    async function loadCategoryData() {
      try {
        const categories = await getCategorySpending(userId, period)
        setCategoryData(categories)
      } catch (error) {
        console.error('Failed to load category spending:', error)
        setCategoryData([])
      } finally {
        setLoading(false)
      }
    }

    loadCategoryData()
  }, [userId, period])

  // Load wardrobe size data (with time range dependency)
  useEffect(() => {
    async function loadWardrobeSizeData() {
      setLoadingWardrobeSize(true)
      try {
        const wardrobeSize = await getWardrobeSizeOverTime(userId, timeRange)
        setWardrobeSizeData(wardrobeSize)
      } catch (error) {
        console.error('Failed to load wardrobe size:', error)
        setWardrobeSizeData([])
      } finally {
        setLoadingWardrobeSize(false)
      }
    }

    loadWardrobeSizeData()
  }, [userId, timeRange])

  return (
    <section className="w-full bg-card border border-border rounded-xl p-6 shadow-sm" aria-labelledby="financial-title">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp
            className="h-5 w-5 text-primary"
            aria-hidden="true"
          />
          <h3 id="financial-title" className="text-2xl font-bold">
            Financial Insights
          </h3>
        </div>
        {/* <p className="text-sm text-muted-foreground mt-1">This Year</p> */}
      </div>

      {/* Charts Grid: 2 charts instead of 3 */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg sm:col-span-2 lg:col-span-2" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Category Spending: 1 column on all sizes */}
          <div className="sm:col-span-1 lg:col-span-1">
            <CategorySpendingChart data={categoryData} />
          </div>

          {/* Wardrobe Growth: Spans 2 columns on lg, full width on sm/mobile */}
          <div className="sm:col-span-2 lg:col-span-2">
            <WardrobeSizeChart
              data={wardrobeSizeData}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              isLoading={loadingWardrobeSize}
            />
          </div>
        </div>
      )}
    </section>
  )
}
