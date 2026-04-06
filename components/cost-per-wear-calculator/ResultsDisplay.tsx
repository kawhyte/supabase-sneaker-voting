/**
 * Results Display - Shows calculation results with cat mascot reveal
 */

'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { CalculatorResults } from '@/lib/worth-it-calculator/calculator-logic';
import { RecommendationCard } from './RecommendationCard';
import { CPWMetricsCard } from './CPWMetricsCard';
import { TimelineProjection } from './TimelineProjection';

const Lottie = dynamic(() => import('react-lottie-player'), { ssr: false });

function CatMascot({ verdict }: { verdict: string }) {
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    // Use the laughing cat for BUY_NOW, wardrobe cat otherwise
    const file = verdict === 'BUY_NOW' ? 'cat-laughing.json' : 'cat-wardrobe.json';
    fetch(`/animations/${file}`)
      .then((r) => r.json())
      .then(setAnimationData)
      .catch(() => null);
  }, [verdict]);

  if (!animationData) return null;

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="w-24 h-24 relative">
        <Lottie
          loop
          play
          animationData={animationData}
          style={{ width: '100%', height: '100%' }}
          rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
        />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
        {verdict === 'BUY_NOW'
          ? 'PurrView says: cop it'
          : verdict === 'WAIT_FOR_SALE'
          ? 'PurrView says: hold off'
          : 'PurrView says: hard pass'}
      </p>
    </div>
  );
}

interface ResultsDisplayProps {
  results: CalculatorResults;
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  return (
    <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500">
      {/* Cat mascot reveal */}
      <CatMascot verdict={results.recommendation.verdict} />

      {/* Recommendation (Most Important - First) */}
      <RecommendationCard recommendation={results.recommendation} />

      {/* Cost Per Wear Metrics */}
      <CPWMetricsCard metrics={results.metrics} input={results.input} />

      {/* Timeline Projection */}
      <TimelineProjection metrics={results.metrics} input={results.input} />
    </div>
  );
}
