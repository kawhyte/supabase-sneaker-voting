import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const { subscription, user_name, action } = body

    if (!subscription || !user_name) {
      return NextResponse.json(
        { success: false, error: 'Missing subscription or user_name' },
        { status: 400 }
      )
    }

    if (action === 'subscribe') {
      // Store/update push subscription in database
      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_name,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          created_at: new Date().toISOString(),
          is_active: true
        }, {
          onConflict: 'user_name,endpoint'
        })
        .select()

      if (error) {
        throw new Error(error.message)
      }

      return NextResponse.json({
        success: true,
        message: 'Push subscription stored successfully',
        data
      })

    } else if (action === 'unsubscribe') {
      // Remove or deactivate push subscription
      const { error } = await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('user_name', user_name)
        .eq('endpoint', subscription.endpoint)

      if (error) {
        throw new Error(error.message)
      }

      return NextResponse.json({
        success: true,
        message: 'Push subscription deactivated successfully'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Failed to manage push subscription:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to manage push subscription' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const user_name = searchParams.get('user_name')

  if (!user_name) {
    return NextResponse.json(
      { success: false, error: 'user_name parameter required' },
      { status: 400 }
    )
  }

  try {
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_name', user_name)
      .eq('is_active', true)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions || []
    })

  } catch (error) {
    console.error('Failed to get push subscriptions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get push subscriptions' },
      { status: 500 }
    )
  }
}