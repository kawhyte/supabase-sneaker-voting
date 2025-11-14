/**
 * Smart Duplicate Detection System
 *
 * Uses fuzzy text matching with weighted scoring to detect duplicates
 * even when there are typos, variations, or formatting differences.
 *
 * Scoring System:
 * - Category Match: 40% weight (must be exact or related)
 * - Color Similarity: 30% weight (fuzzy match with typo tolerance)
 * - Brand Similarity: 20% weight (catches "Nike" vs "NIKE" vs "Nike ")
 * - Model Similarity: 10% weight (catches "Air Max" vs "AirMax" vs "Air Max 1")
 *
 * Two-Tier Detection:
 * - Exact Duplicates: ≥85% similarity (e.g., "Black Nike Hoodie" vs "Black Nike Hoody")
 * - Similar Items: 60-84% similarity (e.g., "Charcoal Nike Hoodie" vs "Dark Grey Nike Hoodie")
 *
 * Edge Cases:
 * - Same brand + different colors = NOT duplicate (colorway variation)
 * - Same brand + same model + same color = duplicate (limited edition re-releases)
 */

import { distance } from 'fastest-levenshtein';
import { WardrobeItem } from '@/components/types/WardrobeItem';

export interface SmartDuplicationMatch {
  item: WardrobeItem;
  similarityScore: number; // 0-100 percentage
  matchType: 'exact' | 'similar'; // exact: ≥85%, similar: 60-84%
  matchDetails: {
    categoryMatch: number; // 0-100
    colorMatch: number; // 0-100
    brandMatch: number; // 0-100
    modelMatch: number; // 0-100
  };
}

export interface SmartDuplicationWarning {
  severity: 'exact' | 'similar';
  message: string;
  matches: SmartDuplicationMatch[];
  totalMatches: number;
  recommendation: string;
}

/**
 * Color similarity groups (from existing wardrobe-duplication-detector.ts)
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
 * Normalize string for comparison
 * Converts to lowercase, trims whitespace, removes extra spaces
 */
function normalizeString(str: string): string {
  if (!str) return '';
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Calculate similarity score between two strings using Levenshtein distance
 * Returns a percentage (0-100)
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;

  const normalized1 = normalizeString(str1);
  const normalized2 = normalizeString(str2);

  if (normalized1 === normalized2) return 100;

  const maxLength = Math.max(normalized1.length, normalized2.length);
  if (maxLength === 0) return 100;

  const editDistance = distance(normalized1, normalized2);
  const similarity = ((maxLength - editDistance) / maxLength) * 100;

  return Math.max(0, Math.min(100, similarity));
}

/**
 * Find color group for a given color
 * Returns the group name or null if not found
 */
function getColorGroup(color: string): string | null {
  const normalized = normalizeString(color);

  for (const [group, colors] of Object.entries(COLOR_GROUPS)) {
    if (colors.some(c => normalizeString(c) === normalized)) {
      return group;
    }
  }

  return null;
}

/**
 * Check if two colors are in the same group
 * Returns 100 if same group, 0 if different groups, or fuzzy match score if not in groups
 */
function calculateColorSimilarity(color1: string, color2: string): number {
  if (!color1 || !color2) return 0;

  // Check if exact match
  if (normalizeString(color1) === normalizeString(color2)) {
    return 100;
  }

  // Check if in same color group (fast path)
  const group1 = getColorGroup(color1);
  const group2 = getColorGroup(color2);

  if (group1 && group2) {
    return group1 === group2 ? 100 : 0; // Same group = 100%, different groups = 0%
  }

  // If not in groups, use fuzzy matching for unusual colors
  return calculateStringSimilarity(color1, color2);
}

/**
 * Calculate category match score
 * Returns 100 if exact match, 0 if different
 */
function calculateCategoryMatch(category1: string, category2: string): number {
  if (!category1 || !category2) return 0;
  return normalizeString(category1) === normalizeString(category2) ? 100 : 0;
}

/**
 * Calculate composite similarity score with weighted components
 *
 * Weights:
 * - Category: 40% (must match for item to be considered similar)
 * - Color: 30% (important for distinguishing colorways)
 * - Brand: 20% (helps identify duplicates across typos)
 * - Model: 10% (least important, often has variations)
 */
function calculateCompositeSimilarity(
  newItem: Partial<WardrobeItem>,
  existingItem: WardrobeItem
): { score: number; details: SmartDuplicationMatch['matchDetails'] } {
  const categoryMatch = calculateCategoryMatch(
    newItem.category || '',
    existingItem.category || ''
  );

  const colorMatch = calculateColorSimilarity(
    newItem.color || '',
    existingItem.color || ''
  );

  const brandMatch = calculateStringSimilarity(
    newItem.brand || '',
    existingItem.brand || ''
  );

  const modelMatch = calculateStringSimilarity(
    newItem.model || '',
    existingItem.model || ''
  );

  // If category doesn't match, return 0 (not similar at all)
  if (categoryMatch === 0) {
    return {
      score: 0,
      details: { categoryMatch, colorMatch, brandMatch, modelMatch }
    };
  }

  // Calculate weighted score
  const weightedScore =
    (categoryMatch * 0.40) +
    (colorMatch * 0.30) +
    (brandMatch * 0.20) +
    (modelMatch * 0.10);

  return {
    score: Math.round(weightedScore),
    details: {
      categoryMatch: Math.round(categoryMatch),
      colorMatch: Math.round(colorMatch),
      brandMatch: Math.round(brandMatch),
      modelMatch: Math.round(modelMatch)
    }
  };
}

