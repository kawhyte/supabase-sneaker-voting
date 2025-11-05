'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { CategorySpending } from '@/lib/financial-stats'

interface CategorySpendingChartProps {
  data: CategorySpending[]
}

export function CategorySpendingChart({ data }: CategorySpendingChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">
          No purchase data yet. Add items with prices to see your spending breakdown.
        </p>
      </div>
    )
  }

  const totalSpent = data.reduce((sum, cat) => sum + cat.amount, 0)

  // Custom label showing percentage
  const renderLabel = (entry: any) => {
    const percent = ((entry.amount / totalSpent) * 100).toFixed(0)
    return `${percent}%`
  }

  return (
    <div className="space-y-4">
      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={100}
            innerRadius={60} // Donut chart
            fill="#8884d8"
            dataKey="amount"
            nameKey="category"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `$${value.toFixed(2)}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => {
              const spending = data.find((d) => d.category === value)
              return `${value} ($${spending?.amount.toFixed(0)})`
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Category Breakdown Table */}
      <div className="space-y-2">
        {data
          .sort((a, b) => b.amount - a.amount)
          .map((cat) => (
            <div
              key={cat.category}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <div>
                  <div className="font-medium text-sm">{cat.category}</div>
                  <div className="text-xs text-muted-foreground">
                    {cat.itemCount} items
                  </div>
                </div>
              </div>
              <div className="font-bold">${cat.amount.toFixed(2)}</div>
            </div>
          ))}
      </div>
    </div>
  )
}
