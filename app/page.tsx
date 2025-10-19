'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { ArrowRight, PawPrint } from 'lucide-react'

// Dynamically import Lottie component for code splitting
const Lottie = dynamic(() => import('react-lottie-player'), {
  ssr: false,
})

/**
 * Lottie Animation Wrapper with error boundary
 */
function LottieAnimationWrapper() {
  const [hasError, setHasError] = useState(false)
  const [animationData, setAnimationData] = useState(null)

  useEffect(() => {
    // Load animation data from public folder
    fetch('/animations/cat-wardrobe.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => {
        console.error('Failed to load Lottie animation:', err)
        setHasError(true)
      })
  }, [])

  if (hasError || !animationData) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="w-full flex justify-center"
    >
      <div className="w-full max-w-[500px] aspect-square">
        <Lottie
          loop
          play
          animationData={animationData}
          style={{
            width: '100%',
            height: '100%',
          }}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid slice',
          }}
        />
      </div>
    </motion.div>
  )
}

/**
 * Main Hero Section Component
 * Phantom-inspired centered layout with cat-themed animation
 */
export default function HomePage() {

  return (
    <main className="relative bg-background flex items-center justify-center">
      {/* Gradient background accent (subtle) */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sun-100 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-terracotta-100 rounded-full blur-3xl opacity-20" />
      </div> */}

      {/* Main Hero Content */}
      <div className="relative z-10 w-full px-4 py-12 md:py-0">
        <div className="max-w-7xl mx-auto text-center space-y-4 md:space-y-4">
          {/* Subtitle with fade-in */}
          <p className="text-sm md:text-lg font-medium text-slate-900"
          >
          A watchlist for your wardrobe
          </p>

          {/* Main Headline with staggered text animation */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-slate-900 leading-tight"
          >
            <div className="flex flex-row items-center justify-center gap-2 sm:gap-3">
              <span>Your</span>
              <PawPrint className="text-sun-200 h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14" />
              <span>trusted</span>
            </div>

            <div className="mt-2">
              PurrView Wardrobe
            </div>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg sm:text-xl md:text-2xl text-slate-600 max-w-7xl mx-auto leading-relaxed font-light"
          >
            Curate your wardrobe with feline precision. Keep a watchful eye on your wishlist and pounce on the purrfect price when it drops.
          </motion.p>

          {/* Lottie Animation */}
          <div className="mt-2 md:mt-4">
            <LottieAnimationWrapper />
          </div>

          {/* CTA Button with hover effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="pt-4 md:pt-4"
          >
            <Link href="/login" prefetch={true}>
              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow:
                    '0 20px 25px -5px rgba(255, 199, 0, 0.2), 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-8 md:px-10 py-4 md:py-5 text-base md:text-lg font-semibold rounded-full bg-sun-200 text-slate-900 hover:bg-sun-300 transition-colors duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-sun-300 focus:ring-offset-2 min-h-[44px]"
                aria-label="Start tracking your wardrobe"
              >
                Start Tracking
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Scroll Hint (subtle) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="pt-12 md:pt-16"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center"
            >
              <div className="text-slate-400 text-xs tracking-widest uppercase">
                Scroll to explore
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decorative bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </main>
  )
}