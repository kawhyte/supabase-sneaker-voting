'use client'

import { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'
import { CategorySpendingChart } from './CategorySpendingChart'
import { WardrobeSizeChart } from './WardrobeSizeChart'
import { SpendingOverTimeChart } from './SpendingOverTimeChart'
import { AverageCPWByCategoryChart } from './AverageCPWByCategoryChart'
import { ROIProgressDashboard } from './ROIProgressDashboard'
import {
  getCategorySpending,
  getWardrobeSizeOverTime,
  getSpendingTrends,
  getAverageCPWByCategory,
  getROIProgressData,
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
  const [spendingData, setSpendingData] = useState<any[]>([])
  const [cpwData, setCpwData] = useState<any[]>([])
  const [roiData, setRoiData] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange>('12mo')
  const [loading, setLoading] = useState(true)
  const [loadingWardrobeSize, setLoadingWardrobeSize] = useState(false)

  // Load all chart data (once on mount)
  useEffect(() => {
    async function loadAllData() {
      try {
        const [categories, spending, cpw, roi] = await Promise.all([
          getCategorySpending(userId, period),
          getSpendingTrends(userId, period),
          getAverageCPWByCategory(userId),
          getROIProgressData(userId),
        ])

        setCategoryData(categories)
        setSpendingData(spending)
        setCpwData(cpw)
        setRoiData(roi)
      } catch (error) {
        console.error('Failed to load financial data:', error)
        setCategoryData([])
        setSpendingData([])
        setCpwData([])
        setRoiData([])
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
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

      {/* Charts Grid: 5 charts responsive layout */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg md:col-span-2" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Row 1: 3 charts */}
          {/* Category Spending (pie chart) */}
          <div>
            <CategorySpendingChart data={categoryData} />
          </div>

          {/* Spending Over Time (area/line chart) */}
          <div>
            <SpendingOverTimeChart data={spendingData} />
          </div>

          {/* Wardrobe Growth (bar chart with time range toggle) */}
          <div>
            <WardrobeSizeChart
              data={wardrobeSizeData}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              isLoading={loadingWardrobeSize}
            />
          </div>

          {/* Row 2: 2 charts */}
          {/* Average CPW by Category (horizontal bars) - spans 2 columns on md */}
          <div className="md:col-span-2">
            <AverageCPWByCategoryChart data={cpwData} />
          </div>

          {/* ROI Progress Dashboard (progress bars) */}
          <div>
            <ROIProgressDashboard data={roiData} />
          </div>
        </div>
      )}
    </section>
  )
}
