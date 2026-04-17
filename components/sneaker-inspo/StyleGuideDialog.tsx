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
import { Info, Droplet, Zap, Anchor, TrendingDown } from 'lucide-react'

interface StyleGuideDialogProps {
  trigger?: React.ReactNode
}

export function StyleGuideDialog({ trigger }: StyleGuideDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Info className="h-4 w-4" />
            Fit Formula Guide
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl tracking-tight text-gray-900">How to Read Fit Formulas</DialogTitle>
          <DialogDescription className="text-gray-500">
            We automatically extract the exact colors from your sneakers and generate three distinct ways to style them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">

          {/* Formula 1: Tonal */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-600">
              <Droplet className="h-5 w-5" />
              <h3 className="text-lg font-semibold text-gray-900">The Tonal / Monochromatic Fit</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              This formula pulls the exact primary colors from your shoe and applies them to your garments. It creates a seamless, highly coordinated look where your outfit feels like an extension of the sneaker.
            </p>
          </div>

          {/* Formula 2: High Contrast */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-orange-500">
              <Zap className="h-5 w-5" />
              <h3 className="text-lg font-semibold text-gray-900">The High-Contrast Fit</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Using color theory, this formula finds the direct complement to your shoe's dominant color. If your shoe is primarily navy blue, this fit will suggest warm orange or earthy tones for a bold, head-turning contrast.
            </p>
          </div>

          {/* Formula 3: The Anchor */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-700">
              <Anchor className="h-5 w-5" />
              <h3 className="text-lg font-semibold text-gray-900">The Anchor Fit</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              When the sneaker needs to be the absolute star of the show. This formula strips the color out of your clothing entirely, using a strict grayscale/neutral base so the shoe acts as your single pop of color.
            </p>
          </div>

          <hr className="border-gray-200/60" />

          {/* Utility & CPW Explanation */}
          <div className="bg-gray-50/50 rounded-2xl p-5 space-y-3 border border-gray-100">
            <div className="flex items-center gap-2 text-emerald-600">
              <TrendingDown className="h-5 w-5" />
              <h4 className="font-semibold text-gray-900">The "Worth It" Metric</h4>
            </div>
            <p className="text-sm text-gray-600">
              Great shoes shouldn't sit in boxes. Our goal is to give you enough outfit ideas to actually wear your collection.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 mt-2">
              <li className="flex gap-2">
                <span className="font-medium text-gray-900">• Doodle Art:</span>
                <span>The minimalist icons show suggested garments. Tinted icons mean you should match the shoe color; grayscale icons mean wear neutrals.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-gray-900">• Log a Wear:</span>
                <span>Clicking the button at the bottom of any Fit Formula instantly logs a wear for that shoe, driving down its overall Cost Per Wear (CPW).</span>
              </li>
            </ul>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
