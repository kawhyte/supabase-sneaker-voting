/**
 * Performance Monitor - Production-grade metrics collection
 *
 * Measures:
 * - Canvas drag lag
 * - Crop tool responsiveness
 * - Image load times
 * - Component render times
 *
 * API:
 * const startTime = perfMonitor.start('canvas-drag')
 * // ... do work ...
 * const duration = perfMonitor.end('canvas-drag', startTime)
 *
 * Success Criteria:
 * - Auto-measures common patterns
 * - Provides stats (avg, p95, p99, min, max)
 * - Exports JSON for analytics
 * - Console summaries for debugging
 * - Silent collection (no auto-warnings in production)
 */

interface Measurement {
  duration: number
  timestamp: number
}

interface PerformanceStats {
  count: number
  avg: string
  p95: string
  p99: string
  min: string
  max: string
}

class PerformanceMonitor {
  private measurements: Map<string, Measurement[]> = new Map()

  /**
   * Start measuring
   * @returns Current timestamp for use with end()
   */
  start(label: string): number {
    if (!this.measurements.has(label)) {
      this.measurements.set(label, [])
    }
    return performance.now()
  }

  /**
   * End measurement
   * @returns Duration in milliseconds
   */
  end(label: string, startTime?: number): number {
    const duration = startTime ? performance.now() - startTime : 0

    const measurements = this.measurements.get(label) || []
    measurements.push({ duration, timestamp: Date.now() })
    this.measurements.set(label, measurements)

    return duration
  }

  /**
   * Get statistics for a measurement label
   */
  getStats(label: string): PerformanceStats | null {
    const measurements = this.measurements.get(label)
    if (!measurements || measurements.length === 0) return null

    const durations = measurements.map(m => m.duration).sort((a, b) => a - b)
    const count = durations.length
    const avg = durations.reduce((a, b) => a + b, 0) / count
    const min = durations[0]
    const max = durations[count - 1]
    const p95Index = Math.floor(count * 0.95)
    const p99Index = Math.floor(count * 0.99)
    const p95 = durations[p95Index] || max
    const p99 = durations[p99Index] || max

    return {
      count,
      avg: `${avg.toFixed(2)}ms`,
      p95: `${p95.toFixed(2)}ms`,
      p99: `${p99.toFixed(2)}ms`,
      min: `${min.toFixed(2)}ms`,
      max: `${max.toFixed(2)}ms`,
    }
  }

  /**
   * Log all stats to console
   */
  logSummary(): void {
    console.log(
      '%c📊 Performance Summary',
      'color: #4f46e5; font-weight: bold; font-size: 14px'
    )

    const summary: Record<string, PerformanceStats> = {}
    Array.from(this.measurements.keys()).forEach(label => {
      const stats = this.getStats(label)
      if (stats) {
        summary[label] = stats
      }
    })

    console.table(summary)
  }

  /**
   * Get all stats as JSON (for analytics)
   */
  getSummary(): Record<string, PerformanceStats> {
    const summary: Record<string, PerformanceStats> = {}
    Array.from(this.measurements.keys()).forEach(label => {
      const stats = this.getStats(label)
      if (stats) {
        summary[label] = stats
      }
    })
    return summary
  }

  /**
   * Get all raw measurements as JSON
   */
  getRawMeasurements(): Record<string, Measurement[]> {
    const raw: Record<string, Measurement[]> = {}
    Array.from(this.measurements.entries()).forEach(([label, measurements]) => {
      raw[label] = measurements
    })
    return raw
  }

  /**
   * Reset measurements
   */
  reset(label?: string): void {
    if (label) {
      this.measurements.delete(label)
    } else {
      this.measurements.clear()
    }
  }

  /**
   * Get last measurement duration (useful for testing)
   */
  getLastDuration(label: string): number | null {
    const measurements = this.measurements.get(label)
    if (!measurements || measurements.length === 0) return null
    return measurements[measurements.length - 1].duration
  }

  /**
   * Check if all measurements meet performance criteria
   */
  meetsPerformanceCriteria(label: string, maxDuration: number): boolean {
    const stats = this.getStats(label)
    if (!stats) return false

    const p95 = parseFloat(stats.p95)
    const p99 = parseFloat(stats.p99)
    const avg = parseFloat(stats.avg)

    return avg < maxDuration && p95 < maxDuration && p99 < maxDuration
  }
}

// Export singleton
export const perfMonitor = new PerformanceMonitor()
