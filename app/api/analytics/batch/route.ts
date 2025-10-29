/**
 * POST /api/analytics/batch
 * Receive and store batched analytics events
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { Logger } from '@/lib/logger'
import { apiErrorHandler } from '@/lib/api-error-handler'

const logger = new Logger()

interface AnalyticsEvent {
  event: string
  data: Record<string, any>
}

interface BatchRequest {
  events: AnalyticsEvent[]
}

export async function POST(request: NextRequest) {
  const requestId = Logger.generateRequestId()

  try {
    // Parse request
    const body: BatchRequest = await request.json()

    if (!Array.isArray(body.events) || body.events.length === 0) {
      logger.warn('Invalid analytics batch request', {
        component: 'AnalyticsAPI',
        requestId,
        eventCount: body.events?.length || 0,
      })
      return NextResponse.json(
        apiErrorHandler.createErrorResponse(
          'VALIDATION_ERROR',
          'Events array required and must not be empty',
          undefined,
          requestId
        ),
        { status: 400 }
      )
    }

    // Get user session (optional for analytics)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Validate event count (prevent abuse)
    if (body.events.length > 100) {
      logger.warn('Analytics batch too large', {
        component: 'AnalyticsAPI',
        requestId,
        eventCount: body.events.length,
      })
      return NextResponse.json(
        apiErrorHandler.createErrorResponse(
          'VALIDATION_ERROR',
          'Maximum 100 events per batch',
          undefined,
          requestId
        ),
        { status: 400 }
      )
    }

    // Store events in analytics table if exists
    // For now, just log them
    logger.info('Analytics batch received', {
      component: 'AnalyticsAPI',
      requestId,
      userId: user?.id,
      eventCount: body.events.length,
      events: body.events.slice(0, 5).map(e => e.event), // Log first 5 event types
    })

    // Return success
    return NextResponse.json(
      {
        success: true,
        processed: body.events.length,
        requestId,
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Analytics batch error', error instanceof Error ? error : new Error(String(error)), {
      component: 'AnalyticsAPI',
      requestId,
      route: '/api/analytics/batch',
      method: 'POST',
    })

    return apiErrorHandler.handleError(error, {
      route: '/api/analytics/batch',
      method: 'POST',
      requestId,
    })
  }
}
