'use client'

import { ROIProgress } from '@/lib/financial-stats'

interface ROIProgressDashboardProps {
  data: ROIProgress[]
}

export function ROIProgressDashboard({ data }: ROIProgressDashboardProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">
          ROI Progress by Category
        </p>
        <div className="flex items-center justify-center h-[148px] bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">No ROI data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">
        ROI Progress by Category
      </p>
      <div className="flex flex-col justify-end flex-1 min-h-[148px]">
        <div className="grid gap-3">
          {data.slice(0, 5).map((item) => {
            const percentage = item.percentageHitTarget
            const isExcellent = percentage >= 75
            const isGood = percentage >= 50
            const colorClass = isExcellent
              ? 'bg-green-500'
              : isGood
              ? 'bg-amber-500'
              : 'bg-red-500'

            return (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{item.category}</span>
                  <span className="text-muted-foreground">
                    {item.itemsHitTarget}/{item.totalItems} items ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${colorClass} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
