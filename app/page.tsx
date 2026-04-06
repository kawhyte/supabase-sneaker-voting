'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingDown, Footprints, MoveRight } from 'lucide-react'
import { PublicCPWCalculator } from '@/components/PublicCPWCalculator'

// Dynamically import Lottie component for code splitting
const Lottie = dynamic(() => import('react-lottie-player'), {
  ssr: false,
})

function LottieAnimationWrapper() {
  const [hasError, setHasError] = useState(false)
  const [animationData, setAnimationData] = useState(null)

  useEffect(() => {
    fetch('/animations/cat-wardrobe.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => {
        console.error('Failed to load Lottie animation:', err)
        setHasError(true)
      })
  }, [])

  if (hasError || !animationData) return null

  return (
    <div className="w-full max-w-[320px] sm:max-w-[380px] aspect-square relative mx-auto">
      <div className="absolute inset-0 bg-sun-200/20 blur-[60px] rounded-full transform scale-75" />
      <Lottie
        loop
        play
        animationData={animationData}
        style={{ width: '100%', height: '100%' }}
        rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
      />
    </div>
  )
}

const BentoCard = ({
  children,
  className = '',
  href,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  href: string
  delay?: number
}) => {
  return (
    <Link href={href} className={`block h-full ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] }}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className="h-full w-full relative overflow-hidden rounded-[2rem] transition-shadow duration-300 hover:shadow-xl"
      >
        {children}
      </motion.div>
    </Link>
  )
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center pb-20">

      {/* --- HERO SECTION: Calculator + Mascot --- */}
      <section className="w-full max-w-6xl mx-auto px-6 pt-10 md:pt-16 pb-16 md:pb-24">

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 text-center mb-4"
        >
          Sneaker CPW Calculator
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.1] text-center mb-12 md:mb-16"
        >
          Is it worth <span className="text-slate-400">the cop?</span>
        </motion.h1>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">

          {/* Left: Calculator */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm"
          >
            <PublicCPWCalculator />
          </motion.div>

          {/* Right: Mascot + tagline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col items-center gap-8 text-center"
          >
            <LottieAnimationWrapper />

            <div className="space-y-3 max-w-xs">
              <p className="text-xl font-extrabold text-slate-900">
                Stop guessing. Start tracking.
              </p>
              <p className="text-base text-slate-500 font-medium leading-relaxed">
                Every pair tells a story. PurrView helps you know if it&apos;s worth writing.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 mt-2 text-sm font-bold text-slate-900 hover:text-sun-500 transition-colors"
              >
                Build your rotation <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- BENTO GRID (2 cards) --- */}
      <div className="w-full max-w-[900px] px-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

        {/* Card 1: The Collection */}
        <BentoCard href="/login" delay={0.4}>
          <div className="bg-white border border-stone-200 p-6 md:p-8 h-full min-h-[200px] flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="p-3 bg-stone-100 rounded-2xl w-fit text-slate-900">
                <Footprints className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-950 group-hover:text-sun-500 transition-colors leading-tight">
                Track your rotation.
              </h3>
            </div>
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-slate-500 font-bold">Wardrobe Manager</p>
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                <MoveRight className="w-4 h-4 text-stone-400 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Card 2: Price Alerts */}
        <BentoCard href="/login" delay={0.5}>
          <div className="bg-sun-50 border border-sun-100 p-6 md:p-8 h-full min-h-[200px] flex flex-col justify-between hover:bg-sun-100 transition-colors group">
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-2xl w-fit text-sun-500 shadow-sm">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-950 leading-tight">
                Never overpay.
              </h3>
            </div>
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-sun-700 font-bold">Price Alerts</p>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <MoveRight className="w-4 h-4 text-sun-500" />
              </div>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* --- SCROLL HINT --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-12 text-center"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">
          Curate with feline precision
        </p>
      </motion.div>
    </main>
  )
}
