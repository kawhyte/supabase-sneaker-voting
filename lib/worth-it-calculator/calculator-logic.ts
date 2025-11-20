/**
 * Cost Per Wear Calculator Logic
 *
 * Reuses core logic from wardrobe-item-utils.ts but adapted for anonymous calculator
 * No database, no authentication required - pure calculation engine
 */

import { getTargetCostPerWear } from '@/lib/wardrobe-item-utils';
import type { ItemCategory } from '@/components/types/item-category';

export type WearFrequency = 'rarely' | 'monthly' | 'weekly' | 'daily';

export interface CalculatorInput {
  category: ItemCategory;
  price: number;
  wearFrequency: WearFrequency;

  // Advanced options (optional)
  brand?: string;
  isOnSale?: boolean;
  originalPrice?: number;
  similarItemsCount?: number;
  hasSameColor?: boolean;
  fillsGap?: boolean;
}

export interface CalculatorMetrics {
  targetCPW: number;           // Target cost per wear for this category/price
  targetWears: number;         // Number of wears needed to hit target
  expectedWearsYear1: number;  // Expected wears in year 1
  expectedWearsYear2: number;  // Expected wears in year 2
  cpwAt1Year: number;         // Cost per wear after 1 year
  cpwAt2Years: number;        // Cost per wear after 2 years
  monthsToTarget: number;     // Months to reach target CPW
  dateAtTarget: Date;         // Date when target will be reached
  progressAt1Year: number;    // Progress percentage at 1 year (0-100)
}

export interface AdvancedInsights {
  saleValueAnalysis?: {
    savingsAmount: number;
    savingsPercent: number;
    adjustedTargetWears: number;
    message: string;
  };

  saturationWarning?: {
    level: 'low' | 'medium' | 'high';
    message: string;
    suggestion: string;
  };

  colorOverlapWarning?: {
    message: string;
    severity: 'info' | 'warning';
  };

  gapFillBonus?: {
    priority: 'essential' | 'nice-to-have' | 'redundant';
    message: string;
  };
}

export type Verdict = 'EXCELLENT' | 'GOOD' | 'CAUTION' | 'SKIP';

export interface Recommendation {
  verdict: Verdict;
  emoji: string;
  title: string;
  message: string;
  color: string;
}

export interface CalculatorResults {
  metrics: CalculatorMetrics;
  recommendation: Recommendation;
  advancedInsights?: AdvancedInsights;
  input: CalculatorInput;
}

/**
 * Convert wear frequency to expected wears per year
 */
export function getWearsFromFrequency(frequency: WearFrequency): number {
  const frequencyMap: Record<WearFrequency, number> = {
    rarely: 6,      // Special occasions - ~6 times/year
    monthly: 12,    // Once a month - 12 times/year
    weekly: 52,     // Once a week - 52 times/year
    daily: 200,     // Daily rotation (not literally every day) - ~200 times/year
  };

  return frequencyMap[frequency];
}

/**
 * Get human-readable label for wear frequency
 */
export function getFrequencyLabel(frequency: WearFrequency): string {
  const labels: Record<WearFrequency, string> = {
    rarely: 'Rarely (Special Occasions)',
    monthly: 'Monthly (Occasional)',
    weekly: 'Weekly (Regular)',
    daily: 'Daily (Everyday)',
  };

  return labels[frequency];
}

/**
 * Calculate comprehensive metrics for the calculator
 */
export function calculateCalculatorMetrics(
  price: number,
  category: ItemCategory,
  wearFrequency: WearFrequency
): CalculatorMetrics {
  const expectedWearsPerYear = getWearsFromFrequency(wearFrequency);
  const targetCPW = getTargetCostPerWear(price, category);
  const targetWears = Math.ceil(price / targetCPW);

  const expectedWearsYear1 = expectedWearsPerYear;
  const expectedWearsYear2 = expectedWearsPerYear * 2;

  const cpwAt1Year = price / expectedWearsYear1;
  const cpwAt2Years = price / expectedWearsYear2;

  const monthsToTarget = (targetWears / expectedWearsPerYear) * 12;

  const dateAtTarget = new Date();
  dateAtTarget.setMonth(dateAtTarget.getMonth() + Math.ceil(monthsToTarget));

  const progressAt1Year = Math.min((expectedWearsYear1 / targetWears) * 100, 100);

  return {
    targetCPW: parseFloat(targetCPW.toFixed(2)),
    targetWears,
    expectedWearsYear1,
    expectedWearsYear2,
    cpwAt1Year: parseFloat(cpwAt1Year.toFixed(2)),
    cpwAt2Years: parseFloat(cpwAt2Years.toFixed(2)),
    monthsToTarget: Math.ceil(monthsToTarget),
    dateAtTarget,
    progressAt1Year: parseFloat(progressAt1Year.toFixed(1)),
  };
}

/**
 * Generate recommendation based on metrics
 */
