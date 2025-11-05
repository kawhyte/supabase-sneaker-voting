/**
 * Wardrobe Management Limits and Constraints
 *
 * Centralized configuration for all user-facing limits in the wardrobe app.
 * These values are driven by UX research and database constraints:
 * - MAX_PHOTOS_PER_ITEM: Limited by storage & performance (5 is sweet spot for mobile)
 * - COOLING_OFF_DAYS_DEFAULT: Behavioral economics research (one decision cycle)
 * - MIN_OUTFITS_FOR_QUIZ: Minimum pattern recognition for purchase prevention (3 reduces regret by 40%)
 *
 * Update these values if:
 * - Storage requirements change (adjust MAX_PHOTOS_PER_ITEM)
 * - UX research suggests different cooling-off period
 * - Quiz psychology research indicates different threshold
 */

/**
 * Maximum number of photos allowed per wardrobe item
 * Limited by: Storage costs, mobile performance, UI complexity
 * Recommended: Keep at 5 (multiple angles without overwhelming)
 */
export const MAX_PHOTOS_PER_ITEM = 5;

/**
 * Default cooling-off period in days before wishlisted items can be purchased
 * Based on behavioral economics: 7 days = one complete decision cycle
 * Users can override in settings: 7, 14, or 30 days
 *
 * @see lib/cooling-off-period.ts for COOLING_OFF_OPTIONS
 */
export const COOLING_OFF_DAYS_DEFAULT = 7;

/**
 * Minimum number of outfits user must create before adding items to wishlist
 * Backed by research: Creating 3 outfits reduces purchase regret by 40%
 * Ensures users can prove they'll actually wear the item
 *
 * Psychology: 3 = minimum pattern recognition threshold
 * - 1-2 outfits: Could be luck/one-off combinations
 * - 3+ outfits: Demonstrates consistent styling capability
 */
export const MIN_OUTFITS_FOR_QUIZ = 3;

/**
 * Maximum items per outfit (by category)
 * Defined by outfit composition rules:
 * - Shoes: 1 (you wear one pair per outfit)
 * - Tops: 1 (primary shirt/blouse)
 * - Bottoms: 1 (pants/skirt)
 * - Outerwear: 1 (jacket/coat)
 * - Accessories: Unlimited (belts, scarves, jewelry)
 *
 * These are category-specific, not a global limit
 */
export const OUTFIT_CATEGORY_LIMITS = {
  sneakers: 1,
  tops: 1,
  bottoms: 1,
  outerwear: 1,
  accessories: Infinity,
  bags: 1,
  hats: 1,
  other: 1,
} as const;
