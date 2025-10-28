/**
 * components/supported-retailers-dialog.tsx
 *
 * Dialog showing all 16 supported retailers for price tracking
 * Helps users understand which URLs will work
 *
 * Design: Following Shopify's help modal pattern
 * - Clear visual hierarchy
 * - Scannable list with badges
 * - Helpful tip at bottom
 * - Mobile-responsive grid
 */

'use client'

import { getSupportedRetailers } from '@/lib/retailer-url-validator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Zap } from 'lucide-react'

interface SupportedRetailersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Dialog component displaying all supported retailers
 */
export function SupportedRetailersDialog({
  open,
  onOpenChange,
}: SupportedRetailersDialogProps) {
  const retailers = getSupportedRetailers()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Supported Retailers ({retailers.length})
          </DialogTitle>
          <DialogDescription>
            We can automatically track prices from these retailers every week
          </DialogDescription>
        </DialogHeader>

        {/* Retailer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {retailers.map((retailer) => (
            <div
              key={retailer.domain}
              className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
            >
              {/* Retailer name and badge */}
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm">{retailer.name}</h3>
                {retailer.requiresJS && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    JS
                  </Badge>
                )}
              </div>

              {/* Domain */}
              <p className="text-xs text-muted-foreground font-mono break-all">
                {retailer.domain}
              </p>
            </div>
          ))}
        </div>

        {/* Helpful tip */}
        <div className="mt-4 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">💡 Tip:</strong> Copy the product URL from your
            browser's address bar. Retailers marked "JS" require JavaScript rendering and may take
            longer to scrape (but still work!).
          </p>
        </div>

        {/* Additional help */}
        <div className="mt-2">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">🤔 Don't see your retailer?</strong> You can still
            try adding the URL. We'll attempt to track it, though success isn't guaranteed for
            unsupported sites.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
