'use client'

import { motion } from 'framer-motion'
import { WardrobeStats } from '@/lib/achievements-stats'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsGridProps {
  stats: WardrobeStats
}

export function StatsGrid({ stats }: StatsGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  // Calculate comparison metrics (placeholder - will be real data in Phase 2.1)
  const totalSaved = 0 // TODO: Implement in Phase 2.1
  const savedComparison = 12.5 // % change vs last month (placeholder)

  const bestValueComparison = -5.2 // % change (negative = improvement)

  const mostWornThisMonth = stats.mostWornItem?.wears || 0 // Simplified - shows total wears

  return (
    <section className="mb-8" aria-labelledby="stats-grid-title">
      {/* Visually hidden title for accessibility */}
      <h2 id="stats-grid-title" className="sr-only">
        Wardrobe Statistics Overview
      </h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Card 1: Total Money Saved */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-2 rounded-xl p-6 bg-card border border-border shadow-sm"
        >
          <p className="text-base font-medium leading-normal text-foreground">
            Total Money Saved
          </p>

          <p className="tracking-tight text-4xl font-bold leading-tight text-foreground">
            ${totalSaved.toFixed(2)}
          </p>

          <div className="flex items-center gap-1">
            {savedComparison > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <p className={`text-base font-medium leading-normal ${savedComparison > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {savedComparison > 0 ? '+' : ''}{savedComparison}% vs last month
            </p>
          </div>
        </motion.div>

        {/* Card 2: Best Value (Cost Per Wear) */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-2 rounded-xl p-6 bg-card border border-border shadow-sm"
        >
          <p className="text-base font-medium leading-normal text-foreground">
            Best Value (Cost Per Wear)
          </p>

          {stats.bestValue ? (
            <>
              <p className="tracking-tight text-4xl font-bold leading-tight text-foreground">
                ${stats.bestValue.costPerWear.toFixed(2)}
              </p>

              <div className="flex items-center gap-1">
                {bestValueComparison < 0 ? (
                  <TrendingDown className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-600" />
                )}
                <p className={`text-base font-medium leading-normal ${bestValueComparison < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {bestValueComparison > 0 ? '+' : ''}{bestValueComparison}% vs last month
                </p>
              </div>
            </>
          ) : (
            <p className="text-base text-muted-foreground">
              Keep wearing items to unlock
            </p>
          )}
        </motion.div>

        {/* Card 3: Most Worn Item */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-2 rounded-xl p-6 bg-card border border-border shadow-sm"
        >
          <p className="text-base font-medium leading-normal text-foreground">
            Most Worn Item
          </p>

          {stats.mostWornItem ? (
            <>
              <p className="tracking-tight text-4xl font-bold leading-tight text-foreground truncate">
                {stats.mostWornItem.brand} {stats.mostWornItem.model}
              </p>

              <p className="text-base font-medium leading-normal text-green-600">
                Worn {mostWornThisMonth} times this month
              </p>
            </>
          ) : (
            <p className="text-base text-muted-foreground">
              Start logging wears
            </p>
          )}
        </motion.div>
      </motion.div>
    </section>
  )
}
