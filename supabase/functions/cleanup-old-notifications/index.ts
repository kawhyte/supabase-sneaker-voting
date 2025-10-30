/**
 * EDGE FUNCTION: cleanup-old-notifications
 *
 * Purpose: Delete expired notifications (runs daily at 2am UTC)
 * Schedule: cron('0 2 * * *')
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const now = new Date().toISOString()

    // Delete notifications where expiry_at < now()
    const { data, error, count } = await supabase
      .from('notifications')
      .delete()
      .lt('expiry_at', now)
      .select('id', { count: 'exact', head: true })

    if (error) throw error

    console.log(`Cleaned up ${count} expired notifications`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cleanup completed',
        deletedCount: count
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Cleanup error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
