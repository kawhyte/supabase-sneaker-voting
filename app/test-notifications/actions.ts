'use server'

import { createNotification } from '@/lib/notification-creator'

export async function createTestNotification(
  userId: string,
  type: 'price_alert' | 'wear_reminder' | 'seasonal_tip' | 'achievement_unlock' | 'outfit_suggestion',
  title: string,
  message: string,
  severity?: 'low' | 'medium' | 'high',
  metadata?: Record<string, any>,
  groupKey?: string
) {
  return await createNotification({
    userId,
    type,
    title,
    message,
    severity,
    metadata,
    groupKey
  })
}
