/**
 * Canonical Category System
 *
 * Maps all category variants to 4 core groups:
 * - SHOES (sneakers, shoes)
 * - TOPS (tops, sweaters, shirts, outerwear, jackets, coats)
 * - BOTTOMS (bottoms, pants, shorts, skirts)
 * - ACCESSORIES (accessories, bags, hats, jewelry, watches, socks)
 *
 * Benefits:
 * - Single source of truth for category grouping
 * - No duplicate quota badges in UI
 * - Cross-variant quota counting (sneakers + shoes = total footwear)
 * - Type-safe with TypeScript
 * - Easy to extend (just add to variants array)
 */

export const CANONICAL_CATEGORIES = {
	SHOES: {
		label: "Shoes",
		max: 1,
		variants: ["sneakers", "shoes"],
		icon: "Footprints",
		description: "Footwear (sneakers, shoes)",
	},
	TOPS: {
		label: "Tops",
		max: 1,
		variants: ["tops", "sweaters", "shirts", "outerwear", "jackets", "coats"],
		icon: "Shirt",
		description: "Upper body (tops, outerwear)",
	},
	BOTTOMS: {
		label: "Bottoms",
		max: 1,
		variants: ["bottoms", "pants", "shorts", "skirts"],
		icon: "PantsIcon",
		description: "Lower body (pants, shorts, skirts)",
	},
	ACCESSORIES: {
		label: "Accessories",
		max: null, // unlimited
		variants: ["accessories", "bags", "hats", "jewelry", "watches", "socks"],
		icon: "Watch",
		description: "Accessories (unlimited)",
	},
} as const;

// Type for canonical category keys
export type CanonicalCategoryKey = keyof typeof CANONICAL_CATEGORIES;

// Type for canonical category config
export type CanonicalCategoryConfig =
	(typeof CANONICAL_CATEGORIES)[CanonicalCategoryKey];

/**
 * Get canonical category for any category variant
 *
 * @param category - Category name (e.g., "sneakers", "tops", "pants")
 * @returns Canonical category key (e.g., "SHOES", "TOPS", "BOTTOMS")
 *
 * @example
 * getCanonicalCategory('sneakers') // => 'SHOES'
 * getCanonicalCategory('sweaters') // => 'TOPS'
 * getCanonicalCategory('jewelry')  // => 'ACCESSORIES'
 */
export function getCanonicalCategory(
	category: string
): CanonicalCategoryKey {
	const normalized = category.toLowerCase();

	for (const [key, config] of Object.entries(CANONICAL_CATEGORIES)) {
		if (config.variants.includes(normalized)) {
			return key as CanonicalCategoryKey;
		}
	}

	// Fallback: unknown categories are accessories (unlimited)
	return "ACCESSORIES";
}

/**
 * Get canonical category config for any category variant
 *
 * @param category - Category name (e.g., "sneakers", "tops", "pants")
 * @returns Canonical category config with label, max, variants, icon
 *
 * @example
 * getCanonicalCategoryConfig('sneakers')
 * // => { label: 'Shoes', max: 1, variants: ['sneakers', 'shoes'], icon: 'Footprints' }
 */
export function getCanonicalCategoryConfig(
	category: string
): CanonicalCategoryConfig {
	const canonicalKey = getCanonicalCategory(category);
	return CANONICAL_CATEGORIES[canonicalKey];
}

/**
 * Check if a category is restricted (has max limit)
 *
 * @param category - Category name
 * @returns true if category has max limit (not unlimited)
 */
export function isRestrictedCategory(category: string): boolean {
	const config = getCanonicalCategoryConfig(category);
	return config.max !== null;
}

/**
 * Get all restricted canonical categories (for UI display)
 *
 * @returns Array of canonical category keys with max limits
 */
export function getRestrictedCanonicalCategories(): CanonicalCategoryKey[] {
	return Object.keys(CANONICAL_CATEGORIES).filter((key) => {
		const config =
			CANONICAL_CATEGORIES[key as CanonicalCategoryKey];
		return config.max !== null;
	}) as CanonicalCategoryKey[];
}

/**
 * Get display label for any category variant
 *
 * @param category - Category name
 * @returns Display label (e.g., "Shoes", "Tops", "Bottoms")
 *
 * @example
 * getCategoryLabel('sneakers') // => 'Shoes'
 * getCategoryLabel('sweaters') // => 'Tops'
 */
export function getCategoryLabel(category: string): string {
	const config = getCanonicalCategoryConfig(category);
	return config.label;
}
