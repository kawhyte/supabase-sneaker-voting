import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkAchievements } from '@/lib/achievement-checker'

/**
 * POST /api/check-achievements
 * Check if user has unlocked any new achievements
 * Called after significant user actions (add item, create outfit, mark worn, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check for new achievements
    await checkAchievements(user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error checking achievements:', error)
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    )
  }
}
