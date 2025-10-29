/**
 * Circuit Breaker Pattern
 *
 * Prevents cascading failures by monitoring for consecutive errors and
 * temporarily stopping requests when failure rate exceeds threshold.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Failure threshold reached, requests immediately fail
 * - HALF_OPEN: Testing recovery, allowing limited requests
 */

import { logger } from './logger'

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerConfig {
  failureThreshold?: number // Consecutive failures before opening (default: 5)
  successThreshold?: number // Successes to close circuit (default: 2)
  timeout?: number // Time (ms) before half-open (default: 30s)
}

export interface CircuitBreakerStatus {
  state: CircuitState
  failures: number
  successes: number
  lastFailureTime: number | null
  nextRetryTime: number | null
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failures: number = 0
  private successes: number = 0
  private lastFailureTime: number | null = null
  private nextRetryTime: number | null = null

  private readonly failureThreshold: number
  private readonly successThreshold: number
  private readonly timeout: number
  private readonly name: string

  constructor(name: string, config?: CircuitBreakerConfig) {
    this.name = name
    this.failureThreshold = config?.failureThreshold || 5
    this.successThreshold = config?.successThreshold || 2
    this.timeout = config?.timeout || 30000 // 30 seconds

    logger.info(`CircuitBreaker initialized: ${name}`, {
      component: 'CircuitBreaker',
      failureThreshold: this.failureThreshold,
      successThreshold: this.successThreshold,
      timeout: this.timeout,
    })
  }

  /**
   * Check if request should be allowed
   */
  canExecute(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return true
    }

    if (this.state === CircuitState.OPEN) {
      // Check if timeout elapsed
      if (this.nextRetryTime && Date.now() >= this.nextRetryTime) {
        this.setState(CircuitState.HALF_OPEN)
        this.successes = 0
        logger.info(`CircuitBreaker ${this.name} transitioning to HALF_OPEN`, {
          component: 'CircuitBreaker',
        })
        return true
      }
      return false
    }

    // HALF_OPEN: allow requests
    return true
  }

  /**
   * Record successful execution
   */
  recordSuccess(): void {
    this.failures = 0
    this.lastFailureTime = null

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++
      logger.info(`CircuitBreaker ${this.name} success in HALF_OPEN (${this.successes}/${this.successThreshold})`, {
        component: 'CircuitBreaker',
        successes: this.successes,
      })

      if (this.successes >= this.successThreshold) {
        this.reset()
      }
    }
  }

  /**
   * Record failed execution
   */
  recordFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()

    logger.warn(`CircuitBreaker ${this.name} failure (${this.failures}/${this.failureThreshold})`, {
      component: 'CircuitBreaker',
      failures: this.failures,
    })

    if (this.state === CircuitState.HALF_OPEN) {
      // Failure in HALF_OPEN state resets circuit to OPEN
      this.open()
      return
    }

    if (this.failures >= this.failureThreshold) {
      this.open()
    }
  }

  /**
   * Open the circuit (stop requests)
   */
  private open(): void {
    if (this.state !== CircuitState.OPEN) {
      this.setState(CircuitState.OPEN)
      this.nextRetryTime = Date.now() + this.timeout

      logger.error(`CircuitBreaker ${this.name} opened after ${this.failures} failures`, {
        component: 'CircuitBreaker',
        failures: this.failures,
        retryAfterMs: this.timeout,
      })
    }
  }

  /**
   * Reset the circuit (normal operation)
   */
  private reset(): void {
    this.setState(CircuitState.CLOSED)
    this.failures = 0
    this.successes = 0
    this.lastFailureTime = null
    this.nextRetryTime = null

    logger.info(`CircuitBreaker ${this.name} reset to CLOSED`, {
      component: 'CircuitBreaker',
    })
  }

  /**
   * Manually close the circuit
   */
  close(): void {
    this.reset()
  }

  /**
   * Set circuit state
   */
  private setState(newState: CircuitState): void {
    if (newState !== this.state) {
      logger.info(`CircuitBreaker ${this.name}: ${this.state} → ${newState}`, {
        component: 'CircuitBreaker',
      })
      this.state = newState
    }
  }

  /**
   * Get current status
   */
  getStatus(): CircuitBreakerStatus {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      nextRetryTime: this.nextRetryTime,
    }
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canExecute()) {
      throw new Error(
        `CircuitBreaker ${this.name} is OPEN. Retrying in ${
          (this.nextRetryTime || 0) - Date.now()
        }ms`
      )
    }

    try {
      const result = await fn()
      this.recordSuccess()
      return result
    } catch (error) {
      this.recordFailure()
      throw error
    }
  }
}

// Global circuit breaker registry
const circuitBreakers = new Map<string, CircuitBreaker>()

/**
 * Get or create circuit breaker
 */
export function getCircuitBreaker(
  name: string,
  config?: CircuitBreakerConfig
): CircuitBreaker {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, new CircuitBreaker(name, config))
  }
  return circuitBreakers.get(name)!
}

/**
 * Reset all circuit breakers
 */
export function resetAllCircuitBreakers(): void {
  for (const breaker of Array.from(circuitBreakers.values())) {
    breaker.close()
  }
  logger.info('All circuit breakers reset', { component: 'CircuitBreaker' })
}

/**
 * Get all circuit breaker statuses
 */
export function getAllCircuitBreakerStatuses(): Record<string, CircuitBreakerStatus> {
  const statuses: Record<string, CircuitBreakerStatus> = {}
  for (const [name, breaker] of Array.from(circuitBreakers.entries())) {
    statuses[name] = breaker.getStatus()
  }
  return statuses
}

export default getCircuitBreaker
