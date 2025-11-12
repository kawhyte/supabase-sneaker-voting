'use client'

import { useState, useEffect, useRef } from 'react'
import { Trophy } from 'lucide-react'
import { AchievementBadge } from './AchievementBadge'
import { AchievementModal } from './AchievementModal'
import { ACHIEVEMENT_DEFINITIONS } from '@/lib/achievement-definitions'
import { createClient } from '@/utils/supabase/client'
import { toast } from '@/components/ui/use-toast'
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
    const supabase = createClient()
    const progressMap = new Map<string, number>()

    try {
      // Fetch all data needed for calculations
      const [itemsResult, outfitsResult] = await Promise.all([
        supabase
          .from('items')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'owned')
          .eq('is_archived', false),
        supabase
          .from('outfits')
          .select('id')
          .eq('user_id', userId)
          .eq('is_archived', false),
      ])

      const items = itemsResult.data || []
      const outfits = outfitsResult.data || []

      // Calculate metrics for each achievement type
      const metrics = {
        // Wardrobe size
        total_items: items.length,

        // Outfit creation
        outfits_created: outfits.length,

        // Cost-per-wear achievements
        items_hit_cpw_target: items.filter((item) => {
          const price = item.purchase_price || item.retail_price
          const wears = item.wears || 0
          if (!price || wears === 0) return false

          const cpw = price / wears
          const target = getTargetCPW(price)
          return cpw <= target
        }).length,

        // Category diversity
        unique_categories: new Set(items.map((item) => item.category)).size,

        // Brand diversity
        unique_brands: new Set(items.map((item) => item.brand).filter(Boolean)).size,

        // Wardrobe utilization (items worn this month)
        items_worn_this_month: items.filter((item) => {
          if (!item.last_worn_date) return false
          const lastWorn = new Date(item.last_worn_date)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return lastWorn >= thirtyDaysAgo
        }).length,

        // Price monitoring savings (placeholder for now)
        total_saved_dollars: 0, // TODO: Query price_alerts table when implemented
      }

      // Calculate progress percentage for each achievement
      for (const achievement of ACHIEVEMENT_DEFINITIONS) {
        const currentValue = metrics[achievement.criteria.metric as keyof typeof metrics] || 0
        const threshold = achievement.criteria.threshold

        // Calculate progress (0-100%)
        const progress = Math.min(100, (currentValue / threshold) * 100)
        progressMap.set(achievement.id, progress)
      }

      setProgress(progressMap)

      // Check for newly unlocked achievements
      await checkAndUnlockAchievements(progressMap)
    } catch (error) {
      console.error('Error calculating progress:', error)
    }
  }

  // Helper: Calculate target cost-per-wear based on price tier
  function getTargetCPW(price: number): number {
    if (price < 50) return 2 // Budget: $2/wear
    if (price < 150) return 5 // Mid-range: $5/wear
    return 10 // Premium: $10/wear
  }

  // Auto-unlock achievements when progress reaches 100%
  async function checkAndUnlockAchievements(progressMap: Map<string, number>) {
    const supabase = createClient()
    const newlyUnlocked: string[] = []

    for (const achievement of ACHIEVEMENT_DEFINITIONS) {
      const progress = progressMap.get(achievement.id) || 0
      const isAlreadyUnlocked = unlockedIds.has(achievement.id)

      // Check if achievement should be unlocked
      if (progress >= 100 && !isAlreadyUnlocked) {
        try {
          // Insert into user_achievements table
          const { error: insertError } = await supabase
            .from('user_achievements')
            .insert({
              user_id: userId,
              achievement_id: achievement.id,
              unlocked_at: new Date().toISOString(),
            })

          if (insertError) {
            console.error('Error unlocking achievement:', {
              achievementId: achievement.id,
              achievementName: achievement.name,
              error: insertError,
              errorMessage: insertError.message,
              errorDetails: insertError.details,
              errorHint: insertError.hint,
            })
            continue
          }

          // Track newly unlocked achievement
          newlyUnlocked.push(achievement.id)

          // Show toast notification
          toast({
            title: `🎉 Achievement Unlocked!`,
            description: (
              <div className="mt-2">
                <p className="font-bold text-primary">{achievement.name}</p>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                <p className="text-xs text-primary mt-1">+{achievement.points} points</p>
              </div>
            ),
            duration: 5000,
          })

          console.log(`✨ Unlocked achievement: ${achievement.name} (+${achievement.points} points)`)
        } catch (error) {
          console.error('Error unlocking achievement (exception):', {
            achievementId: achievement.id,
            achievementName: achievement.name,
            error,
          })
        }
      }
    }

    // Update unlocked IDs state if new achievements were unlocked
    if (newlyUnlocked.length > 0) {
      setUnlockedIds((prev) => {
        const updated = new Set(prev)
        newlyUnlocked.forEach((id) => updated.add(id))
        return updated
      })
    }
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
