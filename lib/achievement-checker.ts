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
  if (criteria.type === 'custom') {
    return checkCustomMetric(userId, criteria.metric, criteria.threshold ?? 1)
  }

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

async function checkCustomMetric(userId: string, metric: string, threshold: number): Promise<boolean> {
  const supabase = await createClient()

  try {
    switch (metric) {
      case 'beater_pair': {
        // Any owned pair with >50 wears and CPW < $1.00
        const { data } = await supabase
          .from('items')
          .select('id, wears, purchase_price, retail_price')
          .eq('user_id', userId)
          .eq('status', 'owned')
          .eq('is_archived', false)
          .gt('wears', 50)

        if (!data || data.length === 0) return false
        return data.some((item) => {
          const price = item.purchase_price || item.retail_price
          if (!price || !item.wears) return false
          return price / item.wears < 1.00
        })
      }

      case 'pairs_from_top_brand': {
        // Any single brand with >= threshold pairs in the collection
        const { data } = await supabase
          .from('items')
          .select('brand')
          .eq('user_id', userId)
          .eq('status', 'owned')
          .eq('is_archived', false)

        if (!data || data.length === 0) return false
        const brandCounts: Record<string, number> = {}
        for (const item of data) {
          const brand = item.brand?.toLowerCase()
          if (!brand) continue
          brandCounts[brand] = (brandCounts[brand] ?? 0) + 1
        }
        return Object.values(brandCounts).some((count) => count >= threshold)
      }

      case 'unique_pairs_worn_this_week': {
        // >= threshold distinct pairs with last_worn_date in the trailing 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data } = await supabase
          .from('items')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'owned')
          .eq('is_archived', false)
          .gte('last_worn_date', sevenDaysAgo.toISOString().split('T')[0])

        return (data?.length ?? 0) >= threshold
      }

      case 'daily_driver_pair': {
        // Any single owned pair with >= threshold wears AND worn within the last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data } = await supabase
          .from('items')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'owned')
          .eq('is_archived', false)
          .gte('wears', threshold)
          .gte('last_worn_date', sevenDaysAgo.toISOString().split('T')[0])

        return (data?.length ?? 0) > 0
      }

      case 'rotation_god': {
        // >= threshold distinct categories worn in the trailing 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data } = await supabase
          .from('items')
          .select('category')
          .eq('user_id', userId)
          .eq('status', 'owned')
          .eq('is_archived', false)
          .gte('last_worn_date', sevenDaysAgo.toISOString().split('T')[0])

        if (!data || data.length === 0) return false
        const distinctCategories = new Set(data.map((item) => item.category)).size
        return distinctCategories >= threshold
      }

      case 'diamond_hands': {
        // Any owned item where lowest_price_seen <= retail_price * 0.90 (value dropped ≥10%)
        const { data } = await supabase
          .from('items')
          .select('id, retail_price, lowest_price_seen')
          .eq('user_id', userId)
          .eq('status', 'owned')
          .eq('is_archived', false)
          .not('lowest_price_seen', 'is', null)
          .not('retail_price', 'is', null)

        if (!data || data.length === 0) return false
        return data.some((item) => {
          if (!item.retail_price || !item.lowest_price_seen) return false
          return item.lowest_price_seen <= item.retail_price * 0.90
        })
      }

      default:
        return false
    }
  } catch (error) {
    console.error(`Error in checkCustomMetric (${metric}):`, error)
    return false
  }
}
