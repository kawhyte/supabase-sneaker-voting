'use client'

import { useState, useEffect, useRef } from 'react'
import { Trophy } from 'lucide-react'
import { AchievementBadge } from './AchievementBadge'
import { AchievementModal } from './AchievementModal'
import { ACHIEVEMENT_DEFINITIONS } from '@/lib/achievement-definitions'
import { createClient } from '@/utils/supabase/client'
import { toast } from '@/components/ui/use-toast'
import { getTargetCostPerWear } from '@/lib/wardrobe-item-utils'

interface AchievementsGalleryProps {
  userId: string
}

export function AchievementsGallery({ userId }: AchievementsGalleryProps) {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set())
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null)
  const [progress, setProgress] = useState<Map<string, number>>(new Map())
  const [focusedIndex, setFocusedIndex] = useState(0)
  const badgeRefs = useRef<(HTMLButtonElement | null)[]>([])
  const isCalculatingRef = useRef(false)

  useEffect(() => {
    async function initializeAchievements() {
      if (isCalculatingRef.current) return

      isCalculatingRef.current = true
      try {
        // loadUnlockedAchievements must complete before calculateProgress
        // so checkAndUnlockAchievements can accurately diff against already-unlocked set
        await loadUnlockedAchievements()
        await calculateProgress()
      } catch (error) {
        console.error('Error initializing achievements:', error)
      } finally {
        isCalculatingRef.current = false
      }
    }

    initializeAchievements()
  }, [userId])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const gridCols = window.innerWidth >= 1280 ? 5 : window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 3 : 2

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          setFocusedIndex((prev) => Math.min(prev + 1, ACHIEVEMENT_DEFINITIONS.length - 1))
          break
        case 'ArrowLeft':
          e.preventDefault()
          setFocusedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex((prev) => Math.min(prev + gridCols, ACHIEVEMENT_DEFINITIONS.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex((prev) => Math.max(prev - gridCols, 0))
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          badgeRefs.current[focusedIndex]?.click()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedIndex])

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
      setUnlockedIds(new Set(data.map((a: { achievement_id: string }) => a.achievement_id)))
    }
  }

  async function calculateProgress() {
    const supabase = createClient()
    const progressMap = new Map<string, number>()

    try {
      const [itemsResult, outfitsResult] = await Promise.all([
        supabase
          .from('items')
          .select('id, category, brand, wears, purchase_price, retail_price, last_worn_date')
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

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const metrics = {
        total_items: items.length,
        outfits_created: outfits.length,
        items_hit_cpw_target: items.filter((item) => {
          const price = item.purchase_price || item.retail_price
          const wears = item.wears || 0
          if (!price || wears === 0) return false
          return price / wears <= getTargetCostPerWear(price, item.category)
        }).length,
        unique_categories: new Set(items.map((item) => item.category)).size,
        unique_brands: new Set(items.map((item) => item.brand).filter(Boolean)).size,
        items_worn_this_month: items.filter((item) => {
          if (!item.last_worn_date) return false
          return new Date(item.last_worn_date) >= thirtyDaysAgo
        }).length,
        total_saved_dollars: 0,
      }

      for (const achievement of ACHIEVEMENT_DEFINITIONS) {
        const currentValue = metrics[achievement.criteria.metric as keyof typeof metrics] || 0
        const pct = Math.min(100, (currentValue / achievement.criteria.threshold) * 100)
        progressMap.set(achievement.id, pct)
      }

      setProgress(progressMap)
      await checkAndUnlockAchievements(progressMap)
    } catch (error) {
      console.error('Error calculating progress:', error)
    }
  }

  async function checkAndUnlockAchievements(progressMap: Map<string, number>) {
    const supabase = createClient()

    for (const achievement of ACHIEVEMENT_DEFINITIONS) {
      const pct = progressMap.get(achievement.id) || 0
      if (pct < 100 || unlockedIds.has(achievement.id)) continue

      try {
        // Check DB first to guard against race conditions across tabs/sessions
        const { data: existingUnlock } = await supabase
          .from('user_achievements')
          .select('id')
          .eq('user_id', userId)
          .eq('achievement_id', achievement.id)
          .maybeSingle()

        if (existingUnlock) {
          setUnlockedIds((prev) => new Set(prev).add(achievement.id))
          continue
        }

        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
            unlocked_at: new Date().toISOString(),
          })

        if (insertError) {
          if (insertError.code === '23505') {
            // Duplicate key — another tab unlocked it simultaneously
            setUnlockedIds((prev) => new Set(prev).add(achievement.id))
            continue
          }
          console.error('Error unlocking achievement:', insertError)
          continue
        }

        setUnlockedIds((prev) => new Set(prev).add(achievement.id))
        toast({
          title: 'Achievement Unlocked!',
          description: (
            <div className="mt-2">
              <p className="font-bold text-primary">{achievement.name}</p>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
              <p className="text-xs text-primary mt-1">+{achievement.points} points</p>
            </div>
          ),
          duration: 5000,
        })
      } catch (error) {
        console.error('Error unlocking achievement:', { achievementId: achievement.id, error })
      }
    }
  }

  return (
    <section className="mb-12" aria-labelledby="achievements-gallery-title">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
        <h3 id="achievements-gallery-title" className="text-2xl font-bold text-foreground">
          Sneaker Insights
        </h3>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        role="region"
        aria-label="Achievement badges"
      >
        {ACHIEVEMENT_DEFINITIONS.map((achievement, index) => (
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
            onClick={() => setSelectedAchievement(achievement.id)}
          />
        ))}
      </div>

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
