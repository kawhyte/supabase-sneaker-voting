'use client'

import { useMemo } from 'react'
import { CategoryCPW } from '@/lib/financial-stats'

interface AverageCPWByCategoryChartProps {
  data: CategoryCPW[]
}

export function AverageCPWByCategoryChart({ data }: AverageCPWByCategoryChartProps) {
  const maxCPW = useMemo(() => {
    if (data.length === 0) return 0
    return Math.max(...data.map((d) => d.avgCostPerWear), 1)
  }, [data])

  if (data.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">
          Avg Cost Per Wear by Category
        </p>
        <div className="flex items-center justify-center h-[148px] bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">No cost-per-wear data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">
        Avg Cost Per Wear by Category
      </p>
      <div className="flex flex-col justify-end flex-1 min-h-[148px]">
        <div className="grid gap-2">
          {data.slice(0, 5).map((item) => {
            const percentage = (item.avgCostPerWear / maxCPW) * 100
            const isGood = item.percentOfTarget < 100

            return (
              <div key={item.category} className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground w-20 truncate">
                  {item.category}
                </span>
                <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden relative">
                  <div
                    className={`h-full ${isGood ? 'bg-green-500' : 'bg-amber-500'} transition-all duration-300 flex items-center justify-end px-2`}
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  >
                    <span className="text-xs font-bold text-white">
                      ${item.avgCostPerWear.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
