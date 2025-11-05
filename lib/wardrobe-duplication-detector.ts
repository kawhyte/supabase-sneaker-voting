/**
 * Wardrobe Duplication Detection
 *
 * Detects similar items in user's wardrobe based on:
 * - Category (e.g., both are hoodies)
 * - Color similarity (black, charcoal, midnight = same group)
 *
 * Uses loose threshold to reduce false positives.
 * Won't flag "black hoodie + black jeans" as duplicates.
 */

import { WardrobeItem } from '@/components/types/WardrobeItem';

export interface DuplicationWarning {
  severity: 'low' | 'medium' | 'high';
  message: string;
  similarItems: WardrobeItem[];
  recommendation: string;
}

/**
 * Color similarity groups
 * Items in the same group are considered "similar color"
 */
const COLOR_GROUPS: Record<string, string[]> = {
  black: ['black', 'charcoal', 'midnight', 'navy', 'dark navy', 'dark blue', 'dark grey', 'dark gray'],
  white: ['white', 'cream', 'ivory', 'off-white', 'ecru'],
  grey: ['grey', 'gray', 'light grey', 'light gray', 'silver', 'ash', 'smoke'],
  brown: ['brown', 'tan', 'beige', 'caramel', 'chocolate', 'coffee', 'bronze', 'khaki'],
  red: ['red', 'crimson', 'burgundy', 'maroon', 'wine', 'scarlet'],
  blue: ['blue', 'light blue', 'sky blue', 'navy', 'cobalt', 'royal blue', 'slate blue'],
  green: ['green', 'sage', 'olive', 'forest green', 'emerald', 'mint', 'dark green'],
  yellow: ['yellow', 'gold', 'golden', 'mustard', 'tan'],
  orange: ['orange', 'rust', 'burnt orange', 'copper'],
  pink: ['pink', 'rose', 'blush', 'mauve', 'fuchsia'],
  purple: ['purple', 'violet', 'lavender', 'plum', 'grape'],
  neutral: ['grey', 'gray', 'beige', 'tan', 'cream', 'white', 'black'],
};

/**
 * Normalize color string for comparison
 * Converts to lowercase and removes extra whitespace
 */
function normalizeColor(color: string): string {
  return color.toLowerCase().trim();
}

/**
 * Find color group for a given color
 * Returns the group name or null if not found
 */
function getColorGroup(color: string): string | null {
  const normalized = normalizeColor(color);

  for (const [group, colors] of Object.entries(COLOR_GROUPS)) {
    if (colors.includes(normalized)) {
      return group;
    }
  }

  return null;
}

/**
 * Check if two colors are similar
 * Returns true if colors are in the same group
 */
function isSimilarColor(color1: string, color2: string): boolean {
  if (!color1 || !color2) {
    return false;
  }

  const group1 = getColorGroup(color1);
  const group2 = getColorGroup(color2);

  if (!group1 || !group2) {
    return false;
  }

  return group1 === group2;
}

/**
 * Detect duplicate items in wardrobe
 *
 * Returns warning only if BOTH conditions are met:
 * 1. Same category (e.g., both are hoodies)
 * 2. Similar color (e.g., both are black)
 *
 * @param newItem - Item being added to wardrobe
 * @param existingWardrobe - User's current owned items
 * @returns DuplicationWarning or null if no duplicates detected
 */
export function detectDuplicates(
  newItem: Partial<WardrobeItem>,
  existingWardrobe: WardrobeItem[]
): DuplicationWarning | null {
  if (!newItem.category || !newItem.color) {
    return null;
  }

  // Step 1: Filter by same category AND owned status
  const sameCategory = existingWardrobe.filter(
    (item) => item.category === newItem.category && item.status === 'owned'
  );

  if (sameCategory.length === 0) {
    return null; // No items in same category
  }

  // Step 2: Filter by similar color
  const similarItems = sameCategory.filter((item) =>
    isSimilarColor(item.color || '', newItem.color || '')
  );

  // Step 3: Return warning only if we have 2+ similar items
  // (meaning the new item would be 3+ with same color/category)
  if (similarItems.length >= 2) {
    return {
      severity: 'high',
      message: `You already have ${similarItems.length} ${newItem.category} items in ${newItem.color}`,
      similarItems,
      recommendation: 'Consider wearing what you own first before buying more',
    };
  }

  if (similarItems.length === 1) {
    return {
      severity: 'medium',
      message: `You have a similar ${newItem.category} in ${newItem.color}`,
      similarItems,
      recommendation: 'Do you need another one?',
    };
  }

  return null; // No duplicates detected
}

/**
 * Get all items with similar color/category from wardrobe
 * Useful for showing recommendations
 */
export function getSimilarItems(
  item: Partial<WardrobeItem>,
  wardrobe: WardrobeItem[]
): WardrobeItem[] {
  if (!item.category || !item.color) {
    return [];
  }

  return wardrobe.filter(
    (w) =>
      w.category === item.category &&
      isSimilarColor(w.color || '', item.color || '') &&
      w.status === 'owned'
  );
}

/**
 * Get all color variants of an item category
 * Useful for suggesting alternatives to buy
 */
export function getAvailableColorVariants(
  category: string,
  wardrobe: WardrobeItem[]
): string[] {
  const colorSet = new Set(
    wardrobe
      .filter((w) => w.category === category && w.status === 'owned')
      .map((w) => w.color || '')
      .filter(Boolean)
  );

  return Array.from(colorSet);
}
