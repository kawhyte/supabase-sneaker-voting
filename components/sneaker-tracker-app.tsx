'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { SmartSneakerForm } from './smart-sneaker-form'
import { SizingJournalDashboard } from './sizing-journal-dashboard'
import { InsightsDashboard } from './insights-dashboard'
import { Zap, BarChart3, Brain } from 'lucide-react'

type ViewMode = 'entry' | 'dashboard' | 'insights'

export function SneakerTrackerApp() {
  const [currentView, setCurrentView] = useState<ViewMode>('entry')

  const handleSneakerAdded = () => {
    // Switch to dashboard after adding a sneaker
    setCurrentView('dashboard')
  }

  const handleAddNew = () => {
    setCurrentView('entry')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900"
    >
      {/* Navigation */}
      <div className="max-w-6xl mx-auto mb-6">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
          className="flex items-center justify-between mb-4"
        >
          <motion.h1
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-orange-500 bg-clip-text text-transparent cursor-pointer"
          >
            👟 Sneaker Sizing Tracker44
          </motion.h1>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex gap-2"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={currentView === 'entry' ? 'default' : 'outline'}
                onClick={() => setCurrentView('entry')}
                className="flex items-center gap-2 relative overflow-hidden group"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.3 }}
                >
                  <Zap className="h-4 w-4" />
                </motion.div>
                Add Item
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-teal-400/20 opacity-0 group-hover:opacity-100"
                  initial={{ x: -100 }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={currentView === 'dashboard' ? 'default' : 'outline'}
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-2 relative overflow-hidden group"
              >
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <BarChart3 className="h-4 w-4" />
                </motion.div>
                Dashboard
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100"
                  initial={{ x: -100 }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={currentView === 'insights' ? 'default' : 'outline'}
                onClick={() => setCurrentView('insights')}
                className="flex items-center gap-2 relative overflow-hidden group"
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Brain className="h-4 w-4" />
                </motion.div>
                Insights
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100"
                  initial={{ x: -100 }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-gray-600 dark:text-gray-300 text-center text-lg"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentView === 'entry'
                ? 'Add sneakers you\'ve seen or tried on to your collection'
                : currentView === 'dashboard'
                  ? 'View your sneaker collection and experiences'
                  : 'AI-powered size recommendations and fit analysis'
              }
            </motion.span>
          </AnimatePresence>
        </motion.p>
      </div>

      {/* Content */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: currentView === 'entry' ? -100 : currentView === 'dashboard' ? 0 : 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: currentView === 'entry' ? 100 : currentView === 'dashboard' ? 0 : -100 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          >
            {currentView === 'entry' ? (
              <div className="flex justify-center">
                <SmartSneakerForm onSneakerAdded={handleSneakerAdded} />
              </div>
            ) : currentView === 'dashboard' ? (
              <SizingJournalDashboard onAddNew={handleAddNew} />
            ) : (
              <InsightsDashboard onGoBack={() => setCurrentView('dashboard')} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}