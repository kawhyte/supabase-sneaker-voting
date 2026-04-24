'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, PawPrint } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const ROW_1 = [
  { name: 'Nike Air Force 1 Low',       src: '/images/sneaker-grid/sneaker-01.png' },
  { name: 'Air Jordan 1 Retro High OG', src: '/images/sneaker-grid/sneaker-02.png' },
  { name: 'Nike Dunk Low',              src: '/images/sneaker-grid/sneaker-03.png' },
  { name: 'Adidas Samba OG',            src: '/images/sneaker-grid/sneaker-04.png' },
  { name: 'New Balance 550',            src: '/images/sneaker-grid/sneaker-05.png' },
]

const ROW_2 = [
  { name: 'Nike Air Max 1',             src: '/images/sneaker-grid/sneaker-06.png' },
  { name: 'Air Jordan 4 Retro',         src: '/images/sneaker-grid/sneaker-07.png' },
  { name: 'Adidas Gazelle Indoor',      src: '/images/sneaker-grid/sneaker-08.png' },
  { name: 'Nike Air Max 90',            src: '/images/sneaker-grid/sneaker-09.png' },
  { name: 'New Balance 9060',           src: '/images/sneaker-grid/sneaker-10.png' },
]

const ROW_3 = [
  { name: 'Converse Chuck Taylor 70',   src: '/images/sneaker-grid/sneaker-11.png' },
  { name: 'New Balance 574',            src: '/images/sneaker-grid/sneaker-12.png' },
  { name: 'Nike Cortez',                src: '/images/sneaker-grid/sneaker-13.png' },
  { name: 'Adidas Campus 00s',          src: '/images/sneaker-grid/sneaker-14.png' },
  { name: 'Air Jordan 3 Retro',         src: '/images/sneaker-grid/sneaker-15.png' },
]

type RowItem = { name: string; src: string }

function MarqueeRow({
  items,
  reverse = false,
  duration = 25,
}: {
  items: RowItem[]
  reverse?: boolean
  duration?: number
}) {
  const prefersReducedMotion = useReducedMotion()
  // 4× duplication: -25% = exactly one copy width → seamless loop
  const track = [...items, ...items, ...items, ...items]

  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex"
        animate={
          prefersReducedMotion
            ? {}
            : { x: reverse ? ['-25%', '0%'] : ['0%', '-25%'] }
        }
        transition={{ duration, ease: 'linear', repeat: Infinity, repeatType: 'loop' }}
      >
        {track.map((sneaker, idx) => (
          <Tooltip key={`${sneaker.name}-${idx}`}>
            <TooltipTrigger asChild>
              <div className="relative w-[90px] h-[82px] flex-shrink-0 bg-zinc-900 hover:bg-zinc-800 transition-colors duration-150 cursor-pointer">
                <Image
                  src={sneaker.src}
                  alt={sneaker.name}
                  fill
                  className="object-contain p-1"
                  unoptimized
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs font-medium">
              {sneaker.name}
            </TooltipContent>
          </Tooltip>
        ))}
      </motion.div>
    </div>
  )
}

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

      {/* 1. Hero */}
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
      </section>

      {/* 2. Sneaker Marquee Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full bg-zinc-950 relative z-10 overflow-hidden"
      >
        <div className="flex flex-col gap-px py-px">
          <MarqueeRow items={ROW_1} duration={28} />
          <MarqueeRow items={ROW_2} reverse duration={34} />
          <MarqueeRow items={ROW_3} duration={22} />
        </div>
      </motion.section>

      {/* 3. CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10"
      >
        <Button asChild size="lg" className="bg-primary hover:bg-primary text-slate-900 font-bold h-12 px-8">
          <Link href="/login">
            Start Tracking
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-12 px-8">
          <Link href="/value-index">Calculate Value Index</Link>
        </Button>
      </motion.div>

    </main>
  )
}
