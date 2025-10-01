'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Edit, Loader2, Upload, X, GripVertical } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { MultiPhotoUpload } from './multi-photo-upload'
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
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Schema for journal entry editing
const sneakerSchema = z.object({
  userName: z.enum(['Kenny', 'Rene'], { required_error: 'Select who is tracking this sneaker' }),
  interactionType: z.enum(['seen', 'tried'], { required_error: 'Select your experience' }),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  colorway: z.string().optional(),
  // Try-on specific (conditional)
  sizeTried: z.string().optional(),
  comfortRating: z.coerce.number().min(1).max(5).optional(),
  // General fields
  storeName: z.string().optional(),
  retailPrice: z.string().optional(),
  idealPrice: z.string().optional(),
  notes: z.string().max(80).optional()
}).refine((data) => {
  if (data.interactionType === 'tried') {
    return data.sizeTried
  }
  return true
}, {
  message: "Size is required when you've tried the sneaker",
  path: ["sizeTried"]
})

type SneakerFormData = z.infer<typeof sneakerSchema>

interface PhotoItem {
  id: string
  file: File
  preview: string
  isMain: boolean
  order: number
}

interface ExistingPhoto {
  id: string
  image_url: string
  image_order: number
  is_main_image: boolean
}

// Common sizes with EU and Women's equivalents (US Men's 3.5 - 10.5)
const COMMON_SIZES = [
  { us: '3.5', women: '5', eu: '35.5' },
  { us: '4', women: '5.5', eu: '36' },
  { us: '4.5', women: '6', eu: '37' },
  { us: '5', women: '6.5', eu: '37.5' },
  { us: '5.5', women: '7', eu: '38' },
  { us: '6', women: '7.5', eu: '38.5' },
  { us: '6.5', women: '8', eu: '39' },
  { us: '7', women: '8.5', eu: '40' },
  { us: '7.5', women: '9', eu: '40.5' },
  { us: '8', women: '9.5', eu: '41' },
  { us: '8.5', women: '10', eu: '42' },
  { us: '9', women: '10.5', eu: '42.5' },
  { us: '9.5', women: '11', eu: '43' },
  { us: '10', women: '11.5', eu: '44' },
  { us: '10.5', women: '12', eu: '44.5' }
]


interface EditSneakerModalProps {
  experience: any
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

// Sortable photo component for existing photos
function SortableExistingPhoto({ photo, index, onSetMain, onDelete }: {
  photo: ExistingPhoto
  index: number
  onSetMain: (id: string) => void
  onDelete: (id: string) => void
}) {
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
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-10' : ''}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 z-10 p-1 bg-black/50 rounded cursor-grab active:cursor-grabbing hover:bg-black/70 transition-colors"
      >
        <GripVertical className="h-3 w-3 text-white" />
      </div>

      <img
        src={photo.image_url}
        alt={`Photo ${index + 1}`}
        className="w-full aspect-square object-cover rounded-lg"
      />

      {photo.is_main_image && (
        <div className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded z-10">
          Main
        </div>
      )}

      <div className="absolute top-1 right-1 flex gap-1">
        {!photo.is_main_image && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] z-10"
            onClick={() => onSetMain(photo.id)}
          >
            ★
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant="destructive"
          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={() => onDelete(photo.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

export function EditSneakerModal({ experience, isOpen, onClose, onSave }: EditSneakerModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([])
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState('')

  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    watch,
    trigger
  } = useForm<SneakerFormData>({
    resolver: zodResolver(sneakerSchema),
    mode: 'onChange'
  })

  const watchedInteractionType = watch('interactionType')

  // Populate form with existing data when modal opens
  useEffect(() => {
    if (isOpen && experience) {
      setValue('userName', experience.user_name)
      setValue('interactionType', experience.interaction_type)
      setValue('brand', experience.brand)
      setValue('model', experience.model)
      setValue('colorway', experience.colorway || '')
      setValue('sizeTried', experience.size_tried || '')
      setValue('comfortRating', experience.comfort_rating || undefined)
      setValue('storeName', experience.store_name || '')
      setValue('retailPrice', experience.retail_price?.toString() || '')
      setValue('idealPrice', experience.ideal_price?.toString() || '')
      setValue('notes', experience.notes || '')

      // Load existing photos from sneaker_photos
      if (experience.sneaker_photos && experience.sneaker_photos.length > 0) {
        setExistingPhotos(experience.sneaker_photos)
      } else {
        setExistingPhotos([])
      }

      // Reset new photos and deletion list
      setPhotos([])
      setPhotosToDelete([])

      // Trigger validation after setting values
      setTimeout(() => trigger(), 100)
    }
  }, [isOpen, experience, setValue, trigger])

  const handleExistingPhotosDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setExistingPhotos((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)

        const reordered = arrayMove(items, oldIndex, newIndex)

        // Update order numbers
        return reordered.map((item, index) => ({
          ...item,
          image_order: index + 1
        }))
      })
    }
  }

