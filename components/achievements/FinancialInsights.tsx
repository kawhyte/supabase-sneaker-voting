'use client';

import { DollarSign, Activity, TrendingDown, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { PortfolioPriceTrend } from '@/lib/achievements-stats';

interface FinancialInsightsProps {
  totalValue?: number;
  totalWears?: number;
  averageCpw?: number;
  priceTrend?: PortfolioPriceTrend;
}

export function FinancialInsights({
  totalValue = 0,
  totalWears = 0,
  averageCpw = 0,
  priceTrend,
}: FinancialInsightsProps) {

  const ambientBackgroundStyle = {
    backgroundImage: `
      radial-gradient(circle at 0% 0%, #10b98120 0%, transparent 50%),
      radial-gradient(circle at 100% 100%, #3b82f620 0%, transparent 50%)
    `,
  };

  const hasSparkline = (priceTrend?.points?.length ?? 0) >= 2;
  const hasDelta = hasSparkline && priceTrend!.deltaAmount !== 0;
  const deltaPositive = (priceTrend?.deltaAmount ?? 0) >= 0;

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-gray-200/60 shadow-sm bg-white transition-all hover:shadow-md">
      {/* Ambient Gradient Base */}
      <div className="absolute inset-0 z-0" style={ambientBackgroundStyle} />

      {/* Heavy Frosting Overlay */}
      <div className="absolute inset-0 z-0 bg-white/60 backdrop-blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 p-6 md:p-8">
        <div className="text-left">
          <h3 className="text-[22px] font-semibold tracking-tight text-gray-900">
            Sneaker Insights
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            The overall value and utility of your sneakers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Metric 1: Total Value — with optional sparkline + delta */}
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

            {/* Delta badge */}
            {hasDelta && (
              <div className="flex items-center gap-1.5">
                {deltaPositive ? (
                  <TrendingUp className="h-3 w-3 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 flex-shrink-0" aria-hidden="true" />
                )}
                <span className={`text-xs font-semibold tabular-nums ${deltaPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {deltaPositive ? '+' : '-'}$
                  {Math.abs(priceTrend!.deltaAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {' / '}
                  {deltaPositive ? '+' : ''}{priceTrend!.deltaPct}%
                </span>
                <span className="text-xs text-gray-400">vs. 30d ago</span>
              </div>
            )}

            {/* Sparkline */}
            {hasSparkline && (
              <div className="mt-1 -mx-1">
                <ResponsiveContainer width="100%" height={40}>
                  <LineChart data={priceTrend!.points}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#FFC700"
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
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
