import { getTargetCostPerWear } from '@/lib/wardrobe-item-utils';
import type { ItemCategory } from '@/components/types/item-category';

/**
 * CORE TYPES
 */
export type RotationScenario = 'daily_beater' | 'weekend_rotation' | 'grail';
export type ResalePotential = 'none' | 'low' | 'medium' | 'high';
export type WardrobeRole = 'gap_fill' | 'upgrade' | 'variety' | 'duplicate';
export type QualityRating = 'low' | 'average' | 'high'; // kept for legacy compatibility

export interface CalculatorInput {
  category: ItemCategory;
  price: number;
  rotationScenario: RotationScenario;
  resalePotential: ResalePotential;
  wardrobeRole: WardrobeRole;
  qualityRating?: QualityRating; // optional — UI removed, defaults to 'average' in calc
  // Optional enrichment — from eBay search and authenticated collection query
  marketValue?: number;    // eBay current market price
  ownedSameBrand?: number; // Count of owned items from same brand
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

export interface ScoreBreakdown {
  cpwScore: number;      // 0–50
  marketScore: number;   // 0–30
  diversityScore: number; // 0–20
  roleModifier: number;  // ±5
}

export interface Recommendation {
  verdict: Verdict;
  score: number; // 0-100
  emoji: string;
  headline: string;
  description: string;
  actionPrompt?: string; // e.g., "Wait for a price under $120"
  color: string; // For UI styling
  breakdown?: ScoreBreakdown;
}

export interface CalculatorResults {
  metrics: CalculatorMetrics;
  recommendation: Recommendation;
  input: CalculatorInput;
}

/**
 * HELPER: Get annual wears from rotation scenario
 */
export function getWearsFromScenario(scenario: RotationScenario): number {
  const scenarioMap: Record<RotationScenario, number> = {
    daily_beater: 180,      // ~15 wears/mo
    weekend_rotation: 48,   // ~4 wears/mo
    grail: 12,              // ~1 wear/mo (special occasion)
  };
  return scenarioMap[scenario];
}

/**
 * HELPER: Get readable label for rotation scenario
 */
export function getScenarioLabel(scenario: RotationScenario): string {
  const labels: Record<RotationScenario, string> = {
    daily_beater: 'Daily Beater',
    weekend_rotation: 'Weekend Rotation',
    grail: 'Special Occasion / Grail',
  };
  return labels[scenario];
}

/**
 * MAIN LOGIC: Calculate Smart Metrics
 * Incorporates Resale Value, Category Targets, and Rotation Scenario
 */
export function calculateSmartMetrics(input: CalculatorInput): CalculatorMetrics {
  const { price, category, rotationScenario, resalePotential } = input;

  // 1. Calculate Lifespan — quality removed from UI, use standard sneaker lifespan
  const baseLifespanYears = category === 'boots' ? 4 : 2;
  const estimatedLifespanYears = baseLifespanYears; // qualityMultiplier = 1.0 (average)

  // 2. Calculate Total Lifetime Wears
  const baseWearsPerYear = getWearsFromScenario(rotationScenario);
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
 * RECOMMENDATION ENGINE — 3-Factor Weighted Value Index Score (0–100)
 *
 * Factor 1 — CPW (50 pts max):   How good is the cost-per-wear?
 * Factor 2 — Market Delta (30 pts max): Are you paying below or above market?
 * Factor 3 — Collection Diversity (20 pts max): Does your rotation need this brand?
 * Modifier  — Wardrobe Role (±5 pts): Gap fill vs. duplicate.
 */
export function generateSmartRecommendation(
  metrics: CalculatorMetrics,
  input: CalculatorInput
): Recommendation {
  const { realCPW, targetCPW, targetBuyPrice } = metrics;
  const { wardrobeRole, marketValue, ownedSameBrand } = input;

  // ── Factor 1: CPW Score (0–50) ──────────────────────────────────────────
  const cpwRatio = realCPW / Math.max(targetCPW, 0.01);
  // cpwRatio = 1.0 → 25 pts (neutral), 0.5 → 37.5 pts, 2.0 → 0 pts
  const cpwScore = Math.min(50, Math.max(0, 50 * (2 - cpwRatio) / 2));

  // ── Factor 2: Market Delta Score (0–30) ─────────────────────────────────
  // 15 pts = neutral (no market data available)
  let marketScore = 15;
  if (marketValue != null && marketValue > 0) {
    const delta = (marketValue - input.price) / marketValue;
    // delta > 0 = asking below market (good), delta < 0 = above market (bad)
    marketScore = Math.min(30, Math.max(0, 15 + delta * 30));
  }

  // ── Factor 3: Collection Diversity Score (0–20) ──────────────────────────
  // Rewards buying a brand you don't already own multiples of
  let diversityScore: number;
  if (ownedSameBrand == null) {
    // Unauthenticated — award neutral 20 pts (no penalty for unknown state)
    diversityScore = 20;
  } else if (ownedSameBrand === 0) {
    diversityScore = 20;
  } else if (ownedSameBrand === 1) {
    diversityScore = 16;
  } else if (ownedSameBrand === 2) {
    diversityScore = 10;
  } else {
    diversityScore = 4;
  }

  // ── Wardrobe Role Modifier (±5) ──────────────────────────────────────────
  const roleModifier =
    wardrobeRole === 'gap_fill' ? 5 :
    wardrobeRole === 'upgrade'  ? 3 :
    wardrobeRole === 'duplicate' ? -5 :
    0; // variety = neutral

  const rawScore = cpwScore + marketScore + diversityScore + roleModifier;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  const breakdown: ScoreBreakdown = {
    cpwScore: Math.round(cpwScore),
    marketScore: Math.round(marketScore),
    diversityScore: Math.round(diversityScore),
    roleModifier,
  };

  // ── Verdict ──────────────────────────────────────────────────────────────

  if (score >= 80) {
    return {
      verdict: 'BUY_NOW',
      score,
      emoji: '🔥',
      headline: "Cop It. It's a Steal.",
      description: `At an effective $${realCPW.toFixed(2)}/wear, this is exceptional value. It pays for itself in just ${metrics.breakEvenWears} wears.`,
      color: 'green-500',
      breakdown,
    };
  } else if (score >= 50) {
    return {
      verdict: 'WAIT_FOR_SALE',
      score,
      emoji: '👀',
      headline: 'Wait for Market Drop.',
      description: `Decent pick, but overpriced relative to its utility right now. Current market price pushes your cost-per-wear above the target.`,
      actionPrompt: `Set a price alert for $${targetBuyPrice}. At that price, the numbers make sense.`,
      color: 'sun-500',
      breakdown,
    };
  } else {
    return {
      verdict: 'PASS',
      score,
      emoji: '🛑',
      headline: 'Hard Pass.',
      description: `The cost-per-wear ($${realCPW.toFixed(2)}) is too high for this category. This is an impulse buy, not an investment.`,
      actionPrompt: `Look for alternatives under $${targetBuyPrice}, or find a higher-quality version that outlasts the price.`,
      color: 'red-500',
      breakdown,
    };
  }
}

// Legacy support wrapper (if needed during transition)
export function getRecommendation(metrics: CalculatorMetrics, input: CalculatorInput): Recommendation {
  return generateSmartRecommendation(metrics, input);
}

/**
 * Smart defaults for sneaker-only calculations.
 */
export const SNEAKER_DEFAULTS = {
  category: 'lifestyle' as ItemCategory,
  resalePotential: 'low' as ResalePotential,
  wardrobeRole: 'variety' as WardrobeRole,
};

/**
 * Simplified entry point for the public CPW calculator.
 * Only requires price and rotation scenario — everything else uses smart defaults.
 */
export function calculateForSneakers(
  price: number,
  rotationScenario: RotationScenario
): CalculatorResults {
  const input: CalculatorInput = { ...SNEAKER_DEFAULTS, price, rotationScenario };
  const metrics = calculateSmartMetrics(input);
  const recommendation = generateSmartRecommendation(metrics, input);
  return { metrics, recommendation, input };
}
