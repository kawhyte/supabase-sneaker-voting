import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Ensures that a user has a profile in the database.
 * This is a defensive measure in case the database trigger fails
 * (e.g., due to rate limits, connection issues, or race conditions).
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to check/create profile for
 * @param userEmail - User email for fallback display name
 * @returns The user's profile (existing or newly created)
 */
export async function ensureProfileExists(
  supabase: SupabaseClient,
  userId: string,
  userEmail?: string
) {
  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    // Profile exists, no action needed
    if (existingProfile && !fetchError) {
      return { success: true, created: false }
    }

    // Profile doesn't exist, create it
    const displayName = userEmail?.split('@')[0] || 'User'

    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        display_name: displayName,
        avatar_version: 1,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      // If error is "duplicate key" (profile was created by trigger between check and insert),
      // that's actually fine - the profile exists now
      if (insertError.code === '23505') {
        return { success: true, created: false }
      }

      throw insertError
    }

    return { success: true, created: true, profile: newProfile }
  } catch (error) {
    return {
      success: false,
      created: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
