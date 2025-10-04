'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SizingJournalDashboard } from '@/components/sizing-journal-dashboard'
import { InsightsDashboard } from '@/components/insights-dashboard'
import { BarChart3, Brain } from 'lucide-react'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('collection')

  return (
    <div className="w-full py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Tabs defaultValue="collection" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="collection" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
            Watchlist
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 ">
              <Brain className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collection">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SizingJournalDashboard />
            </motion.div>
          </TabsContent>

          <TabsContent value="insights">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <InsightsDashboard onGoBack={() => setActiveTab('collection')} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}