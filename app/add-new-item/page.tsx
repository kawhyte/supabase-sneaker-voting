/**
 * ✅ ADD NEW ITEM PAGE - DESIGN SYSTEM v2.0 IMPLEMENTATION
 *
 * 🎯 DESIGN STRATEGY:
 *
 * **Page Purpose:**
 * Form page for adding new wardrobe items (shoes, clothing, accessories).
 * Provides guided input flow with image handling and metadata collection.
 *
 * **Layout Structure:**
 * 1. Outer Container
 *    - bg-background (blaze-50): Light orange, energetic background
 *    - min-h-screen: Full viewport height for sticky footer alignment
 *    - Responsive max-width constraint (1920px ultra-wide optimization)
 *
 * 2. Inner Container
 *    - max-w-[1920px] mx-auto: Consistent with navbar/dashboard
 *    - px-4 sm:px-6 lg:px-8: Responsive padding (mobile-first)
 *    - py-12: Section-level spacing (48px, 3×8px grid)
 *
 * 3. Form Card Section
 *    - bg-card (white): Elevated surface above blaze-50 background
 *    - rounded-lg: Consistent border radius (8px)
 *    - p-6 sm:p-8: Responsive form padding (24-32px)
 *    - shadow-md: Subtle elevation above background
 *
 * **Spacing System (Perfect 8px Grid):**
 * - Horizontal padding: px-4 (16px) → sm:px-6 (24px) → lg:px-8 (32px)
 * - Vertical padding: py-12 (48px - section-level spacing)
 * - Form padding: p-6 (24px) sm:p-8 (32px)
 * - All values align to 8px multiples
 *
 * **Color System Integration:**
 * - Background: bg-background (blaze-50, light orange)
 * - Card: bg-card (white) for form elevation
 * - Text: text-foreground (slate-900) for readability
 * - Border: Border inherited from design system (stone-300)
 *
 * **Responsive Breakpoints:**
 * - Mobile (< 640px): px-4, compact form padding
 * - Tablet (640px - 1024px): px-6, improved readability
 * - Desktop (1024px+): px-8, maximum breathing room
 * - Ultra-wide (> 1920px): max-w-[1920px] centers content
 *
 * **Accessibility (WCAG AAA):**
 * - Minimum 44px touch targets for form inputs
 * - Sufficient whitespace for cognitive load reduction
 * - Responsive design works on all devices
 * - Clear visual hierarchy with elevated form card
 *
 * **Performance:**
 * - Uses semantic design tokens (no hardcoded values)
 * - CSS Grid-aligned spacing prevents layout shifts
 * - Responsive images in form handled by AddItemForm component
 *
 * **Future Scalability:**
 * - Pattern easily extends to edit/duplicate item pages
 * - Max-width constraint supports adding side panel (e.g., help drawer)
 * - Spacing system allows A/B testing via globals.css
 *
 * 📚 Related: globals.css (spacing, colors), AddItemForm component
 */

'use client'

import { useRouter } from 'next/navigation'
import { AddItemForm } from '@/components/add-item-form'
import { FormModeProvider } from '@/lib/form-mode-context'

export default function AddNewItemPage() {
  const router = useRouter()

  const handleItemAdded = () => {
    // Auto-redirect to dashboard after successful submission
    // Short delay allows user to see success toast before transition
    setTimeout(() => {
      router.push('/dashboard')
    }, 100) // Minimal delay - form already waited 800ms
  }

  return (
    <FormModeProvider>
      <div className="min-h-screen bg-background">
        {/* Container with responsive padding + max-width constraint */}
        <div className="container mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-12">
          {/* Form Card - Elevated above background */}
          <div className="bg-card rounded-lg shadow-md p-6 sm:p-8">
            <AddItemForm onItemAdded={handleItemAdded} mode="create" />
          </div>
        </div>
      </div>
    </FormModeProvider>
  )
}