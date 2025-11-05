import { WardrobeItem } from "@/components/types/WardrobeItem";
import { ItemPosition, CategoryLayerConfig } from "@/components/types/Outfit";

/**
 * Outfit Layout Engine
 * Handles intelligent positioning of items on the outfit canvas
 * Items are auto-arranged by category with manual adjustment available
 */

// Canvas dimensions (iPhone 14 Pro mockup)
export const CANVAS_WIDTH = 375;
export const CANVAS_HEIGHT = 667;

// Item display size ranges (as % of canvas)
export const ITEM_SIZE_MIN = 0.15;
export const ITEM_SIZE_MAX = 0.6;

/**
 * Category-to-layer mapping for auto-arrange
 * Determines where items should be positioned vertically
 * Higher layer = appears on top (z-index)
 */
const CATEGORY_LAYER_MAP: Record<string, CategoryLayerConfig> = {
	// Shoes: bottom of outfit (layer 0)
	sneakers: { layer: 0, yPercent: 0.85, zIndex: 10 },
	shoes: { layer: 0, yPercent: 0.85, zIndex: 10 },

	// Bottoms: lower-middle (layer 1)
	bottoms: { layer: 1, yPercent: 0.55, zIndex: 20 },
	skirts: { layer: 1, yPercent: 0.55, zIndex: 20 },
	pants: { layer: 1, yPercent: 0.55, zIndex: 20 },

	// Tops: middle (layer 2)
	tops: { layer: 2, yPercent: 0.35, zIndex: 30 },
	shirts: { layer: 2, yPercent: 0.35, zIndex: 30 },
	sweaters: { layer: 2, yPercent: 0.35, zIndex: 30 },

	// Outerwear: top-ish (layer 3)
	outerwear: { layer: 3, yPercent: 0.25, zIndex: 40 },
	jackets: { layer: 3, yPercent: 0.25, zIndex: 40 },
	coats: { layer: 3, yPercent: 0.25, zIndex: 40 },

	// Accessories: floating (layer 4)
	accessories: { layer: 4, yPercent: 0.15, zIndex: 50 },
	bags: { layer: 4, yPercent: 0.2, zIndex: 50 },
	hats: { layer: 4, yPercent: 0.1, zIndex: 50 },

	// Default fallback
	other: { layer: 2, yPercent: 0.5, zIndex: 25 },
};

/**
 * Calculate auto-position for an item based on its category
 * Used when user first adds item to outfit
 *
 * @param item The wardrobe item
 * @param itemCountInCategory How many items of this category already in outfit
 * @returns Position object with x, y, layer, width, height
 */
export function calculateAutoPosition(
	item: WardrobeItem,
	itemCountInCategory: number = 0
): ItemPosition {
	const category = item.category || "other";
	const config = CATEGORY_LAYER_MAP[category] || CATEGORY_LAYER_MAP["other"];

	// Base size: medium (40% of canvas)
	const baseWidth = CANVAS_WIDTH * 0.4;
	const baseHeight = CANVAS_HEIGHT * 0.3;

	// Horizontal positioning: spread across canvas with slight offset for multiple items
	// First item: 50% (center), subsequent items: +/- 10-20%
	const horizontalSpread = itemCountInCategory * 0.08;
	const positionX = Math.max(
		0.2,
		Math.min(
			0.8,
			0.5 +
				(itemCountInCategory % 2 === 0 ? horizontalSpread : -horizontalSpread)
		)
	);

	// Vertical positioning: based on category layer
	const positionY = config.yPercent;

	return {
		x: positionX * CANVAS_WIDTH,
		y: positionY * CANVAS_HEIGHT,
		layer: config.layer,
		width: baseWidth,
		height: baseHeight,
	};
}

/**
 * Normalize canvas coordinates to 0-1 range
 * Used when saving item positions from pixel coordinates
 */
export function normalizePosition(
	pixelX: number,
	pixelY: number
): { x: number; y: number } {
	return {
		x: Math.max(0, Math.min(1, pixelX / CANVAS_WIDTH)),
		y: Math.max(0, Math.min(1, pixelY / CANVAS_HEIGHT)),
	};
}

/**
 * Denormalize normalized coordinates back to pixels
 * Used when rendering items from saved 0-1 positions
 */
export function denormalizePosition(
	normalizedX: number,
	normalizedY: number
): { x: number; y: number } {
	return {
		x: normalizedX * CANVAS_WIDTH,
		y: normalizedY * CANVAS_HEIGHT,
	};
}