export function getRecommendation(
  metrics: CalculatorMetrics,
  input: CalculatorInput
): Recommendation {
  const ratio = metrics.cpwAt1Year / metrics.targetCPW;
  const categoryLabel = getCategoryLabel(input.category);

  if (ratio <= 0.5) {
    return {
      verdict: 'EXCELLENT',
      emoji: '✨',
      title: 'Excellent Value! Worth It',
      message: `This will cost $${metrics.cpwAt1Year.toFixed(2)}/wear at your usage rate — well below the $${metrics.targetCPW}/wear target for ${categoryLabel}. This is a smart purchase that will pay for itself quickly.`,
      color: 'meadow-500',
    };
  } else if (ratio <= 1.0) {
    return {
      verdict: 'GOOD',
      emoji: '👍',
      title: 'Good Purchase',
      message: `You'll reach the target cost-per-wear of $${metrics.targetCPW} in approximately ${metrics.monthsToTarget} months at your wear rate. This is a reasonable investment for ${categoryLabel}.`,
      color: 'sun-400',
    };
  } else if (ratio <= 1.5) {
    return {
      verdict: 'CAUTION',
      emoji: '⚠️',
      title: 'Think Twice',
      message: `At $${metrics.cpwAt1Year.toFixed(2)}/wear, this is above the healthy target of $${metrics.targetCPW}/wear. Ask yourself: Will you really wear this ${getFrequencyLabel(input.wearFrequency).toLowerCase()}? Consider waiting for a sale or looking for alternatives under $${Math.floor(metrics.targetCPW * metrics.expectedWearsYear1)}.`,
      color: 'orange-500',
    };
  } else {
    return {
      verdict: 'SKIP',
      emoji: '🛑',
      title: 'Not Worth It',
      message: `This significantly exceeds healthy cost-per-wear thresholds. At $${metrics.cpwAt1Year.toFixed(2)}/wear, you'd need to wear it ${metrics.targetWears} times just to justify the cost. Save your money or look for similar items under $${Math.floor(metrics.targetCPW * metrics.expectedWearsYear1)}.`,
      color: 'destructive',
    };
  }
}

/**
 * Calculate advanced insights if advanced options provided
 */
export function calculateAdvancedInsights(
  metrics: CalculatorMetrics,
  input: CalculatorInput
): AdvancedInsights {
  const insights: AdvancedInsights = {};

  // Sale value analysis
  if (input.isOnSale && input.originalPrice && input.originalPrice > input.price) {
    const savingsAmount = input.originalPrice - input.price;
    const savingsPercent = (savingsAmount / input.originalPrice) * 100;
    const adjustedTargetWears = Math.ceil(input.price / metrics.targetCPW);
    const originalTargetWears = Math.ceil(input.originalPrice / metrics.targetCPW);
    const wearsSaved = originalTargetWears - adjustedTargetWears;

    insights.saleValueAnalysis = {
      savingsAmount,
      savingsPercent: parseFloat(savingsPercent.toFixed(1)),
      adjustedTargetWears,
      message: `You're saving $${savingsAmount.toFixed(2)} (${savingsPercent.toFixed(0)}% off)! This reduces your target wears by ${wearsSaved} — you'll reach "worth it" status ${wearsSaved} wears sooner than at full price.`,
    };
  }

  // Wardrobe saturation warning
  if (input.similarItemsCount !== undefined && input.similarItemsCount > 0) {
    const count = input.similarItemsCount;

    if (count >= 4) {
      insights.saturationWarning = {
        level: 'high',
        message: `⚠️ Wardrobe Saturation Alert: You already own ${count} similar items.`,
        suggestion: `Adding another means each piece gets worn less frequently, increasing overall cost-per-wear across your collection. Consider selling or donating one existing item if you buy this.`,
      };
    } else if (count >= 2) {
      insights.saturationWarning = {
        level: 'medium',
        message: `You already own ${count} similar items in this category.`,
        suggestion: `Make sure this offers something unique (different color, occasion, style) to justify the addition to your wardrobe.`,
      };
    } else {
      insights.saturationWarning = {
        level: 'low',
        message: `You own ${count} similar item. This could complement your existing wardrobe.`,
        suggestion: `Consider how often you'll reach for this compared to what you already own.`,
      };
    }
  }

  // Color overlap warning
  if (input.hasSameColor) {
    insights.colorOverlapWarning = {
      message: `You already own this color in this category. Consider if this offers enough variety to justify the purchase.`,
      severity: 'warning',
    };
  }

  // Gap fill analysis
  if (input.fillsGap !== undefined) {
    if (input.fillsGap) {
      insights.gapFillBonus = {
        priority: 'essential',
        message: `✅ This fills a missing need in your wardrobe! Essential items that fill gaps tend to get worn more frequently and offer better value.`,
      };
    } else if (input.similarItemsCount !== undefined && input.similarItemsCount === 0) {
      insights.gapFillBonus = {
        priority: 'nice-to-have',
        message: `This adds variety to your wardrobe but isn't filling a critical gap. Make sure you love it enough to justify the purchase.`,
      };
    } else if (input.similarItemsCount !== undefined && input.similarItemsCount >= 2) {
      insights.gapFillBonus = {
        priority: 'redundant',
        message: `⚠️ This doesn't fill a wardrobe gap and you already own similar items. This is likely a redundant purchase driven by want rather than need.`,
      };
    }
  }

  return insights;
}

/**
 * Get human-readable category label
 */
function getCategoryLabel(category: ItemCategory): string {
  const labels: Record<ItemCategory, string> = {
    shoes: 'shoes',
    tops: 'tops',
    bottoms: 'bottoms',
    outerwear: 'outerwear',
    accessories: 'accessories',
  };

  return labels[category] || category;
}

/**
 * Get seasonal context (future enhancement)
 */
export function getSeasonalContext(category: ItemCategory): { message: string | null } {
  const month = new Date().getMonth();
  const isSummer = month >= 5 && month <= 8;
  const isWinter = month <= 2 || month >= 11;

  if (category === 'outerwear' && isSummer) {
    return {
      message: "🌞 Note: It's summer! Outerwear won't get much wear until fall. Factor seasonal timing into your decision.",
    };
  }

  if (category === 'shoes' && isWinter && month === 11) {
    return {
      message: "❄️ Tip: Winter weather may limit wear frequency. Consider if this is weather-appropriate for the season ahead.",
    };
  }

  return { message: null };
}
