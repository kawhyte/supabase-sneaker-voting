'use client'

import { motion } from 'framer-motion'
import { Package, Footprints, Calendar } from 'lucide-react'
import { WardrobeStats } from '@/lib/achievements-stats'

interface HeroSectionProps {
  stats: WardrobeStats
}

export function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section className="mb-12" aria-labelledby="hero-title">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <h1 id="hero-title" className="text-4xl md:text-5xl font-bold text-foreground mb-3">
          Your Wardrobe Story 📖
        </h1>
        <p className="text-lg text-muted-foreground">
          A journey through your style, spending, and sustainable choices
        </p>
      </motion.div>

      {/* Hero Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Total Items */}
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-sun-200 rounded-full mb-3">
            <Package className="h-6 w-6 text-sun-600" />
          </div>
          <div className="text-4xl font-bold text-foreground mb-1">
            {stats.totalItems}
          </div>
          <div className="text-sm text-muted-foreground">
            Items in Wardrobe
          </div>
        </div>

        {/* Total Wears */}
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-meadow-200 rounded-full mb-3">
            <Footprints className="h-6 w-6 text-meadow-600" />
          </div>
          <div className="text-4xl font-bold text-foreground mb-1">
            {stats.totalWears.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            Total Wears Logged
          </div>
        </div>

        {/* Days Tracked */}
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-sky-200 rounded-full mb-3">
            <Calendar className="h-6 w-6 text-sky-600" />
          </div>
          <div className="text-4xl font-bold text-foreground mb-1">
            {stats.daysTracked}
          </div>
          <div className="text-sm text-muted-foreground">
            Days Tracking
          </div>
        </div>
      </motion.div>
    </section>
  )
}
