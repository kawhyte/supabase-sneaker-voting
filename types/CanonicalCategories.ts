/**
 * Canonical Category System
 *
 * All sneaker subcategories map to a single SNEAKERS group.
 * Collections are unlimited — a collector can have many pairs.
 */

export const CANONICAL_CATEGORIES = {
	SNEAKERS: {
		label: "Sneakers",
		max: null, // unlimited
		variants: ["lifestyle", "running", "basketball", "skate", "training", "boots", "other"],
		icon: "Footprints",
		description: "Sneakers & footwear",
	},
} as const;

export type CanonicalCategoryKey = keyof typeof CANONICAL_CATEGORIES;

export type CanonicalCategoryConfig =
	(typeof CANONICAL_CATEGORIES)[CanonicalCategoryKey];

export function getCanonicalCategory(
	category: string
): CanonicalCategoryKey {
	const normalized = category.toLowerCase();

	for (const [key, config] of Object.entries(CANONICAL_CATEGORIES)) {
		if ((config.variants as readonly string[]).includes(normalized)) {
			return key as CanonicalCategoryKey;
		}
	}

	return "SNEAKERS";
}

export function getCanonicalCategoryConfig(
	category: string
): CanonicalCategoryConfig {
	const canonicalKey = getCanonicalCategory(category);
	return CANONICAL_CATEGORIES[canonicalKey];
}

export function isRestrictedCategory(category: string): boolean {
	const config = getCanonicalCategoryConfig(category);
	return config.max !== null;
}

export function getRestrictedCanonicalCategories(): CanonicalCategoryKey[] {
	return Object.keys(CANONICAL_CATEGORIES).filter((key) => {
		const config = CANONICAL_CATEGORIES[key as CanonicalCategoryKey];
		return config.max !== null;
	}) as CanonicalCategoryKey[];
}

export function getCategoryLabel(category: string): string {
	const config = getCanonicalCategoryConfig(category);
	return config.label;
}
