'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { WardrobeItem } from '@/components/types/WardrobeItem'

interface ConfirmReplaceDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  oldItem: WardrobeItem
  newItem: WardrobeItem
  category: string
}

export function ConfirmReplaceDialog({
  isOpen,
  onClose,
  onConfirm,
  oldItem,
  newItem,
  category,
}: ConfirmReplaceDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Replace {category}?</DialogTitle>
          <DialogDescription className="space-y-3">
            <p>
              You already have{' '}
              <strong>
                {oldItem.brand} {oldItem.model}
              </strong>{' '}
              in this outfit.
            </p>
            <p>
              Would you like to replace it with{' '}
              <strong>
                {newItem.brand} {newItem.model}
              </strong>
              ?
            </p>
            <p className="text-xs text-muted-foreground">
              You'll have 5 seconds to undo this action after replacing.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Replace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
