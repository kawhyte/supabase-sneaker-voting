import type { ItemCategory } from "@/components/types/item-category";

// ============================================================================
// SIZE DEFINITIONS
// ============================================================================

// US Men's shoe sizes
export const US_MENS_SIZES = [
	"6",
	"6.5",
	"7",
	"7.5",
	"8",
	"8.5",
	"9",
	"9.5",
	"10",
	"10.5",
	"11",
	"11.5",
	"12",
	"12.5",
	"13",
	"13.5",
	"14",
	"14.5",
	"15",
];

// US Women's shoe sizes
export const US_WOMENS_SIZES = [
	"5",
	"5.5",
	"6",
	"6.5",
	"7",
	"7.5",
	"8",
	"8.5",
	"9",
	"9.5",
	"10",
	"10.5",
	"11",
	"11.5",
	"12",
];

// EU shoe sizes
export const EU_SIZES = [
	"36",
	"36.5",
	"37",
	"37.5",
	"38",
	"38.5",
	"39",
	"39.5",
	"40",
	"40.5",
	"41",
	"41.5",
	"42",
	"42.5",
	"43",
	"43.5",
	"44",
	"44.5",
	"45",
	"45.5",
	"46",
	"46.5",
	"47",
	"47.5",
	"48",
	"48.5",
	"49",
	"49.5",
	"50",
];

// Clothing sizes
export const CLOTHING_SIZES = [
	"XXS",
	"XS",
	"S",
	"M",
	"L",
	"XL",
	"XXL",
	"XXXL",
];

// Size groups for shoe size selector
export interface SizeGroup {
	label: string;
	sizes: string[];
}

export const SHOE_SIZE_GROUPS: SizeGroup[] = [
	{ label: "US Men's", sizes: US_MENS_SIZES },
	{ label: "US Women's", sizes: US_WOMENS_SIZES },
	{ label: "EU", sizes: EU_SIZES },
];

// ============================================================================
// SHOPPING URL HELPER
// ============================================================================

/**
 * Returns the best external link for purchasing a wishlisted item.
 * - Returns product_url directly if set (scraper-tracked items).
 * - For eBay-tracked items (product_url is null), builds a filtered eBay search
 *   URL matching the Edge Function's query logic.
 */
export function getShoppingUrl(item: {
	product_url?: string | null;
	status?: string;
	auto_price_tracking_enabled?: boolean;
	brand?: string;
	model?: string;
	size_tried?: string | null;
}): string | null {
	if (item.product_url) return item.product_url;

	if (
		item.status === 'wishlisted' &&
		item.auto_price_tracking_enabled === true &&
		item.brand &&
		item.model
	) {
		const rawQuery = `${item.brand} ${item.model}`;
		const cleanQuery = rawQuery
			.replace(/\b(men|women|mens|womens|size|grade\s+school|gs|preschool|ps|infant|toddler)\b/gi, '')
			.replace(/\b(19|20)\d{2}\b/g, '')
			.replace(/\s{2,}/g, ' ')
			.trim();

		const sizeStr = item.size_tried?.trim();
		const finalQuery = sizeStr ? `${cleanQuery} size ${sizeStr}`.trim() : cleanQuery;

		return `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(finalQuery)}&_sacat=15709&LH_ItemCondition=1000&LH_BIN=1`;
	}

	return null;
}

// ============================================================================
// URL CATEGORY DETECTION
// ============================================================================

/**
 * Detect category from product URL
 */
export function detectCategoryFromUrl(url: string): ItemCategory | null {
	try {
		const urlLower = url.toLowerCase();
		const hostname = new URL(url).hostname.toLowerCase();

		// Shoe retailers and brands
		if (
			hostname.includes("nike.com") ||
			hostname.includes("adidas.com") ||
			hostname.includes("footlocker.com") ||
			hostname.includes("finishline.com") ||
			hostname.includes("sneakersnstuff.com") ||
			hostname.includes("stockx.com") ||
			hostname.includes("goat.com") ||
			hostname.includes("stadium goods") ||
			urlLower.includes("/shoes/") ||
			urlLower.includes("/sneakers/") ||
			urlLower.includes("/footwear/")
		) {
			return "lifestyle";
		}

		// No match found
		return null;
	} catch (error) {
		console.error("Error detecting category from URL:", error);
		return null;
	}
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format category for display
 */
export function formatCategory(category: ItemCategory): string {
	const labels: Record<ItemCategory, string> = {
		lifestyle: "Lifestyle",
		running: "Running",
		basketball: "Basketball",
		skate: "Skate",
		training: "Training",
		boots: "Boots",
		other: "Other",
	};
	return labels[category] || category;
}

/**
 * Format category for plural display
 */
export function formatCategoryPlural(category: ItemCategory): string {
	const labels: Record<ItemCategory, string> = {
		lifestyle: "Lifestyle",
		running: "Running",
		basketball: "Basketball",
		skate: "Skate",
		training: "Training",
		boots: "Boots",
		other: "Other",
	};
	return labels[category] || category;
}

/**
 * Get category icon name for Lucide icons
 * @deprecated Use CATEGORY_CONFIGS from types instead
 */
export function getCategoryIcon(category: ItemCategory): string {
	const icons: Record<ItemCategory, string> = {
		lifestyle: "Footprints",
		running: "Activity",
		basketball: "Trophy",
		skate: "Wind",
		training: "Dumbbell",
		boots: "Mountain",
		other: "Package",
	};
	return icons[category] || "Footprints";
}
