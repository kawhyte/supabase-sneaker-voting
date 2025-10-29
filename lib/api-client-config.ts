/**
 * API Client Configuration
 *
 * Defines timeout tiers and retry strategies for different endpoint types:
 * - Fast reads: 5s timeout, 3 retries
 * - Writes: 10s timeout, 2 retries
 * - File uploads: 30s timeout, 1 retry
 * - Background jobs: 60s timeout, 0 retries
 */

export enum ApiEndpointType {
  FAST_READ = 'fast_read',      // 5s - GET /api/items, /api/outfits
  WRITE = 'write',              // 10s - POST/PUT /api/items, /api/outfits
  FILE_UPLOAD = 'file_upload',  // 30s - Cloudinary uploads
  BACKGROUND_JOB = 'background_job', // 60s - Edge functions, scheduled tasks
}

export interface ApiClientConfig {
  timeoutMs: number
  retryConfig: {
    maxRetries: number
    initialDelayMs: number
    maxDelayMs: number
    backoffMultiplier: number
  }
  circuitBreakerConfig: {
    failureThreshold: number
    successThreshold: number
    timeout: number
  }
}

/**
 * Timeout configurations by endpoint type
 */
const timeoutConfigs: Record<ApiEndpointType, ApiClientConfig> = {
  [ApiEndpointType.FAST_READ]: {
    timeoutMs: 5000,
    retryConfig: {
      maxRetries: 3,
      initialDelayMs: 100,
      maxDelayMs: 2000,
      backoffMultiplier: 2,
    },
    circuitBreakerConfig: {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 30000,
    },
  },

  [ApiEndpointType.WRITE]: {
    timeoutMs: 10000,
    retryConfig: {
      maxRetries: 2,
      initialDelayMs: 200,
      maxDelayMs: 3000,
      backoffMultiplier: 2,
    },
    circuitBreakerConfig: {
      failureThreshold: 4,
      successThreshold: 2,
      timeout: 45000,
    },
  },

  [ApiEndpointType.FILE_UPLOAD]: {
    timeoutMs: 30000,
    retryConfig: {
      maxRetries: 1,
      initialDelayMs: 500,
      maxDelayMs: 5000,
      backoffMultiplier: 2,
    },
    circuitBreakerConfig: {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 60000,
    },
  },

  [ApiEndpointType.BACKGROUND_JOB]: {
    timeoutMs: 60000,
    retryConfig: {
      maxRetries: 0,
      initialDelayMs: 0,
      maxDelayMs: 0,
      backoffMultiplier: 1,
    },
    circuitBreakerConfig: {
      failureThreshold: 2,
      successThreshold: 1,
      timeout: 120000,
    },
  },
}

/**
 * Get API client config by endpoint type
 */
export function getApiClientConfig(type: ApiEndpointType): ApiClientConfig {
  return timeoutConfigs[type]
}

/**
 * Get timeout for endpoint type
 */
export function getTimeoutMs(type: ApiEndpointType): number {
  return getApiClientConfig(type).timeoutMs
}

/**
 * Common endpoint mappings (for convenience)
 */
export const ApiEndpointMap: Record<string, ApiEndpointType> = {
  // Reads
  'GET /api/items': ApiEndpointType.FAST_READ,
  'GET /api/items/[id]': ApiEndpointType.FAST_READ,
  'GET /api/outfits': ApiEndpointType.FAST_READ,
  'GET /api/outfits/[id]': ApiEndpointType.FAST_READ,
  'GET /api/brands': ApiEndpointType.FAST_READ,
  'GET /api/brands/[id]': ApiEndpointType.FAST_READ,
  'GET /api/user/preferences': ApiEndpointType.FAST_READ,

  // Writes
  'POST /api/items': ApiEndpointType.WRITE,
  'PUT /api/items/[id]': ApiEndpointType.WRITE,
  'DELETE /api/items/[id]': ApiEndpointType.WRITE,
  'POST /api/outfits': ApiEndpointType.WRITE,
  'PUT /api/outfits/[id]': ApiEndpointType.WRITE,
  'DELETE /api/outfits/[id]': ApiEndpointType.WRITE,

  // File uploads
  'POST /api/upload': ApiEndpointType.FILE_UPLOAD,
  'POST /api/upload/bulk': ApiEndpointType.FILE_UPLOAD,

  // Background jobs (Edge Functions)
  'POST /api/price-check': ApiEndpointType.BACKGROUND_JOB,
  'POST /api/analytics/track': ApiEndpointType.BACKGROUND_JOB,
}

/**
 * Get endpoint type by route
 */
export function getEndpointTypeByRoute(route: string): ApiEndpointType {
  return ApiEndpointMap[route] || ApiEndpointType.WRITE
}

export default getApiClientConfig
