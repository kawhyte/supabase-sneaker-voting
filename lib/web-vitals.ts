/**
 * Web Vitals Collection
 *
 * Tracks Core Web Vitals:
 * - Largest Contentful Paint (LCP)
 * - First Input Delay (FID) / Interaction to Next Paint (INP)
 * - Cumulative Layout Shift (CLS)
 */

import { trackEvent, AnalyticsEvent } from './analytics'

interface Metric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: string
  entryType: string
}

/**
 * Thresholds for Core Web Vitals
 */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // milliseconds
  FID: { good: 100, poor: 300 }, // milliseconds
  INP: { good: 200, poor: 500 }, // milliseconds
  CLS: { good: 0.1, poor: 0.25 }, // unitless
  TTFB: { good: 600, poor: 1200 }, // milliseconds
}

class WebVitals {
  private isInitialized = false
  private metrics: Map<string, Metric> = new Map()

  /**
   * Initialize Web Vitals monitoring
   */
  init(): void {
    if (this.isInitialized) return
    if (typeof window === 'undefined') return

    this.isInitialized = true

    // Monitor Web Vitals using browser APIs
    this.monitorLCP()
    this.monitorINP()
    this.monitorCLS()
    this.monitorTTFB()

    // Send metrics on page unload
    window.addEventListener('beforeunload', () => {
      this.reportMetrics()
    })
  }

  /**
   * Monitor Largest Contentful Paint (LCP)
   */
  private monitorLCP(): void {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list: any) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]

        const metric: Metric = {
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          rating: this.getRating('LCP', lastEntry.renderTime || lastEntry.loadTime),
          delta: 0,
          id: `lcp-${Date.now()}`,
          navigationType: 'paint',
          entryType: 'largest-contentful-paint',
        }

        this.metrics.set('LCP', metric)

        if (metric.rating !== 'good') {
          console.warn(`[WebVitals] LCP (${metric.value}ms) is ${metric.rating}`)
        }
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (error) {
      console.error('[WebVitals] Failed to monitor LCP:', error)
    }
  }

  /**
   * Monitor Interaction to Next Paint (INP) / First Input Delay (FID)
   */
  private monitorINP(): void {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list: any) => {
        const entries = list.getEntries()

        // Get the longest interaction
        let longestEntry = entries[0]
        for (const entry of entries) {
          if (entry.duration > longestEntry.duration) {
            longestEntry = entry
          }
        }

        const metric: Metric = {
          name: 'INP',
          value: longestEntry.duration,
          rating: this.getRating('INP', longestEntry.duration),
          delta: 0,
          id: `inp-${Date.now()}`,
          navigationType: 'interaction',
          entryType: 'event',
        }

        this.metrics.set('INP', metric)

        if (metric.rating !== 'good') {
          console.warn(`[WebVitals] INP (${metric.value}ms) is ${metric.rating}`)
        }
      })

      observer.observe({ entryTypes: ['event'] })
    } catch (error) {
      console.error('[WebVitals] Failed to monitor INP:', error)
    }
  }

  /**
   * Monitor Cumulative Layout Shift (CLS)
   */
  private monitorCLS(): void {
    if (!('PerformanceObserver' in window)) return

    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list: any) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }

        const metric: Metric = {
          name: 'CLS',
          value: clsValue,
          rating: this.getRating('CLS', clsValue),
          delta: 0,
          id: `cls-${Date.now()}`,
          navigationType: 'layout-shift',
          entryType: 'layout-shift',
        }

        this.metrics.set('CLS', metric)

        if (metric.rating !== 'good') {
          console.warn(`[WebVitals] CLS (${metric.value.toFixed(3)}) is ${metric.rating}`)
        }
      })

      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.error('[WebVitals] Failed to monitor CLS:', error)
    }
  }

  /**
   * Monitor Time to First Byte (TTFB)
   */
  private monitorTTFB(): void {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list: any) => {
        const entries = list.getEntries()
        const paintEntry = entries[0]

        if (paintEntry) {
          const metric: Metric = {
            name: 'TTFB',
            value: paintEntry.responseStart,
            rating: this.getRating('TTFB', paintEntry.responseStart),
            delta: 0,
            id: `ttfb-${Date.now()}`,
            navigationType: 'navigation',
            entryType: 'navigation',
          }

          this.metrics.set('TTFB', metric)
        }
      })

      observer.observe({ entryTypes: ['navigation'] })
    } catch (error) {
      console.error('[WebVitals] Failed to monitor TTFB:', error)
    }
  }

  /**
   * Get rating for a metric value
   */
  private getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = THRESHOLDS[metricName as keyof typeof THRESHOLDS]
    if (!threshold) return 'needs-improvement'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  /**
   * Report all collected metrics
   */
  private reportMetrics(): void {
    this.metrics.forEach((metric) => {
      trackEvent(AnalyticsEvent.ERROR_OCCURRED, {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating,
        metric_id: metric.id,
      })

      console.log(`[WebVitals] ${metric.name}: ${metric.value}ms (${metric.rating})`)
    })
  }

  /**
   * Get collected metrics
   */
  getMetrics(): Record<string, Metric> {
    const result: Record<string, Metric> = {}
    this.metrics.forEach((metric, key) => {
      result[key] = metric
    })
    return result
  }
}

const webVitals = new WebVitals()

export default webVitals