/**
 * Check if two items are colorway variations
 * Same brand + same model + DIFFERENT colors = colorway variation (NOT duplicate)
 *
 * Example: "Black Nike Hoodie" vs "White Nike Hoodie" = colorway (don't warn)
 */
function isColorwayVariation(
  newItem: Partial<WardrobeItem>,
  existingItem: WardrobeItem
): boolean {
  const brandMatch = calculateStringSimilarity(newItem.brand || '', existingItem.brand || '');
  const modelMatch = calculateStringSimilarity(newItem.model || '', existingItem.model || '');
  const colorMatch = calculateColorSimilarity(newItem.color || '', existingItem.color || '');

  // High brand and model similarity but different colors = colorway
  return brandMatch >= 85 && modelMatch >= 75 && colorMatch < 50;
}

/**
 * Detect smart duplicates in wardrobe
 *
 * Uses fuzzy matching with weighted scoring to find duplicates even with typos
 *
 * Returns warning if matches found:
 * - Exact: ≥85% similarity (high confidence duplicate)
 * - Similar: 60-84% similarity (possible duplicate)
 *
 * @param newItem - Item being added to wardrobe
 * @param existingWardrobe - User's current owned items
 * @returns SmartDuplicationWarning or null if no duplicates detected
 */
export function detectSmartDuplicates(
  newItem: Partial<WardrobeItem>,
  existingWardrobe: WardrobeItem[]
): SmartDuplicationWarning | null {
  if (!newItem.category || !newItem.color || !newItem.brand) {
    return null;
  }

  // Only check against owned items
  const ownedItems = existingWardrobe.filter(item => item.status === 'owned');

  if (ownedItems.length === 0) {
    return null;
  }

  // Calculate similarity scores for all owned items
  const matches: SmartDuplicationMatch[] = [];

  for (const existingItem of ownedItems) {
    // Skip if this is a colorway variation (same brand/model, different color)
    if (isColorwayVariation(newItem, existingItem)) {
      continue;
    }

    const { score, details } = calculateCompositeSimilarity(newItem, existingItem);

    // Only consider items with similarity ≥60%
    if (score >= 60) {
      matches.push({
        item: existingItem,
        similarityScore: score,
        matchType: score >= 85 ? 'exact' : 'similar',
        matchDetails: details
      });
    }
  }

  // Sort matches by similarity score (highest first)
  matches.sort((a, b) => b.similarityScore - a.similarityScore);

  if (matches.length === 0) {
    return null;
  }

  // Determine severity based on highest match score
  const highestMatch = matches[0];
  const severity = highestMatch.matchType;

  // Create warning message
  const itemDescription = `${newItem.brand} ${newItem.model} (${newItem.color})`;

  let message: string;
  let recommendation: string;

  if (severity === 'exact') {
    message = matches.length === 1
      ? `You're adding an item very similar to one you already own (${highestMatch.similarityScore}% match)`
      : `You're adding an item very similar to ${matches.length} items you already own`;
    recommendation = 'This looks like a duplicate. Consider wearing what you own first.';
  } else {
    message = matches.length === 1
      ? `You have a similar item in your wardrobe (${highestMatch.similarityScore}% match)`
      : `You have ${matches.length} similar items in your wardrobe`;
    recommendation = 'Do you need another one?';
  }

  return {
    severity,
    message,
    matches,
    totalMatches: matches.length,
    recommendation
  };
}

/**
 * Get all smart matches for an item
 * Useful for debugging or showing detailed match information
 */
export function getSmartMatches(
  item: Partial<WardrobeItem>,
  wardrobe: WardrobeItem[],
  minSimilarity: number = 60
): SmartDuplicationMatch[] {
  if (!item.category || !item.color || !item.brand) {
    return [];
  }

  const ownedItems = wardrobe.filter(w => w.status === 'owned');
  const matches: SmartDuplicationMatch[] = [];

  for (const existingItem of ownedItems) {
    if (isColorwayVariation(item, existingItem)) {
      continue;
    }

    const { score, details } = calculateCompositeSimilarity(item, existingItem);

    if (score >= minSimilarity) {
      matches.push({
        item: existingItem,
        similarityScore: score,
        matchType: score >= 85 ? 'exact' : 'similar',
        matchDetails: details
      });
    }
  }

  return matches.sort((a, b) => b.similarityScore - a.similarityScore);
}
