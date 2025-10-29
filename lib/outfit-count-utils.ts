/**
 * Outfit Count Utility
 *
 * Provides efficient outfit counting for quiz modal logic.
 * Used to determine if user has created 3+ outfits (quiz requirement).
 */

import { createClient } from '@/utils/supabase/client'

/**
 * Get the total count of non-archived outfits for the current user
 *
 * This is used for the "Can You Style This?" quiz modal gate:
 * - If user has < 3 outfits: Show quiz modal before adding to wishlist
 * - If user has >= 3 outfits: Skip quiz, add to wishlist immediately
 *
 * @returns Promise<number> - Count of user's outfits (0 if error or no user)
 *
 * @example
 * const outfitCount = await getOutfitCount()
 * if (outfitCount < 3) {
 *   showQuizModal()
 * }
 */
export async function getOutfitCount(): Promise<number> {
  try {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.warn('[outfit-count] No authenticated user')
      return 0
    }

    // Count non-archived outfits for user
    const { count, error } = await supabase
      .from('outfits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_archived', false)

    if (error) {
      console.error('[outfit-count] Failed to fetch outfit count:', error)
      // Return 0 as safe default (will show quiz modal)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('[outfit-count] Unexpected error:', error)
    // Return 0 as safe default (will show quiz modal)
    return 0
  }
}

/**
 * Check if user has created the required number of outfits
 * for quiz exemption (3+ outfits allows skipping quiz)
 *
 * @returns Promise<boolean> - True if user has 3+ outfits
 *
 * @example
 * const canSkipQuiz = await hasMinimumOutfits()
 * if (canSkipQuiz) {
 *   // Skip quiz modal, add to wishlist directly
 * }
 */
export async function hasMinimumOutfits(): Promise<boolean> {
  const count = await getOutfitCount()
  return count >= 3
}
