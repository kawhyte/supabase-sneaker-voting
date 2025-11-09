'use client'

import { lazy, Suspense, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import './achievements.css'
import { StatsGrid } from '@/components/achievements/StatsGrid'
import { AchievementsSidebar } from '@/components/achievements/AchievementsSidebar'
import { AchievementsErrorBoundary } from '@/components/achievements/AchievementsErrorBoundary'
import {
  StatsGridSkeleton,
  SidebarSkeleton,
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
// Analytics removed - not configured yet
// TODO: Re-add when Google Analytics 4 is set up
// import analytics, { AnalyticsEvent } from '@/lib/analytics'

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

// Helper function for personalized greeting
function getGreeting(userName?: string | null): string {
  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening'

  // Fallback chain: userName → 'there'
  let name = userName || 'there'

  // Truncate very long names (>20 chars)
  if (name.length > 20) {
    name = name.substring(0, 17) + '...'
  }

  return `Good ${timeOfDay}, ${name}!`
}

function AchievementsPageContent() {
  const [stats, setStats] = useState<WardrobeStats | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
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

        // Fetch user's first name from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, display_name')
          .eq('id', user.id)
          .single()

        if (profile) {
          setUserName(profile.display_name || profile.first_name || null)
        }

        // Analytics removed - not configured yet
        // try {
        //   analytics.track(AnalyticsEvent.DASHBOARD_VIEWED, {
        //     userId: user.id,
        //     page: 'achievements',
        //     timestamp: Date.now(),
        //   })
        // } catch (e) {
        //   console.error('Failed to track page view:', e)
        // }

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
        <StatsGridSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <FinancialInsightsSkeleton />
            <GallerySkeleton />
            <FactsSkeleton />
          </div>
          <div>
            <SidebarSkeleton />
          </div>
        </div>
      </div>
    )
  }

  const trackInteraction = (feature: string) => {
    // Analytics removed - not configured yet
    // try {
    //   if (userId) {
    //     analytics.track(AnalyticsEvent.FEATURE_DISCOVERED, {
    //       feature: `achievements_${feature}`,
    //       userId,
    //     })
    //   }
    // } catch (e) {
    //   console.error('Failed to track interaction:', e)
    // }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 achievements-main">
      {/* Header */}
      <h1 className="text-text-light dark:text-text-dark text-4xl font-black leading-tight tracking-[-0.033em] mb-8">
        {getGreeting(userName)}
      </h1>

      {/* NEW: Simplified Stats Grid (replaces HeroSection + CoreStatsGrid) */}
      <StatsGrid stats={stats} />

      {/* NEW: Grid Layout (main content + sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* MAIN CONTENT COLUMN (spans 2 columns on lg) */}
        <div className="lg:col-span-2 space-y-8">

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

        </div>

        {/* SIDEBAR COLUMN (1 column) */}
        <div>
          <AchievementsSidebar topWorn={topWorn} leastWorn={leastWorn} />
        </div>

      </div>
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
