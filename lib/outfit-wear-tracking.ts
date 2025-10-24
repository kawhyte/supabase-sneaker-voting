/**
 * Outfit Wear Tracking Utilities
 *
 * Handles wear tracking, notifications, and wearing streak analytics
 */

import { Outfit, OutfitOccasion } from '@/components/types/outfit'

/**
 * Wearing streak - consecutive days an outfit has been worn
 */
export interface WearingStreak {
  outfitId: string
  currentStreak: number
  longestStreak: number
  lastWornDate: string | null
}

/**
 * Wear analytics for outfit
 */
export interface WearAnalytics {
  totalWears: number
  daysOwnedDays: number
  wearPercentage: number
  lastWornDate: string | null
  timesPerWeek: number
}

/**
 * Get wear analytics for an outfit
 */
export function getWearAnalytics(outfit: Outfit): WearAnalytics {
  const createdAt = new Date(outfit.created_at)
  const now = new Date()
  const daysOwned = Math.floor(
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  const timesPerWeek = daysOwned > 0 ? (outfit.times_worn / daysOwned) * 7 : 0

  return {
    totalWears: outfit.times_worn || 0,
    daysOwnedDays: Math.max(1, daysOwned), // Minimum 1 day
    wearPercentage: daysOwned > 0 ? (outfit.times_worn || 0) / daysOwned : 0,
    lastWornDate: outfit.last_worn || null,
    timesPerWeek: Number(timesPerWeek.toFixed(2)),
  }
}

/**
 * Format wear analytics for display
 */
export function formatWearAnalytics(analytics: WearAnalytics): string {
  const parts: string[] = []

  if (analytics.totalWears > 0) {
    parts.push(`${analytics.totalWears}x worn`)
  } else {
    parts.push('Never worn')
  }

  parts.push(`${analytics.timesPerWeek.toFixed(1)}x/week`)

  if (analytics.lastWornDate) {
    const lastWorn = new Date(analytics.lastWornDate)
    const daysAgo = Math.floor(
      (new Date().getTime() - lastWorn.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysAgo === 0) {
      parts.push('worn today')
    } else if (daysAgo === 1) {
      parts.push('worn yesterday')
    } else {
      parts.push(`${daysAgo}d ago`)
    }
  }

  return parts.join(' • ')
}

/**
 * Suggest wearing an outfit based on analytics
 */
export function shouldSuggestWearing(outfit: Outfit): boolean {
  if (!outfit.last_worn) {
    return true // Never worn, suggest it
  }

  const lastWorn = new Date(outfit.last_worn)
  const now = new Date()
  const daysSinceWorn = Math.floor(
    (now.getTime() - lastWorn.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Suggest if not worn in 14+ days
  return daysSinceWorn >= 14
}

/**
 * Get wearing streak for outfit
 * Assumes outfits are worn on consecutive days if date_worn exists
 */
export function getWearingStreak(outfit: Outfit): WearingStreak {
  // Simple implementation: if worn today, streak is 1
  // This would need calendar data for more accurate streaks
  const lastWorn = outfit.last_worn ? new Date(outfit.last_worn) : null
  const today = new Date()

  const isWornToday =
    lastWorn &&
    lastWorn.toDateString() === today.toDateString()

  return {
    outfitId: outfit.id,
    currentStreak: isWornToday ? 1 : 0,
    longestStreak: outfit.times_worn || 0, // Placeholder
    lastWornDate: outfit.last_worn || null,
  }
}

/**
 * Get outfit wearing recommendations based on wardrobe analytics
 */
export function getWearingRecommendations(
  outfits: Outfit[],
  limit: number = 3
): Outfit[] {
  // Sort by days since last worn (descending)
  const sorted = [...outfits].sort((a, b) => {
    const aDaysAgo = a.last_worn
      ? Math.floor(
          (new Date().getTime() - new Date(a.last_worn).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 999

    const bDaysAgo = b.last_worn
      ? Math.floor(
          (new Date().getTime() - new Date(b.last_worn).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 999

    return bDaysAgo - aDaysAgo
  })

  // Return top recommendations
  return sorted
    .filter((outfit) => shouldSuggestWearing(outfit))
    .slice(0, limit)
}

/**
 * Notification for outfit wearing
 */
export interface WearingNotification {
  type: 'first_wear' | 'streak' | 'forgotten' | 'favorite'
  outfitId: string
  outfitName: string
  message: string
  emoji: string
}

/**
 * Generate wearing notifications
 */
export function generateWearingNotifications(
  outfit: Outfit
): WearingNotification | null {
  const analytics = getWearAnalytics(outfit)

  // First wear
  if (analytics.totalWears === 1) {
    return {
      type: 'first_wear',
      outfitId: outfit.id,
      outfitName: outfit.name,
      message: `You wore "${outfit.name}" for the first time!`,
      emoji: '✨',
    }
  }

  // Streak milestone (10 wears)
  if (analytics.totalWears === 10) {
    return {
      type: 'streak',
      outfitId: outfit.id,
      outfitName: outfit.name,
      message: `"${outfit.name}" has been worn 10 times! You love this outfit!`,
      emoji: '🔥',
    }
  }

  // Forgotten outfit (not worn in 30+ days)
  if (analytics.lastWornDate) {
    const lastWorn = new Date(analytics.lastWornDate)
    const daysSince = Math.floor(
      (new Date().getTime() - lastWorn.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSince >= 30) {
      return {
        type: 'forgotten',
        outfitId: outfit.id,
        outfitName: outfit.name,
        message: `You haven't worn "${outfit.name}" in ${daysSince} days. Time to bring it back?`,
        emoji: '👀',
      }
    }
  }

  // Favorite (worn 5+ times per week)
  if (analytics.timesPerWeek >= 5) {
    return {
      type: 'favorite',
      outfitId: outfit.id,
      outfitName: outfit.name,
      message: `"${outfit.name}" is your favorite! You wear it ${analytics.timesPerWeek.toFixed(1)}x per week.`,
      emoji: '❤️',
    }
  }

  return null
}

/**
 * Format outfit wearing celebration message
 */
export function getWearingCelebration(
  totalWears: number
): { emoji: string; message: string } {
  if (totalWears === 1) {
    return {
      emoji: '✨',
      message: 'First wear! Enjoy your new outfit!',
    }
  }

  if (totalWears === 5) {
    return {
      emoji: '🎉',
      message: 'You love this outfit! 5 wears!',
    }
  }

  if (totalWears === 10) {
    return {
      emoji: '🔥',
      message: 'This is a favorite! 10 wears!',
    }
  }

  if (totalWears % 10 === 0) {
    return {
      emoji: '👑',
      message: `${totalWears} wears! You really love this outfit!`,
    }
  }

  return {
    emoji: '👕',
    message: `${totalWears} wears`,
  }
}

/**
 * Calculate outfit wear goal (based on cost per wear philosophy)
 * Suggests target wears to reach a good cost-per-wear value
 */
export function getWearGoal(
  retailPrice: number | undefined
): { targetWears: number; costPerWear: number } {
  if (!retailPrice || retailPrice <= 0) {
    return { targetWears: 50, costPerWear: 5 }
  }

  // $2 per wear for budget items
  // $5 per wear for mid-range
  // $10 per wear for premium
  let costPerWear = 2

  if (retailPrice >= 150) {
    costPerWear = 10
  } else if (retailPrice >= 50) {
    costPerWear = 5
  }

  const targetWears = Math.ceil(retailPrice / costPerWear)

  return { targetWears, costPerWear }
}

/**
 * Get progress towards wear goal
 */
export function getWearProgress(
  currentWears: number,
  goalWears: number
): number {
  if (goalWears <= 0) return 0
  return Math.min(Math.round((currentWears / goalWears) * 100), 100)
}
