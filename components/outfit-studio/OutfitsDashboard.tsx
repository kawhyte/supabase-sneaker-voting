'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Outfit, OutfitWithItems } from '@/components/types/outfit'
import { OutfitListView } from './OutfitListView'
import { OutfitStudio } from './OutfitStudio'
import { SizingJournalEntry } from '@/components/types/sizing-journal-entry'
import { Sparkles, Plus } from 'lucide-react'

/**
 * OutfitsDashboard - Main outfits tab in the dashboard
 * Displays all user-created outfits with options to:
 * - View outfit details
 * - Create new outfit
 * - Delete outfits
 */
export function OutfitsDashboard() {
  const [outfits, setOutfits] = useState<OutfitWithItems[]>([])
  const [userWardrobe, setUserWardrobe] = useState<SizingJournalEntry[]>([])
  const [isListViewOpen, setIsListViewOpen] = useState(false)
  const [isStudioOpen, setIsStudioOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
        const wardrobeResponse = await fetch('/api/sizing-journal?status=owned')
        if (wardrobeResponse.ok) {
          const wardrobeData = await wardrobeResponse.json()
          setUserWardrobe(wardrobeData.items || [])
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

  return (
    <>
      {/* Main Content */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-sun-400" />
              My Outfits
            </h2>
            <p className="text-muted-foreground mt-1">
              {outfits.length} outfit{outfits.length !== 1 ? 's' : ''} created
            </p>
          </div>
          <Button
            onClick={() => setIsStudioOpen(true)}
            className="bg-sun-400 text-slate-900 hover:bg-sun-500 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Outfit
          </Button>
        </div>

        {/* Empty State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sun-400"></div>
          </div>
        ) : outfits.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-300">
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No outfits yet</h3>
              <p className="text-muted-foreground mb-6">
                Start creating outfits to visualize your style combinations
              </p>
              <Button
                onClick={() => setIsStudioOpen(true)}
                className="bg-sun-400 text-slate-900 hover:bg-sun-500"
              >
                Create Your First Outfit
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Outfit Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {outfits.map(outfit => (
              <Card
                key={outfit.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setIsListViewOpen(true)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold line-clamp-2 group-hover:text-sun-400 transition-colors">
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
                    className="h-40 rounded-lg border border-slate-200 flex items-center justify-center text-sm text-muted-foreground overflow-hidden"
                    style={{
                      backgroundColor: outfit.background_color,
                    }}
                  >
                    {outfit.outfit_items && outfit.outfit_items.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 p-2 w-full h-full">
                        {outfit.outfit_items.slice(0, 4).map((item, idx) => (
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
                  <div className="space-y-1 text-xs text-muted-foreground border-t border-slate-200 pt-3">
                    <div className="flex justify-between">
                      <span>Occasion:</span>
                      <span className="font-medium capitalize">
                        {outfit.occasion || 'General'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Times Worn:</span>
                      <span className="font-medium">{outfit.times_worn || 0}</span>
                    </div>
                    {outfit.last_worn && (
                      <div className="flex justify-between">
                        <span>Last Worn:</span>
                        <span className="font-medium">
                          {new Date(outfit.last_worn).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
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
      </div>

      {/* Outfit List View Modal */}
      <OutfitListView
        isOpen={isListViewOpen}
        onClose={() => setIsListViewOpen(false)}
        outfits={outfits}
        onDelete={handleOutfitDeleted}
      />

      {/* Outfit Studio Modal */}
      <OutfitStudio
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        userWardrobe={userWardrobe}
        outfitsCreated={outfits.length}
        onOutfitCreated={handleOutfitCreated}
      />
    </>
  )
}
