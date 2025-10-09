'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AddItemForm } from '@/components/add-item-form'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EditItemModalProps {
  experience: any
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function EditItemModal({ experience, isOpen, onClose, onSave }: EditItemModalProps) {
  const handleItemUpdated = () => {
    onSave() // Refresh the parent list
    onClose() // Close the modal
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Edit Item</DialogTitle>
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </Button> */}
        </DialogHeader>

        <AddItemForm
          initialData={experience}
          mode="edit"
          onItemAdded={handleItemUpdated}
        />
      </DialogContent>
    </Dialog>
  )
}
