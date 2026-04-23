'use client'

import { lazy, Suspense, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import './achievements.css'
import { AchievementsSidebar } from '@/components/achievements/AchievementsSidebar'
import { AchievementsErrorBoundary } from '@/components/achievements/AchievementsErrorBoundary'
import { PlayerCard } from '@/components/achievements/PlayerCard'
import {
  SidebarSkeleton,
  FinancialInsightsSkeleton,
  GallerySkeleton,
} from '@/components/achievements/Skeletons'
import {
  getWardrobeStats,
  getTopWornItems,
  getLeastWornItems,
  getBestValueItems,
  getUserTotalPoints,
  getPortfolioPriceTrend,
  type WardrobeStats,
  type TopWornItem,
  type LeastWornItem,
  type BestValueItem,
  type PortfolioPriceTrend,
} from '@/lib/achievements-stats'
import { FinancialInsights } from '@/components/achievements/FinancialInsights'

const AchievementsGallery = lazy(() =>
  import('@/components/achievements/AchievementsGallery').then((mod) => ({
    default: mod.AchievementsGallery,
  }))
)

function getGreeting(userName?: string | null): string {
  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening'
  let name = userName || 'there'
  if (name.length > 20) name = name.substring(0, 17) + '...'
  return `Good ${timeOfDay}, ${name}!`
}

function AchievementsPageContent() {
  const [stats, setStats] = useState<WardrobeStats | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [topWorn, setTopWorn] = useState<TopWornItem[]>([])
  const [leastWorn, setLeastWorn] = useState<LeastWornItem[]>([])
  const [bestValue, setBestValue] = useState<BestValueItem[]>([])
  const [totalPoints, setTotalPoints] = useState<number>(0)
  const [priceTrend, setPriceTrend] = useState<PortfolioPriceTrend | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError('Please log in to view your achievements')
          return
        }

        setUserId(user.id)

        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single()

        if (profile) {
          setUserName(profile.display_name || null)
        }

        // Fetch 5 items; components slice to 3 on mobile
        const [statsData, topWornData, leastWornData, bestValueData, totalPts, trend] =
          await Promise.all([
            getWardrobeStats(user.id),
            getTopWornItems(user.id, 5),
            getLeastWornItems(user.id, 5),
            getBestValueItems(user.id, 5),
            getUserTotalPoints(user.id),
            getPortfolioPriceTrend(user.id),
          ])

        setStats(statsData)
        setTopWorn(topWornData)
        setLeastWorn(leastWornData)
        setBestValue(bestValueData)
        setTotalPoints(totalPts)
        setPriceTrend(trend)
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <FinancialInsightsSkeleton />
            <GallerySkeleton />
          </div>
          <div>
            <SidebarSkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 achievements-main">
      <h1 className="text-text-light dark:text-text-dark text-4xl font-black leading-tight tracking-[-0.033em] mb-6">
        {getGreeting(userName)}
      </h1>

      <PlayerCard totalPoints={totalPoints} />

      <AchievementsSidebar
        topWorn={topWorn}
        leastWorn={leastWorn}
        bestValue={bestValue}
        userId={userId}
      />

      <div className="space-y-8 mt-16">
        <FinancialInsights
          totalValue={stats.totalValue}
          totalWears={stats.totalWears}
          averageCpw={stats.averageCpw}
          priceTrend={priceTrend}
        />

        {userId && (
          <Suspense fallback={<GallerySkeleton />}>
            <div className="achievement-gallery">
              <AchievementsGallery userId={userId} />
            </div>
          </Suspense>
        )}
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
