'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  images: string[]
  onConfirm: (selectedImages: string[], mainImageIndex: number) => void
}

export function ImageConfirmationModal({ open, onOpenChange, images, onConfirm }: ImageConfirmationModalProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>(images)
  const [mainImageIndex, setMainImageIndex] = useState(0)

  const toggleImageSelection = (image: string) => {
    if (selectedImages.includes(image)) {
      // Don't allow deselecting if it's the only image
      if (selectedImages.length === 1) return

      const newSelected = selectedImages.filter(img => img !== image)
      setSelectedImages(newSelected)

      // If we deselected the main image, set main to first selected
      if (image === selectedImages[mainImageIndex]) {
        setMainImageIndex(0)
      }
    } else {
      setSelectedImages([...selectedImages, image])
    }
  }

  const handleConfirm = () => {
    onConfirm(selectedImages, mainImageIndex)
    onOpenChange(false)
  }

  const handleSkip = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Select Product Images</DialogTitle>
          <DialogDescription>
            Choose which images to import and select your main product image
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-[var(--space-base)] py-[var(--space-base)]">
          {images.map((image, index) => {
            const isSelected = selectedImages.includes(image)
            const isMain = isSelected && selectedImages[mainImageIndex] === image

            return (
              <div
                key={index}
                className={cn(
                  "relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                  isSelected ? "border-blue-500" : "border-gray-200 hover:border-gray-300",
                  isMain && "ring-2 ring-blue-600 ring-offset-2"
                )}
                onClick={() => toggleImageSelection(image)}
              >
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="w-full h-40 object-cover"
                />

                {/* Selection Checkbox */}
                <div className={cn(
                  "absolute top-[var(--space-md)] left-[var(--space-md)] w-[var(--space-lg)] h-[var(--space-lg)] rounded-full flex items-center justify-center transition-all",
                  isSelected ? "bg-blue-600" : "bg-white/80 border border-gray-300"
                )}>
                  {isSelected && <CheckCircle className="h-4 w-4 text-white" />}
                </div>

                {/* Main Image Badge */}
                {isMain && (
                  <div className="absolute top-[var(--space-md)] right-[var(--space-md)] bg-blue-600 text-white text-xs px-[var(--space-md)] py-[var(--space-xs)] rounded">
                    Main
                  </div>
                )}

                {/* Set as Main Button (only show for selected images) */}
                {isSelected && !isMain && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const index = selectedImages.indexOf(image)
                      setMainImageIndex(index)
                    }}
                    className="absolute bottom-[var(--space-md)] right-[var(--space-md)] bg-white/90 hover:bg-white text-xs px-[var(--space-md)] py-[var(--space-xs)] rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Set as Main
                  </button>
                )}

                {/* Deselect Button (only show when more than 1 selected) */}
                {isSelected && selectedImages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleImageSelection(image)
                    }}
                    className="absolute top-[var(--space-md)] right-[var(--space-md)] bg-red-500 hover:bg-red-600 text-white p-[var(--space-xs)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedImages.length} of {images.length} selected
          </div>
          <div className="flex gap-[var(--space-md)]">
            <Button variant="outline" onClick={handleSkip}>
              Skip Import
            </Button>
            <Button onClick={handleConfirm} disabled={selectedImages.length === 0}>
              Import {selectedImages.length} Image{selectedImages.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}