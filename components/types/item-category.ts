import {
	Footprints,
	type LucideIcon,
} from "lucide-react";

// ============================================================================
// ITEM CATEGORIES
// ============================================================================

export type ItemCategory = "shoes";

export type SizeType = "shoe" | "clothing" | "onesize";

// ============================================================================
// CATEGORY CONFIGURATION
// ============================================================================

export interface CategoryConfig {
	id: ItemCategory;
	label: string;
	labelPlural: string;
	icon: LucideIcon;
	color: string;
	bgColor: string;
	borderColor: string;
	textColor: string;
	// Permissions
	allowCollection: boolean; // Can add to collection
	allowPurchased: boolean; // Can mark as purchased
	allowWears: boolean; // Can track wear count
	// Field requirements
	requiresSize: boolean; // Size field required
	requiresFit: boolean; // Fit rating required (for tried items)
	requiresComfort: boolean; // Comfort rating required (for tried items)
	sizeType: SizeType; // Type of size measurement
	// UX hints
	sizeLabel: string; // Label for size field
	sizePlaceholder: string; // Placeholder for size input
}

// ============================================================================
// CATEGORY CONFIGURATIONS
// ============================================================================

export const CATEGORY_CONFIGS: Record<ItemCategory, CategoryConfig> = {
	shoes: {
		id: "shoes",
		label: "Shoes",
		labelPlural: "Shoes",
		icon: Footprints,
		color: "blue",
		bgColor: "var(--color-blue-50)",
		borderColor: "var(--color-blue-500)",
		textColor: "var(--color-blue-700)",
		// Permissions
		allowCollection: true,
		allowPurchased: true,
		allowWears: true,
		// Field requirements
		requiresSize: true,
		requiresFit: true,
		requiresComfort: true,
		sizeType: "shoe",
		// UX hints
		sizeLabel: "Shoe Size",
		sizePlaceholder: "Select size (US Men's, Women's, or EU)",
	},
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get category configuration by ID
 */
export function getCategoryConfig(
	category: ItemCategory
): CategoryConfig | null {
	return CATEGORY_CONFIGS[category] || null;
}

/**
 * Check if category allows collection
 */
export function canAddToCollection(category: ItemCategory): boolean {
	return CATEGORY_CONFIGS[category]?.allowCollection ?? false;
}

/**
 * Check if category allows purchased status
 */
export function canMarkAsPurchased(category: ItemCategory): boolean {
	return CATEGORY_CONFIGS[category]?.allowPurchased ?? false;
}

/**
 * Check if category allows wears tracking
 */
export function canTrackWears(category: ItemCategory): boolean {
	return CATEGORY_CONFIGS[category]?.allowWears ?? false;
}

/**
 * Check if size is required for category
 */
export function isSizeRequired(category: ItemCategory): boolean {
	return CATEGORY_CONFIGS[category]?.requiresSize ?? false;
}

/**
 * Check if fit rating is required for category
 */
export function isFitRequired(category: ItemCategory): boolean {
	return CATEGORY_CONFIGS[category]?.requiresFit ?? false;
}

/**
 * Check if comfort rating is required for category
 */
export function isComfortRequired(category: ItemCategory): boolean {
	return CATEGORY_CONFIGS[category]?.requiresComfort ?? false;
}

/**
 * Get all category IDs
 */
export function getAllCategories(): ItemCategory[] {
	return Object.keys(CATEGORY_CONFIGS) as ItemCategory[];
}

/**
 * Get category display name (singular or plural)
 */
export function getCategoryLabel(
	category: ItemCategory,
	plural: boolean = false
): string {
	const config = CATEGORY_CONFIGS[category];
	return plural ? config?.labelPlural : config?.label;
}

/**
 * Get size type for category
 */
export function getSizeType(category: ItemCategory): SizeType {
	return CATEGORY_CONFIGS[category]?.sizeType ?? "onesize";
}
