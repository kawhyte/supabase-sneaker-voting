'use client'

import { TopWornList } from './TopWornList'
import { WearNextCard } from './WearNextCard'
import { BestValueList } from './BestValueList'
import { TopWornItem, LeastWornItem, BestValueItem } from '@/lib/achievements-stats'

interface AchievementsSidebarProps {
  topWorn: TopWornItem[]
  leastWorn: LeastWornItem[]
  bestValue: BestValueItem[]
  userId: string | null
}

export function AchievementsSidebar({ topWorn, leastWorn, bestValue, userId }: AchievementsSidebarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Wardrobe highlights sidebar">
      {/* Top Worn Widget */}
      <TopWornList items={topWorn} variant="sidebar" />

      {/* Wear Next — single hero card replacing the passive "Items Needing Love" list */}
      <WearNextCard item={leastWorn[0]} userId={userId} />

      {/* Best Value Widget */}
      <BestValueList items={bestValue} variant="sidebar" />
    </div>
  )
}
