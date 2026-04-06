'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Flame, Clock, TrendingUp, Zap } from 'lucide-react'
import {
  calculateForSneakers,
  getWearsFromFrequency,
  type WearFrequency,
  type Verdict,
} from '@/lib/worth-it-calculator/calculator-logic'

const FREQUENCIES: { value: WearFrequency; label: string; icon: React.ReactNode }[] = [
  { value: 'rarely',  label: 'Rarely',  icon: <Clock className="w-3.5 h-3.5" /> },
  { value: 'monthly', label: 'Monthly', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { value: 'weekly',  label: 'Weekly',  icon: <Zap className="w-3.5 h-3.5" /> },
  { value: 'daily',   label: 'Daily',   icon: <Flame className="w-3.5 h-3.5" /> },
]

const VERDICT_STYLES: Record<Verdict, { bar: string; badge: string; card: string; text: string }> = {
  BUY_NOW:      { bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', card: 'border-emerald-200 bg-emerald-50/50', text: 'text-emerald-700' },
  WAIT_FOR_SALE:{ bar: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-700',   card: 'border-amber-200 bg-amber-50/50',   text: 'text-amber-700'   },
  PASS:         { bar: 'bg-red-500',     badge: 'bg-red-100 text-red-700',       card: 'border-red-200 bg-red-50/50',       text: 'text-red-700'     },
}

const VERDICT_LABELS: Record<Verdict, string> = {
  BUY_NOW: 'Buy Now',
  WAIT_FOR_SALE: 'Wait for Sale',
  PASS: 'Hard Pass',
}

export function PublicCPWCalculator() {
  const [rawPrice, setRawPrice] = useState('')
  const [frequency, setFrequency] = useState<WearFrequency>('weekly')

  const price = parseFloat(rawPrice)
  const hasPrice = !isNaN(price) && price >= 1

  const result = useMemo(() => {
    if (!hasPrice) return null
    return calculateForSneakers(price, frequency)
  }, [price, frequency, hasPrice])

  const rec = result?.recommendation
  const metrics = result?.metrics
  const styles = rec ? VERDICT_STYLES[rec.verdict] : null

  return (
    <div className="w-full space-y-6">
      {/* Price Input */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
          Retail Price
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg select-none">
            $
          </span>
          <input
            type="number"
            inputMode="decimal"
            value={rawPrice}
            onChange={(e) => setRawPrice(e.target.value)}
            placeholder="170"
            min="1"
            max="10000"
            className="w-full pl-9 pr-4 py-4 text-2xl font-bold rounded-2xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 transition-colors"
          />
        </div>
      </div>

      {/* Frequency Pills */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
          How often will you wear them?
        </label>
        <div className="grid grid-cols-4 gap-2">
          {FREQUENCIES.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFrequency(value)}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all duration-150 ${
                frequency === value
                  ? 'border-slate-900 bg-slate-900 text-white shadow-md scale-[1.03]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Verdict Card */}
      <AnimatePresence mode="wait">
        {hasPrice && rec && metrics && styles ? (
          <motion.div
            key={`${price}-${frequency}`}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className={`rounded-2xl border-2 p-5 space-y-4 ${styles.card}`}
          >
            {/* Verdict Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <span className={`text-xs font-bold uppercase tracking-wider ${styles.text}`}>
                  {VERDICT_LABELS[rec.verdict]}
                </span>
                <p className="text-lg font-extrabold text-slate-900 leading-tight">
                  {rec.headline}
                </p>
              </div>
              <span className={`text-3xl select-none`}>{rec.emoji}</span>
            </div>

            {/* Score Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Value Score</span>
                <span className="font-bold text-slate-700">{rec.score}/100</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rec.score}%` }}
                  transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
                  className={`h-full rounded-full ${styles.bar}`}
                />
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/70 rounded-xl py-2.5 px-1">
                <p className="text-sm font-extrabold text-slate-900">
                  ${metrics.realCPW.toFixed(2)}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mt-0.5">
                  Per Wear
                </p>
              </div>
              <div className="bg-white/70 rounded-xl py-2.5 px-1">
                <p className="text-sm font-extrabold text-slate-900">
                  {metrics.breakEvenWears}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mt-0.5">
                  Break-Even
                </p>
              </div>
              <div className="bg-white/70 rounded-xl py-2.5 px-1">
                <p className="text-sm font-extrabold text-slate-900">
                  {getWearsFromFrequency(frequency) * metrics.estimatedLifespanYears | 0}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mt-0.5">
                  Lifetime Wears
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed">
              {rec.description}
            </p>

            {rec.actionPrompt && (
              <p className={`text-xs font-semibold ${styles.text}`}>
                {rec.actionPrompt}
              </p>
            )}

            {/* CTA */}
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-colors"
            >
              Save to Wishlist
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center"
          >
            <p className="text-sm font-medium text-slate-400">
              Enter a price to see your verdict
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
