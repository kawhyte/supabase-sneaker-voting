'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SizingJournalDashboard } from '@/components/sizing-journal-dashboard'
import { InsightsDashboard } from '@/components/insights-dashboard'
import { BarChart3, Brain, ShoppingBag } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { CATEGORY_CONFIGS, type ItemCategory } from '@/components/types/item-category'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('collection')
  const [selectedCategories, setSelectedCategories] = useState<ItemCategory[]>(
    Object.keys(CATEGORY_CONFIGS) as ItemCategory[]
  )

  const toggleCategory = (category: ItemCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const toggleAll = () => {
    const allCategories = Object.keys(CATEGORY_CONFIGS) as ItemCategory[]
    setSelectedCategories(
      selectedCategories.length === allCategories.length ? [] : allCategories
    )
  }

  return (
    <div className="w-full py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Category Filter */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Filter by Category</h3>
              <button
                onClick={toggleAll}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {selectedCategories.length === Object.keys(CATEGORY_CONFIGS).length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="flex flex-wrap gap-4">
              {Object.values(CATEGORY_CONFIGS).map((config) => {
                const IconComponent = config.icon
                const isSelected = selectedCategories.includes(config.id)
                return (
                  <div key={config.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${config.id}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleCategory(config.id)}
                    />
                    <Label
                      htmlFor={`category-${config.id}`}
                      className="text-sm font-normal cursor-pointer flex items-center gap-2"
                    >
                      <IconComponent className="h-4 w-4" style={{ color: config.color }} />
                      {config.label}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <Tabs defaultValue="collection" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="collection" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
            Watchlist
            </TabsTrigger>
            <TabsTrigger value="purchased" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Purchased
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
              <SizingJournalDashboard viewMode="watchlist" selectedCategories={selectedCategories} />
            </motion.div>
          </TabsContent>

          <TabsContent value="purchased">
            <motion.div
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SizingJournalDashboard viewMode="purchased" selectedCategories={selectedCategories} />
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