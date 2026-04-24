'use client'

import { motion } from 'framer-motion'
import { CalculatorForm } from '@/components/cost-per-wear-calculator/CalculatorForm'
import { HowItWorksSection } from '@/components/cost-per-wear-calculator/HowItWorksSection'

export default function CopScorePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center pb-20 relative overflow-hidden">

      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 20%, #A9563822 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <section className="w-full max-w-3xl mx-auto px-6 pt-14 md:pt-20 pb-12 text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter text-foreground leading-[1.0]"
        >
          Is it worth{' '}
          <span className="text-primary">the cop?</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="mt-6 text-lg text-muted-foreground font-medium"
        >
          Stop guessing. Start knowing.
        </motion.p>
      </section>

      {/* Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.5 }}
        className="w-full px-4 sm:px-6 relative z-10"
      >
        <CalculatorForm />
      </motion.div>

      {/* Stat strip */}
      <div className="w-full bg-muted/50 py-16 px-6 text-center relative z-10 mt-16">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight max-w-2xl mx-auto leading-tight"
        >
          The average sneakerhead buys{' '}
          <span className="text-primary">12 pairs</span> a year.
          <br />Only <span className="text-primary">4</span> are worth it.
        </motion.p>
        <p className="mt-4 text-muted-foreground text-sm font-medium">Here&apos;s how to be in the 4.</p>
      </div>

      {/* How It Works */}
      <div className="w-full relative z-10">
        <HowItWorksSection />
      </div>

    </main>
  )
}
