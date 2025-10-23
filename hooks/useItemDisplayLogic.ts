/**
 * useItemDisplayLogic - Determine what content to display based on item status
 *
 * Handles context-aware display logic:
 * - Whether item is owned or wishlisted
 * - Whether item is on sale
 * - Which pricing to show
 */

import { SizingJournalEntry } from '@/components/types/sizing-journal-entry';

export interface ItemDisplayLogic {
	isOwned: boolean;
	isWishlist: boolean;
	isOnSale: boolean;
}

/**
 * Compute display logic based on item status and pricing
 * @param item - Wardrobe item
 * @returns Object with display flags
 */
export function useItemDisplayLogic(item: SizingJournalEntry): ItemDisplayLogic {
	const isOwned = item.status === 'owned';
	const isWishlist = item.status === 'wishlisted';
	const isOnSale = !!(
		item.sale_price &&
		item.retail_price &&
		item.sale_price < item.retail_price
	);

	return {
		isOwned,
		isWishlist,
		isOnSale,
	};
}
