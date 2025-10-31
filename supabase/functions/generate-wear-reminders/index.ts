/**
 * EDGE FUNCTION: generate-wear-reminders
 *
 * Purpose: Create notifications for items unworn for 30/60/90+ days
 * Schedule: cron('0 6 * * 1') - Weekly on Mondays at 6am UTC
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all users with wear reminders enabled
    const { data: users, error: usersError } = await supabase
      .from('notification_preferences')
      .select('user_id')
      .eq('wear_reminders_enabled', true)

    if (usersError) throw usersError

    let totalNotifications = 0

    for (const user of users || []) {
      // Get items unworn for 30+ days
      const { data: unwornItems, error: itemsError } = await supabase
        .from('sneakers')
        .select('id, brand, model, color, image_url, last_worn_date, category')
        .eq('user_id', user.user_id)
        .eq('status', 'owned')
        .or(`last_worn_date.is.null,last_worn_date.lt.${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}`)

      if (itemsError) continue

      if (!unwornItems || unwornItems.length === 0) continue

      // Calculate days unworn for each item
      const itemsWithDays = unwornItems.map(item => {
        const daysUnworn = item.last_worn_date
          ? Math.floor((Date.now() - new Date(item.last_worn_date).getTime()) / (24 * 60 * 60 * 1000))
          : 999 // Never worn

        return {
          ...item,
          daysUnworn,
          severity: daysUnworn >= 90 ? 'high' : daysUnworn >= 60 ? 'medium' : 'low'
        }
      })

      // Group by severity for bundling
      const groups = {
        high: itemsWithDays.filter(i => i.severity === 'high'),
        medium: itemsWithDays.filter(i => i.severity === 'medium'),
        low: itemsWithDays.filter(i => i.severity === 'low')
      }

      // Create bundled notifications for each severity level
      for (const [severity, items] of Object.entries(groups)) {
        if (items.length === 0) continue

        const daysThreshold = severity === 'high' ? 90 : severity === 'medium' ? 60 : 30

        await supabase
          .from('notifications')
          .insert({
            user_id: user.user_id,
            notification_type: 'wear_reminder',
            title: `${items.length} item${items.length > 1 ? 's' : ''} ${items.length > 1 ? 'haven\'t' : 'hasn\'t'} been worn in ${daysThreshold}+ days`,
            message: `Time to show some love to these pieces in your wardrobe!`,
            severity: severity as 'low' | 'medium' | 'high',
            metadata: {
              link_url: '/dashboard?tab=owned',
              action_label: 'View Items',
              group_key: `wear_reminder_${daysThreshold}days_${new Date().toISOString().split('T')[0]}`
            },
            is_bundled: true,
            bundled_count: items.length,
            snoozed_until: null
          })

        totalNotifications++
      }
    }

    console.log(`Created ${totalNotifications} wear reminder notifications`)

    return new Response(
      JSON.stringify({ success: true, notifications: totalNotifications }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Wear reminder error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
