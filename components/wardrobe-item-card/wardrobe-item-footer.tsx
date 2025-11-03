/**
 * ItemFooterBadges - Footer section with action buttons
 *
 * Displays:
 * - Create Outfit button (for owned items - launch Outfit Studio)
 * - View Cost Per Wear button (collection mode with wears tracking)
 */

"use client";

import { useState } from "react";
import { SizingJournalEntry } from "@/components/types/sizing-journal-entry";
import { WearStatsDrawer } from "./wear-stats-drawer";
import { Button } from "@/components/ui/button";
import { TrendingDown, Sparkles } from "lucide-react";

interface ItemFooterBadgesProps {
	item: SizingJournalEntry;
	viewMode: 'journal' | 'collection' | 'archive' | 'wishlist';
	canTrackWears?: boolean;
	onIncrementWear?: (item: SizingJournalEntry) => void;
	onDecrementWear?: (item: SizingJournalEntry) => void;
	onCreateOutfit?: (item: SizingJournalEntry) => void;
	userWardrobe?: SizingJournalEntry[];
}

export function ItemFooterBadges({
	item,
	viewMode,
	canTrackWears = false,
	onIncrementWear,
	onDecrementWear,
	onCreateOutfit,
	userWardrobe = [],
}: ItemFooterBadgesProps) {
	const [wearDrawerOpen, setWearDrawerOpen] = useState(false);
	const showWearButton = viewMode === 'collection' && canTrackWears && onIncrementWear && onDecrementWear;
	const showOutfitButton = viewMode === 'collection' && item.status === 'owned' && onCreateOutfit;

	return (
		<>
			<div className='dense flex items-center gap-2 flex-wrap'>
				{/* View Cost Per Wear Button - Collection View Only */}
				{showWearButton && (
					<Button
						onClick={() => setWearDrawerOpen(true)}
						variant='outline'
						className='flex items-center gap-2 bg-foreground text-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95'
						size='sm'
						aria-label='View cost per wear statistics'>
						<TrendingDown className='h-4 w-4' />
						<span>Cost Per Wear</span>
					</Button>
				)}

				{/* Create Outfit Button - Collection View Only */}
				{showOutfitButton && (
					<Button
						onClick={() => onCreateOutfit(item)}
						variant='outline'
						className='flex items-center gap-2 bg-sun-400 text-slate-900 hover:bg-sun-500 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95'
						size='sm'
						aria-label='Create an outfit with this item'>
						<Sparkles className='h-4 w-4' />
						<span>Create Outfit</span>
					</Button>
				)}
			</div>

			{/* Wear Stats Drawer */}
			{showWearButton && (
				<WearStatsDrawer
					item={item}
					isOpen={wearDrawerOpen}
					onOpenChange={setWearDrawerOpen}
					onIncrementWear={onIncrementWear}
					onDecrementWear={onDecrementWear}
				/>
			)}
		</>
	);
}
