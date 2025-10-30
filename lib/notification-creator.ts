/**
 * NOTIFICATION CREATOR SERVICE
 *
 * Purpose: Central service for creating notifications with smart bundling logic
 * Prevents notification spam by grouping similar notifications
 */

import { createClient } from '@/utils/supabase/server'

export type NotificationType =
  | 'price_alert'
  | 'wear_reminder'
  | 'seasonal_tip'
  | 'achievement_unlock'
  | 'outfit_suggestion'

export type NotificationSeverity = 'low' | 'medium' | 'high'

export interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  linkUrl?: string
  actionLabel?: string
  actionUrl?: string
  severity?: NotificationSeverity
  metadata?: Record<string, any>
  groupKey?: string // For bundling
}

export interface BundledItem {
  itemId: string
  itemName: string
  itemImage?: string
  daysUnworn?: number
  [key: string]: any
}

/**
 * Main notification creation function
 * Checks for quiet hours and bundling preferences before creating
 */
export async function createNotification(params: CreateNotificationParams) {
  const supabase = await createClient()

  try {
    // 1. Get user preferences
    const { data: prefs, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', params.userId)
      .single()

    if (prefsError || !prefs) {
      console.error('User preferences not found:', prefsError)
      return null
    }

    // 2. Check if notification type is enabled
    const typeEnabled = getNotificationTypeEnabled(params.type, prefs)
    if (!typeEnabled) {
      console.log(
        `Notification type ${params.type} disabled for user ${params.userId}`
      )
      return null
    }

    // 3. Check quiet hours
    if (prefs.quiet_hours_enabled && isInQuietHours(prefs)) {
      console.log(`Skipping notification - in quiet hours`)
      return null
    }

    // 4. Check daily limit
    const todayCount = await getTodayNotificationCount(params.userId)
    if (todayCount >= prefs.max_daily_notifications) {
      console.log(
        `Daily notification limit reached (${prefs.max_daily_notifications})`
      )
      return null
    }

    // 5. Check if should bundle
    if (prefs.enable_bundling && params.groupKey) {
      return await createOrUpdateBundle(params, prefs.bundle_threshold)
    }

    // 6. Create individual notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        notification_type: params.type,
        title: params.title,
        message: params.message,
        link_url: params.linkUrl,
        action_label: params.actionLabel,
        action_url: params.actionUrl,
        severity: params.severity || 'low',
        metadata: params.metadata || {},
        group_key: params.groupKey
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in createNotification:', error)
    throw error
  }
}

/**
 * Create or update a bundled notification
 * Groups similar notifications together to prevent spam
 */
async function createOrUpdateBundle(
  params: CreateNotificationParams,
  threshold: number
) {
  const supabase = await createClient()

  try {
    // 1. Check if bundle already exists
    const { data: existingBundle, error: bundleError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', params.userId)
      .eq('group_key', params.groupKey)
      .eq('is_bundled', true)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (bundleError && bundleError.code !== 'PGRST116') {
      throw bundleError
    }

    // 2. If bundle exists, update it
    if (existingBundle) {
      const bundledItems = (existingBundle.bundled_items as BundledItem[]) || []
      const newItem: BundledItem = {
        itemId: params.metadata?.item_id,
        itemName: params.metadata?.item_name,
        itemImage: params.metadata?.item_image,
        ...params.metadata
      }

      bundledItems.push(newItem)

      const { data, error } = await supabase
        .from('notifications')
        .update({
          bundled_count: bundledItems.length,
          bundled_items: bundledItems,
          title: `${bundledItems.length} ${params.title}`,
          message: `You have ${bundledItems.length} items that need attention`,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingBundle.id)
        .select()
        .single()

      if (error) throw error
      return data
    }

    // 3. Create new bundle with first item
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        notification_type: params.type,
        title: params.title,
        message: params.message,
        link_url: params.linkUrl,
        action_label: params.actionLabel,
        severity: params.severity || 'low',
        metadata: params.metadata || {},
        group_key: params.groupKey,
        is_bundled: true,
        bundled_count: 1,
        bundled_items: [
          {
            itemId: params.metadata?.item_id,
            itemName: params.metadata?.item_name,
            itemImage: params.metadata?.item_image,
            ...params.metadata
          }
        ]
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error in createOrUpdateBundle:', error)
    throw error
  }
}

/**
 * Helper: Check if notification type is enabled in user preferences
 */
function getNotificationTypeEnabled(type: NotificationType, prefs: any): boolean {
  const typeMap: Record<NotificationType, keyof typeof prefs> = {
    price_alert: 'price_alerts_enabled',
    wear_reminder: 'wear_reminders_enabled',
    seasonal_tip: 'seasonal_tips_enabled',
    achievement_unlock: 'achievements_enabled',
    outfit_suggestion: 'outfit_suggestions_enabled'
  }

  const prefKey = typeMap[type]
  return prefs[prefKey] !== false
}

/**
 * Helper: Check if current time is in quiet hours
 * Timezone-aware calculation
 */
function isInQuietHours(prefs: any): boolean {
  if (!prefs.quiet_hours_start || !prefs.quiet_hours_end) return false

  const now = new Date()
  const userTimezone = prefs.user_timezone || 'UTC'

  // Convert current time to user's timezone
  const userTime = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }))
  const userHour = userTime.getHours()
  const userMinute = userTime.getMinutes()
  const currentMinutes = userHour * 60 + userMinute

  // Parse quiet hours (format: "HH:MM")
  const startParts = prefs.quiet_hours_start.split(':')
  const endParts = prefs.quiet_hours_end.split(':')
  const startHour = parseInt(startParts[0])
  const startMin = parseInt(startParts[1])
  const endHour = parseInt(endParts[0])
  const endMin = parseInt(endParts[1])
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  // Handle overnight quiet hours (e.g., 22:00 - 08:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes
  }

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes
}

/**
 * Helper: Get today's notification count for user
 */
async function getTodayNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())

  return count || 0
}
