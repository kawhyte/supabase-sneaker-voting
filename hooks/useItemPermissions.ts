/**
 * useItemPermissions - Determine what operations are allowed for an item
 *
 * Based on item category, determines:
 * - Can track wear count
 * - Can mark as purchased
 * - Can add to collection
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
 * @param category - Item category
 * @returns Object with permission flags
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
