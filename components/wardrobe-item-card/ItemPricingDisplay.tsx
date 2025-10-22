/**
 * ItemPricingDisplay - Context-aware pricing section
 *
 * Displays different pricing based on item status:
 * - Owned items: Purchase price + cost per wear
 * - Wishlist items: Retail, sale (if on sale), and target prices
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { SizingJournalEntry } from "@/components/types/sizing-journal-entry";

interface ItemPricingDisplayProps {
	item: SizingJournalEntry;
	isOwned: boolean;
	isOnSale: boolean;
}

export function ItemPricingDisplay({
	item,
	isOwned,
	isOnSale,
}: ItemPricingDisplayProps) {
	if (isOwned) {
		// OWNED ITEMS: Show purchase price
		if (!item.purchase_price) return null;

		return (
			<div className='flex items-center gap-1'>
				<span className='text-sm text-muted-foreground'>
					Paid:
				</span>
				<span className='text-sm font-semibold text-foreground'>
					${item.purchase_price}
				</span>
			</div>
		);
	}

	// WISHLIST ITEMS: Show retail/sale price and target price
	return (
		<div className='flex flex-col gap-1.5'>
			{item.retail_price && (
				<div className='flex items-center gap-1 flex-wrap'>
					<span className='text-sm text-muted-foreground'>Retail:</span>
					{isOnSale ? (
						<>
							<span className='text-sm line-through text-muted-foreground'>
								${item.retail_price}
							</span>
							<span className='text-sm font-bold text-meadow-600'>
								${item.sale_price}
							</span>
							<Badge
								variant='outline'
								className='text-xs px-1.5 py-0 rounded-md border-meadow-400 bg-meadow-50 text-meadow-600'
							>
								On Sale!
							</Badge>
						</>
					) : (
						<span className='text-sm font-semibold text-foreground'>
							${item.retail_price}
						</span>
					)}
				</div>
			)}
			{item.target_price && (
				<div className='flex items-center gap-1'>
					<span className='text-sm text-muted-foreground'>Target:</span>
					<span className='text-sm font-semibold text-foreground'>
						${item.target_price}
					</span>
				</div>
			)}
		</div>
	);
}
