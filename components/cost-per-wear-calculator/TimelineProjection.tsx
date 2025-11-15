/**
 * Timeline Projection - Visual timeline showing when target will be reached
 */

'use client';

import { CalculatorMetrics, CalculatorInput, getFrequencyLabel } from '@/lib/worth-it-calculator/calculator-logic';
import { Card } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface TimelineProjectionProps {
  metrics: CalculatorMetrics;
  input: CalculatorInput;
}

export function TimelineProjection({ metrics, input }: TimelineProjectionProps) {
  const today = new Date();
  const targetDate = metrics.dateAtTarget;

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card className="p-6 sm:p-8 bg-card border-border shadow-lg">
      <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Calendar className="h-6 w-6 text-sun-400" />
        <span>Timeline to "Worth It" Status</span>
      </h3>

      <div className="space-y-6">
        {/* Timeline Visual */}
        <div className="relative">
          {/* Line */}
          <div className="absolute left-0 right-0 top-8 h-1 bg-gradient-to-r from-sun-400 to-green-500 rounded-full" />

          {/* Points */}
          <div className="relative flex items-start justify-between">
            {/* Today */}
            <div className="flex flex-col items-center gap-2 z-10">
              <div className="h-16 w-16 rounded-full bg-sun-400 flex items-center justify-center text-2xl shadow-lg">
                🛍️
              </div>
              <div className="text-center">
                <div className="font-semibold text-sm">Today</div>
                <div className="text-xs text-muted-foreground">{formatDate(today)}</div>
                <div className="text-xs text-foreground font-mono mt-1">
                  ${input.price.toFixed(0)}
                </div>
              </div>
            </div>

            {/* Target Date */}
            <div className="flex flex-col items-center gap-2 z-10">
              <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center text-2xl shadow-lg">
                ✨
              </div>
              <div className="text-center">
                <div className="font-semibold text-sm">Target Reached</div>
                <div className="text-xs text-muted-foreground">{formatDate(targetDate)}</div>
                <div className="text-xs text-foreground font-mono mt-1">
                  ${metrics.targetCPW.toFixed(2)}/wear
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Time to Target</span>
            <span className="text-base font-semibold text-foreground">
              {metrics.monthsToTarget} months
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Wears Needed</span>
            <span className="text-base font-semibold text-foreground">
              {metrics.targetWears} times
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Your Wear Frequency</span>
            <span className="text-base font-semibold text-foreground">
              {getFrequencyLabel(input.wearFrequency)}
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 leading-relaxed">
            💡 <strong>Pro Tip:</strong> At your{' '}
            <span className="font-semibold">{input.wearFrequency}</span> wear rate, you'll reach
            "worth it" status by <span className="font-semibold">{formatDate(targetDate)}</span>.
            If you wear it more often, you'll justify the purchase faster!
          </p>
        </div>
      </div>
    </Card>
  );
}
