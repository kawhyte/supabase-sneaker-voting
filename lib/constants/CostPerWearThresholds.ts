/**
 * Cost Per Wear Target Thresholds
 *
 * Defines the cost-per-wear targets that determine if an item is "worth it".
 * These thresholds are category and price-aware, based on typical wear patterns:
 *
 * SHOES: Worn frequently (100+ times over lifetime)
 *   - Budget ($0-75): $2/wear target
 *   - Mid-range ($75-150): $3/wear target
 *   - Premium ($150-300): $5/wear target
 *   - Luxury ($300+): $8/wear target
 *
 * OUTERWEAR: Seasonal, fewer wears (30-50 times per season)
 *   - Budget ($0-75): $3/wear target
 *   - Mid-range ($75-150): $5/wear target
 *   - Premium ($150-300): $8/wear target
 *   - Luxury ($300+): $12/wear target
 *
 * ACCESSORIES/JEWELRY: Occasional wear (variable)
 *   - Budget ($0-75): $2.50/wear target
 *   - Mid-range ($75-150): $4/wear target
 *   - Premium ($150-300): $7/wear target
 *   - Luxury ($300+): $10/wear target
 *
 * DEFAULT (tops, bottoms, etc): Regular wear (50-100 times)
 *   - Budget ($0-75): $3/wear target
 *   - Mid-range ($75-150): $5/wear target
 *   - Premium ($150-300): $7/wear target
 *   - Luxury ($300+): $10/wear target
 */

/**
 * Simple 3-tier thresholds (used in marketing/documentation)
 * Maps price tiers to recommended cost-per-wear targets
 */
export const SIMPLE_CPW_THRESHOLDS = {
  budget: { maxPrice: 50, targetCPW: 2 },        // < $50: $2/wear
  midrange: { minPrice: 50, maxPrice: 150, targetCPW: 5 },     // $50-$150: $5/wear
  premium: { minPrice: 150, targetCPW: 10 },     // $150+: $10/wear
} as const;

/**
 * Price breakpoints for category-aware thresholds
 * Used in getTargetCostPerWear function
 */
export const PRICE_BREAKPOINTS = {
  budget: 75,      // < $75: budget tier
  midrange: 150,   // $75-$150: mid-range tier
  premium: 300,    // $150-$300: premium tier
  luxury: 300,     // $300+: luxury tier
} as const;

/**
 * Category-specific thresholds
 * Maps category to cost-per-wear targets by price tier
 */
export const CATEGORY_CPW_THRESHOLDS = {
  shoes: {
    // Shoes worn frequently (100+ times)
    budget: 2,        // < $75
    midrange: 3,      // $75-$150
    premium: 5,       // $150-$300
    luxury: 8,        // $300+
  },
  outerwear: {
    // Seasonal wear (30-50 times per season)
    budget: 3,        // < $75
    midrange: 5,      // $75-$150
    premium: 8,       // $150-$300
    luxury: 12,       // $300+
  },
  accessories: {
    // Occasional/regular wear
    budget: 2.5,      // < $75
    midrange: 4,      // $75-$150
    premium: 7,       // $150-$300
    luxury: 10,       // $300+
  },
  jewelry: {
    // Occasional wear
    budget: 2.5,      // < $75
    midrange: 4,      // $75-$150
    premium: 7,       // $150-$300
    luxury: 10,       // $300+
  },
  watches: {
    // Occasional wear but expensive
    budget: 2.5,      // < $75
    midrange: 4,      // $75-$150
    premium: 7,       // $150-$300
    luxury: 10,       // $300+
  },
  default: {
    // Tops, bottoms, bags, hats, other
    budget: 3,        // < $75
    midrange: 5,      // $75-$150
    premium: 7,       // $150-$300
    luxury: 10,       // $300+
  },
} as const;

/**
 * Maximum cost-per-wear threshold cap (luxury items ceiling)
 * Prevents unreasonably high thresholds even for very expensive items
 */
export const MAX_CPW_THRESHOLD = 15;

/**
 * Default cost-per-wear if no price available
 * Used when item has no purchase or retail price
 */
export const DEFAULT_CPW_TARGET = 3;
