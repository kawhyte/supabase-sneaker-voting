'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SmartSneakerForm } from './smart-sneaker-form'
import { ExperienceDashboard } from './experience-dashboard'
import { Zap, BarChart3 } from 'lucide-react'

type ViewMode = 'entry' | 'dashboard'

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
    <div className="min-h-screen p-4">
      {/* Navigation */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold">👟 Sneaker Sizing Tracker</h1>
          <div className="flex gap-2">
            <Button
              variant={currentView === 'entry' ? 'default' : 'outline'}
              onClick={() => setCurrentView('entry')}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Add Sneaker
            </Button>
            <Button
              variant={currentView === 'dashboard' ? 'default' : 'outline'}
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>

        <p className="text-gray-600 text-center">
          {currentView === 'entry'
            ? 'Add sneakers you\'ve seen or tried on to your collection'
            : 'View your sneaker collection and experiences'
          }
        </p>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        {currentView === 'entry' ? (
          <div className="flex justify-center">
            <SmartSneakerForm onSneakerAdded={handleSneakerAdded} />
          </div>
        ) : (
          <ExperienceDashboard onAddNew={handleAddNew} />
        )}
      </div>
    </div>
  )
}