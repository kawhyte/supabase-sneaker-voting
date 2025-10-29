/**
 * Database Error Handler
 *
 * Maps PostgreSQL/Supabase errors to user-friendly messages:
 * - RLS policy violations
 * - Constraint violations
 * - Connection errors
 * - Transactional consistency issues
 */

import { logger } from './logger'

export interface DbError {
  code: string
  message: string
  details?: string
  hint?: string
  constraint?: string
}

export interface DbErrorInfo {
  userMessage: string
  isRetryable: boolean
  shouldLog: boolean
  context: Record<string, any>
}

class DbErrorHandler {
  /**
   * Parse Supabase error
   */
  parseSupabaseError(error: any): DbError {
    return {
      code: error.code || 'UNKNOWN',
      message: error.message || String(error),
      details: error.details,
      hint: error.hint,
      constraint: error.constraint,
    }
  }

  /**
   * Handle database error
   */
  handleDbError(error: any, context?: Record<string, any>): DbErrorInfo {
    const dbError = this.parseSupabaseError(error)

    logger.error(`Database error: ${dbError.code}`, {
      component: 'DbErrorHandler',
      code: dbError.code,
      message: dbError.message,
      details: dbError.details,
      hint: dbError.hint,
      ...context,
    })

    return this.mapErrorToResponse(dbError)
  }

  /**
   * Map PostgreSQL error codes to user messages
   */
  private mapErrorToResponse(error: DbError): DbErrorInfo {
    const code = error.code.toUpperCase()

    // RLS (Row Level Security) Violations
    if (code === '42501' || error.message.includes('RLS')) {
      return {
        userMessage: 'You do not have permission to access this data.',
        isRetryable: false,
        shouldLog: false,
        context: { type: 'RLS_VIOLATION', code },
      }
    }

    // NOT NULL Constraint
    if (code === '23502' || error.message.includes('NOT NULL')) {
      const field = this.extractFieldName(error.message)
      return {
        userMessage: `Required field is missing: ${field}. Please try again.`,
        isRetryable: false,
        shouldLog: true,
        context: { type: 'NOT_NULL', field },
      }
    }

    // UNIQUE Constraint
    if (code === '23505' || error.message.includes('unique')) {
      const field = this.extractFieldName(error.message)
      return {
        userMessage: `This ${field} already exists. Please use a different value.`,
        isRetryable: false,
        shouldLog: true,
        context: { type: 'UNIQUE', field },
      }
    }

    // Foreign Key Constraint
    if (code === '23503' || error.message.includes('foreign key')) {
      return {
        userMessage: 'Referenced item does not exist. Please check your input.',
        isRetryable: false,
        shouldLog: true,
        context: { type: 'FOREIGN_KEY' },
      }
    }

    // Check Constraint
    if (code === '23514' || error.message.includes('check constraint')) {
      return {
        userMessage: 'Invalid data provided. Please check your input.',
        isRetryable: false,
        shouldLog: true,
        context: { type: 'CHECK_CONSTRAINT' },
      }
    }

    // Connection Errors
    if (
      code === '08006' ||
      error.message.includes('Connection refused') ||
      error.message.includes('connection closed')
    ) {
      return {
        userMessage: 'Database connection failed. Please try again.',
        isRetryable: true,
        shouldLog: true,
        context: { type: 'CONNECTION_ERROR' },
      }
    }

    // Timeout
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      return {
        userMessage: 'The request took too long. Please try again.',
        isRetryable: true,
        shouldLog: true,
        context: { type: 'TIMEOUT' },
      }
    }

    // Too Many Connections
    if (code === '53300' || error.message.includes('too many connections')) {
      return {
        userMessage: 'The server is busy. Please try again in a moment.',
        isRetryable: true,
        shouldLog: true,
        context: { type: 'TOO_MANY_CONNECTIONS' },
      }
    }

    // Generic Database Error
    return {
      userMessage: 'A database error occurred. Please try again.',
      isRetryable: true,
      shouldLog: true,
      context: { type: 'GENERIC', code },
    }
  }

  /**
   * Extract field name from error message
   */
  private extractFieldName(message: string): string {
    // Try to find field name in quotes
    const match = message.match(/"([^"]+)"/)
    if (match) return match[1]

    // Try to find field name after "column"
    const columnMatch = message.match(/column[:\s]+"?([a-z_]+)"?/i)
    if (columnMatch) return columnMatch[1]

    return 'field'
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: any): boolean {
    const dbError = this.parseSupabaseError(error)
    const errorInfo = this.mapErrorToResponse(dbError)
    return errorInfo.isRetryable
  }

  /**
   * Check if error is RLS violation
   */
  isRlsViolation(error: any): boolean {
    const message = error.message || ''
    const code = error.code || ''
    return code === '42501' || message.includes('RLS')
  }

  /**
   * Check if error is validation error (constraint violation)
   */
  isValidationError(error: any): boolean {
    const code = (error.code || '').toUpperCase()
    return code.startsWith('235') // 235xx are constraint errors
  }

  /**
   * Check if error is connection error
   */
  isConnectionError(error: any): boolean {
    const message = error.message || ''
    const code = error.code || ''
    return (
      code === '08006' ||
      message.includes('Connection refused') ||
      message.includes('connection closed') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ENOTFOUND')
    )
  }
}

export const dbErrorHandler = new DbErrorHandler()
export default dbErrorHandler
