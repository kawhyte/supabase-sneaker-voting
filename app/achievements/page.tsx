'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { HeroSection } from '@/components/achievements/HeroSection'
import { CoreStatsGrid } from '@/components/achievements/CoreStatsGrid'
import { TopWornList } from '@/components/achievements/TopWornList'
import { LeastWornList } from '@/components/achievements/LeastWornList'
import { FinancialInsights } from '@/components/achievements/FinancialInsights'
import { AchievementsGallery } from '@/components/achievements/AchievementsGallery'
import { FunFactsSection } from '@/components/achievements/FunFactsSection'
import {
  getWardrobeStats,
  getTopWornItems,
  getLeastWornItems,
  type WardrobeStats,
  type TopWornItem,
  type LeastWornItem,
} from '@/lib/achievements-stats'
import { Skeleton } from '@/components/ui/skeleton'
import analytics, { AnalyticsEvent } from '@/lib/analytics'

export default function AchievementsPage() {
  const [stats, setStats] = useState<WardrobeStats | null>(null)
  const [topWorn, setTopWorn] = useState<TopWornItem[]>([])
  const [leastWorn, setLeastWorn] = useState<LeastWornItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError('Please log in to view your achievements')
          return
        }

        setUserId(user.id)

        // Track page view
        analytics.track(AnalyticsEvent.DASHBOARD_VIEWED, {
          userId: user.id,
          page: 'achievements',
        })

        // Fetch all stats in parallel
        const [statsData, topWornData, leastWornData] = await Promise.all([
          getWardrobeStats(user.id),
          getTopWornItems(user.id),
          getLeastWornItems(user.id),
        ])

        setStats(statsData)
        setTopWorn(topWornData)
        setLeastWorn(leastWornData)
      } catch (err) {
        console.error('Error loading achievements:', err)
        setError('Failed to load achievements. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (isLoading || !stats) {
    return <LoadingSkeleton />
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <HeroSection stats={stats} />
      <CoreStatsGrid stats={stats} />
      <TopWornList items={topWorn} />
      <LeastWornList items={leastWorn} />

      {userId && <FinancialInsights userId={userId} />}

      {userId && <AchievementsGallery userId={userId} />}

      {userId && <FunFactsSection userId={userId} />}

      {/* Phase 5 placeholder */}
      <div className="bg-muted border border-border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">
          More insights coming soon: Polish and optimization!
        </p>
      </div>
    </main>
  )
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Skeleton */}
      <div className="text-center mb-8">
        <Skeleton className="h-12 w-96 mx-auto mb-3" />
        <Skeleton className="h-6 w-64 mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>

      {/* Core Stats Skeleton */}
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>

      {/* Top Worn Skeleton */}
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
