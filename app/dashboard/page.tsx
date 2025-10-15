'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SizingJournalDashboard } from '@/components/sizing-journal-dashboard'
import { FitProfileDashboard } from '@/components/fit-profile-dashboard'
import { FTUEChecklist } from '@/components/ftue-checklist'
import { Package, Heart, Brain, Archive } from 'lucide-react'

function DashboardContent() {
  const searchParams = useSearchParams()
  // Default to 'owned' if no tab is specified in the URL
  const defaultTab = searchParams.get('tab') || 'owned'

  return (
    <div className="w-full min-h-screen">
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
          <TabsList className="grid w-full max-w-7xl mx-auto grid-cols-4 mb-lg">
            <TabsTrigger value="wishlist" className="flex items-center gap-xs">
              <Heart className="h-4 w-4" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="owned" className="flex items-center gap-xs">
              <Package className="h-4 w-4" />
              Owned
            </TabsTrigger>
            <TabsTrigger value="fit-profile" className="flex items-center gap-xs">
              <Brain className="h-4 w-4" />
              Fit Profile
            </TabsTrigger>
            <TabsTrigger value="archive" className="flex items-center gap-xs">
               <Archive className="h-4 w-4" />
              Archived Items
            </TabsTrigger>
          </TabsList>

          {/* --- The Content for the New Tabs --- */}
          <div className="w-full max-w-[1920px] mx-auto min-h-[600px]">
            <TabsContent value="owned" className="min-h-[600px]">
              <SizingJournalDashboard status={['owned']} />
            </TabsContent>

            <TabsContent value="wishlist" className="min-h-[600px]">
              <SizingJournalDashboard status={['wishlisted', 'journaled']} />
            </TabsContent>

            <TabsContent value="archive" className="min-h-[600px]">
              <SizingJournalDashboard
                status={['owned', 'wishlisted', 'journaled']}
                isArchivePage={true}
              />
            </TabsContent>

            <TabsContent value="fit-profile" className="min-h-[600px]">
              <FitProfileDashboard />
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="w-full py-xl flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
