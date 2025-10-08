'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SizingJournalDashboard } from '@/components/sizing-journal-dashboard'
import { FTUEChecklist } from '@/components/ftue-checklist'
import { Package, Eye, Heart } from 'lucide-react'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('owned')

  return (
    <div className="w-full py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* FTUE Checklist - shown to new users */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FTUEChecklist />
        </div>

        <Tabs defaultValue="owned" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="owned" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Owned
            </TabsTrigger>
            <TabsTrigger value="tried" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Tried
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Wishlist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="owned">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SizingJournalDashboard
                status="owned"
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="tried">
            <motion.div
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SizingJournalDashboard
                status="journaled"
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="wishlist">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SizingJournalDashboard
                status="wishlisted"
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}