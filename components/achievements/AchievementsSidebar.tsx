'use client'

import { TopWornList } from './TopWornList'
import { LeastWornList } from './LeastWornList'
import { BestValueList } from './BestValueList'
import { TopWornItem, LeastWornItem, BestValueItem } from '@/lib/achievements-stats'

interface AchievementsSidebarProps {
  topWorn: TopWornItem[]
  leastWorn: LeastWornItem[]
  bestValue: BestValueItem[]
}

export function AchievementsSidebar({ topWorn, leastWorn, bestValue }: AchievementsSidebarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Wardrobe highlights sidebar">
      {/* Top Worn Widget */}
      <TopWornList items={topWorn} variant="sidebar" />

      {/* Least Worn Widget */}
      <LeastWornList items={leastWorn} variant="sidebar" />

      {/* Best Value Widget */}
      <BestValueList items={bestValue} variant="sidebar" />
    </div>
  )
}
