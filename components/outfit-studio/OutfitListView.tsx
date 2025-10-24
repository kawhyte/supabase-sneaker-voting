'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Outfit, OutfitWithItems } from '@/components/types/outfit'
import { OutfitCanvas } from './OutfitCanvas'
import { Trash2, Edit2, Share2, Check } from 'lucide-react'

interface OutfitListViewProps {
  isOpen: boolean
  onClose: () => void
  outfits: OutfitWithItems[]
  onDelete?: (outfitId: string) => void
  onUpdate?: (outfit: Outfit) => void
}

export function OutfitListView({
  isOpen,
  onClose,
  outfits,
  onDelete,
  onUpdate,
}: OutfitListViewProps) {
  const [selectedOutfitId, setSelectedOutfitId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMarkingWorn, setIsMarkingWorn] = useState(false)
  const [outfitsList, setOutfitsList] = useState(outfits)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const selectedOutfit = outfitsList.find(o => o.id === selectedOutfitId)

  const handleDeleteOutfit = async () => {
    if (!selectedOutfitId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/outfits/${selectedOutfitId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete outfit')
      }

      toast.success('Outfit deleted')
      onDelete?.(selectedOutfitId)
      setSelectedOutfitId(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete outfit'
      toast.error(message)
      console.error('Outfit delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMarkAsWorn = async () => {
    if (!selectedOutfit) return

    setIsMarkingWorn(true)
    try {
      const response = await fetch(`/api/outfits/${selectedOutfit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          times_worn: (selectedOutfit.times_worn || 0) + 1,
          last_worn: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update outfit')
      }

      const data = await response.json()
      // Update the local outfits list
      setOutfitsList(
        outfitsList.map(o => (o.id === selectedOutfit.id ? data.outfit : o))
      )
      toast.success('Outfit marked as worn!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to mark outfit as worn'
      toast.error(message)
      console.error('Mark worn error:', error)
    } finally {
      setIsMarkingWorn(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>My Outfits</DialogTitle>
          <DialogDescription>
            View and manage your created outfits
          </DialogDescription>
        </DialogHeader>

        {outfits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No outfits created yet. Start by adding items to create your first outfit!
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : selectedOutfit ? (
          // Detailed View
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selectedOutfit.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedOutfit.occasion && `${selectedOutfit.occasion.charAt(0).toUpperCase() + selectedOutfit.occasion.slice(1).replace('_', ' ')} · `}
                  {selectedOutfit.outfit_items?.length || 0} items
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAsWorn}
                  disabled={isMarkingWorn}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {isMarkingWorn ? 'Marking...' : 'Mark as Worn'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOutfitId(null)}
                >
                  Back
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>

            {/* Canvas Preview */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <OutfitCanvas
                items={selectedOutfit.outfit_items || []}
                backgroundColor={selectedOutfit.background_color}
                onUpdateItemPosition={() => {}} // Read-only in this view
                onRemoveItem={() => {}}
                onResetAutoArrange={() => {}}
              />
            </div>

            {/* Item Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Items in Outfit</h4>
                <div className="space-y-2">
                  {(selectedOutfit.outfit_items || []).map(outfitItem => (
                    <div
                      key={outfitItem.id}
                      className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm"
                    >
                      <p className="font-medium">
                        {outfitItem.item?.brand} {outfitItem.item?.model}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {outfitItem.item?.category}
                      </p>
                      {outfitItem.item?.color && (
                        <p className="text-xs text-muted-foreground">
                          {outfitItem.item.color}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Outfit Info</h4>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Occasion:</span>
                    <p className="font-medium capitalize">
                      {selectedOutfit.occasion || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <p className="font-medium">
                      {new Date(selectedOutfit.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Times Worn:</span>
                    <p className="font-medium">{selectedOutfit.times_worn || 0}</p>
                  </div>
                  {selectedOutfit.last_worn && (
                    <div>
                      <span className="text-muted-foreground">Last Worn:</span>
                      <p className="font-medium">
                        {new Date(selectedOutfit.last_worn).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
            {outfits.map(outfit => (
              <Card
                key={outfit.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedOutfitId(outfit.id)}
              >
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold line-clamp-2">{outfit.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {outfit.outfit_items?.length || 0} items
                    </p>
                  </div>

                  <div
                    className="h-32 rounded-lg border border-slate-200 flex items-center justify-center text-xs text-muted-foreground"
                    style={{
                      backgroundColor: outfit.background_color,
                    }}
                  >
                    {outfit.outfit_items && outfit.outfit_items.length > 0 ? (
                      <div className="text-center">
                        <p className="font-medium">
                          {outfit.outfit_items.length} item
                          {outfit.outfit_items.length !== 1 ? 's' : ''}
                        </p>
                        {outfit.occasion && (
                          <p className="text-xs">
                            {outfit.occasion.charAt(0).toUpperCase() +
                              outfit.occasion.slice(1).replace('_', ' ')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span>No items</span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>
                      Created:{' '}
                      {new Date(outfit.created_at).toLocaleDateString()}
                    </p>
                    <p>Worn {outfit.times_worn || 0} time{outfit.times_worn !== 1 ? 's' : ''}</p>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={e => {
                        e.stopPropagation()
                        setSelectedOutfitId(outfit.id)
                      }}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={e => {
                        e.stopPropagation()
                        toast.info('Share feature coming soon!')
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Outfit?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedOutfit?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                setShowDeleteConfirm(false)
                await handleDeleteOutfit()
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
