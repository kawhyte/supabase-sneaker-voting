/**
 * DELETE /api/notifications-cleanup
 * Delete all test notifications for current user (for testing only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ message: 'All notifications deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
