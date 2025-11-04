'use server'

/**
 * SERVER ACTIONS FOR NOTIFICATIONS
 *
 * These server actions wrap notification creation functions
 * to make them callable from client components
 */

import {
  createCoolingOffReadyNotification,
  createCostPerWearMilestone,
  createDuplicationFollowUp,
} from './notification-creator'

/**
 * Server action to trigger cooling-off ready notification
 * Called from cooling-off-badge.tsx (client component)
 */
export async function triggerCoolingOffNotification(
  userId: string,
  item: {
    id: string
    brand: string
    model: string
    color: string
    target_price?: number
    image_url?: string
  }
) {
  return await createCoolingOffReadyNotification(userId, item)
}

/**
 * Server action to trigger cost-per-wear milestone notification
 * Called from wardrobe item cards (client components)
 */
export async function triggerCostPerWearNotification(
  userId: string,
  item: {
    id: string
    brand: string
    model: string
    color: string
    wears: number
    purchase_price: number
    cost_per_wear: number
    target_cost_per_wear: number
    image_url?: string
  }
) {
  return await createCostPerWearMilestone(userId, item)
}

/**
 * Server action to trigger duplication follow-up notification
 * Called from duplication-warning-banner.tsx (client component)
 */
export async function triggerDuplicationFollowUp(
  userId: string,
  dismissedWarning: {
    item_name: string
    similar_items: Array<{ brand: string; model: string }>
    severity: 'high' | 'medium' | 'low'
  }
) {
  return await createDuplicationFollowUp(userId, dismissedWarning)
}
