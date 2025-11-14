import type { ItemCategory } from '@/components/types/item-category'
import { ItemStatus } from '@/types/ItemStatus'

/**
 * Wardrobe item display logic
 *
 * Pure functions for determining which UI elements should be displayed
 * based on item properties. These are testable and reusable across components.
 */

interface WardrobeItem {
	status: ItemStatus
	category: ItemCategory
	wears?: number
	purchase_price?: number
	retail_price?: number
	product_url?: string
	item_photos?: any[]
	created_at?: string
}

/**
 * Determines if an item should show a wear counter.
 *
 * Wear tracking is only for:
 * - Owned items (not wishlisted)
 * - Categories that get worn: shoes, accessories
 *
 * Other categories don't track wears by default.
 */
export function shouldShowWearCounter(item: WardrobeItem): boolean {
	const wearableCategories: ItemCategory[] = [
		'shoes',
		'accessories',
	]

	return (
		item.status === ItemStatus.OWNED &&
		wearableCategories.includes(item.category)
	)
}

/**
 * Determines if an item should show cost-per-wear progress.
 *
 * Requirements:
 * - Must be owned (not wishlisted)
 * - Must have a price (retail or purchase)
 * - Must have been worn at least once
 */
export function shouldShowCostPerWear(item: WardrobeItem): boolean {
	const hasPrice = !!(item.purchase_price || item.retail_price)
	const hasWears = (item.wears || 0) > 0

	return item.status === ItemStatus.OWNED && hasPrice && hasWears
}

/**
 * Determines if an item should show price monitoring badge.
 *
 * Only for wishlisted items with a product URL configured.
 */
export function shouldShowPriceMonitoring(item: WardrobeItem): boolean {
	return item.status === ItemStatus.WISHLISTED && !!item.product_url
}

/**
 * Get all display flags for an item at once.
 *
 * Convenience function to avoid multiple function calls.
 */
export function getItemDisplayFlags(item: WardrobeItem) {
	return {
		showWearCounter: shouldShowWearCounter(item),
		showCostPerWear: shouldShowCostPerWear(item),
		showPriceMonitoring: shouldShowPriceMonitoring(item),
	}
}

/**
 * Determines if an item can be added to an outfit.
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
