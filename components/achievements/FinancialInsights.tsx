'use client';

import React from 'react';
import { DollarSign, Activity, TrendingDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FinancialInsightsProps {
  totalValue?: number;
  totalWears?: number;
  averageCpw?: number;
}

export function FinancialInsights({
  totalValue = 0,
  totalWears = 0,
  averageCpw = 0
}: FinancialInsightsProps) {

  const ambientBackgroundStyle = {
    backgroundImage: `
      radial-gradient(circle at 0% 0%, #10b98120 0%, transparent 50%),
      radial-gradient(circle at 100% 100%, #3b82f620 0%, transparent 50%)
    `,
  };

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-gray-200/60 shadow-sm bg-white transition-all hover:shadow-md">
      {/* Ambient Gradient Base */}
      <div className="absolute inset-0 z-0" style={ambientBackgroundStyle} />

      {/* Heavy Frosting Overlay */}
      <div className="absolute inset-0 z-0 bg-white/60 backdrop-blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 p-6 md:p-8">
        <div className="text-left">
          <h3 className="text-[22px] font-semibold tracking-tight text-gray-900">
            Portfolio Insights
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            The overall value and utility of your wardrobe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Metric 1: Total Value */}
          <div className="flex flex-col gap-3 rounded-2xl bg-white/50 border border-white/60 p-5">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-900">
                <DollarSign className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider">Total Value</span>
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-gray-900">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Metric 2: Total Wears */}
          <div className="flex flex-col gap-3 rounded-2xl bg-white/50 border border-white/60 p-5">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider">Total Usage</span>
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-gray-900">
                {totalWears.toLocaleString()} <span className="text-sm font-medium text-gray-500">wears</span>
              </span>
            </div>
          </div>

          {/* Metric 3: Average CPW */}
          <div className="flex flex-col gap-3 rounded-2xl bg-white/50 border border-white/60 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <TrendingDown className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider">Avg CPW</span>
              </div>
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-emerald-600">
                ${averageCpw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="mt-1 flex flex-col gap-1.5">
              <Progress value={Math.max(0, 100 - (averageCpw * 2))} className="h-1.5 bg-gray-200/50" />
              <span className="text-[10px] font-medium text-gray-500 text-right">
                Lower is better
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
