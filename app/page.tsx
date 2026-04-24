'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Footprints, BarChart2, Bell, ArrowRight, PawPrint } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const features = [
  {
    icon: Footprints,
    title: 'Collection Tracker',
    description: 'Catalog every pair. Track wears, cost-per-wear, and when you last wore them.',
  },
  {
    icon: BarChart2,
    title: 'Cop Score',
    description: 'A weighted score that combines CPW, live eBay market data, and your rotation diversity.',
  },
  {
    icon: Bell,
    title: 'Price Alerts',
    description: 'Add to wishlist and get notified the moment the market price hits your target.',
  },
]

export default function HomePage() {
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

      {/* Hero */}
      <section className="w-full max-w-3xl mx-auto px-6 pt-20 md:pt-32 pb-16 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="inline-flex items-center gap-2 text-primary mb-6"
        >
          <PawPrint className="h-7 w-7" />
          <span className="text-2xl font-extrabold tracking-tight">PurrView</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-foreground leading-[1.05]"
        >
          Your sneaker collection,{' '}
          <span className="text-primary">valued intelligently.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-lg text-muted-foreground font-medium max-w-xl mx-auto"
        >
          Track every pair, calculate real value, and know exactly when to cop — all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button asChild size="lg" className="bg-primary hover:bg-primary text-slate-900 font-bold h-12 px-8">
            <Link href="/dashboard">
              View My Collection
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8">
            <Link href="/cop-score">Try the Cop Score</Link>
          </Button>
        </motion.div>
      </section>

      {/* Cop Score CTA card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl mx-auto px-6 relative z-10"
      >
        <Card className="border border-border bg-card rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">Is it worth the cop?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Get a data-driven score that weighs cost-per-wear, live market data, and your collection diversity.
              </p>
            </div>
            <Button asChild className="flex-shrink-0 bg-primary hover:bg-primary text-slate-900 font-bold">
              <Link href="/cop-score">
                Open Calculator
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Feature cards */}
      <section className="w-full max-w-3xl mx-auto px-6 pt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Card className="border border-border bg-card rounded-2xl p-6 h-full">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl mx-auto px-6 pt-16 text-center relative z-10"
      >
        <p className="text-sm text-muted-foreground">Ready to see what your collection is really worth?</p>
        <Button asChild variant="link" className="mt-2 text-primary font-semibold">
          <Link href="/dashboard">
            Start tracking your collection
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>

    </main>
  )
}
