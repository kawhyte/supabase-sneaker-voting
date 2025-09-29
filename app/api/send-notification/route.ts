import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

// Configure web-push (you'll need to set these environment variables)
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9YFiNXlnJFGP1-JM8vRyGgbMQwqQ6L1-8KK4VvwWKKhH8R_a7j9k',
  process.env.VAPID_PRIVATE_KEY || 'placeholder-private-key'
)

export async function POST(request: NextRequest) {
  try {
    const {
      subscription,
      title,
      body,
      icon,
      badge,
      image,
      url,
      data
    } = await request.json()

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { success: false, error: 'Invalid push subscription' },
        { status: 400 }
      )
    }

    const payload = JSON.stringify({
      title: title || 'SoleTracker Price Alert',
      body: body || 'A monitored item has reached your target price!',
      icon: icon || '/icon-192x192.png',
      badge: badge || '/icon-192x192.png',
      image: image,
      url: url || '/dashboard',
      tag: 'price-alert',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Product',
          icon: '/icons/view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss.png'
        }
      ],
      data: {
        url: url || '/dashboard',
        timestamp: Date.now(),
        ...data
      }
    })

    const result = await webpush.sendNotification(subscription, payload)

    console.log('Push notification sent successfully:', {
      statusCode: result.statusCode,
      headers: result.headers
    })

    return NextResponse.json({
      success: true,
      message: 'Push notification sent successfully'
    })

  } catch (error) {
    console.error('Failed to send push notification:', error)

    // Handle specific web-push errors
    if (error.statusCode === 410 || error.statusCode === 413) {
      // Subscription is no longer valid, should be removed from database
      return NextResponse.json({
        success: false,
        error: 'Subscription expired or invalid',
        shouldRemoveSubscription: true
      }, { status: 410 })
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send notification'
      },
      { status: 500 }
    )
  }
}

// Test endpoint for sending sample notifications
export async function GET() {
  return NextResponse.json({
    message: 'Send Notification API is ready',
    vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9YFiNXlnJFGP1-JM8vRyGgbMQwqQ6L1-8KK4VvwWKKhH8R_a7j9k'
  })
}