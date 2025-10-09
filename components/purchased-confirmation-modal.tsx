'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, DollarSign } from 'lucide-react'
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

  const handleConfirm = async () => {
    const price = parseFloat(purchasePrice)

    if (isNaN(price) || price <= 0) {
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirm(price, purchaseDate)
      // Reset form
      setPurchasePrice('')
      setPurchaseDate(new Date())
      onClose()
    } catch (error) {
      console.error('Error confirming purchase:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setPurchasePrice('')
    setPurchaseDate(new Date())
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark as Purchased</DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Add purchase details for <span className="font-semibold">{itemName}</span>
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Purchase Price */}
          <div className="space-y-2">
            <Label htmlFor="purchase-price" className="text-sm font-medium">
              Purchase Price <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="purchase-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="120.00"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="pl-10"
                disabled={isSubmitting}
              />
            </div>
            <p className="text-xs text-gray-500">
              Enter the amount you paid for this item
            </p>
          </div>

          {/* Purchase Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Purchase Date <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !purchaseDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {purchaseDate ? format(purchaseDate, 'PPP') : <span>Pick a date</span>}
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
            <p className="text-xs text-gray-500">
              When did you purchase this item?
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!purchasePrice || parseFloat(purchasePrice) <= 0 || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Saving...' : 'Mark as Purchased'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
