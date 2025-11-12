/**
 * Quota Validation Utility
 *
 * Enforces category quotas for outfit items using canonical categories:
 * - Shoes (sneakers, shoes): Max 1
 * - Tops (tops, sweaters, shirts, outerwear, jackets, coats): Max 1
 * - Bottoms (bottoms, pants, shorts, skirts): Max 1
 * - Accessories (accessories, bags, hats, jewelry, watches, socks): Unlimited
 *
 * Benefits:
 * - No duplicate quota badges (4 max, not 12+)
 * - Cross-variant counting (sneakers + shoes = total footwear)
 * - Single source of truth for quota rules
 */

import type {
	OutfitItem,
	QuotaValidation,
	OutfitQuotaStatus,
} from "@/components/types/outfit";
import type { WardrobeItem } from "@/components/types/WardrobeItem";
import {
	CANONICAL_CATEGORIES,
	getCanonicalCategory,
	getCanonicalCategoryConfig,
	getRestrictedCanonicalCategories,
	type CanonicalCategoryKey,
} from "@/types/CanonicalCategories";

/**
 * Get current count of items in a specific canonical category
 *
 * Counts ALL variants together (e.g., sneakers + shoes = total footwear)
 *
 * @param outfitItems - Current items in outfit
 * @param category - Category name (any variant)
 * @returns Count of items in canonical category
 *
 * @example
 * // If outfit has 1 sneaker:
 * getCategoryCount(items, 'sneakers') // => 1
 * getCategoryCount(items, 'shoes')    // => 1 (same canonical category)
 */
export function getCategoryCount(
	outfitItems: OutfitItem[],
	category: string
): number {
	// Get canonical category for this variant
	const canonicalKey = getCanonicalCategory(category);
	const config = CANONICAL_CATEGORIES[canonicalKey];

	// Count all items that match ANY variant in this canonical category
	return outfitItems.filter((item) => {
		const itemCategory = item.item?.category?.toLowerCase();
		if (!itemCategory) return false;
		return config.variants.includes(itemCategory);
	}).length;
}

/**
 * Check if an item can be added to the outfit (quota check)
 *
 * Uses canonical categories for validation (e.g., sneakers counts toward Shoes quota)
 *
 * @param outfitItems - Current items in outfit
 * @param itemToAdd - Item to validate
 * @returns { canAdd: boolean, reason?: string }
 *
 * @example
 * // Outfit already has 1 sneaker:
 * canAddItem(items, shoesItem) // => { canAdd: false, reason: 'Already have Shoes in outfit (1/1)' }
 */
export function canAddItem(
	outfitItems: OutfitItem[],
	itemToAdd: WardrobeItem
): { canAdd: boolean; reason?: string } {
	const category = itemToAdd.category?.toLowerCase() || "other";
	const config = getCanonicalCategoryConfig(category);

	// Unlimited categories always allowed
	if (config.max === null) {
		return { canAdd: true };
	}

	// Check current count vs limit (counts ALL variants in canonical category)
	const currentCount = getCategoryCount(outfitItems, category);

	if (currentCount >= config.max) {
		return {
			canAdd: false,
			reason: `Already have ${config.label} in outfit (${currentCount}/${config.max})`,
		};
	}

	return { canAdd: true };
}

/**
 * Get quota validation for a specific canonical category
 *
 * @param outfitItems - Current items in outfit
 * @param canonicalKey - Canonical category key (SHOES, TOPS, BOTTOMS, ACCESSORIES)
 * @returns Quota validation with current count and limits
 */
export function getQuotaValidation(
	outfitItems: OutfitItem[],
	canonicalKey: CanonicalCategoryKey
): QuotaValidation {
	const config = CANONICAL_CATEGORIES[canonicalKey];

	// Count all items in this canonical category (all variants)
	const currentCount = outfitItems.filter((item) => {
		const itemCategory = item.item?.category?.toLowerCase();
		if (!itemCategory) return false;
		return config.variants.includes(itemCategory);
	}).length;

	const isUnlimited = config.max === null;
	const isAtLimit = !isUnlimited && currentCount >= config.max!;

	return {
		category: canonicalKey,
		current: currentCount,
		max: config.max,
		isAtLimit,
		canAdd: isUnlimited || !isAtLimit,
		message: isAtLimit
			? `${config.label}: ${currentCount}/${config.max} (at limit)`
			: undefined,
	};
}

/**
 * Get complete quota status for an outfit
 *
 * Returns quota validation for all canonical categories (max 4 entries)
 *
 * @param outfitItems - Current items in outfit
 * @returns Outfit quota status with validations for SHOES, TOPS, BOTTOMS, ACCESSORIES
 */
export function getOutfitQuotaStatus(
	outfitItems: OutfitItem[]
): OutfitQuotaStatus {
	// Get all canonical categories (only 4: SHOES, TOPS, BOTTOMS, ACCESSORIES)
	const canonicalKeys = Object.keys(
		CANONICAL_CATEGORIES
	) as CanonicalCategoryKey[];

	// Build quota map (keyed by canonical category)
	const quotas: Record<string, QuotaValidation> = {};
	const violations: QuotaValidation[] = [];

	for (const canonicalKey of canonicalKeys) {
		const validation = getQuotaValidation(outfitItems, canonicalKey);
		quotas[canonicalKey] = validation;

		if (validation.isAtLimit && validation.current > 0) {
			violations.push(validation);
		}
	}

	return {
		quotas,
		violations,
		isValid: violations.length === 0,
	};
}

/**
 * Get user-friendly quota message for UI display
 *
 * @param canonicalKey - Canonical category key (SHOES, TOPS, BOTTOMS, ACCESSORIES)
 * @param current - Current count in outfit
 * @param max - Maximum allowed (null = unlimited)
 * @returns Display message (e.g., "Shoes: 1/1 ✓", "Accessories: 3 (unlimited)")
 */
export function getQuotaMessage(
	canonicalKey: string,
	current: number,
	max: number | null
): string {
	const config =
		CANONICAL_CATEGORIES[canonicalKey as CanonicalCategoryKey] ||
		CANONICAL_CATEGORIES.ACCESSORIES;

	if (max === null) {
		return current === 0
			? `${config.label}: 0`
			: `${config.label}: ${current}`;
	}

	if (current === 0) {
		return `${config.label}: 0/${max}`;
	}

	if (current >= max) {
		return `${config.label}: ${current}/${max} ✓`;
	}

	return `${config.label}: ${current}/${max}`;
}