  const handleSetMainPhoto = (photoId: string) => {
    setExistingPhotos(prev => prev.map(p => ({
      ...p,
      is_main_image: p.id === photoId
    })))
  }

  const handleDeleteExistingPhoto = (photoId: string) => {
    setPhotosToDelete(prev => [...prev, photoId])
    setExistingPhotos(prev => {
      const filtered = prev.filter(p => p.id !== photoId)
      // If we deleted the main photo, make first remaining photo main
      const deletedPhoto = prev.find(p => p.id === photoId)
      if (deletedPhoto?.is_main_image && filtered.length > 0) {
        filtered[0].is_main_image = true
      }
      return filtered
    })
  }

  const onSubmit = async (data: SneakerFormData) => {
    setIsLoading(true)
    setSuccessMessage('')

    try {
      // Step 1: Upload new photos to Cloudinary
      const uploadedPhotos: Array<{ url: string; publicId: string; order: number; isMain: boolean }> = []

      if (photos.length > 0) {
        setUploadProgress(`📤 Uploading ${photos.length} photo(s)...`)

        for (const photo of photos) {
          const formData = new FormData()
          formData.append('file', photo.file)

          const uploadResponse = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData
          })

          if (!uploadResponse.ok) {
            const error = await uploadResponse.json()
            throw new Error(error.error || 'Failed to upload image')
          }

          const uploadResult = await uploadResponse.json()
          uploadedPhotos.push({
            url: uploadResult.data.url,
            publicId: uploadResult.data.publicId,
            order: photo.order,
            isMain: photo.isMain
          })
        }

        setUploadProgress('✅ Photos uploaded!')
      }

