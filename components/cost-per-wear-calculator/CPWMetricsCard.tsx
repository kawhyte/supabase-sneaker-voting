'use client';

import { CalculatorMetrics, CalculatorInput } from '@/lib/worth-it-calculator/calculator-logic';
import { Card } from '@/components/ui/card';
import { ArrowRight, DollarSign, Repeat, TrendingDown } from 'lucide-react';

interface CPWMetricsCardProps {
  metrics: CalculatorMetrics;
  input: CalculatorInput;
}

export function CPWMetricsCard({ metrics, input }: CPWMetricsCardProps) {
  return (
    <Card className="p-6 sm:p-8 bg-card border-border shadow-lg">
      <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"><DollarSign className="w-5 h-5" /></span>
        <span>Financial Breakdown</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. The Sticker Price vs Net Cost */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between">
          <div>
            <div className="text-sm text-stone-500 font-medium mb-1">Net Cost</div>
            <div className="text-2xl font-bold text-stone-900">
              ${metrics.netCost.toFixed(0)}
            </div>
            <div className="text-xs text-stone-400 mt-1">
              What you actually pay
            </div>
          </div>
          
          {metrics.estimatedResaleValue > 0 && (
            <div className="mt-4 pt-4 border-t border-stone-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500">Retail Price</span>
                <span className="font-medium strike-through text-stone-400">${input.price}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-green-600 font-medium">Est. Resale</span>
                <span className="text-green-600 font-bold">-${metrics.estimatedResaleValue}</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Lifetime Wears */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between">
          <div>
            <div className="text-sm text-stone-500 font-medium mb-1">Estimated Lifespan</div>
            <div className="text-2xl font-bold text-stone-900">
              {metrics.estimatedLifespanYears} Years
            </div>
            <div className="text-xs text-stone-400 mt-1">
              Based on quality rating
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-stone-200 flex items-center gap-2 text-stone-600">
            <Repeat className="w-4 h-4" />
            <span className="text-sm font-medium">{metrics.totalLifetimeWears} total wears</span>
          </div>
        </div>

        {/* 3. Real CPW (The Hero Metric) */}
        <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <TrendingDown className="w-16 h-16" />
          </div>
          
          <div>
            <div className="text-sm text-slate-300 font-medium mb-1">Real Cost Per Wear</div>
            <div className="text-3xl font-bold text-white">
              ${metrics.realCPW.toFixed(2)}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              Target to beat:
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 bg-slate-600 rounded-full flex-1">
                <div 
                  className={`h-full rounded-full ${metrics.realCPW <= metrics.targetCPW ? 'bg-green-400' : 'bg-red-400'}`} 
                  style={{ width: `${Math.min(100, (metrics.targetCPW / metrics.realCPW) * 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium">${metrics.targetCPW}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Break Even Explanation */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
        <div className="bg-blue-100 p-2 rounded-full">
          <ArrowRight className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h4 className="font-semibold text-blue-900 text-sm">The Break-Even Point</h4>
          <p className="text-blue-800 text-sm mt-1">
            To get your money's worth (hitting the ${metrics.targetCPW}/wear target), you need to wear this item <strong>{metrics.breakEvenWears} times</strong>.
            Based on your usage, that will take about <strong>{Math.ceil(metrics.breakEvenWears / (metrics.totalLifetimeWears / metrics.estimatedLifespanYears) * 12)} months</strong>.
          </p>
        </div>
      </div>
    </Card>
  );
}