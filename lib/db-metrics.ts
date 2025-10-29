/**
 * Database Metrics Tracking
 *
 * Monitors database query performance and identifies slow queries
 */

import { logger } from './logger'

export interface QueryMetric {
  operationName: string
  durationMs: number
  rowsAffected?: number
  isSlowQuery: boolean
  timestamp: number
}

const SLOW_QUERY_THRESHOLD = 1000 // milliseconds

class DatabaseMetrics {
  private metrics: QueryMetric[] = []
  private maxMetrics = 100

  /**
   * Record a database query
   */
  recordQuery(
    operationName: string,
    durationMs: number,
    rowsAffected?: number
  ): void {
    const isSlowQuery = durationMs > SLOW_QUERY_THRESHOLD

    const metric: QueryMetric = {
      operationName,
      durationMs,
      rowsAffected,
      isSlowQuery,
      timestamp: Date.now(),
    }

    // Keep only latest metrics
    this.metrics.push(metric)
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log slow queries
    if (isSlowQuery) {
      logger.warn(`Slow query detected: ${operationName}`, {
        component: 'DatabaseMetrics',
        durationMs,
        rowsAffected,
      })
    }
  }

  /**
   * Get query statistics
   */
  getStats(operationName?: string): {
    avgDurationMs: number
    maxDurationMs: number
    slowQueryCount: number
    totalQueryCount: number
  } {
    let metrics = this.metrics

    if (operationName) {
      metrics = metrics.filter(m => m.operationName === operationName)
    }

    if (metrics.length === 0) {
      return {
        avgDurationMs: 0,
        maxDurationMs: 0,
        slowQueryCount: 0,
        totalQueryCount: 0,
      }
    }

    const durations = metrics.map(m => m.durationMs)
    const avgDurationMs = durations.reduce((a, b) => a + b, 0) / durations.length
    const maxDurationMs = Math.max(...durations)
    const slowQueryCount = metrics.filter(m => m.isSlowQuery).length

    return {
      avgDurationMs: Math.round(avgDurationMs),
      maxDurationMs,
      slowQueryCount,
      totalQueryCount: metrics.length,
    }
  }

  /**
   * Get slowest operations
   */
  getSlowestOperations(limit = 10): QueryMetric[] {
    return this.metrics
      .sort((a, b) => b.durationMs - a.durationMs)
      .slice(0, limit)
  }

  /**
   * Get metrics report
   */
  getReport(): string {
    const operations = new Map<string, QueryMetric[]>()

    for (const metric of this.metrics) {
      if (!operations.has(metric.operationName)) {
        operations.set(metric.operationName, [])
      }
      operations.get(metric.operationName)!.push(metric)
    }

    let report = 'DATABASE METRICS REPORT\n'
    report += '='.repeat(50) + '\n\n'

    for (const [opName, operationMetrics] of Array.from(operations.entries())) {
      const durations = operationMetrics.map((m: QueryMetric) => m.durationMs)
      const avg = durations.reduce((a: number, b: number) => a + b, 0) / durations.length
      const max = Math.max(...durations)
      const slowCount = operationMetrics.filter((m: QueryMetric) => m.isSlowQuery).length

      report += `Operation: ${opName}\n`
      report += `  Average: ${avg.toFixed(2)}ms\n`
      report += `  Max: ${max}ms\n`
      report += `  Slow Queries: ${slowCount}/${operationMetrics.length}\n`
      report += `  Last Query: ${new Date(operationMetrics[operationMetrics.length - 1].timestamp).toISOString()}\n`
      report += '\n'
    }

    return report
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = []
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): QueryMetric[] {
    return [...this.metrics]
  }
}

export const dbMetrics = new DatabaseMetrics()
export default dbMetrics
