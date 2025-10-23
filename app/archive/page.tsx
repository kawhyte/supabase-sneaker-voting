'use client'

import { motion } from 'framer-motion'
import { SizingJournalDashboard } from '@/components/wardrobe-dashboard'
import { Archive } from 'lucide-react'

export default function ArchivePage() {
  return (
    <div className="w-full py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-[1920px] mx-auto px-[var(--space-xl)] mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Archive className="h-8 w-8" style={{ color: 'var(--color-slate-600)' }} />
            <h1 className="text-3xl font-bold font-heading" style={{ color: 'var(--color-black)' }}>
              Archived Items
            </h1>
          </div>
          <p className="text-slate-600">
            Items you've sold, donated, or removed from your active collection
          </p>
        </div>

        <SizingJournalDashboard
          status={['owned', 'wishlisted', 'journaled']}
          isArchivePage={true}
        />
      </motion.div>
    </div>
  )
}
