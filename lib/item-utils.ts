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
			return "shoes";
		}


		// Accessories (bags, hats, etc.)
		if (
			hostname.includes("coach.com") ||
			hostname.includes("beistravel.com") ||
			urlLower.includes("/bags/") ||
			urlLower.includes("/backpack/") ||
			urlLower.includes("/accessories/") ||
			urlLower.includes("/hats/") ||
			urlLower.includes("/belts/")||
			urlLower.includes("/watch/") ||
			urlLower.includes("/socks/")
		) {
			return "accessories";
		}

		// Outerwear
		if (
			urlLower.includes("/coats/") ||
			urlLower.includes("/jackets/") ||
			urlLower.includes("/outerwear/") ||
			urlLower.includes("/vests/")
		) {
			return "outerwear";
		}

		// Bottoms
		if (
			urlLower.includes("/pants/") ||
			urlLower.includes("/jeans/") ||
			urlLower.includes("/shorts/") ||
			urlLower.includes("/trousers/") ||
			urlLower.includes("/bottoms/")
		) {
			return "bottoms";
		}

		// Tops (default for clothing retailers)
		if (
			hostname.includes("gap.com") ||
			hostname.includes("oldnavy.com") ||
			hostname.includes("bananarepublic") ||
			hostname.includes("stance.com") ||
			urlLower.includes("/shirts/") ||
			urlLower.includes("/hoodies/") ||
			urlLower.includes("/sweatshirts/") ||
			urlLower.includes("/tops/") ||
			urlLower.includes("/tees/") ||
			urlLower.includes("/t-shirts/")
		) {
			return "tops";
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
		shoes: "Shoes",
		tops: "Top",
		bottoms: "Bottoms",
		outerwear: "Outerwear",
		accessories: "Accessory",
		
	};
	return labels[category] || category;
}

/**
 * Format category for plural display
 */
export function formatCategoryPlural(category: ItemCategory): string {
	const labels: Record<ItemCategory, string> = {
		shoes: "Shoes",
		tops: "Tops",
		bottoms: "Bottoms",
		outerwear: "Outerwear",
		accessories: "Accessories",
		
	};
	return labels[category] || category;
}

/**
 * Get category emoji icon
 */
export function getCategoryEmoji(category: ItemCategory): string {
	const emojis: Record<ItemCategory, string> = {
		shoes: "👟",
		tops: "👕",
		bottoms: "👖",
		outerwear: "🧥",
		accessories: "🎒",
	
	};
	return emojis[category] || "📦";
}