/**
 * Calculate suggested size for item based on category
 * Some categories benefit from larger display (shoes, bags) while others smaller (accessories)
 */
export function calculateSuggestedSize(item: WardrobeItem): {
	width: number;
	height: number;
} {
	const category = item.category || "other";

	const sizeMap: Record<string, { width: number; height: number }> = {
		// Large (shoes take up space)
		sneakers: { width: 0.35, height: 0.25 },
		shoes: { width: 0.35, height: 0.25 },
		bags: { width: 0.3, height: 0.3 },

		// Medium (regular items)
		bottoms: { width: 0.3, height: 0.35 },
		tops: { width: 0.28, height: 0.35 },
		sweaters: { width: 0.3, height: 0.4 },

		// Large (covers more area)
		outerwear: { width: 0.4, height: 0.45 },
		jackets: { width: 0.4, height: 0.45 },
		coats: { width: 0.45, height: 0.5 },

		// Small (accessories)
		accessories: { width: 0.12, height: 0.12 },
		hats: { width: 0.15, height: 0.15 },

		// Default
		other: { width: 0.3, height: 0.35 },
	};

	return sizeMap[category] || sizeMap["other"];
}

/**
 * Check if two items overlap on the canvas
 * Used for preventing items from stacking accidentally
 */
export function checkOverlap(
	item1: { x: number; y: number; width: number; height: number },
	item2: { x: number; y: number; width: number; height: number }
): boolean {
	const tolerance = 20; // pixels of allowed overlap

	const noOverlap =
		item1.x + item1.width + tolerance < item2.x ||
		item2.x + item2.width + tolerance < item1.x ||
		item1.y + item1.height + tolerance < item2.y ||
		item2.y + item2.height + tolerance < item1.y;

	return !noOverlap;
}

/**
 * Resolve overlapping items by shifting them slightly
 * Called after user drops item to auto-adjust if collision detected
 */
export function resolveOverlap(
	newItem: { x: number; y: number; width: number; height: number },
	existingItems: Array<{ x: number; y: number; width: number; height: number }>
): { x: number; y: number } {
	let adjustedX = newItem.x;
	let adjustedY = newItem.y;
	const shiftDistance = 20; // pixels

	for (const existing of existingItems) {
		if (checkOverlap({ ...newItem, x: adjustedX, y: adjustedY }, existing)) {
			// Try shifting right
			adjustedX += shiftDistance;
			if (adjustedX + newItem.width > CANVAS_WIDTH) {
				// Shift left instead
				adjustedX = newItem.x - shiftDistance;
			}
			if (adjustedY + newItem.height > CANVAS_HEIGHT) {
				// Shift up
				adjustedY -= shiftDistance;
			}
		}
	}

	return { x: adjustedX, y: adjustedY };
}

/**
 * Get all items sorted by z-index (back to front)
 * Used for rendering items in correct layer order
 */
export function sortByZIndex<T extends { z_index: number }>(items: T[]): T[] {
	return [...items].sort((a, b) => a.z_index - b.z_index);
}

/**
 * Auto-arrange all items in outfit based on category rules
 * Called when user clicks "Reset to auto-arrange" button
 */
export function autoArrangeOutfit(items: WardrobeItem[]): Array<{
	item_id: string;
	position_x: number;
	position_y: number;
	z_index: number;
	display_width: number;
	display_height: number;
}> {
	// Group items by category
	const itemsByCategory = items.reduce((acc, item) => {
		const cat = item.category || "other";
		if (!acc[cat]) acc[cat] = [];
		acc[cat].push(item);
		return acc;
	}, {} as Record<string, WardrobeItem[]>);

	const result: Array<{
		item_id: string;
		position_x: number;
		position_y: number;
		z_index: number;
		display_width: number;
		display_height: number;
	}> = [];

	// Process each category
	for (const [category, categoryItems] of Object.entries(itemsByCategory)) {
		categoryItems.forEach((item, index) => {
			const position = calculateAutoPosition(item, index);
			const size = calculateSuggestedSize(item);

			result.push({
				item_id: item.id,
				position_x: position.x / CANVAS_WIDTH,
				position_y: position.y / CANVAS_HEIGHT,
				z_index: position.layer,
				display_width: size.width,
				display_height: size.height,
			});
		});
	}

	return result;
}
