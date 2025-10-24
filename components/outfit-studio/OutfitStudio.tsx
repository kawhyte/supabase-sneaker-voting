'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SizingJournalEntry } from '@/components/types/sizing-journal-entry'
import { Outfit, OutfitWithItems, OutfitItem, OutfitOccasion, CropArea } from '@/components/types/outfit'
import { OutfitCanvas } from './OutfitCanvas'
import { ManualCropTool } from './ManualCropTool'
import { CanYouStyleThisQuiz } from './CanYouStyleThisQuiz'
import {
  calculateAutoPosition,
  calculateSuggestedSize,
  autoArrangeOutfit,
} from '@/lib/outfit-layout-engine'
import { Plus, X } from 'lucide-react'

const OUTFIT_OCCASIONS: OutfitOccasion[] = [
  'casual',
  'work',
  'date',
  'gym',
  'formal',
  'travel',
  'weekend',
  'night_out',
  'other',
]

interface OutfitStudioProps {
  isOpen: boolean
  onClose: () => void
  userWardrobe: SizingJournalEntry[]
  outfitsCreated?: number
  onOutfitCreated?: (outfit: Outfit | OutfitWithItems) => void
  // When adding wishlist item
  newWishlistItem?: SizingJournalEntry | null
}

/**
 * OutfitStudio - Main modal for creating and editing outfits
 * Features:
 * - Add items to canvas (with smart auto-arrange)
 * - Manual crop tool for each item
 * - Name, occasion, and background color customization
 * - Save outfit to database
 * - "Can I style this?" quiz for wishlist items
 */
