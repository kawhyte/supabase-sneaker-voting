'use client'

import { DollarSign, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface TotalSavedProps {
  amount: number
  priceAlertsCount?: number
}

export function TotalSaved({ amount, priceAlertsCount = 0 }: TotalSavedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-emerald-100 to-emerald-200 border-2 border-emerald-300 rounded-lg p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 rounded-full">
          <DollarSign className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Total Saved</h3>
          <p className="text-xs text-muted-foreground">
            From smart shopping decisions
          </p>
        </div>
      </div>

      <div className="text-4xl font-bold text-foreground mb-2">
        ${amount.toFixed(2)}
      </div>

      {amount > 0 && (
        <div className="flex items-center gap-2 text-sm text-emerald-700">
          <TrendingDown className="h-4 w-4" />
          <span>
            You paid less than retail on {priceAlertsCount > 0 ? priceAlertsCount : 'multiple'} items!
          </span>
        </div>
      )}

      {amount === 0 && (
        <p className="text-sm text-muted-foreground">
          Start tracking sale prices to see your savings grow!
        </p>
      )}
    </motion.div>
  )
}
