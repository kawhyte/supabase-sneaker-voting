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
// import { CanYouStyleThisQuiz } from './CanYouStyleThisQuiz' // Commented out - file not found
import { ItemLibrary } from './ItemLibrary'
import { QuotaProgressPanel } from './QuotaProgressPanel'
import { OutfitDetailsPanel } from './OutfitDetailsPanel'
import { MilestoneCelebrationModal, useMilestoneCelebration } from '@/components/MilestoneCelebration'
import {
  calculateAutoPosition,
  calculateSuggestedSize,
} from '@/lib/outfit-layout-engine'
import { createClient } from '@/utils/supabase/client'
import { X, Loader2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useOutfitQuotas } from '@/hooks/useOutfitQuotas'
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
  // ✅ NEW: Anchor item for "Style This" workflow (shoe-first)
  anchorItem?: WardrobeItem | null
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
  anchorItem,
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

  // Mobile Wizard Tabs (for responsive design)
  type WizardTab = 'items' | 'arrange' | 'details'
  const [mobileActiveTab, setMobileActiveTab] = useState<WizardTab>('items')

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

  // ✅ NEW: Auto-add anchor item when provided (Shoe-First "Style This" workflow)
  useEffect(() => {
    if (isOpen && anchorItem && mode === 'create' && outfitItems.length === 0) {
      // Automatically add the anchor item to the canvas
      // This creates the "Style This" workflow where the shoe is pre-selected
      handleAddItem(anchorItem)
    }
  }, [isOpen, anchorItem, mode])

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
        .from('items')
        .update({ status: 'wishlisted', purchase_date: null })
        .eq('id', newWishlistItem.id)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Added to wishlist! Time to style some outfits')
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

  // Handle clearing entire canvas
  const handleClearCanvas = () => {
    if (outfitItems.length === 0) return

    const previousState = [...outfitItems]
    setOutfitItems([])

    // Push to undo stack
    pushAction({
      type: 'CLEAR_CANVAS',
      timestamp: Date.now(),
      data: {
        previous: previousState,
        current: [],
      },
    })

    toast.success('Canvas cleared', {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: handleUndo,
      },
    })
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
        <DialogContent className="w-[95vw] max-w-[1400px] max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
          {/* Header */}
          <DialogHeader className='px-6 sm:px-8 pt-6 sm:pt-8 pb-4'>
            <DialogTitle className="text-2xl sm:text-4xl font-black">
              {mode === 'edit' ? 'Edit Outfit' : 'Outfit Designer'}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              {mode === 'edit' ? 'Update your outfit details and arrangement' : 'Add items from your wardrobe and arrange them on the canvas'}
            </DialogDescription>
          </DialogHeader>

          {/* Mobile Wizard Tabs (visible only on mobile/tablet) */}
          <div className="lg:hidden border-b border-stone-200 px-4">
            <div className="flex gap-0">
              {[
                { id: 'items' as WizardTab, label: '1. Items', number: 1 },
                { id: 'arrange' as WizardTab, label: '2. Arrange', number: 2 },
                { id: 'details' as WizardTab, label: '3. Details', number: 3 },
              ].map(({ id, label, number }) => (
                <button
                  key={id}
                  onClick={() => setMobileActiveTab(id)}
                  className={cn(
                    'flex-1 py-3 px-2 text-xs sm:text-sm font-bold border-b-[3px] transition-colors',
                    mobileActiveTab === id
                      ? 'border-b-primary text-primary'
                      : 'border-b-transparent text-muted-foreground'
                  )}
                  aria-current={mobileActiveTab === id ? 'step' : undefined}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
            {/* ============================================================ */}
            {/* DESKTOP LAYOUT: 3-Column (Library | Canvas + Quotas | Details) */}
            {/* ============================================================ */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-6 h-full min-h-[700px]">
              {/* Column 1: Item Library (3/12 width) */}
              <div className="lg:col-span-3 h-full">
                <ItemLibrary
                  userWardrobe={userWardrobe}
                  outfitItems={outfitItems}
                  onAddItem={handleAddItem}
                  canAddItem={canAddItem}
                />
              </div>

              {/* Column 2: Canvas + Floating Quota HUD (6/12 width) */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                {/* Floating Quota HUD - Always Visible */}
                <QuotaProgressPanel outfitItems={outfitItems} />

                {/* Canvas Area */}
                <div className="bg-white dark:bg-[#1a2b2f] rounded-xl shadow-sm flex-grow p-8 min-h-[500px] border-2 border-dashed border-gray-200 dark:border-gray-700">
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
                  ) : outfitItems.length === 0 ? (
                    // Enhanced Empty State
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="mx-auto w-16 h-16 text-primary/30 dark:text-primary/50">
                          <svg className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-[#111718] dark:text-white">Your Outfit Canvas</h3>
                        <p className="mt-1 text-sm text-[#618389] dark:text-gray-400">Click items to add them to your outfit.</p>
                      </div>
                    </div>
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

                {/* Clear Canvas Button */}
                {outfitItems.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleClearCanvas}
                    className="w-full h-11"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Canvas
                  </Button>
                )}
              </div>

              {/* Column 3: Details Panel (3/12 width) */}
              <div className="lg:col-span-3">
                <OutfitDetailsPanel
                  outfitName={outfitName}
                  occasion={occasion}
                  backgroundColor={backgroundColor}
                  description={description}
                  outfitItems={outfitItems}
                  isSaving={isSaving}
                  mode={mode}
                  onOutfitNameChange={setOutfitName}
                  onOccasionChange={setOccasion}
                  onBackgroundColorChange={setBackgroundColor}
                  onDescriptionChange={setDescription}
                  onRemoveItem={handleRemoveItem}
                  onSave={handleSaveOutfit}
                  onCancel={onClose}
                />
              </div>
            </div>

            {/* ============================================================ */}
            {/* MOBILE LAYOUT: 3-Tab Wizard with Floating Quota HUD */}
            {/* ============================================================ */}
            <div className="lg:hidden space-y-6">
              {/* Tab 1: Items */}
              {mobileActiveTab === 'items' && (
                <div className="space-y-4">
                  {/* Floating Quota HUD (mobile) */}
                  <QuotaProgressPanel outfitItems={outfitItems} />

                  <div className="min-h-[500px]">
                    <ItemLibrary
                      userWardrobe={userWardrobe}
                      outfitItems={outfitItems}
                      onAddItem={handleAddItem}
                      canAddItem={canAddItem}
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Arrange */}
              {mobileActiveTab === 'arrange' && (
                <div className="space-y-4">
                  {/* Floating Quota HUD (mobile) */}
                  <QuotaProgressPanel outfitItems={outfitItems} />

                  <div className="bg-white dark:bg-[#1a2b2f] rounded-xl shadow-sm p-6 min-h-[500px] border-2 border-dashed border-gray-200">
                    {croppingItemId ? (
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
                    ) : outfitItems.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="mx-auto w-16 h-16 text-primary/30">
                            <svg className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                          </div>
                          <h3 className="mt-4 text-lg font-semibold">Your Outfit Canvas</h3>
                          <p className="mt-1 text-sm text-muted-foreground">Add items from the Items tab to get started.</p>
                        </div>
                      </div>
                    ) : (
                      <OutfitCanvas
                        items={outfitItems}
                        backgroundColor={backgroundColor}
                        onUpdateItemPosition={handleUpdateItemPosition}
                        onRemoveItem={handleRemoveItem}
                        onResetAutoArrange={handleResetAutoArrange}
                      />
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleClearCanvas}
                      disabled={outfitItems.length === 0}
                      className="flex-1 h-12"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                    <Button
                      onClick={handleSaveOutfit}
                      disabled={isSaving || outfitItems.length === 0}
                      className="flex-1 bg-primary text-white h-12"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>Save</>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Tab 3: Details */}
              {mobileActiveTab === 'details' && (
                <div className="space-y-4">
                  {/* Floating Quota HUD (mobile) */}
                  <QuotaProgressPanel outfitItems={outfitItems} />

                  <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 space-y-4">
                    <h3 className="font-semibold text-lg">Outfit Details</h3>

                  <div>
                    <Label htmlFor="outfit-name-mobile" className="text-sm">Outfit Name</Label>
                    <Input
                      id="outfit-name-mobile"
                      value={outfitName}
                      onChange={e => setOutfitName(e.target.value)}
                      placeholder="e.g., Cozy Coffee Date"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="occasion-mobile" className="text-sm">Occasion</Label>
                    <Select value={occasion} onValueChange={(val) => setOccasion(val as OutfitOccasion)}>
                      <SelectTrigger id="occasion-mobile" className="mt-1">
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
                    <Label htmlFor="bg-color-mobile" className="text-sm">Background Color</Label>
                    <div className="flex gap-2 mt-1">
                      <input
                        id="bg-color-mobile"
                        type="color"
                        value={backgroundColor}
                        onChange={e => setBackgroundColor(e.target.value)}
                        className="h-10 w-12 rounded border border-slate-300 cursor-pointer"
                      />
                      <span className="text-xs text-slate-600 mt-2">{backgroundColor}</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description-mobile" className="text-sm">
                      Description <span className="text-muted-foreground text-xs">(optional)</span>
                    </Label>
                    <Textarea
                      id="description-mobile"
                      placeholder="e.g., Wore to Sarah's wedding..."
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

                  {/* Items in Outfit */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Items ({outfitItems.length})</h4>
                    <div className="dense space-y-2 max-h-48 overflow-y-auto">
                      {outfitItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No items added yet</p>
                      ) : (
                        outfitItems.map(item => (
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
                        ))
                      )}
                    </div>
                  </div>
                  </div>
                </div>
              )}

              {/* Mobile Navigation Buttons */}
              <div className="flex gap-3 pt-4 border-t border-stone-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (mobileActiveTab === 'arrange') setMobileActiveTab('items')
                    if (mobileActiveTab === 'details') setMobileActiveTab('arrange')
                  }}
                  disabled={mobileActiveTab === 'items'}
                  className="flex-1"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (mobileActiveTab === 'items') setMobileActiveTab('arrange')
                    else if (mobileActiveTab === 'arrange') setMobileActiveTab('details')
                    else if (mobileActiveTab === 'details') handleSaveOutfit()
                  }}
                  disabled={mobileActiveTab === 'details' && (isSaving || outfitItems.length === 0)}
                  className="flex-1 bg-primary text-white"
                >
                  {mobileActiveTab === 'details' ? (
                    isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>Save Outfit</>
                    )
                  ) : (
                    <>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
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
      {/* Commented out - CanYouStyleThisQuiz component not found
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
      */}
    </>
  )
}
