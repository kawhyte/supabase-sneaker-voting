/**
 * lib/retailer-url-validator.ts
 *
 * Client-side URL validation for price tracking
 * Provides instant feedback without API calls
 *
 * Design: Following Stripe's inline validation pattern
 * - Instant feedback on URL input
 * - Clear success/warning/error states
 * - Non-blocking (users can save with warnings)
 */

import { RETAILER_CONFIGS } from './retailer-selectors'

/**
 * Validation status types
 */
export type ValidationStatus = 'success' | 'warning' | 'error' | 'idle'

/**
 * Result of URL validation
 */
export interface UrlValidationResult {
  status: ValidationStatus
  retailer?: string           // Detected retailer name (e.g., "Nike")
  message: string             // User-friendly message
  canSave: boolean            // false only for invalid URL format
}

/**
 * Supported retailer information for display
 */
export interface SupportedRetailer {
  name: string                // Display name (e.g., "Nike")
  domain: string              // Domain (e.g., "nike.com")
  requiresJS: boolean         // Needs JavaScript rendering
  example: string             // Example URL
}

/**
 * Validate a product URL for price tracking
 *
 * Strategy:
 * 1. Check URL format (reject invalid URLs)
 * 2. Check against 16 known retailers (success)
 * 3. Check for product page patterns (warning)
 * 4. Default to warning (allow user to try)
 *
 * @param url - The product URL to validate
 * @returns Validation result with status and message
 */
export function validateProductUrl(url: string): UrlValidationResult {
  // Empty URL = idle state (no validation needed)
  if (!url || !url.trim()) {
    return {
      status: 'idle',
      message: '',
      canSave: true
    }
  }

  // Step 1: Basic URL format validation
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)

    // Require http or https protocol
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        status: 'error',
        message: 'URL must start with http:// or https://',
        canSave: false
      }
    }
  } catch {
    return {
      status: 'error',
      message: 'Invalid URL format - please enter a complete URL',
      canSave: false
    }
  }

  // Step 2: Check against 16 known supported retailers
  const hostname = parsedUrl.hostname.replace('www.', '')
  const config = RETAILER_CONFIGS.find(r => hostname.includes(r.domain))

  if (config) {
    // Success: Recognized retailer
    const jsInfo = config.requiresJS ? ' (JS rendering enabled)' : ''
    return {
      status: 'success',
      retailer: config.name,
      message: `${config.name} is supported${jsInfo} - we'll track this weekly`,
      canSave: true
    }
  }

  // Step 3: Check for common product page URL patterns
  const urlLower = url.toLowerCase()
  const productPatterns = [
    '/product/',
    '/item/',
    '/p/',
    '/pd/',
    '/dp/',
    '/browse/',
    '/collections/',
    '/products/',
    '?pid=',
    '/buy/'
  ]

  const hasProductPattern = productPatterns.some(pattern =>
    urlLower.includes(pattern)
  )

  if (hasProductPattern) {
    // Warning: Looks like a product page but unknown retailer
    return {
      status: 'warning',
      message: 'Unknown retailer - tracking might work, but not guaranteed. You can still try.',
      canSave: true
    }
  }

  // Step 4: Doesn't match any patterns
  // Still allow save (non-blocking) but warn user
  return {
    status: 'warning',
    message: 'This doesn\'t look like a product page - tracking may fail',
    canSave: true
  }
}

/**
 * Get list of all supported retailers for display
 *
 * @returns Array of retailer info sorted alphabetically
 */
export function getSupportedRetailers(): SupportedRetailer[] {
  return RETAILER_CONFIGS.map(r => ({
    name: r.name,
    domain: r.domain,
    requiresJS: r.requiresJS,
    example: `https://www.${r.domain}/product/...`
  })).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Quick check if a URL is from a supported retailer
 * Useful for determining if URL should auto-enable tracking
 *
 * @param url - URL to check
 * @returns true if from supported retailer, false otherwise
 */
export function isSupportedRetailer(url: string): boolean {
  if (!url) return false

  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    return RETAILER_CONFIGS.some(r => hostname.includes(r.domain))
  } catch {
    return false
  }
}

/**
 * Get retailer name from URL (if recognized)
 *
 * @param url - URL to check
 * @returns Retailer name or null if not recognized
 */
export function getRetailerName(url: string): string | null {
  if (!url) return null

  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    const config = RETAILER_CONFIGS.find(r => hostname.includes(r.domain))
    return config?.name || null
  } catch {
    return null
  }
}
