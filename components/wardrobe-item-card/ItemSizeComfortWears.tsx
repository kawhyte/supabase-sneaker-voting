/**
 * ItemSizeComfortWears - Size, comfort rating, and wear tracking section
 *
 * Displays:
 * - Ideal/actual size
 * - Comfort rating
 * - Wear counter (collection mode only, for shoes)
 * - Cost per wear calculation
 */

"use client";

import { Minus, Plus } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { SizingJournalEntry } from "@/components/types/sizing-journal-entry";
import { getComfortLabel, calculateCostPerWear } from "@/lib/wardrobe-item-utils";

interface ItemSizeComfortWearsProps {
	item: SizingJournalEntry;
	viewMode: 'journal' | 'collection' | 'archive' | 'wishlist';
	canTrackWears: boolean;
	onIncrementWear?: (item: SizingJournalEntry) => void;
	onDecrementWear?: (item: SizingJournalEntry) => void;
}

export function ItemSizeComfortWears({
	item,
	viewMode,
	canTrackWears,
	onIncrementWear,
	onDecrementWear,
}: ItemSizeComfortWearsProps) {
	const comfortInfo = item.comfort_rating ? getComfortLabel(item.comfort_rating) : null;
	const showWearCounter = viewMode === 'collection' && canTrackWears && onIncrementWear && onDecrementWear;

	return (
		<div className='flex items-center gap-2 text-sm flex-wrap'>
			{/* Size Display */}
			{item.size_tried && (
				<>
					<span className='badge-size-highlight text-muted-foreground'>
						{viewMode === 'collection' ? 'Size' : 'Ideal Size'}: {item.size_tried}
					</span>
					{(comfortInfo || showWearCounter) && (
						<span className='hidden sm:inline text-muted-foreground mx-0.5'>|</span>
					)}
				</>
			)}

			{/* Comfort Rating */}
			{comfortInfo && (
				<div className='flex items-center gap-1.5'>
					<span className='text-muted-foreground'>Comfort:</span>
					<span className={`${comfortInfo.color} font-medium text-sm`}>
						{comfortInfo.label}
					</span>
				</div>
			)}

			{/* Wear Counter (Collection Mode Only) */}
			{showWearCounter && (
				<>
					{comfortInfo && (
						<span className='hidden sm:inline text-muted-foreground mx-0.5'>|</span>
					)}
					<div className='flex items-center gap-1.5'>
						<span className='text-muted-foreground text-xs'>Wears:</span>

						{/* Decrement Button */}
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									onClick={() => onDecrementWear!(item)}
									disabled={!item.wears || item.wears === 0}
									className='h-5 w-5 rounded-full flex items-center justify-center transition-all hover:bg-stone-100 active:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed text-muted-foreground'
									type='button'
									aria-label='Subtract one wear'>
									<Minus className='h-3 w-3' />
								</button>
							</TooltipTrigger>
							<TooltipContent side="top" className="z-[9999]">
								<p>Subtract wear (-1)</p>
							</TooltipContent>
						</Tooltip>

						{/* Count Display */}
						<span className='font-bold text-sm text-foreground'>
							{item.wears || 0}
						</span>

						{/* Increment Button */}
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									onClick={() => onIncrementWear!(item)}
									className='h-5 w-5 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 bg-primary text-white'
									type='button'
									aria-label='Add one wear'>
									<Plus className='h-3 w-3' />
								</button>
							</TooltipTrigger>
							<TooltipContent side="top" className="z-[9999]">
								<p>Add wear (+1)</p>
							</TooltipContent>
						</Tooltip>

						{/* Cost Per Wear */}
						<span className='text-muted-foreground mx-1'>•</span>
						<Tooltip>
							<TooltipTrigger asChild>
								<span
									className='text-xs font-medium cursor-help text-muted-foreground'
								>
									${calculateCostPerWear(item.purchase_price, item.retail_price, item.wears)}/wear
								</span>
							</TooltipTrigger>
							<TooltipContent side="top" className="z-[9999]">
								<p className="text-xs">
									{item.purchase_price || item.retail_price
										? `$${item.purchase_price || item.retail_price} ÷ ${item.wears || 0} wears`
										: 'Set a price to calculate cost per wear'}
								</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</>
			)}
		</div>
	);
}
