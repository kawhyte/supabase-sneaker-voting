// components/cost-per-wear-calculator/TimelineProjection.tsx
'use client';

import { CalculatorMetrics, CalculatorInput, getFrequencyLabel, getWearsFromFrequency } from '@/lib/worth-it-calculator/calculator-logic';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface TimelineProjectionProps {
  metrics: CalculatorMetrics;
  input: CalculatorInput;
}

export function TimelineProjection({ metrics, input }: TimelineProjectionProps) {
  // 1. Calculate dates dynamically based on the new "breakEvenWears" metric
  const wearsPerYear = getWearsFromFrequency(input.wearFrequency);
  
  // Safety check to avoid division by zero
  const safeWearsPerYear = wearsPerYear > 0 ? wearsPerYear : 1;
  
  const yearsToBreakEven = metrics.breakEvenWears / safeWearsPerYear;
  const monthsToBreakEven = Math.ceil(yearsToBreakEven * 12);
  
  const today = new Date();
  const targetDate = new Date();
  targetDate.setMonth(today.getMonth() + monthsToBreakEven);

  // 2. Robust Date Formatter with safety guard
  const formatDate = (date: Date | undefined): string => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'N/A';
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card className="p-6 sm:p-8 bg-card border-border shadow-lg">
      <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Clock className="h-6 w-6 text-sun-400" />
        <span>Time to Value</span>
      </h3>

      <div className="space-y-8">
        {/* Timeline Visual */}
        <div className="relative pt-2 pb-6 px-2">
          {/* Line */}
          <div className="absolute left-4 right-4 top-6 h-1.5 bg-stone-100 rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-stone-300 to-green-400 w-full origin-left" />
          </div>

          {/* Points Container */}
          <div className="relative flex justify-between">
            
            {/* Start Point */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-stone-400 ring-4 ring-white z-10" />
              <div className="text-center">
                <div className="font-bold text-sm text-stone-500">Today</div>
                <div className="text-xs text-stone-400">{formatDate(today)}</div>
              </div>
            </div>

            {/* End Point (Break Even) */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center ring-4 ring-white shadow-md z-10">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-center">
                <div className="font-bold text-sm text-green-700">Pays for Itself</div>
                <div className="text-xs text-green-600 font-medium">{formatDate(targetDate)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-center">
            <div className="text-xs uppercase tracking-wide text-stone-500 font-semibold mb-1">Time to ROI</div>
            <div className="text-lg font-bold text-stone-900">
              {monthsToBreakEven < 1 ? '< 1 Month' : `${monthsToBreakEven} Months`}
            </div>
          </div>
          
          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-center">
            <div className="text-xs uppercase tracking-wide text-stone-500 font-semibold mb-1">Wears Needed</div>
            <div className="text-lg font-bold text-stone-900">
              {metrics.breakEvenWears}
            </div>
          </div>

          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-center">
            <div className="text-xs uppercase tracking-wide text-stone-500 font-semibold mb-1">Usage Rate</div>
            <div className="text-lg font-bold text-stone-900">
              {getFrequencyLabel(input.wearFrequency).split(' ')[0]}
            </div>
          </div>
        </div>

        {/* Contextual Tip */}
        <div className="flex gap-3 text-sm text-stone-600 bg-stone-50 p-4 rounded-md">
          <Calendar className="w-5 h-5 text-stone-400 flex-shrink-0" />
          <p>
            At your <strong>{input.wearFrequency}</strong> wear rate, this item breaks even in <strong>{yearsToBreakEven.toFixed(1)} years</strong>.
            {metrics.estimatedLifespanYears > yearsToBreakEven
              ? <span className="inline-flex items-center gap-1"> Since this is well within the item's estimated lifespan, it's a safe investment. <CheckCircle2 className="h-4 w-4 text-green-600 inline" /></span>
              : <span className="inline-flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-orange-600 inline" /> This is longer than the item might last. Consider a higher quality alternative.</span>}
          </p>
        </div>
      </div>
    </Card>
  );
}