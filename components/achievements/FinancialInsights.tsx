'use client'

import { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'
import { CategorySpendingChart } from './CategorySpendingChart'
import { SpendingTrendsChart } from './SpendingTrendsChart'
import { WardrobeSizeChart } from './WardrobeSizeChart'
import {
  getCategorySpending,
  getSpendingTrends,
  getWardrobeSizeOverTime,
  type TimePeriod,
} from '@/lib/financial-stats'
import { Skeleton } from '@/components/ui/skeleton'

interface FinancialInsightsProps {
  userId: string
}

export function FinancialInsights({ userId }: FinancialInsightsProps) {
  // REMOVED: period state - now fixed to 'year'
  const period: TimePeriod = 'year'

  const [categoryData, setCategoryData] = useState<any[]>([])
  const [trendsData, setTrendsData] = useState<any[]>([])
  const [wardrobeSizeData, setWardrobeSizeData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [categories, trends, wardrobeSize] = await Promise.all([
          getCategorySpending(userId, period),
          getSpendingTrends(userId, period),
          getWardrobeSizeOverTime(userId),
        ])

        setCategoryData(categories)
        setTrendsData(trends)
        setWardrobeSizeData(wardrobeSize)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : JSON.stringify(error)
        console.error('Error loading financial insights:', errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [userId, period])

  return (
    <section className="mb-12 bg-card border border-border rounded-xl p-6 shadow-sm" aria-labelledby="financial-title">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp
          className="h-5 w-5 text-primary"
          aria-hidden="true"
        />
        <h2 id="financial-title" className="text-2xl font-bold text-foreground">
          Financial Insights
        </h2>
        <span className="ml-auto text-sm text-muted-foreground font-medium">
          This Year
        </span>
      </div>

      {/* REMOVED: Time Period Selector (Tabs) */}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Spending by Category */}
          <div className="flex flex-col min-h-[280px] sm:min-h-[300px]">
            <h3 className="text-sm font-medium text-foreground mb-4 text-center">Spending by Category</h3>
            <div className="flex-1 flex items-center justify-center">
              <CategorySpendingChart data={categoryData} />
            </div>
          </div>

          {/* Spending Over Time */}
          <div className="flex flex-col min-h-[280px] sm:min-h-[300px]">
            <h3 className="text-sm font-medium text-foreground mb-4 text-center">Spending Over Time</h3>
            <div className="flex-1 flex items-center justify-center">
              <SpendingTrendsChart data={trendsData} />
            </div>
          </div>

          {/* Wardrobe Growth */}
          <div className="flex flex-col min-h-[280px] sm:min-h-[300px] sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-medium text-foreground mb-4 text-center">Wardrobe Growth</h3>
            <div className="flex-1 flex items-end justify-center pb-4">
              <WardrobeSizeChart data={wardrobeSizeData} />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
