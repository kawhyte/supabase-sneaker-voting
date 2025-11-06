'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { WardrobeItem } from '@/components/types/WardrobeItem'
import { Outfit, OutfitWithItems, OutfitItem, OutfitOccasion, CropArea } from '@/components/types/outfit'
import { OutfitCanvas } from './OutfitCanvas'
import { ManualCropTool } from './ManualCropTool'
import { CanYouStyleThisQuiz } from './CanYouStyleThisQuiz'
import { MilestoneCelebrationModal, useMilestoneCelebration } from '@/components/MilestoneCelebration'
import {
  calculateAutoPosition,
  calculateSuggestedSize,
} from '@/lib/outfit-layout-engine'
import { createClient } from '@/utils/supabase/client'
import { X, Check, Loader2 } from 'lucide-react'
import { useOutfitQuotas } from '@/hooks/useOutfitQuotas'
import { getQuotaMessage } from '@/lib/quota-validation'
import { getQuotaForCategory } from '@/components/types/outfit'
import { cn } from '@/lib/utils'
import { useUndo } from '@/contexts/UndoContext'
import { ConfirmReplaceDialog } from './ConfirmReplaceDialog'

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
  userWardrobe: WardrobeItem[]
  outfitsCreated?: number
  onOutfitCreated?: (outfit: Outfit | OutfitWithItems) => void
  // When adding wishlist item
  newWishlistItem?: WardrobeItem | null
  // ✅ NEW: Edit mode props
  mode?: 'create' | 'edit'
  editingOutfitId?: string
  editingOutfit?: OutfitWithItems
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
  mode = 'create',
  editingOutfitId,
  editingOutfit,
}: OutfitStudioProps) {
  // Form State
  const [outfitName, setOutfitName] = useState('Untitled Outfit')
  const [occasion, setOccasion] = useState<OutfitOccasion>('casual')
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [description, setDescription] = useState<string>('')

  // Outfit Items
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([])

  // UI State
  const [selectedItemToAdd, setSelectedItemToAdd] = useState<WardrobeItem | null>(newWishlistItem || null)
  const [croppingItemId, setCroppingItemId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false)
  const [itemToReplace, setItemToReplace] = useState<{
    old: WardrobeItem
    new: WardrobeItem
    category: string
  } | null>(null)

  // Milestone celebrations
  const {
    isOpen: showCelebration,
    milestone: celebrationMilestone,
    celebrate,
    closeCelebration,
  } = useMilestoneCelebration()

  // Quota management
  const { quotaStatus, canAdd: canAddItem, getCategoryCount } = useOutfitQuotas(outfitItems)

  // Undo management
  const { pushAction, undo, canUndo, clearStack } = useUndo()

  // Initialize Supabase client for quiz callbacks
  const supabase = createClient()

  // ✅ Pre-populate form when editing
  useEffect(() => {
    if (mode === 'edit' && editingOutfit) {
      setOutfitName(editingOutfit.name || 'Untitled Outfit')
      setOccasion(editingOutfit.occasion || 'casual')
      setBackgroundColor(editingOutfit.background_color || '#FFFFFF')
      setDescription(editingOutfit.description || '')

      // Pre-populate outfit items
      if (editingOutfit.outfit_items && editingOutfit.outfit_items.length > 0) {
        setOutfitItems(editingOutfit.outfit_items)
      }
    }
  }, [mode, editingOutfit])

  // Clear undo stack when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearStack()
    }
  }, [isOpen, clearStack])

  // 🎯 STEP 3.5c: Quiz modal callbacks for OutfitStudio
  const handleQuizProceed = async () => {
    if (!newWishlistItem) {
      setShowQuiz(false)
      return
    }

    try {
      setIsSaving(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Authentication Error')
        return
      }

      // Update item status to 'wishlisted'
      const { error } = await supabase
        .from('sneakers')
        .update({ status: 'wishlisted', purchase_date: null })
        .eq('id', newWishlistItem.id)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Added to wishlist! Time to style some outfits 🎉')
      setShowQuiz(false)
    } catch (error) {
      toast.error((error as Error).message || 'Failed to add to wishlist')
      console.error('[OutfitStudio] Quiz proceed error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleQuizSkip = () => {
    // Just close the quiz modal without saving
    // User decided not to add item to wishlist
    setShowQuiz(false)
    // TODO: Track skip event for analytics (optional)
  }

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
  const handleAddItem = (item: WardrobeItem) => {
    // Check if item already in outfit
    if (outfitItems.find(oi => oi.item_id === item.id)) {
      toast.error('Item already in outfit')
      return
    }

    // Check quota
    const { canAdd: canAddItemCheck, reason } = canAddItem(item)

    if (!canAddItemCheck) {
      // Check if we can auto-replace
      const category = item.category || 'other'
      const quota = getQuotaForCategory(category)

      if (quota.max === 1) {
        // Find existing item in this category
        const existingItem = outfitItems.find(
          oi => oi.item?.category?.toLowerCase() === category.toLowerCase()
        )

        if (existingItem && existingItem.item) {
          // Show replace confirmation
          setItemToReplace({
            old: existingItem.item,
            new: item,
            category: quota.label,
          })
          setReplaceDialogOpen(true)
          return
        }
      }

      // Can't auto-replace (unlimited category or no existing item)
      toast.error(reason || 'Cannot add item')
      return
    }

    // Add item normally
    addItemToOutfit(item)
  }

  const addItemToOutfit = (item: WardrobeItem) => {
    const category = item.category || 'other'
    const categoryCount = getCategoryCount(category)

    const position = calculateAutoPosition(item, categoryCount)
    const size = calculateSuggestedSize(item)

    const newOutfitItem: OutfitItem = {
      id: `temp-${Date.now()}`,
      outfit_id: '',
      item_id: item.id,
      position_x: position.x / 375,
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

    const previousState = [...outfitItems]
    const newState = [...outfitItems, newOutfitItem]

    setOutfitItems(newState)
    setSelectedItemToAdd(null)

    // Push to undo stack
    pushAction({
      type: 'ADD_ITEM',
      timestamp: Date.now(),
      data: {
        previous: previousState,
        current: newState,
      },
    })

    toast.success(`Added ${item.brand} ${item.model}`)
  }

  const handleConfirmReplace = () => {
    if (!itemToReplace) return

    const category = itemToReplace.new.category || 'other'

    // Find and remove old item
    const previousState = [...outfitItems]
    const itemsWithoutOld = outfitItems.filter(
      oi => oi.item?.id !== itemToReplace.old.id
    )

    // Add new item
    const categoryCount = getCategoryCount(category)
    const position = calculateAutoPosition(itemToReplace.new, categoryCount)
    const size = calculateSuggestedSize(itemToReplace.new)

    const newOutfitItem: OutfitItem = {
      id: `temp-${Date.now()}`,
      outfit_id: '',
      item_id: itemToReplace.new.id,
      position_x: position.x / 375,
      position_y: position.y / 667,
      z_index: position.layer,
      display_width: size.width,
      display_height: size.height,
      item_order: itemsWithoutOld.length,
      crop_x: null,
      crop_y: null,
      crop_width: null,
      crop_height: null,
      cropped_image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      item: itemToReplace.new,
    }

    const newState = [...itemsWithoutOld, newOutfitItem]

    setOutfitItems(newState)
    setSelectedItemToAdd(null)

    // Push to undo stack
    pushAction({
      type: 'REPLACE_ITEM',
      timestamp: Date.now(),
      data: {
        previous: previousState,
        current: newState,
      },
    })

    // Show undo toast (5 seconds)
    toast.success(
      `Replaced ${itemToReplace.old.brand} with ${itemToReplace.new.brand}`,
      {
        duration: 5000,
        action: {
          label: 'Undo',
          onClick: handleUndo,
        },
      }
    )

    setReplaceDialogOpen(false)
    setItemToReplace(null)
  }

  const handleUndo = () => {
    const previousState = undo()
    if (previousState) {
      setOutfitItems(previousState)
      toast.info('Action undone')
    }
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

    // Reset positions for each item
    const resetItems = outfitItems.map(item => {
      const category = item.item?.category || 'other'
      const categoryCount = getCategoryCount(category)
      const position = calculateAutoPosition(item.item!, categoryCount)
      const size = calculateSuggestedSize(item.item!)

      return {
        ...item,
        position_x: position.x / 375,
        position_y: position.y / 667,
        z_index: position.layer,
        display_width: size.width,
        display_height: size.height,
      }
    })

    setOutfitItems(resetItems)

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
    // Validation
    if (outfitItems.length === 0) {
      toast.error('Add at least one item to your outfit')
      return
    }

    if (!outfitName.trim()) {
      toast.error('Please enter an outfit name')
      return
    }

    setIsSaving(true)

    try {
      const outfitData = {
        name: outfitName.trim(),
        description: description.trim() || null,
        occasion: occasion || null,
        background_color: backgroundColor,
        outfit_items: outfitItems.map((item, index) => ({
          item_id: item.item_id,
          position_x: item.position_x,
          position_y: item.position_y,
          z_index: item.z_index,
          crop_x: item.crop_x,
          crop_y: item.crop_y,
          crop_width: item.crop_width,
          crop_height: item.crop_height,
          cropped_image_url: item.cropped_image_url,
          display_width: item.display_width,
          display_height: item.display_height,
          item_order: index,
        })),
      }

      let response

      if (mode === 'edit' && editingOutfitId) {
        // ✅ EDIT MODE: PUT request
        response = await fetch(`/api/outfits/${editingOutfitId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(outfitData),
        })
      } else {
        // ✅ CREATE MODE: POST request
        response = await fetch('/api/outfits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(outfitData),
        })
      }

      if (!response.ok) {
        throw new Error('Failed to save outfit')
      }

      const savedOutfit = await response.json()

      // Show success message
      if (mode === 'edit') {
        toast.success('Outfit updated successfully!')
      } else {
        toast.success('Outfit created successfully!')
        // Trigger milestone celebration (only for create)
        celebrate('outfit_created')
      }

      // Callback to parent
      onOutfitCreated?.(savedOutfit)

      // Close modal after brief delay
      setTimeout(() => {
        onClose()
      }, 100)
    } catch (error) {
      console.error('Error saving outfit:', error)
      toast.error(mode === 'edit' ? 'Failed to update outfit' : 'Failed to create outfit')
    } finally {
      setIsSaving(false)
    }
  }

  // Show quiz if adding wishlist item and not enough outfits yet
  const showQuizModal = showQuiz && newWishlistItem && outfitsCreated < 3

  return (
    <>
      {/* Milestone Celebration Modal */}
      {showCelebration && celebrationMilestone && (
        <MilestoneCelebrationModal
          isOpen={showCelebration}
          milestone={celebrationMilestone}
          onClose={closeCelebration}
        />
      )}

      {/* Main Outfit Studio Modal */}
      <TooltipProvider>
        <Dialog open={isOpen && !showQuizModal} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-8 sm:p-12 ">
          <DialogHeader className='mb-8'>
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

                {/* Description Field */}
                <div>
                  <Label htmlFor="description" className="text-sm">
                    Description <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="e.g., Wore to Sarah's wedding, perfect for summer brunch..."
                    value={description}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value.length <= 500) {
                        setDescription(value)
                      }
                    }}
                    maxLength={500}
                    rows={3}
                    className="resize-none mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {description.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Items in Outfit */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-sm mb-3">Items ({outfitItems.length})</h3>
                <div className="dense space-y-2 max-h-48 overflow-y-auto">
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
                        aria-label={`Remove ${item.item?.brand} ${item.item?.model} from outfit`}
                        className="text-red-500 hover:text-red-700 flex-shrink-0"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quota Status Badges (with tooltips) */}
              <div className="space-y-2 border-t border-border pt-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Outfit Quotas
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(quotaStatus.quotas)
                    .filter(([_, validation]) => validation.max !== null)
                    .map(([category, validation]) => {
                      const isAtLimit = validation.isAtLimit && validation.current > 0

                      const tooltipMessage = validation.canAdd
                        ? `Can add ${validation.max! - validation.current} more ${validation.category}`
                        : `Already have ${validation.category} in outfit (${validation.current}/${validation.max})`

                      return (
                        <Tooltip key={category}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                'rounded-md border px-3 py-2 text-xs cursor-help transition-colors',
                                isAtLimit
                                  ? 'border-sun-400 bg-sun-100'
                                  : 'border-border bg-background hover:bg-muted'
                              )}
                              aria-label={tooltipMessage}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {getQuotaMessage(category, validation.current, validation.max)}
                                </span>
                                {isAtLimit && (
                                  <Check className="h-3 w-3 text-sun-600 flex-shrink-0" aria-hidden="true" />
                                )}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{tooltipMessage}</p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                </div>
              </div>

              {/* Add Item Dropdown */}
              <div className="space-y-2">
                <Label className="text-sm" htmlFor="add-item-select">Add Item</Label>
                {userWardrobe.length === 0 && (
                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    ⚠️ No items in wardrobe. Add items to your collection first.
                  </div>
                )}
                {userWardrobe.length > 0 && (
                  <Select
                    value=""
                    onValueChange={(itemId) => {
                      const item = userWardrobe.find(i => i.id === itemId)
                      if (item) {
                        handleAddItem(item)
                      }
                    }}
                  >
                    <SelectTrigger id="add-item-select" aria-label="Select item to add to outfit" aria-describedby="quota-help-text">
                      <SelectValue placeholder="Select item to add..." />
                    </SelectTrigger>
                    <SelectContent>
                      {userWardrobe.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                          No items in wardrobe
                        </div>
                      ) : (
                        userWardrobe.map(item => {
                          // Check if already in outfit
                          const alreadyInOutfit = outfitItems.find(oi => oi.item_id === item.id)

                          // Check quota status
                          const { canAdd: canAddCheck, reason } = canAddItem(item)
                          const isDisabled = !!alreadyInOutfit || !canAddCheck

                          return (
                            <SelectItem
                              key={item.id}
                              value={item.id}
                              disabled={isDisabled}
                              className={cn(
                                isDisabled && 'opacity-50 cursor-not-allowed line-through'
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span>
                                  {item.brand} {item.model} - {item.color}
                                </span>
                                {isDisabled && (
                                  <span className="text-xs text-muted-foreground">
                                    {alreadyInOutfit
                                      ? '(already added)'
                                      : reason
                                      ? `(${reason})`
                                      : '(quota reached)'}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          )
                        })
                      )}
                    </SelectContent>
                  </Select>
                )}
                <p id="quota-help-text" className="text-xs text-muted-foreground">
                  You can add 1 shoe, 1 top, 1 bottom, 1 outerwear, and unlimited accessories.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button className='mx-6' variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveOutfit}
              disabled={isSaving || outfitItems.length === 0}
              aria-busy={isSaving}
              aria-label={isSaving
                ? mode === 'edit' ? 'Saving changes...' : 'Creating outfit...'
                : mode === 'edit' ? 'Save changes to outfit' : 'Create new outfit'}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  {mode === 'edit' ? 'Saving Changes...' : 'Creating Outfit...'}
                </>
              ) : (
                <>
                  {mode === 'edit' ? 'Save Changes' : 'Create Outfit'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </TooltipProvider>

      {/* Replace Confirmation Dialog */}
      {itemToReplace && (
        <ConfirmReplaceDialog
          isOpen={replaceDialogOpen}
          onClose={() => {
            setReplaceDialogOpen(false)
            setItemToReplace(null)
          }}
          onConfirm={handleConfirmReplace}
          oldItem={itemToReplace.old}
          newItem={itemToReplace.new}
          category={itemToReplace.category}
        />
      )}

      {/* Quiz Modal (if showing) */}
      {showQuizModal && (
        <CanYouStyleThisQuiz
          outfitsCreated={outfitsCreated}
          isOpen={true}
          itemBrand={newWishlistItem?.brand}
          itemModel={newWishlistItem?.model}
          itemPrice={newWishlistItem?.purchase_price}
          onProceed={handleQuizProceed}
          onCreateOutfits={() => setShowQuiz(false)}
          onSkip={handleQuizSkip}
        />
      )}
    </>
  )
}
