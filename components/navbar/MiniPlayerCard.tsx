'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Medal } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { getPointsProgress } from '@/lib/level-system'

interface MiniPlayerCardProps {
  userId?: string
}

export function MiniPlayerCard({ userId }: MiniPlayerCardProps) {
  const [totalPoints, setTotalPoints] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setIsLoading(false); return }
    const supabase = createClient()

    async function fetchPoints() {
      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .select('achievements!inner(points)')
          .eq('user_id', userId)
        if (error || !data) { setTotalPoints(0); return }
        setTotalPoints(
          data.reduce((sum: number, row: any) => sum + (row.achievements?.points ?? 0), 0)
        )
      } catch {
        setTotalPoints(0)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPoints()
  }, [userId])

  if (isLoading) {
    return (
      <div className="px-2 py-2 space-y-2">
        <div className="h-4 w-1/2 rounded-md bg-muted animate-pulse" />
        <div className="h-1.5 w-full rounded-full bg-muted animate-pulse" />
        <div className="h-3 w-3/4 rounded-md bg-muted animate-pulse" />
      </div>
    )
  }

  if (totalPoints === null) return null

  const { level, tierName, currentPts, nextThreshold, progressPct } = getPointsProgress(totalPoints)
  const isMaxLevel = level >= 50
  const ptsToNext = isMaxLevel ? 0 : nextThreshold - currentPts

  return (
    <Link
      href="/achievements"
      className="block px-2 py-2 rounded-md hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Medal className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="text-sm font-bold text-foreground">Level {level}</span>
        </div>
        <span className="text-xs text-muted-foreground">{tierName}</span>
      </div>

      <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-primary h-full rounded-full transition-all duration-700"
          style={{ width: `${progressPct}%` }}
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-muted-foreground tabular-nums">
          {currentPts.toLocaleString()} pts
        </span>
        {isMaxLevel ? (
          <span className="text-xs font-semibold text-primary">Max Level</span>
        ) : (
          <span className="text-xs text-muted-foreground tabular-nums">
            {ptsToNext.toLocaleString()} to Level {level + 1}
          </span>
        )}
      </div>
    </Link>
  )
}
