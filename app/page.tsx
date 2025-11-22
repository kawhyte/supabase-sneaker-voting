'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { ArrowRight, Calculator, TrendingDown, Shirt, Sparkles, MoveRight } from 'lucide-react'

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
    <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[400px] aspect-square relative">
      {/* Restored the subtle glow from Design 1 */}
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
  className = "", 
  href, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string; 
  href: string;
  delay?: number;
}) => {
  return (
    <Link href={href} className={`block h-full ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] }}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        // KEPT: rounded-[2rem] for the Phantom look
        // ADDED: overflow-hidden to prevent corners from "cutting off" incorrectly
        className="h-full w-full relative overflow-hidden rounded-[2rem] transition-shadow duration-300 hover:shadow-xl"
      >
        {children}
      </motion.div>
    </Link>
  )
}

export default function HomePage() {
  return (
    // RESTORED: bg-stone-50 (instead of white)
    // ADJUSTED: pt-6 sm:pt-10 (Less space than Design 1, but more breathing room than Design 2)
    <main className="min-h-screen bg-stone-50 flex flex-col items-center pt-6 sm:pt-10 md:pt-1 pb-20 px-4 sm:px-6">
      
      {/* --- HERO SECTION --- */}
      <div className="max-w-5xl mx-auto text-center space-y-6 mb-12 md:mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center mb-2 md:mb-6"
        >
          <LottieAnimationWrapper />
        </motion.div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            // UPDATE: Switched to text-slate-950 for higher contrast
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-950 leading-[1.1]"
          >
            Your Wardrobe. <span className="text-slate-400">Curated.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            // UPDATE: Slightly darker subtext
            className="text-lg sm:text-xl text-slate-600 font-medium max-w-lg mx-auto"
          >
            Import styles. Track wears. Watch prices.
          </motion.p>
        </div>
      </div>

      {/* --- THE BENTO GRID --- */}
      <div className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[minmax(200px,auto)]">
        
        {/* CARD 1: The Collection (Restored Design 1 Layout) */}
        <div className="col-span-1 md:col-span-2 row-span-2">
          <BentoCard 
            href="/login" 
            className="h-full"
            delay={0.4}
          >
            <div className="bg-white border border-stone-200 p-8 md:p-10 h-full flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-stone-100 rounded-2xl text-slate-900">
                    <Shirt className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider text-stone-500">The Collection</span>
                </div>
                {/* UPDATE: Darker text (slate-950) + Font Extrabold */}
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-950 mb-4 group-hover:text-sun-500 transition-colors">
                  Organize your rotation.
                </h2>
                <p className="text-lg text-slate-600 max-w-md font-medium">
                  Keep a watchful eye on your wishlist and track every wear. Your digital closet, reimagined.
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-stone-100 flex items-center justify-between">
                <div className="flex -space-x-4">
                  {[1,2,3].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full bg-stone-100 border-4 border-white flex items-center justify-center shadow-sm">
                       <Sparkles className="w-4 h-4 text-stone-300" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-slate-950 font-bold group-hover:gap-4 transition-all">
                  Open Wardrobe <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </BentoCard>
        </div>

        {/* CARD 2: Calculator (Restored Design 1 Colors + Darker Text) */}
        <div className="col-span-1 row-span-1 min-h-[240px]">
          <BentoCard 
            href="/cost-per-wear-calculator" 
            className="h-full"
            delay={0.5}
          >
            <div className="bg-terracotta-50 border border-terracotta-100 p-6 md:p-8 h-full flex flex-col justify-between hover:bg-terracotta-100 transition-colors">
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-2xl w-fit text-terracotta-500 shadow-sm">
                  <Calculator className="w-6 h-6" />
                </div>
                {/* UPDATE: Increased weight and darkness */}
                <h3 className="text-2xl font-extrabold text-slate-950 leading-tight">
                  Is it worth it?
                </h3>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-terracotta-700 font-bold">CPW Calculator</p>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <MoveRight className="w-4 h-4 text-terracotta-500" />
                </div>
              </div>
            </div>
          </BentoCard>
        </div>

        {/* CARD 3: Price Tracker (Restored Design 1 Colors + Darker Text) */}
        <div className="col-span-1 row-span-1 min-h-[240px]">
          <BentoCard 
            href="/login" 
            className="h-full"
            delay={0.6}
          >
            <div className="bg-sun-50 border border-sun-100 p-6 md:p-8 h-full flex flex-col justify-between hover:bg-sun-100 transition-colors">
               <div className="space-y-4">
                <div className="p-3 bg-white rounded-2xl w-fit text-sun-500 shadow-sm">
                  <TrendingDown className="w-6 h-6" />
                </div>
                {/* UPDATE: Increased weight and darkness */}
                <h3 className="text-2xl font-extrabold text-slate-950 leading-tight">
                  Never overpay.
                </h3>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-sun-700 font-bold">Price Alerts</p>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <MoveRight className="w-4 h-4 text-sun-500" />
                </div>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>

      {/* --- SCROLL HINT --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-12 md:mt-16 text-center"
      >
        {/* UPDATE: Darker grey for better visibility */}
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">
          Curate with feline precision
        </p>
      </motion.div>
    </main>
  )
}