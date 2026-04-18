import {
	Activity,
	Dumbbell,
	Footprints,
	Mountain,
	Package,
	Trophy,
	Wind,
	type LucideIcon,
} from "lucide-react";

// ============================================================================
// ITEM CATEGORIES
// ============================================================================

export type ItemCategory =
	| "lifestyle"
	| "running"
	| "basketball"
	| "skate"
	| "training"
	| "boots"
	| "other";

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

const SNEAKER_SIZE_DEFAULTS = {
	allowCollection: true,
	allowPurchased: true,
	allowWears: true,
	requiresSize: true,
	requiresFit: true,
	requiresComfort: true,
	sizeType: "shoe" as SizeType,
	sizeLabel: "Shoe Size",
	sizePlaceholder: "Select size (US Men's, Women's, or EU)",
};

export const CATEGORY_CONFIGS: Record<ItemCategory, CategoryConfig> = {
	lifestyle: {
		id: "lifestyle",
		label: "Lifestyle",
		labelPlural: "Lifestyle",
		icon: Footprints,
		color: "blue",
		bgColor: "var(--color-blue-50)",
		borderColor: "var(--color-blue-500)",
		textColor: "var(--color-blue-700)",
		...SNEAKER_SIZE_DEFAULTS,
	},
	running: {
		id: "running",
		label: "Running",
		labelPlural: "Running",
		icon: Activity,
		color: "green",
		bgColor: "var(--color-green-50)",
		borderColor: "var(--color-green-500)",
		textColor: "var(--color-green-700)",
		...SNEAKER_SIZE_DEFAULTS,
	},
	basketball: {
		id: "basketball",
		label: "Basketball",
		labelPlural: "Basketball",
		icon: Trophy,
		color: "orange",
		bgColor: "var(--color-orange-50)",
		borderColor: "var(--color-orange-500)",
		textColor: "var(--color-orange-700)",
		...SNEAKER_SIZE_DEFAULTS,
	},
	skate: {
		id: "skate",
		label: "Skate",
		labelPlural: "Skate",
		icon: Wind,
		color: "purple",
		bgColor: "var(--color-purple-50)",
		borderColor: "var(--color-purple-500)",
		textColor: "var(--color-purple-700)",
		...SNEAKER_SIZE_DEFAULTS,
	},
	training: {
		id: "training",
		label: "Training",
		labelPlural: "Training",
		icon: Dumbbell,
		color: "rose",
		bgColor: "var(--color-rose-50)",
		borderColor: "var(--color-rose-500)",
		textColor: "var(--color-rose-700)",
		...SNEAKER_SIZE_DEFAULTS,
	},
	boots: {
		id: "boots",
		label: "Boots",
		labelPlural: "Boots",
		icon: Mountain,
		color: "amber",
		bgColor: "var(--color-amber-50)",
		borderColor: "var(--color-amber-500)",
		textColor: "var(--color-amber-700)",
		...SNEAKER_SIZE_DEFAULTS,
	},
	other: {
		id: "other",
		label: "Other",
		labelPlural: "Other",
		icon: Package,
		color: "slate",
		bgColor: "var(--color-slate-50)",
		borderColor: "var(--color-slate-500)",
		textColor: "var(--color-slate-700)",
		...SNEAKER_SIZE_DEFAULTS,
	},
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getCategoryConfig(
	category: ItemCategory
): CategoryConfig | null {
	return CATEGORY_CONFIGS[category] || null;
}

export function canAddToCollection(category: ItemCategory): boolean {
	return CATEGORY_CONFIGS[category]?.allowCollection ?? false;
}

export function canMarkAsPurchased(category: ItemCategory): boolean {
	return CATEGORY_CONFIGS[category]?.allowPurchased ?? false;
}

export function canTrackWears(category: ItemCategory): boolean {
	return CATEGORY_CONFIGS[category]?.allowWears ?? false;
}

export function isSizeRequired(category: ItemCategory): boolean {
	return CATEGORY_CONFIGS[category]?.requiresSize ?? false;
}

export function isFitRequired(category: ItemCategory): boolean {
	return CATEGORY_CONFIGS[category]?.requiresFit ?? false;
}

export function isComfortRequired(category: ItemCategory): boolean {
	return CATEGORY_CONFIGS[category]?.requiresComfort ?? false;
}

export function getAllCategories(): ItemCategory[] {
	return Object.keys(CATEGORY_CONFIGS) as ItemCategory[];
}

export function getCategoryLabel(
	category: ItemCategory,
	plural: boolean = false
): string {
	const config = CATEGORY_CONFIGS[category];
	return plural ? config?.labelPlural : config?.label;
}

export function getSizeType(category: ItemCategory): SizeType {
	return CATEGORY_CONFIGS[category]?.sizeType ?? "onesize";
}
