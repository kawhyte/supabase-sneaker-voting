'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, PawPrint } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const SNEAKERS = [
  { name: 'Nike Air Force 1 Low',            src: '/images/sneaker-grid/sneaker-1.webp' },
  { name: 'Air Jordan 1 Retro High OG',      src: '/images/sneaker-grid/sneaker-2.webp' },
  { name: 'Nike Dunk Low',                   src: '/images/sneaker-grid/sneaker-3.webp' },
  { name: 'Adidas Samba OG',                 src: '/images/sneaker-grid/sneaker-4.webp' },
  { name: 'New Balance 550',                 src: '/images/sneaker-grid/sneaker-5.webp' },
  { name: 'Nike Air Max 1',                  src: '/images/sneaker-grid/sneaker-6.webp' },
  { name: 'Air Jordan 4 Retro',              src: '/images/sneaker-grid/sneaker-7.webp' },
  { name: 'Adidas Gazelle Indoor',           src: '/images/sneaker-grid/sneaker-8.webp' },
  { name: 'Nike Air Max 90',                 src: '/images/sneaker-grid/sneaker-9.webp' },
  { name: 'New Balance 9060',                src: '/images/sneaker-grid/sneaker-10.webp' },
  { name: 'Converse Chuck Taylor 70',        src: '/images/sneaker-grid/sneaker-11.webp' },
  { name: 'New Balance 574',                 src: '/images/sneaker-grid/sneaker-12.webp' },
  { name: 'Nike Cortez',                     src: '/images/sneaker-grid/sneaker-13.webp' },
  { name: 'Adidas Campus 00s',               src: '/images/sneaker-grid/sneaker-14.webp' },
  { name: 'Air Jordan 3 Retro',              src: '/images/sneaker-grid/sneaker-15.webp' },
  { name: 'Air Jordan 11 Retro',             src: '/images/sneaker-grid/sneaker-16.webp' },
  { name: 'Travis Scott x AF1',              src: '/images/sneaker-grid/sneaker-17.webp' },
  { name: 'New Balance 2002R',               src: '/images/sneaker-grid/sneaker-18.webp' },

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

      {/* 1. Hero */}
      <section className="w-full max-w-3xl mx-auto px-6 pt-20 md:pt-20 pb-16 text-center relative z-10">
     

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

     
      

      {/* 3. CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-12 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10"
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


 {/* 2. Sneaker Grid */}
      <motion.section
     
        className="w-full  relative z-10"
      >
        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {SNEAKERS.map((sneaker, index) => (
            <Tooltip key={sneaker.name}>
              <TooltipTrigger asChild>
                <div className={`relative h-[72px] sm:h-[82px] lg:h-[140px] bg-background flex items-center justify-center overflow-hidden cursor-pointer hover:bg-muted transition-colors duration-150 ${index >= 8 && index < 15 ? 'hidden md:flex' : ''} ${index >= 15 ? 'hidden lg:flex' : ''}`}>
                  <Image
                    src={sneaker.src}
                    alt={sneaker.name}
                    width={200}
                    height={100}
                    className="object-contain w-5xl  h-full p-1 sm:p-2"
                    unoptimized
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs font-medium">
                {sneaker.name}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </motion.section>

    </main>
  )
}
