'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, DollarSign, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface PurchasedConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (purchasePrice: number, purchaseDate: Date) => void
  itemName?: string
}

export function PurchasedConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  itemName = 'this item'
}: PurchasedConfirmationModalProps) {
  const [purchasePrice, setPurchasePrice] = useState('')
  const [purchaseDate, setPurchaseDate] = useState<Date>(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [priceError, setPriceError] = useState<string>('')

  // Validation
  const price = parseFloat(purchasePrice)
  const isPriceValid = !isNaN(price) && price > 0
  const hasError = purchasePrice && !isPriceValid

  const handleConfirm = async () => {
    if (!isPriceValid) {
      setPriceError('Please enter a valid purchase price')
      return
    }

    setIsSubmitting(true)
    setPriceError('')

    try {
      await onConfirm(price, purchaseDate)
      // Reset form
      setPurchasePrice('')
      setPurchaseDate(new Date())
      setPriceError('')
      onClose()
    } catch (error) {
      console.error('Error confirming purchase:', error)
      setPriceError('Failed to save purchase. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setPurchasePrice('')
    setPurchaseDate(new Date())
    setPriceError('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md md:max-w-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-lg sm:text-xl font-semibold">Mark as Purchased</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add purchase details for <span className="font-medium text-foreground">{itemName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Purchase Price Field */}
          <div className="space-y-3">
            <Label htmlFor="purchase-price" className="text-sm font-semibold text-foreground">
              Purchase Price
              <span className="text-destructive ml-1" aria-label="required">*</span>
            </Label>

            <div className="relative">
              <DollarSign
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <Input
                id="purchase-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="120.00"
                value={purchasePrice}
                onChange={(e) => {
                  setPurchasePrice(e.target.value)
                  if (priceError) setPriceError('')
                }}
                onBlur={() => {
                  if (purchasePrice && !isPriceValid) {
                    setPriceError('Please enter a valid price')
                  }
                }}
                className={cn(
                  "pl-10 pr-3 py-2",
                  hasError && "border-destructive focus-visible:ring-destructive"
                )}
                disabled={isSubmitting}
                aria-invalid={hasError ? 'true' : 'false'}
                aria-describedby={hasError ? "price-error" : "price-description"}
                inputMode="decimal"
              />
            </div>

            {hasError && (
              <div
                id="price-error"
                className="flex items-center gap-2 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>{priceError || 'Please enter a valid purchase price'}</span>
              </div>
            )}

            {!hasError && (
              <p id="price-description" className="text-xs text-muted-foreground">
                Enter the amount you paid for this item
              </p>
            )}
          </div>

          {/* Purchase Date Field */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">
              Purchase Date
              <span className="text-destructive ml-1" aria-label="required">*</span>
            </Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal min-h-10 px-3 py-2",
                    !purchaseDate && "text-muted-foreground",
                    "focus-ring"
                  )}
                  disabled={isSubmitting}
                  aria-label={`Purchase date: ${purchaseDate ? format(purchaseDate, 'PPPP') : 'Pick a date'}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  {purchaseDate ? format(purchaseDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={purchaseDate}
                  onSelect={(date) => date && setPurchaseDate(date)}
                  initialFocus
                  disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                />
              </PopoverContent>
            </Popover>

            <p id="date-description" className="text-xs text-muted-foreground">
              When did you purchase this item?
            </p>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-2 pt-4 border-t border-stone-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="min-h-11"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!purchasePrice || !isPriceValid || isSubmitting}
            className="min-h-11 bg-meadow-600 hover:bg-meadow-700 text-white focus-ring"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              'Mark as Purchased'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
