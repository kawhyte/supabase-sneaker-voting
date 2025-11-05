/**
 * Wardrobe item validators
 *
 * Pure functions for validating wardrobe item data.
 * These are testable and reusable across components.
 */

import { ItemStatus } from '@/types/ItemStatus';

interface WardrobeItem {
	purchase_price?: number
	retail_price?: number
	wears?: number
	is_archived?: boolean
	status?: ItemStatus
	item_photos?: any[]
}

/**
 * Validate that an item has all required fields for cost-per-wear.
 *
 * Cost per wear requires:
 * - A price (purchase or retail)
 * - At least one wear recorded
 */
export function canCalculateCostPerWear(item: WardrobeItem): boolean {
	return !!(item.purchase_price || item.retail_price) && (item.wears || 0) > 0
}

/**
 * Validate that an item can be archived.
 *
 * Can't archive what's already archived.
 */
export function canArchiveItem(item: WardrobeItem): boolean {
	return !item.is_archived
}

/**
 * Validate that an item can be unarchived.
 *
 * Can only unarchive items that are already archived.
 */
export function canUnarchiveItem(item: WardrobeItem): boolean {
	return !!item.is_archived
}

/**
 * Validate that an item can be added to an outfit.
 *
 * Requirements:
 * - Must be owned (not wishlisted)
 * - Must have at least one photo
 */
export function canAddToOutfit(item: WardrobeItem): boolean {
	return (
		item.status === ItemStatus.OWNED &&
		(item.item_photos?.length || 0) > 0
	)
}

/**
 * Validate that an item has a valid price.
 *
 * Valid price means at least one price field is set.
 */
export function hasValidPrice(item: WardrobeItem): boolean {
	return !!(item.purchase_price || item.retail_price)
}

/**
 * Validate purchase price is realistic.
 *
 * Price must be between $0 and $10,000
 */
export function isRealisticPrice(price: number): boolean {
	return price >= 0 && price <= 10000
}
