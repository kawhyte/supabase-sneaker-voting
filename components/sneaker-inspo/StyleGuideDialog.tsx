'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Info, Zap, Coffee } from 'lucide-react'

interface StyleGuideDialogProps {
  trigger?: React.ReactNode
}

/**
 * StyleGuideDialog - Explains how to use the Sneaker Inspiration palettes
 *
 * Features:
 * - Explains the Bold vs Muted concept
 * - Provides styling tips for each palette type
 * - Helps users understand color roles
 * - Custom trigger or default Info button
 */
export function StyleGuideDialog({ trigger }: StyleGuideDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Info className="h-4 w-4" />
            Style Guide
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">How to Style Your Kicks</DialogTitle>
          <DialogDescription>
            Learn how to use Bold and Muted palettes to create perfect outfits
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Bold Palette Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-semibold">Bold Palette (Streetwear/Statement)</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              High-energy colors for making a statement. Perfect for street style, creative environments, and when you want your sneakers to be the star of the show.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold">How to Use Bold Colors:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[140px]">Primary Base:</span>
                  <span>Use for your main garment (shirt, hoodie, or pants). This is the dominant color from your sneakers.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[140px]">High Contrast Pop:</span>
                  <span>Perfect for accessories (hat, bag, or jacket). Creates maximum visual impact.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[140px]">Secondary Pop:</span>
                  <span>Use for layering pieces or accent details (watch strap, socks, laces).</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[140px]">Vibrant Harmony:</span>
                  <span>Great for pattern mixing or bold accessories that complement your look.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[140px]">Shoe Accent:</span>
                  <span>The secondary color from your sneakers - perfect for repeating throughout your outfit.</span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground italic mt-2">
                💡 Tip: Start with 1-2 bold colors in your outfit, then add neutral tones to balance.
              </p>
            </div>
          </div>

          {/* Muted Palette Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-amber-700" />
              <h3 className="text-lg font-semibold">Muted Palette (Office/Casual Elegance)</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sophisticated, understated colors for professional settings and minimalist style. Perfect for office wear, date nights, and when you want a refined look.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold">How to Use Muted Colors:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[140px]">Muted Base:</span>
                  <span>Your foundation color - use for chinos, dress pants, or blazers.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[140px]">Subtle Harmony:</span>
                  <span>Perfect for layering (cardigan, vest, or button-up). Blends seamlessly with the base.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[140px]">Low-Key Pop:</span>
                  <span>Use for subtle accents that add depth without overpowering (belt, tie, or pocket square).</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[140px]">Neutral Ground:</span>
                  <span>Universal neutral - perfect for T-shirts, sweaters, or outerwear that works with everything.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[140px]">Deep Accent:</span>
                  <span>Rich, subdued version of your sneaker's secondary color - ideal for bags or watches.</span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground italic mt-2">
                💡 Tip: Muted palettes work best when you mix textures (cotton, wool, denim) to add visual interest.
              </p>
            </div>
          </div>

          {/* General Tips */}
          <div className="bg-sun-50 dark:bg-sun-950/20 rounded-lg p-4 space-y-2 border border-sun-200 dark:border-sun-800">
            <h4 className="text-sm font-semibold text-sun-900 dark:text-sun-100">General Styling Tips</h4>
            <ul className="space-y-1.5 text-sm text-sun-800 dark:text-sun-200">
              <li>• Click any color circle to copy its hex code for shopping reference</li>
              <li>• The first color (Primary/Muted Base) usually works best for your largest garment</li>
              <li>• Mix bold and muted approaches: bold sneakers + muted outfit, or vice versa</li>
              <li>• Hover over colors to see their specific role and purpose</li>
              <li>• Use the regenerate button to get fresh palettes if colors don't inspire you</li>
            </ul>
          </div>

          {/* Example Outfit Formula */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-semibold">Quick Outfit Formula</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-semibold">Bold Look:</span> Primary Base pants + Neutral Ground shirt + High Contrast Pop jacket + sneakers</p>
              <p><span className="font-semibold">Muted Look:</span> Muted Base chinos + Neutral Ground tee + Subtle Harmony cardigan + sneakers</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
