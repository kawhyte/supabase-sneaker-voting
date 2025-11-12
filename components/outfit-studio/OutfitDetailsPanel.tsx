'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Edit3, Loader2, X } from 'lucide-react'
import { OutfitOccasion, OCCASION_CONFIG } from '@/components/types/outfit'
import { OutfitItem } from '@/components/types/outfit'
import { cn } from '@/lib/utils'

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

// Preset background colors for quick selection
const PRESET_COLORS = [
  '#FFFFFF', // White
  '#F5F5F5', // Light gray
  '#FFF7CC', // Light yellow
  '#FFE5E5', // Light pink
  '#E5F2FF', // Light blue
  '#E5FFE5', // Light green
  '#FFE5F7', // Light lavender
  '#000000', // Black
]

interface OutfitDetailsPanelProps {
  outfitName: string
  occasion: OutfitOccasion
  backgroundColor: string
  description: string
  outfitItems: OutfitItem[]
  isSaving: boolean
  mode?: 'create' | 'edit'
  onOutfitNameChange: (value: string) => void
  onOccasionChange: (value: OutfitOccasion) => void
  onBackgroundColorChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onRemoveItem: (itemId: string) => void
  onSave: () => void
  onCancel: () => void
}

/**
 * OutfitDetailsPanel - Right sidebar details form (desktop only)
 *
 * Features:
 * - Sticky positioning (always visible while scrolling)
 * - Compact form layout
 * - Preset color swatches for quick selection
 * - Custom color picker
 * - Character count for description
 * - Items list with remove buttons
 * - Save/cancel actions
 * - Responsive: hidden on mobile (uses 3-tab wizard instead)
 *
 * Design:
 * - Clean card layout with subtle shadow
 * - 8px grid spacing
 * - Clear visual hierarchy
 * - Accessible labels and inputs
 */
export function OutfitDetailsPanel({
  outfitName,
  occasion,
  backgroundColor,
  description,
  outfitItems,
  isSaving,
  mode = 'create',
  onOutfitNameChange,
  onOccasionChange,
  onBackgroundColorChange,
  onDescriptionChange,
  onRemoveItem,
  onSave,
  onCancel,
}: OutfitDetailsPanelProps) {
  return (
    <Card className="sticky top-6 p-6 space-y-6 h-fit max-h-[calc(100vh-3rem)] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Edit3 className="h-5 w-5 text-primary" aria-hidden="true" />
          {mode === 'edit' ? 'Edit Details' : 'Outfit Details'}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {mode === 'edit' ? 'Update your outfit information' : 'Name and style your outfit'}
        </p>
      </div>

      <Separator />

      {/* Form - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Outfit Name */}
        <div>
          <Label htmlFor="outfit-name-sidebar" className="text-sm font-medium">
            Outfit Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="outfit-name-sidebar"
            value={outfitName}
            onChange={(e) => onOutfitNameChange(e.target.value)}
            placeholder="e.g., Cozy Coffee Date"
            className="mt-1.5 font-semibold"
            required
          />
        </div>

        {/* Occasion */}
        <div>
          <Label htmlFor="occasion-sidebar" className="text-sm font-medium">
            Occasion
          </Label>
          <Select value={occasion} onValueChange={(val) => onOccasionChange(val as OutfitOccasion)}>
            <SelectTrigger id="occasion-sidebar" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OUTFIT_OCCASIONS.map((occ) => (
                <SelectItem key={occ} value={occ}>
                  <span className="flex items-center gap-2">
                    <span>{OCCASION_CONFIG[occ].icon}</span>
                    <span>{OCCASION_CONFIG[occ].label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Background Color */}
        <div>
          <Label htmlFor="bg-color-sidebar" className="text-sm font-medium">
            Background Color
          </Label>

          {/* Preset Color Swatches */}
          <div className="mt-1.5 flex flex-wrap gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onBackgroundColorChange(color)}
                className={cn(
                  'w-8 h-8 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  backgroundColor === color
                    ? 'border-primary scale-110 shadow-md'
                    : 'border-slate-300 hover:border-slate-400'
                )}
                style={{ backgroundColor: color }}
                title={color}
                aria-label={`Select ${color} background`}
              />
            ))}

            {/* Custom Color Picker */}
            <div className="relative">
              <input
                id="bg-color-sidebar"
                type="color"
                value={backgroundColor}
                onChange={(e) => onBackgroundColorChange(e.target.value)}
                className="w-8 h-8 rounded-full border-2 border-slate-300 cursor-pointer hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                title="Custom color"
                aria-label="Custom background color picker"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-2">{backgroundColor}</p>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description-sidebar" className="text-sm font-medium">
            Description <span className="text-xs text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="description-sidebar"
            placeholder="e.g., Wore to Sarah's wedding, perfect for summer brunch..."
            value={description}
            onChange={(e) => {
              const value = e.target.value
              if (value.length <= 500) {
                onDescriptionChange(value)
              }
            }}
            maxLength={500}
            rows={4}
            className="resize-none mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            {description.length}/500 characters
          </p>
        </div>

        <Separator />

        {/* Items in Outfit */}
        <div>
          <h4 className="text-sm font-semibold mb-2">
            Items ({outfitItems.length})
          </h4>

          {outfitItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
              No items added yet
            </p>
          ) : (
            <div className="dense space-y-2 max-h-48 overflow-y-auto">
              {outfitItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200 text-xs hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {item.item?.brand} {item.item?.model}
                    </p>
                    <p className="text-xs text-slate-600 capitalize">{item.item?.category}</p>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    aria-label={`Remove ${item.item?.brand} ${item.item?.model} from outfit`}
                    className="text-red-500 hover:text-red-700 flex-shrink-0 p-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions - Fixed */}
      <div className="flex-shrink-0 pt-4 border-t space-y-3">
        <Button
          onClick={onSave}
          disabled={isSaving || outfitItems.length === 0 || !outfitName.trim()}
          className="w-full bg-primary text-white h-11"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'edit' ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            <>{mode === 'edit' ? 'Save Changes' : 'Save Outfit'}</>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="w-full h-10"
        >
          Cancel
        </Button>
      </div>
    </Card>
  )
}
