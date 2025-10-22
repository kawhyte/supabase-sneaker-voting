'use client'

import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { SizingJournalEntry } from './types/sizing-journal-entry'

interface DeleteConfirmDialogProps {
  experience: SizingJournalEntry | null
  isOpen: boolean
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmDialog({
  experience,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel
}: DeleteConfirmDialogProps) {
  if (!isOpen || !experience) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-900 font-heading">Delete Item</h3>
            <p className="text-sm text-slate-500">This action cannot be undone.</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 mb-6">
          <div className="font-medium text-slate-900">
            {experience.brand} {experience.model}
          </div>
          <div className="text-sm text-slate-600">
            {experience.color !== 'Standard' && experience.color && (
              <span>{experience.color} • </span>
            )}
            {experience.has_been_tried ? 'Tried On' : 'Spotted'}
            {experience.size_tried && ` • Size ${experience.size_tried}`}
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete this Item? This will permanently remove it from your Inventory and analytics.
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex-1"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
