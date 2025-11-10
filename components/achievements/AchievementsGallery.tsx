'use client'

import { useState, useEffect, useRef } from 'react'
import { Trophy } from 'lucide-react'
import { AchievementBadge } from './AchievementBadge'
import { AchievementModal } from './AchievementModal'
import { ACHIEVEMENT_DEFINITIONS } from '@/lib/achievement-definitions'
import { createClient } from '@/utils/supabase/client'
// Analytics removed - not configured yet
// TODO: Re-add when Google Analytics 4 is set up
// import analytics, { AnalyticsEvent } from '@/lib/analytics'

interface AchievementsGalleryProps {
  userId: string
}

export function AchievementsGallery({ userId }: AchievementsGalleryProps) {
  // REMOVED: const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set())
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null)
  const [progress, setProgress] = useState<Map<string, number>>(new Map())
  const [focusedIndex, setFocusedIndex] = useState(0)
  const badgeRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    loadUnlockedAchievements()
    calculateProgress()
  }, [userId])

  // UPDATED: Use all achievements (no filtering)
  const achievements = ACHIEVEMENT_DEFINITIONS

  // Keyboard navigation handler (PRESERVED)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const gridCols = window.innerWidth >= 1280 ? 5 : window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 3 : 2

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          setFocusedIndex((prev) => Math.min(prev + 1, achievements.length - 1))
          // Track keyboard navigation
          // analytics.track(AnalyticsEvent.FEATURE_DISCOVERED, {
          //   feature: 'achievement_keyboard_nav_right',
          //   userId,
          // })
          break
        case 'ArrowLeft':
          e.preventDefault()
          setFocusedIndex((prev) => Math.max(prev - 1, 0))
          // analytics.track(AnalyticsEvent.FEATURE_DISCOVERED, {
          //   feature: 'achievement_keyboard_nav_left',
          //   userId,
          // })
          break
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex((prev) => Math.min(prev + gridCols, achievements.length - 1))
          // analytics.track(AnalyticsEvent.FEATURE_DISCOVERED, {
          //   feature: 'achievement_keyboard_nav_down',
          //   userId,
          // })
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex((prev) => Math.max(prev - gridCols, 0))
          // analytics.track(AnalyticsEvent.FEATURE_DISCOVERED, {
          //   feature: 'achievement_keyboard_nav_up',
          //   userId,
          // })
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          badgeRefs.current[focusedIndex]?.click()
          // analytics.track(AnalyticsEvent.FEATURE_DISCOVERED, {
          //   feature: 'achievement_keyboard_activated',
          //   achievementId: achievements[focusedIndex]?.id,
          //   userId,
          // })
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedIndex, achievements.length, userId])

  // Focus management
  useEffect(() => {
    badgeRefs.current[focusedIndex]?.focus()
  }, [focusedIndex])

  async function loadUnlockedAchievements() {
    const supabase = createClient()
    const { data } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)

    if (data) {
      setUnlockedIds(new Set(data.map((a: any) => a.achievement_id)))
    }
  }

  async function calculateProgress() {
    // TODO: Implement progress calculation based on criteria
    // For now, placeholder
    const progressMap = new Map<string, number>()
    // Example: progressMap.set('wardrobe_starter', 60)
    setProgress(progressMap)
  }

  return (
    <section className="mb-12" aria-labelledby="achievements-gallery-title">
      {/* REMOVED: Filter tabs */}
      <div className="flex items-center gap-3 mb-6">
        <Trophy
          className="h-5 w-5 text-primary"
          aria-hidden="true"
        />
        <h3 id="achievements-gallery-title" className="text-2xl font-bold text-foreground">
          Achievements
        </h3>
      </div>

      {/* Grid - UPDATED: Use achievements instead of filtered */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" role="region" aria-label="Achievement badges">
        {achievements.map((achievement, index) => (
          <AchievementBadge
            ref={(el) => (badgeRefs.current[index] = el)}
            key={achievement.id}
            id={achievement.id}
            name={achievement.name}
            icon={achievement.icon}
            tier={achievement.tier}
            isUnlocked={unlockedIds.has(achievement.id)}
            progress={progress.get(achievement.id)}
            tabIndex={index === focusedIndex ? 0 : -1}
            description={achievement.description}
            onClick={() => {
              setSelectedAchievement(achievement.id)
              // analytics.track(AnalyticsEvent.FEATURE_DISCOVERED, {
              //   feature: 'achievement_details_viewed',
              //   achievementId: achievement.id,
              //   userId,
              // })
            }}
          />
        ))}
      </div>

      {/* Modal (PRESERVED) */}
      {selectedAchievement && (
        <AchievementModal
          achievement={ACHIEVEMENT_DEFINITIONS.find((a) => a.id === selectedAchievement)!}
          isUnlocked={unlockedIds.has(selectedAchievement)}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </section>
  )
}
