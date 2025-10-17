'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, BarChart3, Zap, TrendingUp, Target, Brain } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
    
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="text-9xl">👟</div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="absolute -top-2 -right-2"
              >
                <Zap className="h-8 w-8 text-orange-500" fill="currentColor" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-teal-600 to-orange-500 bg-clip-text text-transparent"
          >
            Item Sizing Tracker
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-7xl mx-auto"
          >
            Track your try-on experiences, discover perfect fits, and never buy the wrong size again.
          </motion.p>

          
      </div>
    </div>
  )
}