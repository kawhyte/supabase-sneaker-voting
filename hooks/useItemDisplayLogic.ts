/**
 * useItemDisplayLogic - Determine what content to display based on item status
 *
 * Computes display flags used by UI components to show/hide content.
 * Handles three key display concerns:
 * - Item ownership status (owned vs wishlisted - affects wear tracking visibility)
 * - Sale status (whether item has a lower sale price - affects pricing badge)
 * - Archive status (implicitly handled by component filter)
 *
 * This hook centralizes display logic to ensure consistency across the app.
 * For example, wear counters only show for owned items, price comparisons only
 * show when there's both a retail and sale price.
 *
 * @example
 * const display = useItemDisplayLogic(item);
 * return (
 *   <>
 *     {display.isOwned && <WearCounter />}
 *     {display.isOnSale && <SaleBadge />}
 *   </>
 * );
 *
 * @see ItemDisplayLogic for the returned object structure
 */

import { WardrobeItem } from '@/components/types/WardrobeItem';

export interface ItemDisplayLogic {
	isOwned: boolean;
	isWishlist: boolean;
	isOnSale: boolean;
}

/**
 * Compute display logic based on item status and pricing
 *
 * Pure function that evaluates display conditions without side effects.
 * Always safe to call multiple times (memoization-friendly).
 *
 * Logic:
 * - isOwned: true if item status is 'owned'
 * - isWishlist: true if item status is 'wishlisted'
 * - isOnSale: true if both sale_price and retail_price exist AND sale_price < retail_price
 *
 * @param item - The wardrobe item to evaluate
 * @returns ItemDisplayLogic object with boolean flags for display decisions
 *
 * @example
 * const { isOwned, isOnSale } = useItemDisplayLogic(item);
 * // Use flags in conditional rendering: {isOwned && <WearCounter />}
 */
export function useItemDisplayLogic(item: WardrobeItem): ItemDisplayLogic {
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
