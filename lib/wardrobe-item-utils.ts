/**
 * Wardrobe Item Utilities - Business logic and data transformation
 *
 * These functions handle:
 * - Data formatting (dates, prices)
 * - Label generation (comfort ratings)
 * - Calculations (cost per wear)
 * - Data normalization (photos)
 */

import { SizingJournalEntry, ItemPhoto } from '@/components/types/sizing-journal-entry';

/**
 * Get comfort rating label and color
 * @param rating - Comfort rating (1-5)
 * @returns Label and color class for display
 */
export function getComfortLabel(rating: number | undefined): { label: string; color: string } | null {
	if (!rating) return null;

	const comfortMap: Record<number, { label: string; color: string }> = {
		1: {
			label: 'Unwearable',
			color: 'text-destructive',
		},
		2: {
			label: 'Uncomfortable',
			color: 'text-sun-600',
		},
		3: {
			label: 'Neutral',
			color: 'text-slate-500',
		},
		4: {
			label: 'Comfortable',
			color: 'text-meadow-600',
		},
		5: {
			label: 'Perfect',
			color: 'text-sun-400',
		},
	};

	return comfortMap[rating] || null;
}

/**
 * Format date to readable string (e.g., "Oct 18, 2025")
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

/**
 * Convert archive reason to display label
 * @param reason - Archive reason code (e.g., 'worn_out')
 * @returns Human-readable reason string
 */
export function formatArchiveReason(reason: string): string {
	const reasonMap: Record<string, string> = {
		sold: 'Sold',
		donated: 'Donated',
		worn_out: 'Worn Out',
		other: 'Other',
	};
	return reasonMap[reason] || reason;
}

/**
 * Calculate cost per wear
 * @param purchasePrice - Price paid for item
 * @param listPrice - Retail/list price
 * @param wears - Number of times worn
 * @returns Formatted cost per wear (e.g., "$12.50/wear" or "N/A")
 */
export function calculateCostPerWear(
	purchasePrice: number | undefined,
	listPrice: number | undefined,
	wears: number | undefined
): string {
	const price = purchasePrice ?? listPrice;
	if (!price || !wears || wears === 0) return 'N/A';
	return (price / wears).toFixed(2);
}

/**
 * Extract and normalize photos from item entry
 * Prioritizes item_photos array, falls back to image_url
 *
 * @param item - Wardrobe item entry
 * @returns Array of photos with normalized structure
 */
export function prepareItemPhotos(item: SizingJournalEntry): ItemPhoto[] {
	// First priority: item_photos array
	if (item.item_photos && item.item_photos.length > 0) {
		return item.item_photos;
	}

	// Fallback: single image_url
	if (item.image_url) {
		return [
			{
				id: "main",
				image_url: item.image_url,
				image_order: 0,
				is_main_image: true,
			},
		];
	}

	// No photos available
	return [];
}

/**
 * Determine if item is on sale
 * @param item - Wardrobe item
 * @returns true if sale_price < retail_price
 */
export function isItemOnSale(item: SizingJournalEntry): boolean {
	return !!(item.sale_price && item.retail_price && item.sale_price < item.retail_price);
}

/**
 * Get image alt text for accessibility
 * @param brand - Brand name
 * @param model - Model name
 * @param color - Color (if not "Standard")
 * @returns Descriptive alt text
 */
export function getImageAltText(brand: string, model: string, color?: string): string {
	const baseText = `${brand} ${model}`;
	return color && color !== "Standard" ? `${baseText} in ${color}` : baseText;
}
