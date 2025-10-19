/**
 * ItemSizeComfortWears - Size, comfort rating, and wear tracking section
 *
 * Displays:
 * - Ideal/actual size
 * - Comfort rating
 * - Clickable wears badge (opens drawer for detailed tracking)
 *
 * Wear tracking details are in a separate drawer for cleaner card layout.
 */

"use client";

import { useState } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { SizingJournalEntry } from "@/components/types/sizing-journal-entry";
import { getComfortLabel } from "@/lib/wardrobe-item-utils";
import { WearStatsDrawer } from "./WearStatsDrawer";

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
	const [wearDrawerOpen, setWearDrawerOpen] = useState(false);
	const comfortInfo = item.comfort_rating ? getComfortLabel(item.comfort_rating) : null;
	const showWearsBadge = viewMode === 'collection' && canTrackWears && onIncrementWear && onDecrementWear;

	return (
		<>
			<div className='flex items-center gap-2 text-sm flex-wrap'>
				{/* Size Display */}
				{item.size_tried && (
					<>
						<span className='badge-size-highlight text-muted-foreground'>
							{viewMode === 'collection' ? 'Size' : 'Ideal Size'}: {item.size_tried}
						</span>
						{(comfortInfo || showWearsBadge) && (
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

				{/* Wears Badge (Collection Mode Only) - Clickable */}
				{showWearsBadge && (
					<>
						{comfortInfo && (
							<span className='hidden sm:inline text-muted-foreground mx-0.5'>|</span>
						)}
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									onClick={() => setWearDrawerOpen(true)}
									className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs transition-colors cursor-pointer'
									type='button'
									aria-label='Open wear statistics'>
									👟 {item.wears || 0} {item.wears === 1 ? 'Wear' : 'Wears'}
								</button>
							</TooltipTrigger>
							<TooltipContent side="top" className="z-[9999]">
								<p>Click to view wear tracking details</p>
							</TooltipContent>
						</Tooltip>
					</>
				)}
			</div>

			{/* Wear Stats Drawer */}
			<WearStatsDrawer
				item={item}
				isOpen={wearDrawerOpen}
				onOpenChange={setWearDrawerOpen}
				onIncrementWear={onIncrementWear}
				onDecrementWear={onDecrementWear}
			/>
		</>
	);
}
