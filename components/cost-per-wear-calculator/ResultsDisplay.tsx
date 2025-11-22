/**
 * Results Display - Shows calculation results with recommendation
 */

'use client';

import { CalculatorResults } from '@/lib/worth-it-calculator/calculator-logic';
import { Card } from '@/components/ui/card';
import { RecommendationCard } from './RecommendationCard';
import { CPWMetricsCard } from './CPWMetricsCard';
import { TimelineProjection } from './TimelineProjection';
// import { AdvancedInsightsDisplay } from './AdvancedInsightsDisplay'; // Commented out - incomplete feature

interface ResultsDisplayProps {
  results: CalculatorResults;
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  return (
    <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500">
      {/* Recommendation (Most Important - First) */}
      <RecommendationCard recommendation={results.recommendation} />

      {/* Cost Per Wear Metrics */}
      <CPWMetricsCard metrics={results.metrics} input={results.input} />

      {/* Timeline Projection */}
      <TimelineProjection metrics={results.metrics} input={results.input} />

      {/* Advanced Insights (if provided) - Commented out - incomplete feature */}
      {/* {results.advancedInsights && (
        <AdvancedInsightsDisplay insights={results.advancedInsights} />
      )} */}
    </div>
  );
}
