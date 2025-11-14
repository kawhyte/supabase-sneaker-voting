/**
 * GET /api/user-preferences - Get user's notification preferences
 * POST /api/user-preferences - Initialize default preferences for user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!data) {
      return NextResponse.json({ error: 'Preferences not found' }, { status: 404 })
    }

    return NextResponse.json({ preferences: data })
  } catch (error: any) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create default preferences for user
    const { data, error } = await supabase
      .from('notification_preferences')
      .insert({
        user_id: user.id,
        enable_in_app: true,
        enable_push: false,
        enable_email: false,
        price_alerts_enabled: true,
        wear_reminders_enabled: true,
        seasonal_tips_enabled: true,
        achievements_enabled: true,
        outfit_suggestions_enabled: true,
        enable_bundling: true,
        bundle_threshold: 3,
        max_daily_notifications: 20
      })
      .select()
      .single()

    if (error) {
      // If already exists, just return success
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Preferences already exist' })
      }
      throw error
    }

    return NextResponse.json({ preferences: data })
  } catch (error: any) {
    console.error('Error creating preferences:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
