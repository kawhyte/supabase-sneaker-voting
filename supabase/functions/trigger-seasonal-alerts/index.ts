/**
 * EDGE FUNCTION: trigger-seasonal-alerts
 *
 * Purpose: Check if today is a season start date and trigger alerts
 * Schedule: cron('0 6 * * *') - Daily at 6am UTC
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const currentYear = new Date().getFullYear()

    // Get seasonal content where start_date matches today
    const { data: seasonalContent, error: contentError } = await supabase
      .from('seasonal_content')
      .select('*')
      .eq('is_active', true)

    if (contentError) throw contentError

    // Filter for today's date (compare month-day only)
    const todaysSeasons = seasonalContent?.filter((season) => {
      const seasonDate = season.start_date.substring(5) // Extract MM-DD
      const todayDate = today.substring(5)
      return seasonDate === todayDate
    })

    if (!todaysSeasons || todaysSeasons.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No seasonal alerts for today' }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // For each season, get all users who haven't dismissed it this year
    let totalNotificationsCreated = 0

    for (const season of todaysSeasons) {
      // Get all users
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id')

      if (usersError) throw usersError

      // Get users who have dismissed this season this year
      const { data: dismissed, error: dismissedError } = await supabase
        .from('user_dismissed_seasonal_alerts')
        .select('user_id')
        .eq('season', season.season)
        .eq('year', currentYear)

      if (dismissedError) throw dismissedError

      const dismissedUserIds = dismissed?.map((d) => d.user_id) || []

      // Get users to notify
      const usersToNotify =
        allUsers?.filter((u) => !dismissedUserIds.includes(u.id)) || []

      // Create notifications for eligible users
      for (const user of usersToNotify) {
        // Get user's wardrobe items matching seasonal suggestions
        const { data: wardrobeItems } = await supabase
          .from('items')
          .select('id, brand, model, category, color, image_url')
          .eq('user_id', user.id)
          .eq('status', 'owned')
          .in('category', season.suggested_categories || [])
          .limit(5)

        const suggestedItems = wardrobeItems || []

        // Build message with wardrobe suggestions
        let message = season.message
        if (suggestedItems.length > 0) {
          message += `\n\nYou have ${suggestedItems.length} items perfect for ${season.season}!`
        }

        // Create notification
        const { error: insertError } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            notification_type: 'seasonal_tip',
            title: season.title,
            message: message,
            severity: 'low',
            metadata: {
              season: season.season,
              suggested_items: suggestedItems,
              tips: season.suggested_tips
            }
          })

        if (insertError) {
          console.error(
            `Failed to create seasonal alert for user ${user.id}:`,
            insertError
          )
        } else {
          totalNotificationsCreated++
        }
      }

      console.log(
        `Created seasonal alerts for ${season.season} - ${usersToNotify.length} users`
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        seasons: todaysSeasons.map((s) => s.season),
        totalNotificationsCreated
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Seasonal alert error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
