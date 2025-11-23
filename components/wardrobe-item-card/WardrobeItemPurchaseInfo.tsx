/**
 * ItemStoreAndDate - Store location and last worn date display
 *
 * Shows:
 * - Store name (if available)
 * - Store URL link (if available)
 * - Last worn date (collection mode only)
 */

"use client";

import { MapPin, Calendar, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/wardrobe-item-utils";
import { shortenStoreUrl, getFullDomain } from "@/lib/url-shortener";

interface ItemStoreAndDateProps {
	storeName?: string;
	storeUrl?: string | null;
	lastWornDate?: string | null;
	viewMode: 'journal' | 'collection' | 'archive' | 'wishlist';
	canTrackWears: boolean;
}

export function ItemStoreAndDate({
	storeName,
	storeUrl,
	lastWornDate,
	viewMode,
	canTrackWears,
}: ItemStoreAndDateProps) {
	const showLastWorn = viewMode === 'collection' && canTrackWears && lastWornDate;
	const hasStoreInfo = storeName || storeUrl;
	const hasContent = hasStoreInfo || showLastWorn;

	if (!hasContent) return null;

	return (
		<div className='flex items-center gap-2 text-xs flex-wrap text-muted-foreground'>
			{/* Store Information */}
			{hasStoreInfo && (
				<>
					<div className='flex items-center gap-1.5'>
						{/* Store Name */}
						{storeName && (
							<span className='truncate text-sm max-w-[160px] sm:max-w-[200px]'>
								{storeName}
							</span>
						)}

						{/* Store URL Link */}
						{storeUrl && (
							<a
								href={storeUrl}
								target='_blank'
								rel='noopener noreferrer'
								className='inline-flex items-center gap-1 text-sun-600 hover:text-sun-700 underline decoration-dotted underline-offset-2 transition-colors'
								title={getFullDomain(storeUrl) || storeUrl}
								onClick={(e) => e.stopPropagation()} // Prevent card click when clicking link
							>
								<ExternalLink className='h-3 w-3' />
								<span className='text-xs font-medium'>
									{shortenStoreUrl(storeUrl) || 'Store Link'}
								</span>
							</a>
						)}
					</div>
					{showLastWorn && (
						<span className='hidden sm:inline text-muted-foreground mx-0.5'>|</span>
					)}
				</>
			)}

			{/* Last Worn Date */}
			{showLastWorn && (
				<div className='flex items-center gap-1'>
					<span className='text-xs'>Last worn: {formatDate(lastWornDate!)}</span>
				</div>
			)}
		</div>
	);
}
