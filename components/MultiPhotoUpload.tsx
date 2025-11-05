'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, X, GripVertical, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PhotoItem } from '@/components/types/photo-item'

interface MultiPhotoUploadProps {
  photos: PhotoItem[]
  onPhotosChange: (photos: PhotoItem[]) => void
  maxPhotos?: number
  className?: string
}

interface SortablePhotoProps {
  photo: PhotoItem
  index: number
  onRemove: (id: string) => void
  onSetMain: (id: string) => void
}

function SortablePhoto({ photo, index, onRemove, onSetMain }: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative overflow-hidden transition-transform ${isDragging ? 'z-10 rotate-2 scale-105 shadow-lg' : ''}`}
    >
      <CardContent className="p-0">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-1.5 left-1.5 z-10 p-0.5 bg-slate-900/50 rounded cursor-grab active:cursor-grabbing hover:bg-slate-900/70 transition-colors"
        >
          <GripVertical className="h-3.5 w-3.5 text-white" />
        </div>

        {/* Main Photo Badge */}
        {photo.isMain && (
          <div className="absolute top-1 left-0 right-0 z-10 flex items-center justify-center">
            <Badge className="bg-sun-400 text-slate-900 px-1.5 py-0.5 text-[10px] font-semibold shadow-sm">
              Main
            </Badge>
          </div>
        )}

        {/* Remove Button */}
        <Button
          variant="destructive"
          className="absolute top-1.5 right-1.5 z-10 size-6 p-0 rounded-full hover:scale-105 transition-transform focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          title="Remove photo"
          aria-label="Remove photo"
          onClick={() => onRemove(photo.id)}
        >
          <X className="h-3 w-3" />
        </Button>

        {/* Photo */}
        <div className="aspect-square relative">
          <img
            src={photo.preview}
            alt={`Upload ${index + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Set Main Photo Overlay */}
          {!photo.isMain && (
            <div
              className="absolute inset-0 bg-slate-900/0 hover:bg-slate-900/20 transition-colors cursor-pointer flex items-center justify-center group"
              onClick={() => onSetMain(photo.id)}
            >
              <Button
                variant="default"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
              >
                Set Main
              </Button>
            </div>
          )}
        </div>

        {/* Photo Info */}
        <div className={`p-2 text-xs ${photo.isExisting ? 'bg-blue-50 text-blue-700' : 'bg-stone-50 text-slate-600'}`}>
          <div className="flex items-center justify-between">
            <span className="truncate font-medium">{photo.file?.name || 'Existing photo'}</span>
            <span>#{photo.order}</span>
          </div>
          {photo.isExisting && (
            <span className="text-xs text-blue-600 mt-1 block">From database</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function MultiPhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  className = ""
}: MultiPhotoUploadProps) {
  const [draggedOver, setDraggedOver] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleFileSelect = useCallback((files: FileList) => {
    const newFiles = Array.from(files).filter(file => {
      // Only accept image files
      return file.type.startsWith('image/')
    })

    if (newFiles.length === 0) return

    // Check if adding new files would exceed max photos
    const remainingSlots = maxPhotos - photos.length
    if (remainingSlots <= 0) return

    const filesToAdd = newFiles.slice(0, remainingSlots)

    const newPhotos: PhotoItem[] = filesToAdd.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      isMain: photos.length === 0 && index === 0, // First photo of empty list becomes main
      order: photos.length + index + 1
    }))

    onPhotosChange([...photos, ...newPhotos])
  }, [photos, onPhotosChange, maxPhotos])

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFileSelect(event.target.files)
    }
  }

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDraggedOver(false)

    if (event.dataTransfer.files) {
      handleFileSelect(event.dataTransfer.files)
    }
  }, [handleFileSelect])

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDraggedOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDraggedOver(false)
  }

  const removePhoto = (photoId: string) => {
    const photoToRemove = photos.find(p => p.id === photoId)
    const updatedPhotos = photos
      .filter(p => p.id !== photoId)
      .map((photo, index) => ({
        ...photo,
        order: index + 1,
        // If we removed the main photo, make the first remaining photo main
        isMain: photoToRemove?.isMain && index === 0 ? true : photo.isMain && !photoToRemove?.isMain
      }))

    // Clean up preview URL
    if (photoToRemove) {
      URL.revokeObjectURL(photoToRemove.preview)
    }

    onPhotosChange(updatedPhotos)
  }

  const setMainPhoto = (photoId: string) => {
    const updatedPhotos = photos.map(photo => ({
      ...photo,
      isMain: photo.id === photoId
    }))
    onPhotosChange(updatedPhotos)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex(photo => photo.id === active.id)
      const newIndex = photos.findIndex(photo => photo.id === over.id)

      const reorderedPhotos = arrayMove(photos, oldIndex, newIndex)

      // Update order numbers
      const updatedPhotos = reorderedPhotos.map((photo, index) => ({
        ...photo,
        order: index + 1
      }))

      onPhotosChange(updatedPhotos)
    }
  }

  const remainingSlots = maxPhotos - photos.length

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {remainingSlots > 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${draggedOver
              ? 'border-sun-400 bg-sun-50'
              : 'border-stone-300 hover:border-stone-400'
            }
          `}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-2">
            <Upload className="mx-auto h-8 w-8 text-slate-400" />
            <div className="text-sm text-slate-600">
              <span className="font-medium">Click to upload</span> or drag and drop
            </div>
            <div className="text-xs text-slate-500">
              PNG, JPG, GIF up to 10MB each ({remainingSlots} of {maxPhotos} slots remaining)
            </div>
          </div>
        </div>
      )}

      {/* Max Photos Warning */}
      {photos.length >= maxPhotos && (
        <Alert className=''>
          <AlertCircle className="h-4 w-4 " />
          <AlertDescription>
            Maximum of {maxPhotos} photos reached. Remove a photo to add more.
          </AlertDescription>
        </Alert>
      )}

      {/* Photo Grid with Drag and Drop */}
      {photos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Photos ({photos.length}/{maxPhotos})</h4>
            <div className="text-xs text-slate-500">
              <GripVertical className="inline h-3 w-3 mr-1" />
              Drag handle to reorder
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={photos.map(p => p.id)} strategy={rectSortingStrategy}>
              <div className="dense grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {photos.map((photo, index) => (
                  <SortablePhoto
                    key={photo.id}
                    photo={photo}
                    index={index}
                    onRemove={removePhoto}
                    onSetMain={setMainPhoto}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && remainingSlots === maxPhotos && (
        <div className="text-center py-8">
          <ImageIcon className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No photos yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            Upload up to {maxPhotos} photos of your item
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-slate-500 p-3 bg-stone-50 rounded-lg">
        <div className="flex items-start gap-2">
          <GripVertical className="h-3 w-3 mt-0.5 text-slate-400" />
          <div>
            <strong>How to reorder:</strong> Click and hold the grip handle (⋮⋮) in the top-left corner of any photo, then drag to reorder.
          </div>
        </div>
      </div>
    </div>
  )
}