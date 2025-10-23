/**
 * ItemFooterBadges - Footer section with wear tracking button
 *
 * Displays:
 * - View Cost Per Wear button (collection mode with wears tracking)
 */

"use client";

import { useState } from "react";
import { SizingJournalEntry } from "@/components/types/sizing-journal-entry";
import { WearStatsDrawer } from "./WearStatsDrawer";
import { Button } from "@/components/ui/button";
import { TrendingDown } from "lucide-react";

interface ItemFooterBadgesProps {
	item: SizingJournalEntry;
	viewMode: 'journal' | 'collection' | 'archive' | 'wishlist';
	canTrackWears?: boolean;
	onIncrementWear?: (item: SizingJournalEntry) => void;
	onDecrementWear?: (item: SizingJournalEntry) => void;
}

export function ItemFooterBadges({
	item,
	viewMode,
	canTrackWears = false,
	onIncrementWear,
	onDecrementWear,
}: ItemFooterBadgesProps) {
	const [wearDrawerOpen, setWearDrawerOpen] = useState(false);
	const showWearButton = viewMode === 'collection' && canTrackWears && onIncrementWear && onDecrementWear;

	return (
		<>
			<div className='dense flex items-center gap-2 flex-wrap'>
				{/* View Cost Per Wear Button - Collection View Only */}
				{showWearButton && (
					<Button
						onClick={() => setWearDrawerOpen(true)}
						variant='outline'
						className='flex items-center gap-2 bg-foreground  text-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95'
						size='sm'
						aria-label='View cost per wear statistics'>
						<TrendingDown className='h-4 w-4' />
						<span>View Cost Per Wear</span>
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
