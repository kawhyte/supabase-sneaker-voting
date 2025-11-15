/**
 * Calculator Analytics - Client-side tracking utilities
 *
 * Privacy-friendly anonymous tracking
 * NO user identification, NO PII, NO exact prices
 */

import type { CalculatorInput, Verdict } from './calculator-logic';

/**
 * Get price range bucket (privacy-friendly)
 */
function getPriceRange(price: number): string {
  if (price < 50) return '<$50';
  if (price < 150) return '$50-150';
  if (price < 300) return '$150-300';
  return '$300+';
}

/**
 * Track calculator calculation (anonymous)
 */
export async function trackCalculation(input: CalculatorInput, verdict: Verdict): Promise<void> {
  try {
    // Only track if running in browser
    if (typeof window === 'undefined') return;

    // Anonymous payload - NO PII
    const payload = {
      category: input.category,
      priceRange: getPriceRange(input.price),
      wearFrequency: input.wearFrequency,
      verdict: verdict,
      timestamp: Date.now(),
      // NO: user ID, IP address, exact price, brand, or any identifying info
    };

    // Fire and forget - don't await or block UI
    fetch('/api/analytics/calculator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Don't fail if analytics fails
      keepalive: true,
    }).catch((error) => {
      // Silently fail - analytics should never break UX
      console.debug('[Analytics] Failed to track calculation:', error);
    });
  } catch (error) {
    // Silently fail - analytics should never break UX
    console.debug('[Analytics] Failed to track calculation:', error);
  }
}
