/**
 * ACHIEVEMENT CHECKER
 *
 * Purpose: Check if user has unlocked any achievements and create notifications
 * Called: After user actions (create outfit, wear item, purchase item)
 */

import { createClient } from '@/utils/supabase/server'

export async function checkAchievements(userId: string) {
  const supabase = await createClient()

  try {
    // Get all active achievements
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)

    if (!achievements || achievements.length === 0) return

    // Get already unlocked achievements
    const { data: unlockedIds } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)

    const unlockedSet = new Set(unlockedIds?.map((u: any) => u.achievement_id) || [])

    for (const achievement of achievements) {
      // Skip if already unlocked
      if (unlockedSet.has(achievement.achievement_key)) continue

      // Check unlock criteria
      const isUnlocked = await checkCriteria(userId, achievement.unlock_criteria)

      if (isUnlocked) {
        // Unlock achievement
        await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.achievement_key,
            unlocked_at: new Date().toISOString()
          })

        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            notification_type: 'achievement_unlock',
            title: `Achievement Unlocked: ${achievement.name}`,
            message: achievement.description,
            severity: 'low',
            metadata: {
              achievement_id: achievement.achievement_key,
              achievement_emoji: achievement.icon_emoji,
              points: achievement.points
            },
            is_read: false,
            snoozed_until: null
          })

        // Update user stats
        const { data: currentStats } = await supabase
          .from('user_stats')
          .select('achievements_unlocked')
          .eq('user_id', userId)
          .single()

        await supabase
          .from('user_stats')
          .update({
            achievements_unlocked: (currentStats?.achievements_unlocked || 0) + 1
          })
          .eq('user_id', userId)

        console.log(`Unlocked achievement: ${achievement.name} for user ${userId}`)
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error)
  }
}

async function checkCriteria(userId: string, criteria: any): Promise<boolean> {
  if (criteria.type !== 'sql') return false

  const supabase = await createClient()

  try {
    // Execute the SQL query with user_id parameter
    const query = criteria.query.replace('$1', `'${userId}'`)
    const { data, error } = await supabase.rpc('execute_sql', { query_text: query })

    if (error) {
      console.error('Error checking criteria:', error)
      return false
    }

    const count = data?.[0]?.count || 0
    return count >= (criteria.threshold || 1)
  } catch (error) {
    console.error('Error in checkCriteria:', error)
    return false
  }
}
