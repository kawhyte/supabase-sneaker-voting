'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorBoundary } from '@/components/error-boundary'
import { OutfitStudioErrorBoundary } from '@/components/outfit-studio-error-boundary'
import { Outfit, OutfitWithItems } from '@/components/types/outfit'
import { OutfitListView } from './OutfitListView'
import { OutfitStudio } from './OutfitStudio'
import { SizingJournalEntry } from '@/components/types/sizing-journal-entry'
import { OutfitsEmptyState } from '@/components/empty-state-illustrations'
import { CatLoadingSpinner } from '@/components/cat-loading-animation'
import { Sparkles, Plus, Calendar, Shuffle } from 'lucide-react'

// Lazy load heavy outfit components (only loaded when tabs are active)
const OutfitCalendar = lazy(() => import('./OutfitCalendar').then(mod => ({ default: mod.OutfitCalendar })))
const OutfitShuffle = lazy(() => import('./OutfitShuffle').then(mod => ({ default: mod.OutfitShuffle })))

/**
 * OutfitsDashboard - Main outfits tab in the dashboard
 * Displays all user-created outfits with options to:
 * - View outfit details
 * - Create new outfit
 * - Delete outfits
 */
type DashboardTab = 'gallery' | 'calendar' | 'shuffle'

export function OutfitsDashboard() {
  const [outfits, setOutfits] = useState<OutfitWithItems[]>([])
  const [userWardrobe, setUserWardrobe] = useState<SizingJournalEntry[]>([])
  const [isListViewOpen, setIsListViewOpen] = useState(false)
  const [isStudioOpen, setIsStudioOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<DashboardTab>('gallery')

  // Fetch outfits and wardrobe on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch outfits
        const outfitsResponse = await fetch('/api/outfits')
        if (!outfitsResponse.ok) {
          throw new Error('Failed to fetch outfits')
        }
        const outfitsData = await outfitsResponse.json()
        setOutfits(outfitsData.outfits || [])

        // Fetch wardrobe (owned items only for outfit creation)
        // Using direct Supabase client instead of non-existent API endpoint
        try {
          const { createClient } = await import('@/utils/supabase/client')
          const supabase = createClient()
          const { data: items, error } = await supabase
            .from('items')
            .select('*, item_photos(*)')
            .eq('status', 'owned')
            .eq('is_archived', false)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Error fetching wardrobe:', error)
            toast.error('Failed to load wardrobe items')
          } else {
            console.log('Fetched wardrobe items:', items?.length || 0, items)
            setUserWardrobe(items || [])
          }
        } catch (error) {
          console.error('Failed to import Supabase client:', error)
          toast.error('Failed to load wardrobe items')
        }
      } catch (error) {
        console.error('Failed to load data:', error)
        toast.error('Failed to load outfits')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleOutfitCreated = (outfit: Outfit | OutfitWithItems) => {
    // Ensure outfit has outfit_items array for display
    const outfitWithItems: OutfitWithItems = {
      ...outfit,
      outfit_items: (outfit as any).outfit_items || [],
    }
    setOutfits([outfitWithItems, ...outfits])
    setIsStudioOpen(false)
    toast.success('Outfit created!')
  }

  const handleOutfitDeleted = (outfitId: string) => {
    setOutfits(outfits.filter(o => o.id !== outfitId))
  }

  const handleSaveOutfitFromShuffle = async (
    items: SizingJournalEntry[],
    occasion: string
  ) => {
    try {
      // Import outfit layout engine for auto-arrange
      const { autoArrangeOutfit } = await import('@/lib/outfit-layout-engine')
      const arrangedItems = autoArrangeOutfit(items)

      const response = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${occasion} outfit`,
          occasion,
          background_color: '#FFFFFF',
          outfit_items: items.map((item, index) => {
            const arranged = arrangedItems[index]
            return {
              item_id: item.id,
              position_x: arranged?.position_x || 0.5,
              position_y: arranged?.position_y || 0.5,
              z_index: arranged?.z_index || 0,
              display_width: arranged?.display_width || 0.3,
              display_height: arranged?.display_height || 0.3,
            }
          }),
        }),
      })

      if (!response.ok) throw new Error('Failed to save outfit')
      const data = await response.json()

      // Fetch the full outfit with related item data
      const getResponse = await fetch(`/api/outfits/${data.outfit.id}`)
      if (!getResponse.ok) throw new Error('Failed to fetch saved outfit')
      const fullData = await getResponse.json()
      const newOutfit = fullData.outfit as OutfitWithItems

      setOutfits([newOutfit, ...outfits])
      toast.success('Outfit saved!')
      return newOutfit
    } catch (error) {
      console.error('Error saving outfit:', error)
      toast.error('Failed to save outfit')
      return null
    }
  }

  const handleOutfitWorn = async (outfitId: string) => {
    try {
      const response = await fetch(`/api/outfits/${outfitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          times_worn: (outfits.find(o => o.id === outfitId)?.times_worn || 0) + 1,
          last_worn: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error('Failed to mark outfit as worn')
      const data = await response.json()
      setOutfits(outfits.map(o => o.id === outfitId ? data.outfit : o))
      toast.success('Outfit marked as worn!')
    } catch (error) {
      console.error('Error marking outfit as worn:', error)
      toast.error('Failed to mark outfit as worn')
    }
  }

  const handleUnscheduleOutfit = async (outfitId: string) => {
    try {
      const response = await fetch(`/api/outfits/${outfitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date_worn: null }),
      })

      if (!response.ok) throw new Error('Failed to unschedule outfit')
      const data = await response.json()
      setOutfits(outfits.map(o => o.id === outfitId ? data.outfit : o))
      toast.success('Outfit unscheduled')
    } catch (error) {
      console.error('Error unscheduling outfit:', error)
      toast.error('Failed to unschedule outfit')
    }
  }

  return (
    <>
      {/* Main Content */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 sm:h-6 w-5 sm:w-6 text-sun-400" />
              My Outfits
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {outfits.length} outfit{outfits.length !== 1 ? 's' : ''} created
            </p>
          </div>
          {activeTab === 'gallery' && (
            <Button
              onClick={() => setIsStudioOpen(true)}
              className="bg-sun-400 text-slate-900 hover:bg-sun-500 shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
          )}
        </div>

        {/* Tab Navigation - Responsive */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex gap-1 sm:gap-2 border-b border-stone-200 min-w-min sm:min-w-0">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-3 sm:px-4 py-3 font-medium text-xs sm:text-sm transition-colors border-b-2 whitespace-nowrap ${ activeTab === 'gallery'
                ? 'text-sun-600 border-b-sun-400'
                : 'text-muted-foreground border-b-transparent hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Sparkles className="h-3.5 sm:h-4 w-3.5 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Gallery</span>
                <span className="sm:hidden">Gallery</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 sm:px-4 py-3 font-medium text-xs sm:text-sm transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'calendar'
                  ? 'text-sun-600 border-b-sun-400'
                  : 'text-muted-foreground border-b-transparent hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="h-3.5 sm:h-4 w-3.5 sm:w-4 flex-shrink-0" />
                <span>Calendar</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('shuffle')}
              className={`px-3 sm:px-4 py-3 font-medium text-xs sm:text-sm transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'shuffle'
                  ? 'text-sun-600 border-b-sun-400'
                  : 'text-muted-foreground border-b-transparent hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Shuffle className="h-3.5 sm:h-4 w-3.5 sm:w-4 flex-shrink-0" />
                <span>Shuffle</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        <ErrorBoundary level="section">
          {activeTab === 'gallery' && (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <CatLoadingSpinner size="md" />
                </div>
              ) : outfits.length === 0 ? (
                <div className="flex justify-center py-12">
                  <OutfitsEmptyState onCreateOutfit={() => setIsStudioOpen(true)} />
                </div>
              ) : (
                // Outfit Grid - Responsive
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {outfits.map(outfit => (
                  <Card
                    key={outfit.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => setIsListViewOpen(true)}
                  >
                    <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-sun-400 transition-colors">
                            {outfit.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {outfit.outfit_items?.length || 0} item
                            {outfit.outfit_items?.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Outfit Preview */}
                      <div
                        className="h-32 sm:h-40 rounded-lg border border-slate-200 flex items-center justify-center text-xs sm:text-sm text-muted-foreground overflow-hidden"
                        style={{
                          backgroundColor: outfit.background_color,
                        }}
                      >
                        {outfit.outfit_items && outfit.outfit_items.length > 0 ? (
                          <div className="grid grid-cols-2 gap-1 sm:gap-2 p-2 w-full h-full">
                            {outfit.outfit_items.slice(0, 4).map((item) => (
                              <div
                                key={item.id}
                                className="bg-slate-100 rounded flex items-center justify-center text-xs font-medium p-1 text-center line-clamp-2"
                              >
                                {item.item?.brand}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span>No items</span>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="space-y-1 text-xs text-muted-foreground border-t border-slate-200 pt-2 sm:pt-3">
                        <div className="flex justify-between">
                          <span>Occasion:</span>
                          <span className="font-medium capitalize truncate">
                            {outfit.occasion || 'General'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Times Worn:</span>
                          <span className="font-medium">{outfit.times_worn || 0}</span>
                        </div>
                        {outfit.last_worn && (
                          <div className="flex justify-between gap-2">
                            <span>Last Worn:</span>
                            <span className="font-medium text-right">
                              {new Date(outfit.last_worn).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 text-xs sm:text-sm h-8 sm:h-9"
                        onClick={e => {
                          e.stopPropagation()
                          setIsListViewOpen(true)
                        }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <ErrorBoundary level="section">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <CatLoadingSpinner size="md" />
                </div>
              }>
                <OutfitCalendar
                  outfits={outfits}
                  onOutfitWorn={handleOutfitWorn}
                  onUnscheduleOutfit={handleUnscheduleOutfit}
                />
              </Suspense>
            </ErrorBoundary>
          )}

          {/* Shuffle Tab */}
          {activeTab === 'shuffle' && (
            <ErrorBoundary level="section">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <CatLoadingSpinner size="md" />
                </div>
              }>
                <OutfitShuffle
                  wardrobe={userWardrobe}
                  onSaveOutfit={handleSaveOutfitFromShuffle}
                />
              </Suspense>
            </ErrorBoundary>
          )}
        </ErrorBoundary>
      </div>

      {/* Outfit List View Modal */}
      <ErrorBoundary level="component">
        <OutfitListView
          isOpen={isListViewOpen}
          onClose={() => setIsListViewOpen(false)}
          outfits={outfits}
          onDelete={handleOutfitDeleted}
        />
      </ErrorBoundary>

      {/* Outfit Studio Modal */}
      <OutfitStudioErrorBoundary onClose={() => setIsStudioOpen(false)}>
        <OutfitStudio
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          userWardrobe={userWardrobe}
          outfitsCreated={outfits.length}
          onOutfitCreated={handleOutfitCreated}
        />
      </OutfitStudioErrorBoundary>
    </>
  )
}
