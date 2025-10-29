import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Logger } from '@/lib/logger'
import { apiErrorHandler } from '@/lib/api-error-handler'
import { retryUtils } from '@/lib/retry-utils'
import { getCircuitBreaker } from '@/lib/circuit-breaker'
import { ApiEndpointType, getApiClientConfig } from '@/lib/api-client-config'

const logger = new Logger()

interface RouteParams {
  id: string
}

/**
 * Circuit breakers for outfit operations
 */
const outfitReadBreaker = getCircuitBreaker('outfit-read', {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 30000,
})

const outfitWriteBreaker = getCircuitBreaker('outfit-write', {
  failureThreshold: 4,
  successThreshold: 2,
  timeout: 45000,
})

/**
 * DELETE /api/outfits/:id
 * Archive or delete an outfit
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  const params = await context.params
  const requestId = Logger.generateRequestId()
  const config = getApiClientConfig(ApiEndpointType.WRITE)

  try {
    const supabase = await createClient()

    // Get user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized outfit delete attempt', {
        component: 'OutfitsDetailAPI',
        requestId,
        error: authError?.message,
      })
      return NextResponse.json(
        apiErrorHandler.createErrorResponse('UNAUTHORIZED', undefined, undefined, requestId),
        { status: 401 }
      )
    }

    const outfitId = params.id

    if (!outfitId) {
      logger.warn('Outfit ID required for delete', {
        component: 'OutfitsDetailAPI',
        requestId,
      })
      return NextResponse.json(
        apiErrorHandler.createErrorResponse('VALIDATION_ERROR', 'Outfit ID required', undefined, requestId),
        { status: 400 }
      )
    }

    // Verify outfit belongs to user with retry
    const outfit = await outfitReadBreaker.execute(async () => {
      return await retryUtils.retry(
        async () => {
          const { data, error } = await supabase
            .from('outfits')
            .select('id, user_id')
            .eq('id', outfitId)
            .single()

          if (error) throw error
          return data
        },
        'Fetch outfit for delete authorization',
        config.retryConfig
      )
    })

    if (!outfit) {
      logger.info('Outfit not found for delete', {
        component: 'OutfitsDetailAPI',
        requestId,
        outfitId,
      })
      return NextResponse.json(
        apiErrorHandler.createErrorResponse('NOT_FOUND', 'Outfit not found', undefined, requestId),
        { status: 404 }
      )
    }

    if (outfit.user_id !== user.id) {
      logger.warn('Unauthorized outfit delete attempt - ownership check', {
        component: 'OutfitsDetailAPI',
        requestId,
        outfitId,
        userId: user.id,
      })
      return NextResponse.json(
        apiErrorHandler.createErrorResponse('FORBIDDEN', undefined, undefined, requestId),
        { status: 403 }
      )
    }

    // Archive the outfit (soft delete) with retry
    await outfitWriteBreaker.execute(async () => {
      return await retryUtils.retry(
        async () => {
          const { error } = await supabase
            .from('outfits')
            .update({ is_archived: true })
            .eq('id', outfitId)

          if (error) throw error
          return true
        },
        'Archive outfit',
        config.retryConfig
      )
    })

    logger.info('Outfit archived successfully', {
      component: 'OutfitsDetailAPI',
      requestId,
      outfitId,
      userId: user.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Outfit delete error', error instanceof Error ? error : new Error(String(error)), {
      component: 'OutfitsDetailAPI',
      requestId,
      route: '/api/outfits/[id]',
      method: 'DELETE',
    })

    return apiErrorHandler.handleError(error, {
      route: '/api/outfits/[id]',
      method: 'DELETE',
      requestId,
    })
  }
}

/**
 * GET /api/outfits/:id
 * Fetch a specific outfit with its items
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  const params = await context.params
  const requestId = Logger.generateRequestId()
  const config = getApiClientConfig(ApiEndpointType.FAST_READ)

  try {
    const supabase = await createClient()

    // Get user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized outfit fetch attempt', {
        component: 'OutfitsDetailAPI',
        requestId,
        error: authError?.message,
      })
      return NextResponse.json(
        apiErrorHandler.createErrorResponse('UNAUTHORIZED', undefined, undefined, requestId),
        { status: 401 }
      )
    }

    const outfitId = params.id

    if (!outfitId) {
      logger.warn('Outfit ID required for fetch', {
        component: 'OutfitsDetailAPI',
        requestId,
      })
      return NextResponse.json(
        apiErrorHandler.createErrorResponse('VALIDATION_ERROR', 'Outfit ID required', undefined, requestId),
        { status: 400 }
      )
    }

    // Fetch outfit with items using retry
    const outfit = await outfitReadBreaker.execute(async () => {
      return await retryUtils.retry(
        async () => {
          const { data, error } = await supabase
            .from('outfits')
            .select(
              `*,
              outfit_items(
                *,
                item:items(*)
              )`
            )
            .eq('id', outfitId)
            .eq('user_id', user.id)
            .single()

          if (error) throw error
          return data
        },
        'Fetch outfit details',
        config.retryConfig
      )
    })

    if (!outfit) {
      logger.info('Outfit not found for fetch', {
        component: 'OutfitsDetailAPI',
        requestId,
        outfitId,
        userId: user.id,
      })
      return NextResponse.json(
        apiErrorHandler.createErrorResponse('NOT_FOUND', 'Outfit not found', undefined, requestId),
        { status: 404 }
      )
    }

    logger.info('Outfit fetched successfully', {
      component: 'OutfitsDetailAPI',
      requestId,
      outfitId,
      userId: user.id,
    })

    return NextResponse.json({ outfit })
  } catch (error) {
    logger.error('Outfit fetch error', error instanceof Error ? error : new Error(String(error)), {
      component: 'OutfitsDetailAPI',
      requestId,
      route: '/api/outfits/[id]',
      method: 'GET',
    })

    return apiErrorHandler.handleError(error, {
      route: '/api/outfits/[id]',
      method: 'GET',
      requestId,
    })
  }
}

/**
 * PUT /api/outfits/:id
 * Update outfit (mark as worn, update occasion, etc.)
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  const params = await context.params
  const requestId = Logger.generateRequestId()
  const config = getApiClientConfig(ApiEndpointType.WRITE)

  try {
    const supabase = await createClient()

    // Get user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized outfit update attempt', {
        component: 'OutfitsDetailAPI',
        requestId,
        error: authError?.message,
      })
      return NextResponse.json(
        apiErrorHandler.createErrorResponse('UNAUTHORIZED', undefined, undefined, requestId),
        { status: 401 }
      )
    }

    const outfitId = params.id

    if (!outfitId) {
      logger.warn('Outfit ID required for update', {
        component: 'OutfitsDetailAPI',
        requestId,
      })
      return NextResponse.json(
        apiErrorHandler.createErrorResponse('VALIDATION_ERROR', 'Outfit ID required', undefined, requestId),
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { times_worn, last_worn, date_worn, occasion, name } = body

    // Verify outfit belongs to user
    const outfit = await outfitReadBreaker.execute(async () => {
      return await retryUtils.retry(
        async () => {
          const { data, error } = await supabase
            .from('outfits')
            .select('id, user_id')
            .eq('id', outfitId)
            .single()

          if (error) throw error
          return data
        },
        'Fetch outfit for update authorization',
        config.retryConfig
      )
    })

    if (!outfit) {
      logger.info('Outfit not found for update', {
        component: 'OutfitsDetailAPI',
        requestId,
        outfitId,
      })
      return NextResponse.json(
        apiErrorHandler.createErrorResponse('NOT_FOUND', 'Outfit not found', undefined, requestId),
        { status: 404 }
      )
    }

    if (outfit.user_id !== user.id) {
      logger.warn('Unauthorized outfit update attempt - ownership check', {
        component: 'OutfitsDetailAPI',
        requestId,
        outfitId,
        userId: user.id,
      })
      return NextResponse.json(
        apiErrorHandler.createErrorResponse('FORBIDDEN', undefined, undefined, requestId),
        { status: 403 }
      )
    }

    // Build update object with proper typing
    interface OutfitUpdateData {
      times_worn?: number
      last_worn?: string | null
      date_worn?: string | null
      occasion?: string
      name?: string
    }

    const updateData: OutfitUpdateData = {}
    if (times_worn !== undefined) updateData.times_worn = times_worn
    if (last_worn !== undefined) updateData.last_worn = last_worn
    if (date_worn !== undefined) updateData.date_worn = date_worn
    if (occasion !== undefined) updateData.occasion = occasion
    if (name !== undefined) updateData.name = name

    // Update outfit with retry
    const updatedOutfit = await outfitWriteBreaker.execute(async () => {
      return await retryUtils.retry(
        async () => {
          const { data, error } = await supabase
            .from('outfits')
            .update(updateData)
            .eq('id', outfitId)
            .select(
              `*,
              outfit_items(
                *,
                item:items(*)
              )`
            )
            .single()

          if (error) throw error
          return data
        },
        'Update outfit',
        config.retryConfig
      )
    })

    logger.info('Outfit updated successfully', {
      component: 'OutfitsDetailAPI',
      requestId,
      outfitId,
      userId: user.id,
      updatedFields: Object.keys(updateData),
    })

    return NextResponse.json({ outfit: updatedOutfit })
  } catch (error) {
    logger.error('Outfit update error', error instanceof Error ? error : new Error(String(error)), {
      component: 'OutfitsDetailAPI',
      requestId,
      route: '/api/outfits/[id]',
      method: 'PUT',
    })

    return apiErrorHandler.handleError(error, {
      route: '/api/outfits/[id]',
      method: 'PUT',
      requestId,
    })
  }
}
