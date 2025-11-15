/**
 * CPW Metrics Card - Shows cost per wear breakdown and progress
 */

'use client';

import { CalculatorMetrics, CalculatorInput } from '@/lib/worth-it-calculator/calculator-logic';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CPWMetricsCardProps {
  metrics: CalculatorMetrics;
  input: CalculatorInput;
}

export function CPWMetricsCard({ metrics, input }: CPWMetricsCardProps) {
  const isWorthItAt1Year = metrics.cpwAt1Year <= metrics.targetCPW;
  const isWorthItAt2Years = metrics.cpwAt2Years <= metrics.targetCPW;

  const getProgressColor = (): string => {
    if (metrics.progressAt1Year >= 100) return '#62a663'; // meadow-500
    if (metrics.progressAt1Year >= 75) return '#81b682'; // meadow-400
    if (metrics.progressAt1Year >= 50) return '#FFC700'; // sun-400
    if (metrics.progressAt1Year >= 25) return '#FFD966';
    return '#FFC700';
  };

  return (
    <Card className="p-6 sm:p-8 bg-card border-border shadow-lg">
      <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <span>💰</span>
        <span>Cost Per Wear Breakdown</span>
      </h3>

      <div className="space-y-6">
        {/* Target CPW */}
        <div className="p-4 bg-stone-100 rounded-lg border border-stone-300">
          <div className="text-sm text-muted-foreground mb-1">Target Cost Per Wear</div>
          <div className="text-3xl font-bold text-foreground">
            ${metrics.targetCPW.toFixed(2)}/wear
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Industry standard for {input.category} at this price point
          </div>
        </div>

        {/* Year 1 & Year 2 Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Year 1 */}
          <div
            className={cn(
              'p-4 rounded-lg border-2',
              isWorthItAt1Year
                ? 'bg-green-50 border-green-500'
                : 'bg-stone-50 border-stone-300'
            )}
          >
            <div className="text-sm text-muted-foreground mb-1">At 1 Year</div>
            <div className="text-2xl font-bold text-foreground">
              ${metrics.cpwAt1Year.toFixed(2)}/wear
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {metrics.expectedWearsYear1} wears
            </div>
            {isWorthItAt1Year && (
              <div className="text-sm text-green-700 font-semibold mt-2">✓ Worth It!</div>
            )}
          </div>

          {/* Year 2 */}
          <div
            className={cn(
              'p-4 rounded-lg border-2',
              isWorthItAt2Years
                ? 'bg-green-50 border-green-500'
                : 'bg-stone-50 border-stone-300'
            )}
          >
            <div className="text-sm text-muted-foreground mb-1">At 2 Years</div>
            <div className="text-2xl font-bold text-foreground">
              ${metrics.cpwAt2Years.toFixed(2)}/wear
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {metrics.expectedWearsYear2} wears
            </div>
            {isWorthItAt2Years && (
              <div className="text-sm text-green-700 font-semibold mt-2">✓ Worth It!</div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress to Target</span>
            <span className="font-semibold text-foreground">
              {metrics.progressAt1Year.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-3 overflow-hidden border border-stone-300">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(Math.max(metrics.progressAt1Year, 0), 100)}%`,
                backgroundColor: getProgressColor(),
              }}
              role="progressbar"
              aria-valuenow={Math.round(metrics.progressAt1Year)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {metrics.progressAt1Year >= 100 ? (
              <span className="text-green-700 font-semibold">
                ✨ You'll reach "worth it" status within the first year!
              </span>
            ) : (
              <span>
                You'll need to wear this {metrics.targetWears} times total to reach the target
              </span>
            )}
          </div>
        </div>

        {/* Calculation Formula */}
        <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
          <div className="text-xs text-muted-foreground font-semibold mb-2">
            HOW WE CALCULATED THIS
          </div>
          <div className="font-mono text-sm text-foreground">
            ${input.price.toFixed(2)} ÷ {metrics.expectedWearsYear1} wears = $
            {metrics.cpwAt1Year.toFixed(2)}/wear
          </div>
        </div>
      </div>
    </Card>
  );
}
