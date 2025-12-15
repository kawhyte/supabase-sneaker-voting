import { SneakerInspirationView } from '@/components/outfit-studio/SneakerInspirationView'

/**
 * Sneaker Inspiration Page
 *
 * Displays a beautiful grid of the user's sneakers with harmonious color palettes.
 * Each sneaker shows a 5-color palette extracted from its image to inspire outfit choices.
 *
 * Features:
 * - Responsive grid: 2 columns on mobile, 3-4 on desktop
 * - Generate Palette button for items without palettes
 * - Batch migration button to process all sneakers at once
 * - Empty state with helpful guidance
 * - Loading states and error handling
 */
export default function OutfitsPage() {
  return (
    <div className="container max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SneakerInspirationView showHeader={true} />
    </div>
  )
}
