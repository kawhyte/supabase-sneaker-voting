/**
 * Retry Utilities
 *
 * Provides exponential backoff retry logic for handling transient failures:
 * - Network timeouts
 * - 5xx server errors
 * - Rate limit errors (429)
 * - Transient database errors
 */

import { logger } from './logger'

export interface RetryConfig {
  maxRetries?: number // default: 3
  initialDelayMs?: number // default: 100
  maxDelayMs?: number // default: 5000
  backoffMultiplier?: number // default: 2 (exponential)
  jitter?: boolean // default: true (prevent thundering herd)
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: Error
  attempts: number
  totalDurationMs: number
}

class RetryUtils {
  /**
   * Check if error is retryable
   */
  isRetryable(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      const code = (error as any).code

      // Network errors (retryable)
      if (
        message.includes('timeout') ||
        message.includes('timed out') ||
        message.includes('econnrefused') ||
        message.includes('enotfound') ||
        message.includes('socket hang up') ||
        message.includes('connection refused') ||
        message.includes('connection reset')
      ) {
        return true
      }

      // Rate limit (retryable)
      if (code === 429 || message.includes('rate limit')) {
        return true
      }

      // Server errors (retryable)
      if (code && (code >= 500 || code < 100)) {
        return true
      }

      // Database transient errors (retryable)
      if (
        message.includes('database') ||
        message.includes('connection') ||
        message.includes('unavailable') ||
        message.includes('temporarily') ||
        code === '08006' || // Postgres connection lost
        code === '57P03'    // Cannot execute queries during recovery
      ) {
        return true
      }
    }

    return false
  }

  /**
   * Calculate delay with exponential backoff + jitter
   */
  private calculateDelay(
    attempt: number,
    initialDelayMs: number,
    maxDelayMs: number,
    backoffMultiplier: number,
    jitter: boolean
  ): number {
    // Exponential backoff: initialDelay * (multiplier ^ (attempt - 1))
    let delay = initialDelayMs * Math.pow(backoffMultiplier, attempt - 1)

    // Cap at max delay
    delay = Math.min(delay, maxDelayMs)

    // Add jitter (random 0-10% variation)
    if (jitter) {
      const jitterAmount = delay * (Math.random() * 0.1)
      delay += jitterAmount
    }

    return Math.round(delay)
  }

  /**
   * Retry with exponential backoff
   */
  async retryWithBackoff<T>(
    fn: () => Promise<T>,
    operationName: string = 'operation',
    config?: RetryConfig
  ): Promise<RetryResult<T>> {
    const {
      maxRetries = 3,
      initialDelayMs = 100,
      maxDelayMs = 5000,
      backoffMultiplier = 2,
      jitter = true,
    } = config || {}

    const startTime = performance.now()
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        const data = await fn()
        const duration = Math.round(performance.now() - startTime)

        if (attempt > 1) {
          logger.info(`${operationName} succeeded after ${attempt - 1} retries`, {
            component: 'RetryUtils',
            attempts: attempt,
            durationMs: duration,
          })
        }

        return {
          success: true,
          data,
          attempts: attempt,
          totalDurationMs: duration,
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // Check if error is retryable
        if (!this.isRetryable(error)) {
          logger.error(`${operationName} failed with non-retryable error`, lastError, {
            component: 'RetryUtils',
            attempts: attempt,
            operationName,
          })

          const duration = Math.round(performance.now() - startTime)
          return {
            success: false,
            error: lastError,
            attempts: attempt,
            totalDurationMs: duration,
          }
        }

        // If we've exhausted retries, return error
        if (attempt > maxRetries) {
          const duration = Math.round(performance.now() - startTime)
          logger.error(`${operationName} failed after ${maxRetries} retries`, lastError, {
            component: 'RetryUtils',
            attempts: attempt,
            durationMs: duration,
            operationName,
          })

          return {
            success: false,
            error: lastError,
            attempts: attempt,
            totalDurationMs: duration,
          }
        }

        // Calculate delay before retry
        const delay = this.calculateDelay(
          attempt,
          initialDelayMs,
          maxDelayMs,
          backoffMultiplier,
          jitter
        )

        logger.warn(
          `${operationName} failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`,
          {
            component: 'RetryUtils',
            attempt,
            maxRetries,
            delay,
            error: lastError.message,
          }
        )

        // Wait before retry
        await this.sleep(delay)
      }
    }

    // Should never reach here, but handle just in case
    const duration = Math.round(performance.now() - startTime)
    return {
      success: false,
      error: lastError || new Error('Unknown error'),
      attempts: maxRetries + 1,
      totalDurationMs: duration,
    }
  }

  /**
   * Retry with exponential backoff (throws on failure)
   */
  async retry<T>(
    fn: () => Promise<T>,
    operationName: string = 'operation',
    config?: RetryConfig
  ): Promise<T> {
    const result = await this.retryWithBackoff(fn, operationName, config)

    if (!result.success) {
      throw result.error
    }

    return result.data as T
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Retry with timeout
   */
  async retryWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    operationName: string = 'operation',
    retryConfig?: RetryConfig
  ): Promise<T> {
    return Promise.race([
      this.retry(fn, operationName, retryConfig),
      this.sleep(timeoutMs).then(() => {
        throw new Error(`${operationName} timed out after ${timeoutMs}ms`)
      }),
    ])
  }
}

export const retryUtils = new RetryUtils()
export default retryUtils
