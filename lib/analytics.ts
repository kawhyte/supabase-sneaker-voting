/**
 * Analytics Service
 *
 * Tracks user events and flows for understanding product usage:
 * - Item management (add, edit, delete, archive)
 * - Outfit creation and wear tracking
 * - Wishlist and price monitoring interactions
 * - Quiz and purchase prevention metrics
 * - Navigation and feature discovery
 *
 * Integrated with Google Analytics 4 via gtag
 */

export enum AnalyticsEvent {
  // Item Management
  ITEM_ADDED = 'item_added',
  ITEM_EDITED = 'item_edited',
  ITEM_DELETED = 'item_deleted',
  ITEM_ARCHIVED = 'item_archived',
  ITEM_RESTORED = 'item_restored',

  // Item Details
  COST_PER_WEAR_VIEWED = 'cost_per_wear_viewed',
  WEAR_COUNT_UPDATED = 'wear_count_updated',
  COMFORT_RATING_SET = 'comfort_rating_set',

  // Outfit Management
  OUTFIT_CREATED = 'outfit_created',
  OUTFIT_ITEM_ADDED = 'outfit_item_added',
  OUTFIT_ITEM_REMOVED = 'outfit_item_removed',
  OUTFIT_VIEWED = 'outfit_viewed',
  OUTFIT_MARKED_WORN = 'outfit_marked_worn',
  OUTFIT_EDITED = 'outfit_edited',
  OUTFIT_DELETED = 'outfit_deleted',

  // Photo Management
  PHOTO_UPLOADED = 'photo_uploaded',
  PHOTO_DELETED = 'photo_deleted',
  PHOTO_REORDERED = 'photo_reordered',
  PHOTO_CROPPED = 'photo_cropped',

  // Wishlist & Price Tracking
  ITEM_WISHLISTED = 'item_wishlisted',
  PRICE_ALERT_RECEIVED = 'price_alert_received',
  PRICE_ALERT_CLICKED = 'price_alert_clicked',
  PRODUCT_URL_ADDED = 'product_url_added',
  PRICE_TRACKING_ENABLED = 'price_tracking_enabled',
  PRICE_TRACKING_DISABLED = 'price_tracking_disabled',

  // Quiz & Purchase Prevention
  QUIZ_SHOWN = 'quiz_shown',
  QUIZ_COMPLETED = 'quiz_completed',
  QUIZ_SKIPPED = 'quiz_skipped',
  PURCHASE_PREVENTED = 'purchase_prevented',

  // Dashboard & Navigation
  DASHBOARD_VIEWED = 'dashboard_viewed',
  COLLECTION_VIEWED = 'collection_viewed',
  WISHLIST_VIEWED = 'wishlist_viewed',
  ARCHIVE_VIEWED = 'archive_viewed',
  OUTFITS_VIEWED = 'outfits_viewed',
  PROFILE_VIEWED = 'profile_viewed',

  // Filter & Search
  FILTERS_APPLIED = 'filters_applied',
  SEARCH_PERFORMED = 'search_performed',
  SORT_CHANGED = 'sort_changed',

  // Authentication
  USER_SIGNED_UP = 'user_signed_up',
  USER_LOGGED_IN = 'user_logged_in',
  USER_LOGGED_OUT = 'user_logged_out',

  // Feature Adoption
  FEATURE_DISCOVERED = 'feature_discovered',
  ONBOARDING_STARTED = 'onboarding_started',
  ONBOARDING_COMPLETED = 'onboarding_completed',
  TUTORIAL_VIEWED = 'tutorial_viewed',

  // Error Tracking
  ERROR_OCCURRED = 'error_occurred',
  CIRCUIT_BREAKER_OPENED = 'circuit_breaker_opened',
}

export interface AnalyticsEventData {
  userId?: string
  sessionId?: string
  timestamp?: number
  [key: string]: any
}

class Analytics {
  private isProduction: boolean
  private eventBuffer: Array<{ event: AnalyticsEvent; data: AnalyticsEventData }> = []
  private bufferSize: number = 50
  private flushInterval: NodeJS.Timeout | null = null

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'

