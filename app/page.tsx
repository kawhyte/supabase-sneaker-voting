'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { CalculatorForm } from '@/components/cost-per-wear-calculator/CalculatorForm'
import { HowItWorksSection } from '@/components/cost-per-wear-calculator/HowItWorksSection'

const TRUST_CHIPS = [
  'No account needed',
  'Sneaker-specific math',
  'Takes 60 seconds',
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center pb-20 relative overflow-hidden">

      {/* Yellow ambient glow — sits behind everything */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 20%, #FFC70022 0%, transparent 70%)',
        }}
      />

      {/* ─── COMPACT HEADER ─── */}
      <section className="w-full max-w-3xl mx-auto px-6 pt-10 md:pt-14 pb-8 text-center relative z-10">

        {/* Trust chips */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-6"
        >
          {TRUST_CHIPS.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-sun-400/15 text-amber-700 border border-sun-400/30"
            >
              <Check className="w-3 h-3 text-sun-500" />
              {chip}
            </span>
          ))}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.08]"
        >
          Is it worth{' '}
          <span
            className="relative inline-block"
            style={{
              backgroundImage: 'linear-gradient(135deg, #b8860b 0%, #FFC700 50%, #e6a817 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            the cop?
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="mt-4 text-base text-slate-500 font-medium"
        >
          Every pair tells a story — find out if it&apos;s worth writing.
        </motion.p>
      </section>

      {/* ─── CALCULATOR (THE HERO) ─── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.5 }}
        className="w-full px-4 sm:px-6 relative z-10"
      >
        <CalculatorForm />
      </motion.div>

      {/* ─── HOW IT WORKS ─── */}
      <div className="w-full relative z-10">
        <HowItWorksSection />
      </div>

    </main>
  )
}
