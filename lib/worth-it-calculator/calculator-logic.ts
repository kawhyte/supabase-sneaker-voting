import { getTargetCostPerWear } from '@/lib/wardrobe-item-utils';
import type { ItemCategory } from '@/components/types/item-category';

/**
 * CORE TYPES
 */
export type WearFrequency = 'rarely' | 'monthly' | 'weekly' | 'daily';
export type ResalePotential = 'none' | 'low' | 'medium' | 'high';
export type WardrobeRole = 'gap_fill' | 'upgrade' | 'variety' | 'duplicate';
export type QualityRating = 'low' | 'average' | 'high';

export interface CalculatorInput {
  category: ItemCategory;
  price: number;
  wearFrequency: WearFrequency;
  resalePotential: ResalePotential;
  wardrobeRole: WardrobeRole;
  qualityRating: QualityRating;
}

export interface CalculatorMetrics {
  targetCPW: number;
  estimatedLifespanYears: number;
  totalLifetimeWears: number;
  netCost: number; // Price - Estimated Resale
  estimatedResaleValue: number;
  realCPW: number; // Net Cost / Lifetime Wears
  breakEvenWears: number; // Wears needed to hit target CPW
  targetBuyPrice: number; // The price you SHOULD pay to make this a "Good" deal
}

export type Verdict = 'BUY_NOW' | 'WAIT_FOR_SALE' | 'PASS';

export interface Recommendation {
  verdict: Verdict;
  score: number; // 0-100
  emoji: string;
  headline: string;
  description: string;
  actionPrompt?: string; // e.g., "Wait for a price under $120"
  color: string; // For UI styling
}

export interface CalculatorResults {
  metrics: CalculatorMetrics;
  recommendation: Recommendation;
  input: CalculatorInput;
}

/**
 * HELPER: Get annual wears from frequency label
 */
export function getWearsFromFrequency(frequency: WearFrequency): number {
  const frequencyMap: Record<WearFrequency, number> = {
    rarely: 6,      // ~6 times/year (Special occasions)
    monthly: 12,    // 12 times/year
    weekly: 52,     // 52 times/year
    daily: 180,     // ~Every other day / heavy rotation
  };
  return frequencyMap[frequency];
}

/**
 * HELPER: Get readable label
 */
export function getFrequencyLabel(frequency: WearFrequency): string {
  const labels: Record<WearFrequency, string> = {
    rarely: 'Rarely (Special Occasions)',
    monthly: 'Monthly (Occasional)',
    weekly: 'Weekly (Regular)',
    daily: 'Daily (Heavy Rotation)',
  };
  return labels[frequency];
}

/**
 * MAIN LOGIC: Calculate Smart Metrics
 * Incorporates Resale Value, Quality (Lifespan), and Category Targets
 */
export function calculateSmartMetrics(input: CalculatorInput): CalculatorMetrics {
  const { price, category, wearFrequency, resalePotential, qualityRating } = input;

  // 1. Calculate Lifespan based on Quality & Category
  // Shoes generally last less time than jackets. High quality extends life.
  const baseLifespanYears = category === 'shoes' ? 2 : category === 'outerwear' ? 5 : 3; 
  const qualityMultiplier = qualityRating === 'high' ? 1.5 : qualityRating === 'low' ? 0.6 : 1.0;
  const estimatedLifespanYears = Math.max(1, parseFloat((baseLifespanYears * qualityMultiplier).toFixed(1)));
  
  // 2. Calculate Total Lifetime Wears
  const baseWearsPerYear = getWearsFromFrequency(wearFrequency);
  const totalLifetimeWears = Math.floor(baseWearsPerYear * estimatedLifespanYears);

  // 3. Calculate Resale Value (Net Cost)
  const resaleMap: Record<ResalePotential, number> = {
    none: 0,
    low: 0.10,    // 10% back
    medium: 0.25, // 25% back
    high: 0.50    // 50% back (hype items)
  };
  const resalePercent = resaleMap[resalePotential];
  const estimatedResaleValue = Math.floor(price * resalePercent);
  const netCost = price - estimatedResaleValue;

  // 4. Calculate Real Cost Per Wear
  const realCPW = netCost / Math.max(1, totalLifetimeWears);

  // 5. Targets & Break-even
  const targetCPW = getTargetCostPerWear(price, category);
  const breakEvenWears = Math.ceil(netCost / targetCPW);

  // 6. Target Buy Price (Reverse Engineering)
  // "What price makes Real CPW <= Target CPW?"
  // Formula derived from: (TargetPrice * (1 - Resale%)) / TotalWears = TargetCPW
  const targetBuyPrice = Math.floor((targetCPW * totalLifetimeWears) / (1 - resalePercent));

  return {
    targetCPW: parseFloat(targetCPW.toFixed(2)),
    estimatedLifespanYears,
    totalLifetimeWears,
    netCost,
    estimatedResaleValue,
    realCPW: parseFloat(realCPW.toFixed(2)),
    breakEvenWears,
    targetBuyPrice
  };
}

/**
 * RECOMMENDATION ENGINE
 * Generates a Score (0-100) and Verdict based on value & utility
 */
export function generateSmartRecommendation(
  metrics: CalculatorMetrics, 
  input: CalculatorInput
): Recommendation {
  const { realCPW, targetCPW, targetBuyPrice } = metrics;
  const { wardrobeRole } = input;

  // --- Scoring Logic ---
  
  // Base Score: Ratio of Real CPW to Target CPW
  // 1.0 (on target) = 75 pts
  // 0.5 (great value) = 90 pts
  // 2.0 (bad value) = 40 pts
  const cpwRatio = realCPW / targetCPW;
  let score = 100 - (cpwRatio * 25); 

  // Wardrobe Role Adjustments
  if (wardrobeRole === 'duplicate') score -= 20; // Heavy penalty for clutter
  if (wardrobeRole === 'gap_fill') score += 10;  // Bonus for utility
  if (wardrobeRole === 'upgrade') score += 5;    // Small bonus for quality upgrade
  // 'variety' is neutral

  // Clamp Score
  score = Math.min(100, Math.max(0, Math.round(score)));

  // --- Verdict Logic ---

  if (score >= 80) {
    return {
      verdict: 'BUY_NOW',
      score,
      emoji: '🔥',
      headline: 'Cop It. It\'s a Steal.',
      description: `At an effective $${realCPW.toFixed(2)}/wear, this item provides exceptional value. It pays for itself in just ${metrics.breakEvenWears} wears.`,
      color: 'green-500'
    };
  } else if (score >= 50) {
    return {
      verdict: 'WAIT_FOR_SALE',
      score,
      emoji: '👀',
      headline: 'Wait for a Sale.',
      description: `It's a decent item, but overpriced right now relative to its utility. Buying it at full price pushes your cost-per-wear too high.`,
      actionPrompt: `Set a price alert for $${targetBuyPrice}. If it drops below that, it becomes a smart buy.`,
      color: 'sun-500' // yellow/orange
    };
  } else {
    return {
      verdict: 'PASS',
      score,
      emoji: '🛑',
      headline: 'Hard Pass.',
      description: `This is an impulse buy that doesn't make financial sense. The cost-per-wear ($${realCPW.toFixed(2)}) is way above industry standards for this category.`,
      actionPrompt: `Look for alternatives under $${targetBuyPrice} or invest in a higher quality version that lasts longer.`,
      color: 'red-500'
    };
  }
}

// Legacy support wrapper (if needed during transition)
export function getRecommendation(metrics: CalculatorMetrics, input: CalculatorInput): Recommendation {
  return generateSmartRecommendation(metrics, input);
}