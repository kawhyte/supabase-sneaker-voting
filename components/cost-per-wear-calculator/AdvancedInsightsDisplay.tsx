/**
 * Advanced Insights Display - Shows advanced analysis if provided
 */

'use client';

import { AdvancedInsights } from '@/lib/worth-it-calculator/calculator-logic';
import { Card } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Info, TrendingDown, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedInsightsDisplayProps {
  insights: AdvancedInsights;
}

export function AdvancedInsightsDisplay({ insights }: AdvancedInsightsDisplayProps) {
  const hasAnyInsights =
    insights.saleValueAnalysis ||
    insights.saturationWarning ||
    insights.colorOverlapWarning ||
    insights.gapFillBonus;

  if (!hasAnyInsights) return null;

  return (
    <Card className="p-6 sm:p-8 bg-card border-border shadow-lg">
      <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Info className="h-6 w-6 text-blue-500" />
        <span>Advanced Insights</span>
      </h3>

      <div className="space-y-4">
        {/* Sale Value Analysis */}
        {insights.saleValueAnalysis && (
          <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg">
            <div className="flex items-start gap-3">
              <TrendingDown className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <div className="font-semibold text-green-900 text-base flex items-center gap-2">
                  <PartyPopper className="h-5 w-5" /> Great Sale Find!
                </div>
                <p className="text-sm text-green-800 leading-relaxed">
                  {insights.saleValueAnalysis.message}
                </p>
                <div className="flex flex-wrap gap-4 text-sm pt-2">
                  <div>
                    <span className="text-green-700">Savings:</span>{' '}
                    <span className="font-semibold text-green-900">
                      ${insights.saleValueAnalysis.savingsAmount.toFixed(2)} (
                      {insights.saleValueAnalysis.savingsPercent}% off)
                    </span>
                  </div>
                  <div>
                    <span className="text-green-700">New Target Wears:</span>{' '}
                    <span className="font-semibold text-green-900">
                      {insights.saleValueAnalysis.adjustedTargetWears} times
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saturation Warning */}
        {insights.saturationWarning && (
          <div
            className={cn(
              'p-4 border-2 rounded-lg',
              insights.saturationWarning.level === 'high'
                ? 'bg-red-50 border-red-500'
                : insights.saturationWarning.level === 'medium'
                ? 'bg-orange-50 border-orange-500'
                : 'bg-blue-50 border-blue-500'
            )}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className={cn(
                  'h-6 w-6 flex-shrink-0 mt-0.5',
                  insights.saturationWarning.level === 'high'
                    ? 'text-red-600'
                    : insights.saturationWarning.level === 'medium'
                    ? 'text-orange-600'
                    : 'text-blue-600'
                )}
              />
              <div className="space-y-2 flex-1">
                <div
                  className={cn(
                    'font-semibold text-base',
                    insights.saturationWarning.level === 'high'
                      ? 'text-red-900'
                      : insights.saturationWarning.level === 'medium'
                      ? 'text-orange-900'
                      : 'text-blue-900'
                  )}
                >
                  {insights.saturationWarning.message}
                </div>
                <p
                  className={cn(
                    'text-sm leading-relaxed',
                    insights.saturationWarning.level === 'high'
                      ? 'text-red-800'
                      : insights.saturationWarning.level === 'medium'
                      ? 'text-orange-800'
                      : 'text-blue-800'
                  )}
                >
                  {insights.saturationWarning.suggestion}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Color Overlap Warning */}
        {insights.colorOverlapWarning && (
          <div className="p-4 bg-orange-50 border-2 border-orange-500 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <div className="font-semibold text-orange-900 text-base">
                  Color Redundancy Alert
                </div>
                <p className="text-sm text-orange-800 leading-relaxed">
                  {insights.colorOverlapWarning.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Gap Fill Bonus */}
        {insights.gapFillBonus && (
          <div
            className={cn(
              'p-4 border-2 rounded-lg',
              insights.gapFillBonus.priority === 'essential'
                ? 'bg-green-50 border-green-500'
                : insights.gapFillBonus.priority === 'nice-to-have'
                ? 'bg-blue-50 border-blue-500'
                : 'bg-orange-50 border-orange-500'
            )}
          >
            <div className="flex items-start gap-3">
              {insights.gapFillBonus.priority === 'essential' ? (
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : insights.gapFillBonus.priority === 'nice-to-have' ? (
                <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 flex-1">
                <div
                  className={cn(
                    'font-semibold text-base',
                    insights.gapFillBonus.priority === 'essential'
                      ? 'text-green-900'
                      : insights.gapFillBonus.priority === 'nice-to-have'
                      ? 'text-blue-900'
                      : 'text-orange-900'
                  )}
                >
                  {insights.gapFillBonus.priority === 'essential'
                    ? 'Essential Wardrobe Addition'
                    : insights.gapFillBonus.priority === 'nice-to-have'
                    ? 'Nice-to-Have Addition'
                    : 'Redundant Purchase Warning'}
                </div>
                <p
                  className={cn(
                    'text-sm leading-relaxed',
                    insights.gapFillBonus.priority === 'essential'
                      ? 'text-green-800'
                      : insights.gapFillBonus.priority === 'nice-to-have'
                      ? 'text-blue-800'
                      : 'text-orange-800'
                  )}
                >
                  {insights.gapFillBonus.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
