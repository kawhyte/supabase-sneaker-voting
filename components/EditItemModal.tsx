/**
 * ✅ EDIT ITEM MODAL - DESIGN SYSTEM v2.0 IMPLEMENTATION (RESPONSIVE)
 *
 * 🎯 DESIGN STRATEGY:
 *
 * **Component Purpose:**
 * Modal dialog for editing existing wardrobe items in the tracking system.
 * Wraps AddItemForm in "edit" mode with responsive container styling.
 * Used in dashboard and item management flows.
 *
 * **Layout Structure (Mobile-First):**
 * 1. Dialog Container
 *    - w-[95vw] max-w-7xl: 1280px maximum width, centered, responsive (80rem exactly)
 *    - px-4 sm:px-6 lg:px-8: Responsive horizontal gutters (16px→24px→32px)
 *    - max-h-[85vh] md:max-h-[90vh]: Responsive overflow height
 *    - bg-card border border-stone-300: Elevated white surface with subtle border
 *    - overflow-y-auto: Smooth scrolling for long forms
 *
 * 2. Header Section (STICKY)
 *    - sticky top-0 bg-card z-10: Stays visible while form scrolls
 *    - pb-[var(--spacing-6)] border-b border-stone-300: 24px spacing + separator
 *    - -mx-4 sm:-mx-6 lg:-mx-8: Negative margins extend borders edge-to-edge
 *    - px-4 sm:px-6 lg:px-8: Re-apply responsive padding
 *    - Title: text-xl md:text-2xl responsive heading
 *    - Semantic heading for accessibility
 *
 * 3. Form Container (AddItemForm)
 *    - Inherits full responsive width from dialog padding
 *    - Fills available vertical space
 *    - Responsive padding handled by parent modal
 *
 * **Color System Integration (Design System v2.0):**
 * - Dialog background: bg-card (white)
 * - Dialog border: border-stone-300 (warm neutral, subtle)
 * - Header separator: border-stone-300 (visual hierarchy)
 * - Text: text-foreground for title, text-muted-foreground for description
 *
 * **Spacing System (Perfect 8px Grid Alignment):**
 * - Dialog horizontal: px-4 sm:px-6 lg:px-8 (16px→24px→32px)
 * - Header padding: pb-[var(--spacing-6)] = 24px (semantic token)
 * - Header margins: -mx-4 sm:-mx-6 lg:-mx-8 (extends borders)
 * - All values are 8px multiples ✓
 *
 * **Responsive Breakpoints (Mobile-First):**
 * - Mobile (< 640px):    w-[95vw], px-4, max-h-[85vh]
 * - Tablet (640-1024px): w-[95vw] max-w-7xl, px-6, max-h-[90vh]
 * - Desktop (1024px+):    w-[95vw] max-w-7xl, px-8, max-h-[90vh]
 * - Ultra-wide (>1280px): Max-width constraint at 7xl (1280px = 80rem), centered
 *
 * **Accessibility (WCAG AAA):**
 * - Dialog semantic: <Dialog> component from shadcn/ui
 * - Title hierarchy: DialogTitle for screen readers
 * - Keyboard navigation: Esc to close, Tab through form elements
 * - Focus management: Dialog traps focus automatically
 * - Sticky header: Maintains context while scrolling
 * - Semantic form: AddItemForm provides full accessibility
 *
 * **Interactive Features:**
 * - Sticky header stays visible while editing long forms
 * - Dialog closes on Escape key
 * - Click outside to close (standard dialog behavior)
 * - Form saves trigger modal close and parent refresh
 *
 * **Performance:**
 * - Sticky positioning uses native CSS (no JS overhead)
 * - Dialog manages focus management internally
 * - Responsive padding calculated at render time
 * - No layout thrashing from responsive changes
 *
 * **Future Scalability:**
 * - Pattern consistent with ImageConfirmationModal
 * - Can be extended with additional header actions
 * - Supports form variations through AddItemForm modes
 * - Responsive layout adapts to content needs
 *
 * 📚 Related: add-item-form.tsx (form implementation), Dialog component (UI primitive)
 * 🎨 Design System: globals.css (spacing, colors, typography)
 * 📱 Responsive: Mobile-first, tested on 320px-2560px viewports
 */

'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import AddItemForm from '@/components/add-item-form/AddItemForm'

interface EditItemModalProps {
  experience: any
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function EditItemModal({ experience, isOpen, onClose, onSave }: EditItemModalProps) {
  const handleSuccess = () => {
    onSave() // Refresh the parent list
    onClose() // Close the modal
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-7xl px-4 sm:px-6 lg:px-8 max-h-[85vh] md:max-h-[90vh] overflow-y-auto bg-card border border-stone-300">
        <DialogHeader className="sticky top-0 bg-card  pb-[var(--spacing-6)]  border-stone-300 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 z-50">
          <DialogTitle className="text-xl md:text-2xl p-8">Edit Item</DialogTitle>
        </DialogHeader>

        <div className="pt-[var(--spacing-6)]">
          <AddItemForm
            initialData={experience}
            mode="edit"
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
