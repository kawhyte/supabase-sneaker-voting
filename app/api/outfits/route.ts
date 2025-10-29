import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Logger } from '@/lib/logger'
import { apiErrorHandler } from '@/lib/api-error-handler'
import { dbErrorHandler } from '@/lib/db-error-handler'
import { retryUtils } from '@/lib/retry-utils'
import { getCircuitBreaker } from '@/lib/circuit-breaker'
import { ApiEndpointType, getApiClientConfig } from '@/lib/api-client-config'

const logger = new Logger()

/**
 * Circuit breaker for outfit creation (write operation)
 */
const outfitCreateBreaker = getCircuitBreaker('outfit-create', {
  failureThreshold: 4,
  successThreshold: 2,
  timeout: 45000,
})

/**
 * POST /api/outfits
 * Save a new outfit with items to the database
 */
export async function POST(request: NextRequest) {
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
      logger.warn('Unauthorized outfit creation attempt', {
        component: 'OutfitsAPI',
        requestId,
        error: authError?.message,
      })
      return NextResponse.json(
        apiErrorHandler.createErrorResponse('UNAUTHORIZED', undefined, undefined, requestId),
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      name,
      description,
      occasion,
      background_color,
      outfit_items,
    } = body

    // Validate required fields
    const validationError = apiErrorHandler.validateRequired(
      { name, outfit_items },
      ['name', 'outfit_items']
    )
    if (validationError || !Array.isArray(outfit_items) || outfit_items.length === 0) {
      logger.warn('Invalid outfit creation request', {
        component: 'OutfitsAPI',
        requestId,
        error: validationError || 'Items required',
      })
      return NextResponse.json(
        apiErrorHandler.createErrorResponse('VALIDATION_ERROR', 'Outfit name and at least one item required', undefined, requestId),
        { status: 400 }
      )
    }

    // Create outfit with retry and circuit breaker
    const outfit = await outfitCreateBreaker.execute(async () => {
      return await retryUtils.retry(
        async () => {
          const { data, error } = await supabase
            .from('outfits')
            .insert({
              user_id: user.id,
              name: name.trim(),
              description: description?.trim() || null,
              occasion: occasion || 'casual',
              background_color: background_color || '#FFFFFF',
            })
            .select()
            .single()

          if (error) throw error
          return data
        },
        'Create outfit',
        config.retryConfig
      )
    })

    // Create outfit items with proper typing
    interface OutfitItemRequest {
      item_id: string
      position_x?: number
      position_y?: number
      z_index?: number
      display_width?: number
      display_height?: number
      crop_x?: number | null
      crop_y?: number | null
      crop_width?: number | null
      crop_height?: number | null
      cropped_image_url?: string | null
    }

    const outfitItemsData = (outfit_items as OutfitItemRequest[]).map(
      (item: OutfitItemRequest, index: number) => ({
        outfit_id: outfit.id,
        item_id: item.item_id,
        position_x: item.position_x || 0.5,
        position_y: item.position_y || 0.5,
        z_index: item.z_index || 0,
        display_width: item.display_width || 0.3,
        display_height: item.display_height || 0.3,
        item_order: index,
        crop_x: item.crop_x || null,
        crop_y: item.crop_y || null,
        crop_width: item.crop_width || null,
        crop_height: item.crop_height || null,
        cropped_image_url: item.cropped_image_url || null,
      })
    )

    const createdItems = await outfitCreateBreaker.execute(async () => {
      return await retryUtils.retry(
        async () => {
          const { data, error } = await supabase
            .from('outfit_items')
            .insert(outfitItemsData)
            .select()

          if (error) throw error
          return data
        },
        'Create outfit items',
        config.retryConfig
      )
    })

    logger.info('Outfit created successfully', {
      component: 'OutfitsAPI',
      requestId,
      userId: user.id,
      outfitId: outfit.id,
      itemCount: createdItems?.length || 0,
    })

    // Return created outfit with items
    return NextResponse.json({
      outfit,
      outfit_items: createdItems,
    })
  } catch (error) {
    logger.error('Outfit creation error', error instanceof Error ? error : new Error(String(error)), {
      component: 'OutfitsAPI',
      requestId,
      route: '/api/outfits',
      method: 'POST',
    })

    return apiErrorHandler.handleError(error, {
      route: '/api/outfits',
      method: 'POST',
      requestId,
    })
  }
}

/**
 * Circuit breaker for outfit reads (fast read operation)
 */
const outfitReadBreaker = getCircuitBreaker('outfit-read', {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 30000,
})

/**
 * GET /api/outfits
 * Fetch user's outfits
 */
export async function GET(request: NextRequest) {
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
        component: 'OutfitsAPI',
        requestId,
        error: authError?.message,
      })
      return NextResponse.json(
        apiErrorHandler.createErrorResponse('UNAUTHORIZED', undefined, undefined, requestId),
        { status: 401 }
      )
    }

    // Fetch user's outfits with items and item photos using retry and circuit breaker
    const outfits = await outfitReadBreaker.execute(async () => {
      return await retryUtils.retry(
        async () => {
          const { data, error } = await supabase
            .from('outfits')
            .select(
              `*,
              outfit_items(
                *,
                item:items(
                  *,
                  item_photos(*)
                )
              )`
            )
            .eq('user_id', user.id)
            .eq('is_archived', false)
            .order('created_at', { ascending: false })

          if (error) throw error
          return data
        },
        'Fetch outfits',
        config.retryConfig
      )
    })

    logger.info('Outfits fetched successfully', {
      component: 'OutfitsAPI',
      requestId,
      userId: user.id,
      count: outfits?.length || 0,
    })

    return NextResponse.json({ outfits })
  } catch (error) {
    logger.error('Outfit fetch error', error instanceof Error ? error : new Error(String(error)), {
      component: 'OutfitsAPI',
      requestId,
      route: '/api/outfits',
      method: 'GET',
    })

    return apiErrorHandler.handleError(error, {
      route: '/api/outfits',
      method: 'GET',
      requestId,
    })
  }
}
