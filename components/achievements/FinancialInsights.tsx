'use client'

import { useState, useEffect } from 'react'
import { CategorySpendingChart } from './CategorySpendingChart'
import { SpendingTrendsChart } from './SpendingTrendsChart'
import { WardrobeSizeChart } from './WardrobeSizeChart'
import { TotalSaved } from './TotalSaved'
import {
  getCategorySpending,
  getSpendingTrends,
  getWardrobeSizeOverTime,
  getTotalSaved,
  type TimePeriod,
} from '@/lib/financial-stats'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

interface FinancialInsightsProps {
  userId: string
}

export function FinancialInsights({ userId }: FinancialInsightsProps) {
  const [period, setPeriod] = useState<TimePeriod>('year')
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [trendsData, setTrendsData] = useState<any[]>([])
  const [wardrobeSizeData, setWardrobeSizeData] = useState<any[]>([])
  const [totalSaved, setTotalSaved] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [categories, trends, wardrobeSize, saved] = await Promise.all([
          getCategorySpending(userId, period),
          getSpendingTrends(userId, period),
          getWardrobeSizeOverTime(userId),
          getTotalSaved(userId),
        ])

        setCategoryData(categories)
        setTrendsData(trends)
        setWardrobeSizeData(wardrobeSize)
        setTotalSaved(saved)
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
    <section className="mb-12" aria-labelledby="financial-title">
      <h2 id="financial-title" className="text-2xl font-bold text-foreground mb-6">
        Financial Insights 💰
      </h2>

      {/* Time Period Selector */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as TimePeriod)} className="mb-6">
        <TabsList>
          <TabsTrigger value="month">Last Month</TabsTrigger>
          <TabsTrigger value="quarter">Last Quarter</TabsTrigger>
          <TabsTrigger value="year">Last Year</TabsTrigger>
          <TabsTrigger value="all">All Time</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-96 rounded-lg" />
          <Skeleton className="h-96 rounded-lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Spending */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
            <CategorySpendingChart data={categoryData} />
          </div>

          {/* Spending Trends */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Spending Over Time</h3>
            <SpendingTrendsChart data={trendsData} />
          </div>

          {/* Wardrobe Size Over Time */}
          <div className="bg-card border border-border rounded-lg p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Wardrobe Growth</h3>
            <WardrobeSizeChart data={wardrobeSizeData} />
          </div>

          {/* Total Saved */}
          <div className="lg:col-span-2">
            <TotalSaved amount={totalSaved} />
          </div>
        </div>
      )}
    </section>
  )
}
