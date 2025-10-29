/**
 * API Error Handler
 *
 * Standardizes error responses across all API routes with:
 * - Consistent error format
 * - Automatic error code mapping
 * - HTTP status code logic
 * - Logging integration
 * - CORS error handling
 */

import { logger } from './logger'

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'TIMEOUT'
  | 'DATABASE_ERROR'
  | 'STORAGE_ERROR'
  | 'INVALID_REQUEST'

export interface ApiErrorResponse {
  success: false
  error: {
    code: ErrorCode
    message: string
    details?: Record<string, any>
    requestId?: string
  }
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

class ApiErrorHandler {
  /**
   * Map HTTP status codes to error codes
   */
  private getErrorCode(statusCode: number): ErrorCode {
    switch (statusCode) {
      case 400:
        return 'VALIDATION_ERROR'
      case 401:
        return 'UNAUTHORIZED'
      case 403:
        return 'FORBIDDEN'
      case 404:
        return 'NOT_FOUND'
      case 409:
        return 'CONFLICT'
      case 429:
        return 'RATE_LIMITED'
      case 503:
        return 'SERVICE_UNAVAILABLE'
      case 504:
        return 'TIMEOUT'
      default:
        return 'INTERNAL_ERROR'
    }
  }

  /**
   * Map error to HTTP status code
   */
  private getStatusCode(code: ErrorCode): number {
    const statusMap: Record<ErrorCode, number> = {
      VALIDATION_ERROR: 400,
      NOT_FOUND: 404,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      CONFLICT: 409,
      RATE_LIMITED: 429,
      INTERNAL_ERROR: 500,
      SERVICE_UNAVAILABLE: 503,
      TIMEOUT: 504,
      DATABASE_ERROR: 500,
      STORAGE_ERROR: 500,
      INVALID_REQUEST: 400,
    }
    return statusMap[code]
  }

  /**
   * User-friendly error message
   */
  private getErrorMessage(code: ErrorCode): string {
    const messages: Record<ErrorCode, string> = {
      VALIDATION_ERROR: 'The provided data is invalid. Please check your input.',
      NOT_FOUND: 'The requested resource was not found.',
      UNAUTHORIZED: 'Authentication is required. Please log in.',
      FORBIDDEN: 'You do not have permission to access this resource.',
      CONFLICT: 'This resource already exists or there is a conflict.',
      RATE_LIMITED: 'Too many requests. Please try again later.',
      INTERNAL_ERROR: 'An unexpected error occurred. Please try again.',
      SERVICE_UNAVAILABLE: 'The service is temporarily unavailable. Please try again later.',
      TIMEOUT: 'The request took too long. Please try again.',
      DATABASE_ERROR: 'Database error. Please try again.',
      STORAGE_ERROR: 'File storage error. Please try again.',
      INVALID_REQUEST: 'Invalid request. Please check your input.',
    }
    return messages[code]
  }

  /**
   * Create error response
   */
  createErrorResponse(
    code: ErrorCode,
    customMessage?: string,
    details?: Record<string, any>,
    requestId?: string
  ): ApiErrorResponse {
    return {
      success: false,
      error: {
        code,
        message: customMessage || this.getErrorMessage(code),
        ...(details && { details }),
        ...(requestId && { requestId }),
      },
    }
  }

  /**
   * Handle error and return Response object
   */
  handleError(
    error: unknown,
    context?: {
      route?: string
      method?: string
      userId?: string
      requestId?: string
    }
  ): Response {
    let code: ErrorCode = 'INTERNAL_ERROR'
    let message: string | undefined
    let details: Record<string, any> | undefined
    let statusCode = 500

    // Determine error type and extract info
    if (error instanceof Error) {
      message = error.message

      // Check for specific error types
      if (error.message.includes('validation') || error.message.includes('Invalid')) {
        code = 'VALIDATION_ERROR'
        statusCode = 400
      } else if (error.message.includes('not found') || error.message.includes('Not found')) {
        code = 'NOT_FOUND'
        statusCode = 404
      } else if (error.message.includes('unauthorized') || error.message.includes('Unauthorized')) {
        code = 'UNAUTHORIZED'
        statusCode = 401
      } else if (error.message.includes('permission') || error.message.includes('Permission')) {
        code = 'FORBIDDEN'
        statusCode = 403
      } else if (
        error.message.includes('timeout') ||
        error.message.includes('Timeout') ||
        error.message.includes('timed out')
      ) {
        code = 'TIMEOUT'
        statusCode = 504
      } else if (error.message.includes('database') || error.message.includes('Database')) {
        code = 'DATABASE_ERROR'
        statusCode = 500
      }

      // Log error with context
      logger.error(error.message, error, {
        component: 'ApiErrorHandler',
        route: context?.route,
        method: context?.method,
        userId: context?.userId,
        requestId: context?.requestId,
      })
    } else if (typeof error === 'object' && error !== null) {
      message = (error as any).message || 'Unknown error'
      details = error as Record<string, any>

      logger.error(message || 'Unknown error', {
        component: 'ApiErrorHandler',
        error: details,
        route: context?.route,
        method: context?.method,
        userId: context?.userId,
        requestId: context?.requestId,
      })
    } else {
      message = String(error)
      logger.error(message, {
        component: 'ApiErrorHandler',
        route: context?.route,
        method: context?.method,
        userId: context?.userId,
        requestId: context?.requestId,
      })
    }

    const errorResponse = this.createErrorResponse(code, message, details, context?.requestId)

    return new Response(JSON.stringify(errorResponse), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * Validate request data against schema
   */
  validateRequired(data: Record<string, any>, requiredFields: string[]): string | null {
    for (const field of requiredFields) {
      if (!data[field]) {
        return `Missing required field: ${field}`
      }
    }
    return null
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(code: ErrorCode): boolean {
    const retryableCodes: ErrorCode[] = [
      'TIMEOUT',
      'SERVICE_UNAVAILABLE',
      'RATE_LIMITED',
      'DATABASE_ERROR',
      'STORAGE_ERROR',
    ]
    return retryableCodes.includes(code)
  }
}

export const apiErrorHandler = new ApiErrorHandler()
export default apiErrorHandler
