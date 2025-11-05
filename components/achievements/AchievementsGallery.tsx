'use client'

import { useState, useEffect } from 'react'
import { AchievementBadge } from './AchievementBadge'
import { AchievementModal } from './AchievementModal'
import { ACHIEVEMENT_DEFINITIONS } from '@/lib/achievement-definitions'
import { createClient } from '@/utils/supabase/client'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface AchievementsGalleryProps {
  userId: string
}

export function AchievementsGallery({ userId }: AchievementsGalleryProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set())
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null)
  const [progress, setProgress] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    loadUnlockedAchievements()
    calculateProgress()
  }, [userId])

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

  const filtered = ACHIEVEMENT_DEFINITIONS.filter((achievement) => {
    const isUnlocked = unlockedIds.has(achievement.id)
    if (filter === 'unlocked') return isUnlocked
    if (filter === 'locked') return !isUnlocked
    return true
  })

  return (
    <section className="mb-12" aria-labelledby="achievements-gallery-title">
      <div className="flex items-center justify-between mb-6">
        <h2 id="achievements-gallery-title" className="text-2xl font-bold text-foreground">
          Achievement Gallery 🏆
        </h2>

        {/* Filter */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
            <TabsTrigger value="locked">Locked</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filtered.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            id={achievement.id}
            name={achievement.name}
            icon={achievement.icon}
            tier={achievement.tier}
            isUnlocked={unlockedIds.has(achievement.id)}
            progress={progress.get(achievement.id)}
            onClick={() => setSelectedAchievement(achievement.id)}
          />
        ))}
      </div>

      {/* Modal */}
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
