/**
 * Recommendation Card - Shows the verdict (Excellent/Good/Caution/Skip)
 */

'use client';

import { Recommendation } from '@/lib/worth-it-calculator/calculator-logic';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const verdictStyles = {
  EXCELLENT: {
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
    border: 'border-green-500',
    textColor: 'text-green-900',
    badgeBg: 'bg-green-500',
  },
  GOOD: {
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
    border: 'border-sun-400',
    textColor: 'text-slate-900',
    badgeBg: 'bg-sun-400',
  },
  CAUTION: {
    bg: 'bg-gradient-to-br from-orange-50 to-red-50',
    border: 'border-orange-500',
    textColor: 'text-orange-900',
    badgeBg: 'bg-orange-500',
  },
  SKIP: {
    bg: 'bg-gradient-to-br from-red-50 to-rose-50',
    border: 'border-red-500',
    textColor: 'text-red-900',
    badgeBg: 'bg-red-500',
  },
};

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const styles = verdictStyles[recommendation.verdict];

  return (
    <Card
      className={cn(
        'p-6 sm:p-8 border-2 shadow-xl',
        styles.bg,
        styles.border
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-5xl">{recommendation.emoji}</span>
          <div>
            <h2 className={cn('text-2xl sm:text-3xl font-bold', styles.textColor)}>
              {recommendation.title}
            </h2>
          </div>
        </div>
        <div className={cn('px-3 py-1 rounded-full text-white text-sm font-semibold', styles.badgeBg)}>
          {recommendation.verdict}
        </div>
      </div>

      {/* Message */}
      <p className={cn('text-base sm:text-lg leading-relaxed', styles.textColor)}>
        {recommendation.message}
      </p>
    </Card>
  );
}
