'use client'

import { TopWornList } from './TopWornList'
import { LeastWornList } from './LeastWornList'
import { TopWornItem, LeastWornItem } from '@/lib/achievements-stats'

interface AchievementsSidebarProps {
  topWorn: TopWornItem[]
  leastWorn: LeastWornItem[]
}

export function AchievementsSidebar({ topWorn, leastWorn }: AchievementsSidebarProps) {
  return (
    <aside className="space-y-8" aria-label="Wardrobe highlights sidebar">
      {/* Top Worn Widget */}
      <TopWornList items={topWorn} variant="sidebar" />

      {/* Least Worn Widget */}
      <LeastWornList items={leastWorn} variant="sidebar" />
    </aside>
  )
}