    // Auto-flush buffer every 30 seconds
    if (typeof window !== 'undefined') {
      this.flushInterval = setInterval(() => this.flush(), 30000)
    }
  }

  /**
   * Track an analytics event
   */
  track(event: AnalyticsEvent, data?: AnalyticsEventData): void {
    // Add timestamp if not provided
    const eventData: AnalyticsEventData = {
      ...data,
      timestamp: data?.timestamp || Date.now(),
    }

    // Log in development
    if (!this.isProduction) {
      console.log(`[Analytics] ${event}:`, eventData)
    }

    // Buffer the event
    this.eventBuffer.push({ event, data: eventData })

    // Flush if buffer is full
    if (this.eventBuffer.length >= this.bufferSize) {
      this.flush()
    }

    // Send to Google Analytics 4 if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      try {
        (window as any).gtag('event', event, {
          ...eventData,
          event_category: this.getCategoryForEvent(event),
        })
      } catch (error) {
        console.error('Failed to track event with gtag:', error)
      }
    }
  }

  /**
   * Track page view
   */
  trackPageView(pagePath: string, pageTitle?: string): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      try {
        (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
          page_path: pagePath,
          page_title: pageTitle,
        })
      } catch (error) {
        console.error('Failed to track page view:', error)
      }
    }

    if (!this.isProduction) {
      console.log(`[Analytics] Page View: ${pagePath}`)
    }
  }

  /**
   * Identify user
   */
  identifyUser(userId: string, traits?: Record<string, any>): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      try {
        (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
          user_id: userId,
          ...traits,
        })
      } catch (error) {
        console.error('Failed to identify user:', error)
      }
    }

    if (!this.isProduction) {
      console.log(`[Analytics] Identify User: ${userId}`, traits)
    }
  }

  /**
   * Track custom properties for user
   */
  setUserProperties(properties: Record<string, any>): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      try {
        (window as any).gtag('event', 'user_properties', properties)
      } catch (error) {
        console.error('Failed to set user properties:', error)
      }
    }

    if (!this.isProduction) {
      console.log(`[Analytics] User Properties:`, properties)
    }
  }

  /**
   * Track error
   */
  trackError(error: Error | string, context?: Record<string, any>): void {
    const errorMessage = typeof error === 'string' ? error : error.message
    const errorStack = error instanceof Error ? error.stack : undefined

    this.track(AnalyticsEvent.ERROR_OCCURRED, {
      error_message: errorMessage,
      error_stack: errorStack,
      ...context,
    })
  }

  /**
   * Get category for event (for GA4 grouping)
   */
  private getCategoryForEvent(event: AnalyticsEvent): string {
    if (event.startsWith('item_')) return 'wardrobe'
    if (event.startsWith('outfit_')) return 'outfits'
    if (event.startsWith('photo_')) return 'photos'
    if (event.startsWith('price_') || event.startsWith('product_')) return 'wishlist'
    if (event.startsWith('quiz_')) return 'purchase_prevention'
    if (event.endsWith('_viewed') || event.includes('dashboard')) return 'navigation'
    if (event.startsWith('filter_') || event.includes('search') || event.includes('sort')) return 'search'
    if (event.includes('sign_') || event.includes('logged_')) return 'authentication'
    if (event.includes('feature_') || event.includes('onboarding') || event.includes('tutorial')) return 'feature_adoption'
    if (event.includes('circuit_breaker') || event.includes('error_')) return 'errors'

    return 'other'
  }

  /**
   * Flush buffered events to server
   */
  private async flush(): Promise<void> {
    if (this.eventBuffer.length === 0) return

    const events = [...this.eventBuffer]
    this.eventBuffer = []

    // In production, send to analytics backend
    if (this.isProduction && typeof window !== 'undefined') {
      try {
        await fetch('/api/analytics/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events }),
        })
      } catch (error) {
        console.error('Failed to flush analytics events:', error)
        // Re-buffer events if flush fails
        this.eventBuffer = [...events, ...this.eventBuffer]
      }
    }
  }

  /**
   * Force flush on page unload
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    this.flush()
  }
}

// Singleton instance
const analytics = new Analytics()

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    analytics.destroy()
  })
}

export const trackEvent = (event: AnalyticsEvent, data?: AnalyticsEventData) =>
  analytics.track(event, data)

export const trackPageView = (pagePath: string, pageTitle?: string) =>
  analytics.trackPageView(pagePath, pageTitle)

export const identifyUser = (userId: string, traits?: Record<string, any>) =>
  analytics.identifyUser(userId, traits)

export const setUserProperties = (properties: Record<string, any>) =>
  analytics.setUserProperties(properties)

export const trackError = (error: Error | string, context?: Record<string, any>) =>
  analytics.trackError(error, context)

export default analytics
