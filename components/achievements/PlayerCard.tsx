'use client'

import { Medal } from 'lucide-react'
import { getPointsProgress } from '@/lib/level-system'

interface PlayerCardProps {
  totalPoints: number
}

export function PlayerCard({ totalPoints }: PlayerCardProps) {
  const { level, tierName, currentPts, nextThreshold, progressPct } = getPointsProgress(totalPoints)
  const isMaxLevel = level >= 50
  const ptsToNext = isMaxLevel ? 0 : nextThreshold - currentPts

  return (
    <div className="border border-border rounded-xl p-6 bg-card mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Medal className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Collector Level
            </p>
            <p className="text-2xl font-black tracking-tight text-foreground leading-none">
              Level {level}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tier
          </p>
          <p className="text-sm font-bold text-foreground">{tierName}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground tabular-nums">
            {currentPts.toLocaleString()} pts
          </p>
          {isMaxLevel ? (
            <p className="text-xs font-semibold text-primary">Max Level</p>
          ) : (
            <p className="text-xs text-muted-foreground tabular-nums">
              {ptsToNext.toLocaleString()} pts to Level {level + 1}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
