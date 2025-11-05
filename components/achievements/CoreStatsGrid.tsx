'use client'

import { motion } from 'framer-motion'
import { Trophy, Zap, DollarSign, Flame } from 'lucide-react'
import { WardrobeStats } from '@/lib/achievements-stats'
import Link from 'next/link'

interface CoreStatsGridProps {
  stats: WardrobeStats
}

export function CoreStatsGrid({ stats }: CoreStatsGridProps) {
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

  return (
    <section className="mb-12" aria-labelledby="core-stats-title">
      <h2 id="core-stats-title" className="text-2xl font-bold text-foreground mb-6">
        Your Highlights ✨
      </h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Most Worn Item */}
        <motion.div variants={itemVariants}>
          <Link
            href={stats.mostWornItem ? `/dashboard?tab=owned` : '#'}
            className="block bg-gradient-to-br from-sun-100 to-sun-200 border border-sun-300 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="h-6 w-6 text-sun-600" />
              <h3 className="font-semibold text-foreground">Wardrobe MVP</h3>
            </div>

            {stats.mostWornItem ? (
              <>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stats.mostWornItem.wears}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stats.mostWornItem.brand} {stats.mostWornItem.model}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Start logging wears!
              </div>
            )}
          </Link>
        </motion.div>

        {/* Best Value */}
        <motion.div variants={itemVariants}>
          <div className="bg-gradient-to-br from-meadow-100 to-meadow-200 border border-meadow-300 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="h-6 w-6 text-meadow-600" />
              <h3 className="font-semibold text-foreground">Best Value</h3>
            </div>

            {stats.bestValue ? (
              <>
                <div className="text-3xl font-bold text-foreground mb-1">
                  ${stats.bestValue.costPerWear.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  per wear - {stats.bestValue.brand}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Keep wearing to unlock!
              </div>
            )}
          </div>
        </motion.div>

        {/* Total Saved (Phase 2) */}
        <motion.div variants={itemVariants}>
          <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-300 rounded-lg p-6 opacity-50">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="h-6 w-6 text-emerald-600" />
              <h3 className="font-semibold text-foreground">Total Saved</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              Coming in Phase 2
            </div>
          </div>
        </motion.div>

        {/* Current Streak (Phase 2) */}
        <motion.div variants={itemVariants}>
          <div className="bg-gradient-to-br from-orange-100 to-orange-200 border border-orange-300 rounded-lg p-6 opacity-50">
            <div className="flex items-center gap-3 mb-3">
              <Flame className="h-6 w-6 text-orange-600" />
              <h3 className="font-semibold text-foreground">Wear Streak</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              Coming in Phase 2
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
