/**
 * Price Tracking Utilities
 *
 * Handles price history tracking, stale price detection, and price drop notifications.
 * Integrates with automated weekly price checking via Edge Functions.
 */

import { WardrobeItem } from '@/components/types/WardrobeItem';

export interface PriceHistoryEntry {
  id?: string;
  item_id: string;
  user_id: string;
  price: number;
  checked_at: string;
  source: 'automated_scrape' | 'manual_entry' | 'imported';
}

export interface PriceDropAlert {
  severity: 'low' | 'medium' | 'high';
  message: string;
  priceDropAmount: number;
  percentageOff: number;
  newPrice: number;
  previousPrice: number;
}

/**
 * Check if price data is stale (older than 14 days)
 * @param lastPriceCheckAt - ISO timestamp of last price check
 * @returns true if data is older than 14 days
 */
export function isPriceStale(lastPriceCheckAt: string | null | undefined): boolean {
  if (!lastPriceCheckAt) {
    return true; // No price data = stale
  }

  const lastCheck = new Date(lastPriceCheckAt);
  const now = new Date();
  const daysSince = Math.floor((now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24));

  return daysSince > 14;
}

/**
 * Get number of days since last price check
 * @param lastPriceCheckAt - ISO timestamp of last price check
 * @returns Number of days since last check, or null if never checked
 */
export function getDaysSincePriceCheck(lastPriceCheckAt: string | null | undefined): number | null {
  if (!lastPriceCheckAt) {
    return null;
  }

  const lastCheck = new Date(lastPriceCheckAt);
  const now = new Date();

  return Math.floor((now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Detect price drop and generate alert
 * @param item - The wishlist item
 * @param currentPrice - Current price
 * @param previousPrice - Previous price (optional)
 * @returns PriceDropAlert or null if no significant drop
 */
export function detectPriceDrop(
  item: WardrobeItem,
  currentPrice: number,
  previousPrice?: number
): PriceDropAlert | null {
  const retailPrice = item.retail_price || item.purchase_price || 0;
  const targetPrice = item.target_price || retailPrice;
  const comparePrice = previousPrice || retailPrice;

  if (comparePrice <= 0) {
    return null; // Can't calculate drop without previous price
  }

  const priceDropAmount = comparePrice - currentPrice;

  if (priceDropAmount <= 0) {
    return null; // Price went up or stayed same
  }

  const percentageOff = Math.round((priceDropAmount / comparePrice) * 100);

  // Determine severity
  let severity: 'low' | 'medium' | 'high' = 'low';
  if (percentageOff >= 30) {
    severity = 'high';
  } else if (percentageOff >= 15) {
    severity = 'medium';
  }

  return {
    severity,
    message: `Price dropped! ${item.brand} ${item.model} is now $${currentPrice.toFixed(2)} (was $${comparePrice.toFixed(2)})`,
    priceDropAmount,
    percentageOff,
    newPrice: currentPrice,
    previousPrice: comparePrice,
  };
}

/**
 * Check if target price has been reached
 * @param item - The wishlist item
 * @param currentPrice - Current price
 * @returns true if item has dropped to or below target price
 */
export function isTargetPriceReached(
  item: WardrobeItem,
  currentPrice: number
): boolean {
  if (!item.target_price) {
    return false; // No target price set
  }

  return currentPrice <= item.target_price;
}

/**
 * Get lowest price and savings info
 * @param item - The wishlist item
 * @param currentPrice - Current price (optional)
 * @returns Object with lowest price, savings, and percentage
 */
export function getPriceSavingsInfo(item: WardrobeItem, currentPrice?: number) {
  const retailPrice = item.retail_price || item.purchase_price || 0;
  const lowestPrice = item.lowest_price_seen || currentPrice || retailPrice;
  const displayPrice = currentPrice || item.sale_price || retailPrice;

  const savings = Math.max(0, retailPrice - lowestPrice);
  const savingsPercentage = retailPrice > 0 ? Math.round((savings / retailPrice) * 100) : 0;

  return {
    lowestPrice,
    currentPrice: displayPrice,
    savings,
    savingsPercentage,
    retailPrice,
  };
}

/**
 * Format price tracking status message
 * @param item - The wishlist item
 * @returns Human-readable status message
 */
export function formatPriceTrackingStatus(item: WardrobeItem): string {
  if (!item.auto_price_tracking_enabled) {
    return 'Price tracking disabled';
  }

  if (item.price_check_failures && item.price_check_failures >= 3) {
    return 'Price tracking paused (too many failed checks)';
  }

  const daysSince = getDaysSincePriceCheck(item.last_price_check_at);

  if (daysSince === null) {
    return 'Price tracking active (never checked)';
  }

  if (daysSince === 0) {
    return 'Price updated today';
  }

  if (daysSince === 1) {
    return 'Price updated yesterday';
  }

  if (isPriceStale(item.last_price_check_at)) {
    return `Price last updated ${daysSince} days ago (stale)`;
  }

  return `Price last updated ${daysSince} days ago`;
}

/**
 * Check if price tracking has failed too many times
 * @param priceCheckFailures - Number of consecutive failures
 * @returns true if failures >= 3
 */
export function shouldDisablePriceTracking(priceCheckFailures: number | null): boolean {
  return (priceCheckFailures ?? 0) >= 3;
}

/**
 * Get best price available (accounting for sales)
 * @param item - The wishlist item
 * @returns The best (lowest) price available
 */
export function getBestPrice(item: WardrobeItem): number {
  const prices = [item.lowest_price_seen, item.sale_price, item.retail_price].filter(
    (p): p is number => p !== null && p !== undefined && p > 0
  );

  return prices.length > 0 ? Math.min(...prices) : 0;
}

/**
 * Calculate value rating based on how often item is worn vs cost
 * Combines cost-per-wear with discount tracking
 * @param item - The wishlist item with price and wear data
 * @returns Score 0-100 (higher = better value)
 */
export function calculateValueScore(item: WardrobeItem & { wears?: number }): number {
  const basePrice = item.retail_price || 100;
  const currentPrice = item.sale_price || basePrice;
  const discount = Math.min(100, ((basePrice - currentPrice) / basePrice) * 100);

  // Value increases with discount, decreases with price
  const priceScore = Math.max(0, 100 - (currentPrice / basePrice) * 50);
  const discountScore = discount * 0.5; // Discount is worth half the weight

  return Math.round(priceScore + discountScore);
}