export function OutfitStudio({
  isOpen,
  onClose,
  userWardrobe,
  outfitsCreated = 0,
  onOutfitCreated,
  newWishlistItem,
}: OutfitStudioProps) {
  // Form State
  const [outfitName, setOutfitName] = useState('Untitled Outfit')
  const [occasion, setOccasion] = useState<OutfitOccasion>('casual')
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')

  // Outfit Items
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([])

  // UI State
  const [selectedItemToAdd, setSelectedItemToAdd] = useState<SizingJournalEntry | null>(newWishlistItem || null)
  const [croppingItemId, setCroppingItemId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)

  // Calculate items by category in current outfit
  const itemsByCategory = outfitItems.reduce(
    (acc, item) => {
      const category = item.item?.category || 'other'
      if (!acc[category]) acc[category] = 0
      acc[category]++
      return acc
    },
    {} as Record<string, number>
  )

  // Handle adding item from wardrobe
  const handleAddItem = (item: SizingJournalEntry) => {
    const itemCountInCategory = itemsByCategory[item.category || 'other'] || 0
    const position = calculateAutoPosition(item, itemCountInCategory)
    const size = calculateSuggestedSize(item)

    const newOutfitItem: OutfitItem = {
      id: `temp-${Date.now()}`, // Temporary ID, will be replaced on save
      outfit_id: '', // Will be set on save
      item_id: item.id,
      position_x: position.x / 375, // Normalize to 0-1
      position_y: position.y / 667,
      z_index: position.layer,
      display_width: size.width,
      display_height: size.height,
      item_order: outfitItems.length,
      crop_x: null,
      crop_y: null,
      crop_width: null,
      crop_height: null,
      cropped_image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      item: item,
    }

    setOutfitItems([...outfitItems, newOutfitItem])
    setSelectedItemToAdd(null)
    toast.success(`Added ${item.brand} ${item.model}`)
  }

  // Handle removing item from outfit
  const handleRemoveItem = (itemId: string) => {
    setOutfitItems(outfitItems.filter(item => item.id !== itemId))
    toast.success('Item removed')
  }

  // Handle item position update (dragging)
  const handleUpdateItemPosition = (itemId: string, positionX: number, positionY: number) => {
    setOutfitItems(
      outfitItems.map(item =>
        item.id === itemId
          ? { ...item, position_x: positionX, position_y: positionY }
          : item
      )
    )
  }

  // Handle resetting to auto-arrange
  const handleResetAutoArrange = () => {
    if (outfitItems.length === 0) return

    const items = outfitItems.map(oi => oi.item).filter(Boolean) as SizingJournalEntry[]
    const arranged = autoArrangeOutfit(items)

    setOutfitItems(
      outfitItems.map(item => {
        const arranged = autoArrangeOutfit([item.item!])[0]
        return {
          ...item,
          position_x: arranged.position_x,
          position_y: arranged.position_y,
          z_index: arranged.z_index,
          display_width: arranged.display_width,
          display_height: arranged.display_height,
        }
      })
    )

    toast.success('Reset to auto-arrange')
  }

  // Handle crop completion
  const handleCropComplete = (cropArea: CropArea) => {
    setOutfitItems(
      outfitItems.map(item =>
        item.id === croppingItemId
          ? {
              ...item,
              crop_x: cropArea.x,
              crop_y: cropArea.y,
              crop_width: cropArea.width,
              crop_height: cropArea.height,
            }
          : item
      )
    )
    setCroppingItemId(null)
    toast.success('Crop applied')
  }

  // Handle save outfit
  const handleSaveOutfit = async () => {
    if (outfitItems.length === 0) {
      toast.error('Add at least one item to create an outfit')
      return
    }

    if (!outfitName.trim()) {
      toast.error('Please enter an outfit name')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: outfitName.trim(),
          description: '',
          occasion,
          background_color: backgroundColor,
          outfit_items: outfitItems.map(item => ({
            item_id: item.item_id,
            position_x: item.position_x,
            position_y: item.position_y,
            z_index: item.z_index,
            display_width: item.display_width,
            display_height: item.display_height,
            crop_x: item.crop_x,
            crop_y: item.crop_y,
            crop_width: item.crop_width,
            crop_height: item.crop_height,
            cropped_image_url: item.cropped_image_url,
          })),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save outfit')
      }

      const data = await response.json()
      toast.success('Outfit created successfully!')

      // Call callback if provided
      if (onOutfitCreated && data.outfit) {
        onOutfitCreated(data.outfit)
      }

      // Reset form
      setOutfitName('Untitled Outfit')
      setOccasion('casual')
      setBackgroundColor('#FFFFFF')
      setOutfitItems([])

      onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save outfit'
      toast.error(message)
      console.error('Outfit save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Show quiz if adding wishlist item and not enough outfits yet
  const showQuizModal = showQuiz && newWishlistItem && outfitsCreated < 3

  return (
    <>
      {/* Main Outfit Studio Modal */}
      <Dialog open={isOpen && !showQuizModal} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Outfit</DialogTitle>
            <DialogDescription>
              Add items from your wardrobe and arrange them on the canvas
            </DialogDescription>
          </DialogHeader>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Canvas */}
            <div className="md:col-span-2">
              {croppingItemId ? (
                // Crop Tool
                <ManualCropTool
                  imageUrl={
                    outfitItems.find(i => i.id === croppingItemId)?.item?.image_url ||
                    outfitItems.find(i => i.id === croppingItemId)?.item?.item_photos?.[0]?.image_url ||
                    ''
                  }
                  itemName={`${outfitItems.find(i => i.id === croppingItemId)?.item?.brand || ''} ${outfitItems.find(i => i.id === croppingItemId)?.item?.model || ''}`}
                  onCropComplete={handleCropComplete}
                  onCancel={() => setCroppingItemId(null)}
                />
              ) : (
                // Outfit Canvas
                <OutfitCanvas
                  items={outfitItems}
                  backgroundColor={backgroundColor}
                  onUpdateItemPosition={handleUpdateItemPosition}
                  onRemoveItem={handleRemoveItem}
                  onResetAutoArrange={handleResetAutoArrange}
                />
              )}
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-4">
              {/* Outfit Details */}
              <div className="space-y-3 bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div>
                  <Label htmlFor="outfit-name" className="text-sm">
                    Outfit Name
                  </Label>
                  <Input
                    id="outfit-name"
                    value={outfitName}
                    onChange={e => setOutfitName(e.target.value)}
                    placeholder="e.g., Cozy Coffee Date"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="occasion" className="text-sm">
                    Occasion
                  </Label>
                  <Select value={occasion} onValueChange={(val) => setOccasion(val as OutfitOccasion)}>
                    <SelectTrigger id="occasion" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OUTFIT_OCCASIONS.map(occ => (
                        <SelectItem key={occ} value={occ}>
                          {occ.charAt(0).toUpperCase() + occ.slice(1).replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bg-color" className="text-sm">
                    Background Color
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <input
                      id="bg-color"
                      type="color"
                      value={backgroundColor}
                      onChange={e => setBackgroundColor(e.target.value)}
                      className="h-10 w-12 rounded border border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 mt-2">{backgroundColor}</span>
                  </div>
                </div>
              </div>

              {/* Items in Outfit */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-sm mb-3">Items ({outfitItems.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {outfitItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {item.item?.brand} {item.item?.model}
                        </p>
                        <p className="text-xs text-slate-600 capitalize">{item.item?.category}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Item Dropdown */}
              <div className="space-y-2">
                <Label className="text-sm">Add Item</Label>
                {userWardrobe.length === 0 && (
                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    ⚠️ No items in wardrobe. Add items to your collection first.
                  </div>
                )}
                <Select
                  value={selectedItemToAdd?.id || ''}
                  onValueChange={(itemId) => {
                    const item = userWardrobe.find(i => i.id === itemId)
                    if (item) handleAddItem(item)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item to add..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const availableItems = userWardrobe.filter(item => !outfitItems.find(oi => oi.item_id === item.id))
                      console.log('Available items for dropdown:', availableItems.length, availableItems)
                      return availableItems.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.brand} {item.model} - {item.color}
                        </SelectItem>
                      ))
                    })()}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveOutfit}
              disabled={isSaving || outfitItems.length === 0}
              className="flex items-center gap-2"
            >
              {isSaving ? 'Saving...' : 'Save Outfit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quiz Modal (if showing) */}
      {showQuizModal && (
        <CanYouStyleThisQuiz
          outfitsCreated={outfitsCreated}
          isOpen={true}
          itemBrand={newWishlistItem?.brand}
          itemModel={newWishlistItem?.model}
          itemPrice={newWishlistItem?.purchase_price}
          onProceed={() => {
            setShowQuiz(false)
            // TODO: Add to wishlist
          }}
          onCreateOutfits={() => setShowQuiz(false)}
          onSkip={() => {
            setShowQuiz(false)
            // TODO: Track skip event
          }}
        />
      )}
    </>
  )
}
