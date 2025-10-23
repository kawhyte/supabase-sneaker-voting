/**
 * ItemStoreAndDate - Store location and last worn date display
 *
 * Shows:
 * - Store name (if available)
 * - Last worn date (collection mode only)
 */

"use client";

import { MapPin, Calendar } from "lucide-react";
import { formatDate } from "@/lib/wardrobe-item-utils";

interface ItemStoreAndDateProps {
	storeName?: string;
	lastWornDate?: string | null;
	viewMode: 'journal' | 'collection' | 'archive' | 'wishlist';
	canTrackWears: boolean;
}

export function ItemStoreAndDate({
	storeName,
	lastWornDate,
	viewMode,
	canTrackWears,
}: ItemStoreAndDateProps) {
	const showLastWorn = viewMode === 'collection' && canTrackWears && lastWornDate;
	const hasContent = storeName || showLastWorn;

	if (!hasContent) return null;

	return (
		<div className='flex items-center gap-2 text-xs flex-wrap text-muted-foreground'>
			{storeName && (
				<>
					<div className='flex items-center gap-1'>
						<MapPin className='h-4 w-4 text-muted-foreground' />
						<span className='truncate text-sm max-w-[160px] sm:max-w-[200px]'>
							{storeName}
						</span>
					</div>
					{showLastWorn && (
						<span className='hidden sm:inline text-muted-foreground mx-0.5'>|</span>
					)}
				</>
			)}

			{showLastWorn && (
				<div className='flex items-center gap-1'>
					<Calendar className='h-3.5 w-3.5 text-muted-foreground' />
					<span className='text-xs'>Last worn: {formatDate(lastWornDate!)}</span>
				</div>
			)}
		</div>
	);
}
