'use client'

import { lazy, Suspense, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import './achievements.css'
import { HeroSection } from '@/components/achievements/HeroSection'
import { CoreStatsGrid } from '@/components/achievements/CoreStatsGrid'
import { TopWornList } from '@/components/achievements/TopWornList'
import { LeastWornList } from '@/components/achievements/LeastWornList'
import { AchievementsErrorBoundary } from '@/components/achievements/AchievementsErrorBoundary'
import { StatsPreferences, type StatsPreferencesType } from '@/components/achievements/StatsPreferences'
import {
  HeroSkeleton,
  CoreStatsSkeleton,
  TopWornListSkeleton,
  LeastWornListSkeleton,
  FinancialInsightsSkeleton,
  GallerySkeleton,
  FactsSkeleton,
} from '@/components/achievements/Skeletons'
import {
  getWardrobeStats,
  getTopWornItems,
  getLeastWornItems,
  type WardrobeStats,
  type TopWornItem,
  type LeastWornItem,
} from '@/lib/achievements-stats'
import analytics, { AnalyticsEvent } from '@/lib/analytics'

// Lazy load heavy components
const FinancialInsights = lazy(() =>
  import('@/components/achievements/FinancialInsights').then((mod) => ({
    default: mod.FinancialInsights,
  }))
)
const AchievementsGallery = lazy(() =>
  import('@/components/achievements/AchievementsGallery').then((mod) => ({
    default: mod.AchievementsGallery,
  }))
)
const FunFactsSection = lazy(() =>
  import('@/components/achievements/FunFactsSection').then((mod) => ({
    default: mod.FunFactsSection,
  }))
)

function AchievementsPageContent() {
  const [stats, setStats] = useState<WardrobeStats | null>(null)
  const [topWorn, setTopWorn] = useState<TopWornItem[]>([])
  const [leastWorn, setLeastWorn] = useState<LeastWornItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<StatsPreferencesType | null>(null)

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
        try {
          analytics.track(AnalyticsEvent.DASHBOARD_VIEWED, {
            userId: user.id,
            page: 'achievements',
            timestamp: Date.now(),
          })
        } catch (e) {
          console.error('Failed to track page view:', e)
        }

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
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <HeroSkeleton />
        <CoreStatsSkeleton />
        <TopWornListSkeleton />
        <LeastWornListSkeleton />
        <FinancialInsightsSkeleton />
        <GallerySkeleton />
        <FactsSkeleton />
      </div>
    )
  }

  const trackInteraction = (feature: string) => {
    try {
      if (userId) {
        analytics.track(AnalyticsEvent.FEATURE_DISCOVERED, {
          feature: `achievements_${feature}`,
          userId,
        })
      }
    } catch (e) {
      console.error('Failed to track interaction:', e)
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 achievements-main">
      {/* Header with Preferences */}
      <div className="achievements-header flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <h1 className="hero-title text-3xl sm:text-4xl font-bold text-foreground">
          Your Achievements 🏆
        </h1>
        {userId && (
          <div onClick={() => trackInteraction('stats_preferences')}>
            <StatsPreferences userId={userId} onPreferencesChange={setPreferences} />
          </div>
        )}
      </div>

      <HeroSection stats={stats} />

      <div className="core-stats-grid">
        <CoreStatsGrid stats={stats} />
      </div>

      <div className="worn-items-grid">
        <TopWornList items={topWorn} />
      </div>

      {/* Conditionally render based on preferences */}
      {preferences?.show_least_worn !== false && (
        <div className="worn-items-grid">
          <LeastWornList items={leastWorn} />
        </div>
      )}

      {userId && (
        <Suspense fallback={<FinancialInsightsSkeleton />}>
          <div className="charts-grid">
            <FinancialInsights userId={userId} />
          </div>
        </Suspense>
      )}

      {userId && (
        <Suspense fallback={<GallerySkeleton />}>
          <div className="achievement-gallery">
            <AchievementsGallery userId={userId} />
          </div>
        </Suspense>
      )}

      {userId && (
        <Suspense fallback={<FactsSkeleton />}>
          <FunFactsSection userId={userId} />
        </Suspense>
      )}
    </main>
  )
}

export default function AchievementsPage() {
  return (
    <AchievementsErrorBoundary>
      <AchievementsPageContent />
    </AchievementsErrorBoundary>
  )
}
