'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, BarChart3, Zap, TrendingUp, Target, Brain } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
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
            Sneaker Sizing Tracker
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Track your try-on experiences, discover perfect fits, and never buy the wrong size again.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/add-new-item">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Sneaker
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Dashboard
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {/* Feature 1 */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full bg-white/80 backdrop-blur border-2 hover:border-blue-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Track Try-Ons</h3>
                <p className="text-gray-600">
                  Record every sneaker you try on with size, fit rating, and comfort level. Build your personal sizing database.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full bg-white/80 backdrop-blur border-2 hover:border-teal-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 mb-4">
                  <Brain className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Smart Recommendations</h3>
                <p className="text-gray-600">
                  Get AI-powered size suggestions based on your fit history. Know your size across different brands.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full bg-white/80 backdrop-blur border-2 hover:border-orange-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mb-4">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Price Monitoring</h3>
                <p className="text-gray-600">
                  Set target prices and get notified when sneakers drop to your ideal price point. Never miss a deal.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-br from-blue-600 to-teal-600 border-0">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Find Your Perfect Fit?
              </h2>
              <p className="text-xl text-blue-50 mb-6">
                Start tracking your sneaker experiences today and make confident sizing decisions.
              </p>
              <Link href="/add-new-item">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6">
                  <Zap className="mr-2 h-5 w-5" />
                  Get Started Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}