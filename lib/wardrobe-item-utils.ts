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
 * Determine target CPW threshold based on item price and category
 * Higher prices = can justify higher CPW; Lower prices = need lower CPW
 *
 * @param price - Item price (purchase or retail)
 * @param category - Item category (shoes, outerwear, accessories, etc.)
 * @returns Target cost per wear ($/wear) to consider item "worth it"
 */
export function getTargetCostPerWear(
	price: number | undefined,
	category: string | undefined
): number {
	if (!price || price <= 0) return 3;

	// Category-aware thresholds for different wear patterns
	const getThresholdForCategory = (p: number, cat?: string): number => {
		const isShoes = cat === 'shoes';
		const isOuterwear = cat === 'outerwear';
		const isAccessories = cat === 'accessories' || cat === 'jewelry' || cat === 'watches';

		// Shoes: More reasonable to have low CPW (worn frequently)
		if (isShoes) {
			if (p >= 300) return 8;
			if (p >= 150) return 5;
			if (p >= 75) return 3;
			return 2;
		}

		// Outerwear: Higher threshold (seasonal, fewer wears expected)
		if (isOuterwear) {
			if (p >= 300) return 12;
			if (p >= 150) return 8;
			if (p >= 75) return 5;
			return 3;
		}

		// Accessories/Jewelry: Mid-range (occasional wear)
		if (isAccessories) {
			if (p >= 300) return 10;
			if (p >= 150) return 7;
			if (p >= 75) return 4;
			return 2.5;
		}

		// Default for other categories
		if (p >= 300) return 10;
		if (p >= 150) return 7;
		if (p >= 75) return 5;
		return 3;
	};

	const threshold = getThresholdForCategory(price, category);

	// Cap very high prices at $15/wear max (luxury items)
	return Math.min(threshold, 15);
}

/**
 * Calculate comprehensive worth it metrics
 * Determines if item has been worn enough to justify purchase price
 *
 * @param item - SizingJournalEntry with price and wear data
 * @returns Metrics for display and decision making
 */
export interface WorthItMetrics {
	isWorthIt: boolean;
	currentCPW: number | null;
	targetCPW: number;
	targetWears: number;
	progress: number; // 0-100
	wearsRemaining: number;
	milestoneMessage: string | null;
	milestoneEmoji: string | null;
}

export function calculateWorthItMetrics(item: SizingJournalEntry): WorthItMetrics {
	// Determine which price to use
	const purchasePrice = item.purchase_price;
	const retailPrice = item.retail_price;
	const price = purchasePrice ?? retailPrice;

	// Not applicable if no price or not owned
	if (!price || price <= 0 || item.status !== 'owned') {
		return {
			isWorthIt: false,
			currentCPW: null,
			targetCPW: 0,
			targetWears: 0,
			progress: 0,
			wearsRemaining: 0,
			milestoneMessage: null,
			milestoneEmoji: null,
		};
	}

	const wears = item.wears || 0;
	const targetCPW = getTargetCostPerWear(price, item.category);
	const targetWears = Math.ceil(price / targetCPW);
	const currentCPW = wears > 0 ? price / wears : null;
	const progress = Math.min((wears / targetWears) * 100, 100);
	const wearsRemaining = Math.max(targetWears - wears, 0);

	// Determine milestone message
	let milestoneMessage: string | null = null;
	let milestoneEmoji: string | null = null;

	if (wears === 0) {
		milestoneMessage = 'Start wearing! Track to see value';
		milestoneEmoji = '🚀';
	} else if (progress >= 100) {
		milestoneMessage = 'Worth it! Great value';
		milestoneEmoji = '✨';
	} else if (progress >= 75) {
		milestoneMessage = 'Almost there!';
		milestoneEmoji = '🚀';
	} else if (progress >= 50) {
		milestoneMessage = 'Halfway there!';
		milestoneEmoji = '💪';
	} else if (progress >= 25) {
		milestoneMessage = 'Great start!';
		milestoneEmoji = '🎯';
	}

	return {
		isWorthIt: progress >= 100,
		currentCPW,
		targetCPW: parseFloat(targetCPW.toFixed(2)),
		targetWears,
		progress: parseFloat(progress.toFixed(1)),
		wearsRemaining,
		milestoneMessage,
		milestoneEmoji,
	};
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