      // Step 2: Update the main entry data
      const experienceData = {
        user_name: data.userName,
        brand: data.brand,
        model: data.model,
        colorway: data.colorway || 'Standard',
        interaction_type: data.interactionType,
        size_tried: data.interactionType === 'tried' ? data.sizeTried : null,
        comfort_rating: data.interactionType === 'tried' ? (data.comfortRating || null) : null,
        store_name: data.storeName || null,
        retail_price: data.retailPrice ? parseFloat(data.retailPrice) : null,
        ideal_price: data.idealPrice ? parseFloat(data.idealPrice) : null,
        notes: data.notes || null,
        interested_in_buying: true,
        try_on_date: new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('sneakers')
        .update(experienceData)
        .eq('id', experience.id)

      if (updateError) {
        console.error('Database error:', updateError)
        throw updateError
      }

      // Step 3: Delete photos marked for deletion
      if (photosToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('sneaker_photos')
          .delete()
          .in('id', photosToDelete)

        if (deleteError) {
          console.error('Error deleting photos:', deleteError)
        }
      }

      // Step 4: Update existing photos (main status and order)
      for (const existingPhoto of existingPhotos) {
        const { error: photoUpdateError } = await supabase
          .from('sneaker_photos')
          .update({
            is_main_image: existingPhoto.is_main_image,
            image_order: existingPhoto.image_order
          })
          .eq('id', existingPhoto.id)

        if (photoUpdateError) {
          console.error('Error updating photo:', photoUpdateError)
        }
      }

      // Step 5: Insert new photos
      if (uploadedPhotos.length > 0) {
        const newPhotoRecords = uploadedPhotos.map(photo => ({
          sneaker_id: experience.id,
          image_url: photo.url,
          cloudinary_id: photo.publicId,
          image_order: photo.order + existingPhotos.length,
          is_main_image: photo.isMain && existingPhotos.length === 0 // Only set main if no existing photos
        }))

        const { error: insertError } = await supabase
          .from('sneaker_photos')
          .insert(newPhotoRecords)

        if (insertError) {
          console.error('Error inserting photos:', insertError)
          throw insertError
        }
      }

      setSuccessMessage('✅ Journal entry updated successfully!')

      // Close modal and refresh after 1 second
      setTimeout(() => {
        setSuccessMessage('')
        setUploadProgress('')
        onSave()
        onClose()
      }, 1000)

    } catch (error: any) {
      console.error('Error updating journal entry:', error)
      setSuccessMessage('')
      setUploadProgress('')
      alert(`Failed to update: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0">
          <CardHeader className="text-center relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-2 top-2"
            >
              <X className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Edit className="h-6 w-6 text-blue-500" />
              Edit Journal Entry
            </CardTitle>
            <p className="text-sm text-gray-600">Update your sizing journal entry</p>
          </CardHeader>

          <CardContent>
            {successMessage && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* User Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Who's tracking this sneaker?</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button
                    type="button"
                    variant={watch('userName') === 'Kenny' ? 'default' : 'outline'}
                    onClick={() => setValue('userName', 'Kenny')}
                    className="h-12 text-base"
                  >
                    👤 Kenny
                  </Button>
                  <Button
                    type="button"
                    variant={watch('userName') === 'Rene' ? 'default' : 'outline'}
                    onClick={() => setValue('userName', 'Rene')}
                    className="h-12 text-base"
                  >
                    👤 Rene
                  </Button>
                </div>
              </div>

              {/* Interaction Type */}
              <div>
                <Label className="text-sm font-medium text-gray-700">What's your experience with this sneaker?</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button
                    type="button"
                    variant={watchedInteractionType === 'seen' ? 'default' : 'outline'}
                    onClick={() => setValue('interactionType', 'seen')}
                    className="h-16 flex flex-col items-center justify-center p-2"
                  >
                    <span className="text-lg mb-1">👀</span>
                    <span className="text-sm font-medium">Seen</span>
                    <span className="text-xs text-gray-500">Online or in store</span>
                  </Button>
                  <Button
                    type="button"
                    variant={watchedInteractionType === 'tried' ? 'default' : 'outline'}
                    onClick={() => setValue('interactionType', 'tried')}
                    className="h-16 flex flex-col items-center justify-center p-2"
                  >
                    <span className="text-lg mb-1">👟</span>
                    <span className="text-sm font-medium">Tried On</span>
                    <span className="text-xs text-gray-500">Worn & tested</span>
                  </Button>
                </div>
              </div>

              {/* Brand and Model */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Brand</Label>
                  <Input
                    {...register('brand')}
                    placeholder="Nike, Adidas, etc."
                    className="mt-2"
                  />
                  {errors.brand && (
                    <p className="text-xs text-red-600 mt-1">{errors.brand.message}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Model</Label>
                  <Input
                    {...register('model')}
                    placeholder="Air Jordan 1, etc."
                    className="mt-2"
                  />
                  {errors.model && (
                    <p className="text-xs text-red-600 mt-1">{errors.model.message}</p>
                  )}
                </div>
              </div>

              {/* Try-On Specific Fields */}
              {watchedInteractionType === 'tried' && (
                <>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Size Tried</Label>
                    <Select onValueChange={(value) => setValue('sizeTried', value)} value={watch('sizeTried')}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_SIZES.map((size) => (
                          <SelectItem key={size.us} value={size.us}>
                            <div className="flex flex-col">
                              <span>US M {size.us} / W {size.women}</span>
                              <span className="text-xs text-gray-500">EU {size.eu}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.sizeTried && (
                      <p className="text-xs text-red-600 mt-1">{errors.sizeTried.message}</p>
                    )}
                  </div>
                </>
              )}

              {/* Optional Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Colorway</Label>
                  <Input
                    {...register('colorway')}
                    placeholder="Bred, Chicago, etc."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Store</Label>
                  <Input
                    {...register('storeName')}
                    placeholder="Foot Locker, etc."
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Retail Price ($)</Label>
                  <Input
                    {...register('retailPrice')}
                    placeholder="170.00"
                    type="number"
                    step="0.01"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Ideal Price ($)</Label>
                  <Input
                    {...register('idealPrice')}
                    placeholder="120.00"
                    type="number"
                    step="0.01"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Price you'd be willing to pay</p>
                </div>
              </div>

              {watchedInteractionType === 'tried' && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Comfort Rating</Label>
                  <Select onValueChange={(value) => setValue('comfortRating', parseInt(value))} value={watch('comfortRating')?.toString()}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="1-5" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} {rating === 1 ? '(Uncomfortable)' : rating === 5 ? '(Very Comfortable)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Existing Photos Management */}
              {existingPhotos.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Current Photos - Drag to reorder
                  </Label>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleExistingPhotosDragEnd}
                  >
                    <SortableContext items={existingPhotos.map(p => p.id)} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {existingPhotos.map((photo, index) => (
                          <SortableExistingPhoto
                            key={photo.id}
                            photo={photo}
                            index={index}
                            onSetMain={handleSetMainPhoto}
                            onDelete={handleDeleteExistingPhoto}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}

              {/* Multi Photo Upload */}
              <div>
                <MultiPhotoUpload
                  photos={photos}
                  onPhotosChange={setPhotos}
                  maxPhotos={5 - existingPhotos.length}
                />
              </div>

              {/* Upload Progress */}
              {uploadProgress && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">{uploadProgress}</AlertDescription>
                </Alert>
              )}

              {/* Notes */}
              <div>
                <Label className="text-sm font-medium text-gray-700">💭 Notes</Label>
                <Textarea
                  {...register('notes')}
                  placeholder="How did they feel? Any thoughts? Comparisons?"
                  className="mt-2 resize-none"
                  rows={3}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading || !isValid}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    '✅ Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}