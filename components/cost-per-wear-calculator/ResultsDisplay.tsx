/**
 * Results Display — "The Verdict" reveal
 */

'use client';

import { CalculatorResults } from '@/lib/worth-it-calculator/calculator-logic';
import { RecommendationCard } from './RecommendationCard';
import { CPWMetricsCard } from './CPWMetricsCard';
import { TimelineProjection } from './TimelineProjection';

interface ResultsDisplayProps {
  results: CalculatorResults;
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  return (
    <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500">
      {/* Minimalist verdict header */}
      <div className="text-center pt-8 pb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Value Index
        </p>
        <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tighter text-foreground">
          The Verdict.
        </h2>
      </div>

      {/* Recommendation (Most Important - First) */}
      <RecommendationCard recommendation={results.recommendation} />

      {/* Cost Per Wear Metrics */}
      <CPWMetricsCard metrics={results.metrics} input={results.input} />

      {/* Timeline Projection */}
      <TimelineProjection metrics={results.metrics} input={results.input} />
    </div>
  );
}
