/**
 * ItemSizeComfortWears - Size and comfort rating section
 *
 * Displays:
 * - Ideal/actual size
 * - Comfort rating
 */

"use client";

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { SizingJournalEntry } from "@/components/types/sizing-journal-entry";
import { getComfortLabel } from "@/lib/wardrobe-item-utils";

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

	return (
		<div className='flex items-center gap-2 text-sm flex-wrap'>
			{/* Size Display */}
			{item.size_tried && (
				<>
					<span className='badge-size-highlight text-muted-foreground'>
						{viewMode === 'collection' ? 'Size' : 'Ideal Size'}: {item.size_tried}
					</span>
					{comfortInfo && (
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
		</div>
	);
}
