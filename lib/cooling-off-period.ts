/**
 * Cooling-Off Period Utilities
 *
 * Implements the 7-day cooling-off period for wishlist purchases.
 * Based on behavioral economics research (1 week = one decision cycle).
 *
 * Users can configure 7, 14, or 30 days in settings.
 */

/**
 * Valid cooling-off period options (in days)
 */
export const COOLING_OFF_OPTIONS = [7, 14, 30] as const;
export type CoolingOffDays = typeof COOLING_OFF_OPTIONS[number];

/**
 * Get human-readable label for cooling-off period
 */
export function getCoolingOffLabel(days: CoolingOffDays): string {
  switch (days) {
    case 7:
      return '7 days (recommended)';
    case 14:
      return '14 days';
    case 30:
      return '30 days';
    default:
      return `${days} days`;
  }
}

/**
 * Calculate when item becomes purchasable
 * @param coolingOffDays - Number of days to wait (7, 14, or 30)
 * @returns ISO timestamp when item can be purchased
 */
export function calculateCanPurchaseAfter(coolingOffDays: CoolingOffDays): string {
  const now = new Date();
  now.setDate(now.getDate() + coolingOffDays);
  return now.toISOString();
}

/**
 * Check if a wishlist item can be purchased
 * @param canPurchaseAfter - ISO timestamp when item becomes purchasable
 * @returns true if current time is past can_purchase_after date
 */
export function canPurchaseNow(canPurchaseAfter: string | null): boolean {
  if (!canPurchaseAfter) {
    return true; // Legacy items without cooling-off can be purchased immediately
  }

  return new Date() > new Date(canPurchaseAfter);
}

/**
 * Get time remaining until item can be purchased
 * @param canPurchaseAfter - ISO timestamp when item becomes purchasable
 * @returns Object with days, hours, minutes remaining
 */
export function getTimeRemaining(canPurchaseAfter: string | null): {
  days: number;
  hours: number;
  minutes: number;
  total: number;
  canPurchaseNow: boolean;
} {
  if (!canPurchaseAfter) {
    return { days: 0, hours: 0, minutes: 0, total: 0, canPurchaseNow: true };
  }

  const now = new Date();
  const purchaseDate = new Date(canPurchaseAfter);

  if (now >= purchaseDate) {
    return { days: 0, hours: 0, minutes: 0, total: 0, canPurchaseNow: true };
  }

  const diffMs = purchaseDate.getTime() - now.getTime();
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return {
    days,
    hours,
    minutes,
    total: totalMinutes,
    canPurchaseNow: false,
  };
}

/**
 * Format time remaining as human-readable string
 * @param canPurchaseAfter - ISO timestamp when item becomes purchasable
 * @returns Human-readable string like "3 days, 5 hours"
 */
export function formatTimeRemaining(canPurchaseAfter: string | null): string {
  const { days, hours, minutes, canPurchaseNow: canBuy } = getTimeRemaining(canPurchaseAfter);

  if (canBuy) {
    return 'Ready to purchase';
  }

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} day${days > 1 ? 's' : ''}`);
  }

  if (hours > 0) {
    parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  }

  if (minutes > 0 && days === 0) {
    parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  }

  return parts.length > 0 ? `${parts.join(', ')} remaining` : 'Ready to purchase';
}

/**
 * Get percentage of cooling-off period completed
 * @param createdAt - ISO timestamp when item was added to wishlist
 * @param canPurchaseAfter - ISO timestamp when item becomes purchasable
 * @returns Percentage (0-100) of cooling-off period that has passed
 */
export function getCoolingOffProgress(
  createdAt: string,
  canPurchaseAfter: string | null
): number {
  if (!canPurchaseAfter) {
    return 100; // Legacy items show as complete
  }

  const created = new Date(createdAt);
  const purchasable = new Date(canPurchaseAfter);
  const now = new Date();

  if (now >= purchasable) {
    return 100;
  }

  const totalMs = purchasable.getTime() - created.getTime();
  const elapsedMs = now.getTime() - created.getTime();

  return Math.floor((elapsedMs / totalMs) * 100);
}
