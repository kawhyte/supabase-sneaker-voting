/**
 * ItemFooterBadges - Footer section with action buttons
 *
 * Displays:
 * - Create Outfit button (for owned items - launch Outfit Studio)
 * - View Cost Per Wear button (collection mode with wears tracking)
 */

"use client";

import { useState } from "react";
import { WardrobeItem } from '@/components/types/WardrobeItem';
import { WearStatsDrawer } from "./WearStatsDrawer";
import { TrendingDown } from "lucide-react";

interface ItemFooterBadgesProps {
	item: WardrobeItem;
	viewMode: 'journal' | 'collection' | 'archive' | 'wishlist';
	canTrackWears?: boolean;
	onIncrementWear?: (item: WardrobeItem) => void;
	onDecrementWear?: (item: WardrobeItem) => void;
	userWardrobe?: WardrobeItem[];
}

export function ItemFooterBadges({
	item,
	viewMode,
	canTrackWears = false,
	onIncrementWear,
	onDecrementWear,
	userWardrobe = [],
}: ItemFooterBadgesProps) {
	const [wearDrawerOpen, setWearDrawerOpen] = useState(false);
	const showWearButton = viewMode === 'collection' && canTrackWears && onIncrementWear && onDecrementWear;

	return (
		<>
			<div className='dense flex items-center gap-2 flex-wrap'>
				{/* View Cost Per Wear Button - Collection View Only */}
				{showWearButton && (
					<button
						onClick={() => setWearDrawerOpen(true)}
						className='h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-accent transition-colors'
						type='button'
						aria-label='View wear statistics'>
						<TrendingDown className='h-4 w-4' />
					</button>
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
