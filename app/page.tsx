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
    <main className="min-h-screen bg-slate-50 flex flex-col items-center pb-20 relative overflow-hidden">

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
      <section className="w-full max-w-3xl mx-auto px-6 pt-14 md:pt-20 pb-12 text-center relative z-10">

        {/* Trust chips */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-wrap items-center justify-center gap-3 gap-y-2 mb-8"
        >
          {TRUST_CHIPS.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide px-4 py-2 rounded-full bg-primary/15 text-amber-700 border border-primary/30"
            >
              <Check className="w-3 h-3 text-primary" />
              {chip}
            </span>
          ))}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter text-slate-950 leading-[1.0]"
        >
          Is it worth{' '}
          <span className="text-primary">
            the cop?
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="mt-6 text-lg text-slate-500 font-medium"
        >
          Stop guessing. Start knowing.
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

      {/* ─── DARK STAT STRIP ─── */}
      <div className="w-full bg-slate-950 py-16 px-6 text-center relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight max-w-2xl mx-auto leading-tight"
        >
          The average sneakerhead buys{' '}
          <span className="text-primary">12 pairs</span> a year.
          <br />Only <span className="text-primary">4</span> are worth it.
        </motion.p>
        <p className="mt-4 text-slate-400 text-sm font-medium">Here&apos;s how to be in the 4.</p>
      </div>

      {/* ─── HOW IT WORKS ─── */}
      <div className="w-full relative z-10">
        <HowItWorksSection />
      </div>

    </main>
  )
}
