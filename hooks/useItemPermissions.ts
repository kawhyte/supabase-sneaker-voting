/**
 * useItemPermissions - Determine what operations are allowed for an item based on category
 *
 * This hook encapsulates category-specific business rules for item operations.
 * Different item categories (shoes, tops, accessories, etc.) have different capabilities:
 * - Shoes and clothing: can track wear count, require size
 * - Accessories: limited wear tracking, no size requirement
 * - Jewelry: no wear tracking, size usually not applicable
 *
 * @example
 * const perms = useItemPermissions('sneakers');
 * if (perms.canTrackWearCount) {
 *   // Show wear counter UI
 * }
 *
 * @param category - The item category to check permissions for
 * @returns ItemPermissions object with flags for each operation
 *
 * @see ItemCategory for available categories
 * @see ItemPermissions for the returned object structure
 */

import { ItemCategory, getCategoryConfig } from '@/components/types/item-category';

export interface ItemPermissions {
	canTrackWearCount: boolean;
	canMarkPurchased: boolean;
	canAddToCollection: boolean;
	requiresSize: boolean;
	requiresComfort: boolean;
	sizeType: 'shoe' | 'clothing' | 'onesize';
}

/**
 * Determine item permissions based on category
 *
 * Looks up the category configuration and translates it to permission flags.
 * If the category is not found, returns safe defaults (all operations allowed).
 *
 * @param category - Item category (e.g., 'sneakers', 'tops', 'accessories')
 * @returns ItemPermissions object with boolean flags for each operation type
 * @throws No - returns safe defaults if category config not found
 */
export function useItemPermissions(category: ItemCategory): ItemPermissions {
	const config = getCategoryConfig(category);

	// Default permissions when config is not available
	const defaults: ItemPermissions = {
		canTrackWearCount: true,
		canMarkPurchased: true,
		canAddToCollection: true,
		requiresSize: false,
		requiresComfort: true,
		sizeType: 'onesize',
	};

	if (!config) {
		return defaults;
	}

	return {
		canTrackWearCount: config.allowWears,
		canMarkPurchased: config.allowPurchased,
		canAddToCollection: config.allowCollection,
		requiresSize: config.requiresSize,
		requiresComfort: config.requiresComfort,
		sizeType: config.sizeType,
	};
}
