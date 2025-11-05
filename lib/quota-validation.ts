/**
 * Quota Validation Utility
 *
 * Enforces category quotas for outfit items:
 * - Shoes, Tops, Bottoms, Outerwear: Max 1 each
 * - Accessories: Unlimited
 */

import type {
	OutfitItem,
	CategoryQuota,
	QuotaValidation,
	OutfitQuotaStatus,
} from "@/components/types/Outfit";
import { QUOTA_RULES, getQuotaForCategory } from "@/components/types/Outfit";
import type { WardrobeItem } from "@/components/types/WardrobeItem";

/**
 * Get current count of items in a specific category
 */
export function getCategoryCount(
	outfitItems: OutfitItem[],
	category: string
): number {
	const normalizedCategory = category.toLowerCase();

	return outfitItems.filter((item) => {
		const itemCategory = item.item?.category?.toLowerCase();
		return itemCategory === normalizedCategory;
	}).length;
}

/**
 * Check if an item can be added to the outfit (quota check)
 *
 * @returns { canAdd: boolean, reason?: string }
 */
export function canAddItem(
	outfitItems: OutfitItem[],
	itemToAdd: WardrobeItem
): { canAdd: boolean; reason?: string } {
	const category = itemToAdd.category?.toLowerCase() || "other";
	const quota = getQuotaForCategory(category);

	// Unlimited categories always allowed
	if (quota.max === null) {
		return { canAdd: true };
	}

	// Check current count vs limit
	const currentCount = getCategoryCount(outfitItems, category);

	if (currentCount >= quota.max) {
		return {
			canAdd: false,
			reason: `Already have ${quota.label} in outfit (${currentCount}/${quota.max})`,
		};
	}

	return { canAdd: true };
}

/**
 * Get quota validation for a specific category
 */
export function getQuotaValidation(
	outfitItems: OutfitItem[],
	category: string
): QuotaValidation {
	const quota = getQuotaForCategory(category);
	const currentCount = getCategoryCount(outfitItems, category);

	const isUnlimited = quota.max === null;
	const isAtLimit = !isUnlimited && currentCount >= quota.max!;

	return {
		category: quota.category,
		current: currentCount,
		max: quota.max,
		isAtLimit,
		canAdd: isUnlimited || !isAtLimit,
		message: isAtLimit
			? `${quota.label}: ${currentCount}/${quota.max} (at limit)`
			: undefined,
	};
}

/**
 * Get complete quota status for an outfit
 */
export function getOutfitQuotaStatus(
	outfitItems: OutfitItem[]
): OutfitQuotaStatus {
	// Get all unique categories in outfit
	const categories = Array.from(
		new Set(outfitItems.map((item) => item.item?.category).filter(Boolean))
	) as string[];

	// Also include restricted categories even if not in outfit (for UI display)
	const restrictedCategories = Object.keys(QUOTA_RULES).filter(
		(cat) => QUOTA_RULES[cat].max !== null
	);

	const allCategories = Array.from(
		new Set([...categories, ...restrictedCategories])
	);

	// Build quota map
	const quotas: Record<string, QuotaValidation> = {};
	const violations: QuotaValidation[] = [];

	for (const category of allCategories) {
		const validation = getQuotaValidation(outfitItems, category);
		quotas[category] = validation;

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
 */
export function getQuotaMessage(
	category: string,
	current: number,
	max: number | null
): string {
	const quota = getQuotaForCategory(category);

	if (max === null) {
		return `${quota.label}: ${current} (unlimited)`;
	}

	if (current === 0) {
		return `${quota.label}: 0/${max}`;
	}

	if (current >= max) {
		return `${quota.label}: ${current}/${max} ✓`;
	}

	return `${quota.label}: ${current}/${max}`;
}
