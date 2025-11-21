/**
 * ItemPricingDisplay - Context-aware pricing section
 *
 * Displays different pricing based on item status:
 * - Owned items: Purchase price + cost per wear
 * - Wishlist items: Retail, sale (if on sale), and target prices
 * - Shows stale price warning for wishlist items
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { WardrobeItem } from '@/components/types/WardrobeItem';
import { StalePriceWarning } from "./StalePriceWarning";

interface ItemPricingDisplayProps {
	item: WardrobeItem;
	isOwned: boolean;
	isOnSale: boolean;
	onRefreshPrice?: (itemId: string) => Promise<void>;
	onManualEntrySuccess?: () => void;
	isPublicView?: boolean; // Hide target price and price tracking in public view
}

export function ItemPricingDisplay({
	item,
	isOwned,
	isOnSale,
	onRefreshPrice,
	onManualEntrySuccess,
	isPublicView = false,
}: ItemPricingDisplayProps) {
	if (isOwned) {
		// OWNED ITEMS: Show purchase price
		if (!item.purchase_price) return null;

		return (
			<div className='flex items-center gap-1.5 px-2 -mx-2 rounded-md transition-colors hover:bg-stone-50/50'>
				<span className='text-sm text-muted-foreground'>
					Purchase Price:
				</span>
				<span className='text-sm text-muted-foreground'>
					${item.purchase_price}
				</span>
			</div>
		);
	}

	// WISHLIST ITEMS: Show retail/sale price and target price
	return (
		<div className='flex flex-col gap-2.5'>
			{/* Show pricing if we have either retail price OR sale price */}
			{(item.retail_price || item.sale_price) && (
				<div className='flex items-center gap-1.5 flex-wrap px-2 py-1 -mx-2 rounded-md transition-colors hover:bg-stone-50/50'>
					{item.retail_price && (
						<>
							<span className='text-sm text-muted-foreground'>Retail:</span>
							{isOnSale ? (
								<>
									<span className='text-sm line-through text-muted-foreground'>
										${item.retail_price}
									</span>
									<span className='text-base font-bold text-meadow-600'>
										${item.sale_price}
									</span>
									<Badge
										variant='outline'
										className='text-xs px-1.5 py-0 rounded-md border-meadow-400 bg-meadow-50 text-meadow-600 transition-all duration-200'
									>
										On Sale!
									</Badge>
								</>
							) : (
								<span className='text-base font-semibold text-foreground'>
									${item.retail_price}
								</span>
							)}
						</>
					)}

					{/* Show sale price even without retail price (from price check) */}
					{!item.retail_price && item.sale_price && (
						<>
							<span className='text-sm text-muted-foreground'>Current Price:</span>
							<span className='text-base font-semibold text-foreground'>
								${item.sale_price}
							</span>
						</>
					)}
				</div>
			)}

			{/* Target price - Hide in public view */}
			{!isPublicView && item.target_price && (
				<div className='flex items-center gap-1.5 px-2 py-1 -mx-2 rounded-md transition-colors hover:bg-stone-50/50'>
					<span className='text-sm text-muted-foreground'>Target:</span>
					<span className='text-base font-semibold text-foreground'>
						${item.target_price}
					</span>
				</div>
			)}

			{/* Stale price warning for wishlist items - Hide in public view */}
			{!isPublicView && (
				<StalePriceWarning
					itemId={item.id}
					itemName={`${item.brand} ${item.model}`}
					lastPriceCheckAt={item.last_price_check_at || null}
					isAutoTrackingEnabled={item.auto_price_tracking_enabled !== false}
					priceCheckFailures={item.price_check_failures || 0}
					onRefreshPrice={onRefreshPrice}
					retailPrice={item.retail_price}
					currentPrice={item.sale_price}
					onManualEntrySuccess={onManualEntrySuccess}
				/>
			)}
		</div>
	);
}
