'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SizingJournalDashboard } from '@/components/sizing-journal-dashboard'
import { FitProfileDashboard } from '@/components/fit-profile-dashboard' // Make sure you have this component
import { FTUEChecklist } from '@/components/ftue-checklist'
import { Package, Heart, Brain } from 'lucide-react'

export default function DashboardPage() {
  const searchParams = useSearchParams()
  // Default to 'owned' if no tab is specified in the URL
  const defaultTab = searchParams.get('tab') || 'owned'

  return (
    <div className="w-full py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FTUEChecklist />
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          {/* --- The New Simplified Tabs --- */}
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="owned" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Owned
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="fit-profile" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Fit Profile
            </TabsTrigger>
          </TabsList>

          {/* --- The Content for the New Tabs --- */}
          <TabsContent value="owned">
            <SizingJournalDashboard status={['owned']} />
          </TabsContent>

          <TabsContent value="wishlist">
            {/* This now shows both wishlisted and journaled items */}
            <SizingJournalDashboard status={['wishlisted', 'journaled']} />
          </TabsContent>

          <TabsContent value="fit-profile">
            {/* Assuming you have a FitProfileDashboard component */}
            {/* <FitProfileDashboard /> */}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}