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
import { CheckCircle, Loader2, Upload, X, Camera, User, Eye, Footprints, AlertTriangle, Star, Sparkles } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { MultiPhotoUpload } from './multi-photo-upload'
import { BrandCombobox } from './brand-combobox'
import { SizeCombobox } from './size-combobox'
import { cn } from '@/lib/utils'

// Schema for journal entry editing
const sneakerSchema = z.object({
  userName: z.enum(['Kenny', 'Rene'], {
    required_error: 'Please select who is tracking this sneaker'
  }),
  interactionType: z.enum(['seen', 'tried'], {
    required_error: 'Please select whether you saw or tried on this sneaker'
  }),
  brand: z.string()
    .min(1, 'Please select or enter a brand name')
    .max(50, 'Brand name must be less than 50 characters')
    .trim(),
  model: z.string()
    .min(2, 'Please enter the sneaker model (e.g., Air Jordan 1, Yeezy 350)')
    .max(100, 'Model name must be less than 100 characters')
    .trim(),
  sku: z.string()
    .max(50, 'SKU must be less than 50 characters')
    .regex(/^[A-Za-z0-9-]*$/, 'SKU can only contain letters, numbers, and hyphens')
    .optional()
    .or(z.literal('')),
  colorway: z.string()
    .max(100, 'Colorway must be less than 100 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  // Try-on specific (conditional)
  sizeTried: z.string().optional(),
  comfortRating: z.coerce.number().min(1).max(5).optional(),
  // General fields
  retailPrice: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Please enter a valid price (e.g., 170 or 170.00)')
    .refine((val) => {
      if (val === '') return true;
      const price = parseFloat(val);
      return price >= 0 && price <= 10000;
    }, 'Price must be between $0 and $10,000')
    .optional()
    .or(z.literal('')),
  salePrice: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Please enter a valid price (e.g., 120 or 120.00)')
    .refine((val) => {
      if (val === '') return true;
      const price = parseFloat(val);
      return price >= 0 && price <= 10000;
    }, 'Price must be between $0 and $10,000')
    .optional()
    .or(z.literal('')),
  idealPrice: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Please enter a valid price (e.g., 100 or 100.00)')
    .refine((val) => {
      if (val === '') return true;
      const price = parseFloat(val);
      return price >= 0 && price <= 10000;
    }, 'Price must be between $0 and $10,000')
    .optional()
    .or(z.literal('')),
  purchasePrice: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Please enter a valid price (e.g., 150 or 150.00)')
    .refine((val) => {
      if (val === '') return true;
      const price = parseFloat(val);
      return price >= 0 && price <= 10000;
    }, 'Price must be between $0 and $10,000')
    .optional()
    .or(z.literal('')),
  notes: z.string()
    .max(80, 'Notes must be less than 80 characters')
    .trim()
    .optional()
    .or(z.literal(''))
}).refine((data) => {
  // Size is required when tried on
  if (data.interactionType === 'tried') {
    return data.sizeTried && data.sizeTried.length > 0;
  }
  return true;
}, {
  message: "Please select the size you tried on - this helps track your perfect fit",
  path: ["sizeTried"]
}).refine((data) => {
  // Comfort rating is required when tried on
  if (data.interactionType === 'tried') {
    return data.comfortRating !== undefined && data.comfortRating >= 1 && data.comfortRating <= 5;
  }
  return true;
}, {
  message: "Please rate the comfort - how did they feel on your feet?",
  path: ["comfortRating"]
}).refine((data) => {
  // Sale price cannot be higher than retail price
  if (data.retailPrice && data.salePrice) {
    const retail = parseFloat(data.retailPrice);
    const sale = parseFloat(data.salePrice);
    return sale <= retail;
  }
  return true;
}, {
  message: 'Sale price cannot be higher than retail price',
  path: ['salePrice']
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
  cloudinary_id?: string
  image_order: number
  is_main_image: boolean
}

interface EditSneakerModalProps {
  experience: any
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function EditSneakerModal({ experience, isOpen, onClose, onSave }: EditSneakerModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([])
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState('')
  const [sizePreferences, setSizePreferences] = useState<Record<string, string>>({})
  const [isFormReady, setIsFormReady] = useState(false)

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
    reset
  } = useForm<SneakerFormData>({
    resolver: zodResolver(sneakerSchema),
    mode: 'onBlur'
  })

  const watchedUser = watch('userName')
  const watchedBrand = watch('brand')
  const watchedInteractionType = watch('interactionType')
  const watchedRetailPrice = watch('retailPrice')
  const watchedSalePrice = watch('salePrice')

  // Calculate discount percentage
  const discountPercentage =
    watchedRetailPrice && watchedSalePrice
      ? Math.round(
          ((parseFloat(watchedRetailPrice) - parseFloat(watchedSalePrice)) /
            parseFloat(watchedRetailPrice)) *
            100
        )
      : 0

  // Load size preferences when user/brand changes
  useEffect(() => {
    if (watchedUser && watchedBrand) {
      loadSizePreference(watchedUser, watchedBrand)
    }
  }, [watchedUser, watchedBrand])

  const loadSizePreference = async (userName: string, brand: string) => {
    try {
      const { data } = await supabase
        .from('size_preferences')
        .select('preferred_size')
        .eq('user_name', userName)
        .eq('brand', brand)
        .single()

      if (data?.preferred_size) {
        setSizePreferences({ [brand]: data.preferred_size })
      }
    } catch (error) {
      // No preference found, that's okay
    }
  }

  // Populate form with existing data when modal opens
  useEffect(() => {
    if (isOpen && experience) {
      console.log('Loading experience data:', experience)

      setIsFormReady(false)

      // Reset the form with new values
      reset({
        userName: experience.user_name,
        interactionType: experience.interaction_type || 'seen',
        brand: experience.brand,
        model: experience.model,
        sku: experience.sku || '',
        colorway: experience.colorway || '',
        sizeTried: experience.size_tried || '',
        comfortRating: experience.comfort_rating || undefined,
        storeName: experience.store_name || '',
        retailPrice: experience.retail_price?.toString() || '',
        salePrice: experience.sale_price?.toString() || '',
        idealPrice: experience.ideal_price?.toString() || '',
        purchasePrice: experience.purchase_price?.toString() || '',
        notes: experience.notes || ''
      })

      // Load existing photos from sneaker_photos
      if (experience.sneaker_photos && experience.sneaker_photos.length > 0) {
        setExistingPhotos(experience.sneaker_photos)
      } else {
        setExistingPhotos([])
      }

      // Reset new photos and deletion list
      setPhotos([])
      setPhotosToDelete([])

      // Mark form as ready after data is loaded
      setTimeout(() => setIsFormReady(true), 0)
    } else if (!isOpen) {
      setIsFormReady(false)
    }
  }, [isOpen, experience, reset])

  const onSubmit = async (data: SneakerFormData) => {
    setIsLoading(true)
    setSuccessMessage('')

    try {
      let mainImageUrl = null
      let mainCloudinaryId = null
      const uploadedPhotos = []

      // Upload all new photos to Cloudinary if provided
      if (photos.length > 0) {
        setUploadProgress(
          `📤 Uploading ${photos.length} photo${photos.length > 1 ? 's' : ''}...`
        )

        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i]
          const formData = new FormData()
          formData.append('file', photo.file)

          const uploadResponse = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData
          })

          if (!uploadResponse.ok) {
            const error = await uploadResponse.json()
            throw new Error(error.error || `Failed to upload photo ${i + 1}`)
          }

          const uploadResult = await uploadResponse.json()

          uploadedPhotos.push({
            url: uploadResult.data.url,
            cloudinaryId: uploadResult.data.publicId,
            order: photo.order + existingPhotos.length,
            isMain: photo.isMain && existingPhotos.length === 0
          })

          if (photo.isMain && existingPhotos.length === 0) {
            mainImageUrl = uploadResult.data.url
            mainCloudinaryId = uploadResult.data.publicId
          }

          setUploadProgress(`📤 Uploaded ${i + 1}/${photos.length} photo${photos.length > 1 ? 's' : ''}...`)
        }

        setUploadProgress(`✅ ${photos.length} photo${photos.length > 1 ? 's' : ''} uploaded!`)
      }

      // Update the main entry data
      const experienceData = {
        user_name: data.userName,
        brand: data.brand,
        model: data.model,
        colorway: data.colorway || 'Standard',
        sku: data.sku || null,
        interaction_type: data.interactionType,
        size_tried: data.interactionType === 'tried' ? data.sizeTried : null,
        comfort_rating: data.interactionType === 'tried' ? (data.comfortRating || null) : null,
        retail_price: data.retailPrice ? parseFloat(data.retailPrice) : null,
        purchase_price: data.purchasePrice ? parseFloat(data.purchasePrice) : null,
        ideal_price: data.idealPrice ? parseFloat(data.idealPrice) : null,
        notes: data.notes || null,
        interested_in_buying: true,
        // Keep existing main image if no new main was uploaded
        ...(mainImageUrl && { image_url: mainImageUrl, cloudinary_id: mainCloudinaryId })
      }

      const { error: updateError } = await supabase
        .from('sneakers')
        .update(experienceData)
        .eq('id', experience.id)

      if (updateError) {
        console.error('Database error:', updateError)
        throw updateError
      }

      // Delete photos marked for deletion from Cloudinary and DB
      if (photosToDelete.length > 0) {
        for (const photoId of photosToDelete) {
          const photoToDelete = experience.sneaker_photos?.find((p: any) => p.id === photoId)

          // Delete from Cloudinary if cloudinary_id exists
          if (photoToDelete?.cloudinary_id) {
            try {
              await fetch('/api/delete-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ publicId: photoToDelete.cloudinary_id })
              })
            } catch (imageError) {
              console.warn('Error deleting image from Cloudinary:', imageError)
            }
          }
        }

        // Delete from DB
        const { error: deleteError } = await supabase
          .from('sneaker_photos')
          .delete()
          .in('id', photosToDelete)

        if (deleteError) {
          console.error('Error deleting photos:', deleteError)
        }
      }

      // Update existing photos (main status and order)
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

      // Insert new photos
      if (uploadedPhotos.length > 0) {
        const newPhotoRecords = uploadedPhotos.map(photo => ({
          sneaker_id: experience.id,
          image_url: photo.url,
          cloudinary_id: photo.cloudinaryId,
          image_order: photo.order,
          is_main_image: photo.isMain
        }))

        const { error: insertError } = await supabase
          .from('sneaker_photos')
          .insert(newPhotoRecords)

        if (insertError) {
          console.error('Error inserting photos:', insertError)
          throw insertError
        }
      }

      setSuccessMessage('✅ Entry updated successfully!')

      // Close modal and refresh after 1.5 seconds
      setTimeout(() => {
        setSuccessMessage('')
        setUploadProgress('')
        reset()
        onSave()
        onClose()
      }, 1500)

    } catch (error: any) {
      console.error('Error updating journal entry:', error)
      setSuccessMessage('')
      setUploadProgress('')
      alert(`Failed to update: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Convert existing photos to PhotoItem format for MultiPhotoUpload preview
  const combinedPhotos = [
    ...existingPhotos.map(photo => ({
      id: photo.id,
      file: null as any, // Existing photos don't have file
      preview: photo.image_url,
      isMain: photo.is_main_image,
      order: photo.image_order
    })),
    ...photos
  ]

  const handlePhotosChange = (newPhotos: PhotoItem[]) => {
    // Separate existing and new photos
    const existing = newPhotos.filter(p => existingPhotos.some(ep => ep.id === p.id))
    const newOnes = newPhotos.filter(p => !existingPhotos.some(ep => ep.id === p.id))

    // Update existing photos
    setExistingPhotos(existing.map((p, i) => ({
      id: p.id,
      image_url: p.preview,
      cloudinary_id: existingPhotos.find(ep => ep.id === p.id)?.cloudinary_id,
      image_order: i,
      is_main_image: p.isMain
    })))

    // Update new photos
    setPhotos(newOnes)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen p-4 py-8">
        <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <Card className="border-0">
          <CardHeader className="text-left pb-6 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </Button>
            <CardTitle className="text-3xl flex flex-col justify-start">
              <p className="-mb-2">Edit Your Entry</p>
              <p className="text-sm text-gray-600 font-normal">
                Update your sizing journal entry
              </p>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {successMessage && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-[var(--space-lg)]">
              {/* User and Experience Dropdowns */}
              {isFormReady && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-base)] pb-[var(--space-base)]">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-[var(--space-md)]">
                      {/* <User className="h-3 w-3 text-blue-600" /> */}
                      Who's tracking? <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value: "Kenny" | "Rene") => setValue("userName", value, { shouldValidate: true })}
                      value={watchedUser}
                    >
                      <SelectTrigger className="h-4 mt-[var(--space-md)] max-w-xs">
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kenny">Kenny</SelectItem>
                        <SelectItem value="Rene">Rene</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.userName && (
                      <div className="mt-[var(--space-md)] p-[var(--space-md)] bg-red-50 border border-red-200 rounded flex items-start gap-[var(--space-md)]">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs font-semibold text-red-700">{errors.userName.message}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-[var(--space-md)]">
                      Experience <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value: "seen" | "tried") => setValue("interactionType", value, { shouldValidate: true })}
                      value={watchedInteractionType}
                    >
                      <SelectTrigger className="h-4 mt-[var(--space-md)] max-w-sm">
                        <SelectValue placeholder="Select experience type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seen">
                          <div className="flex items-center gap-[var(--space-md)]">
                            <Eye className="h-2 w-2" />
                            <span>Seen - Online or in store</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="tried">
                          <div className="flex items-center gap-[var(--space-md)]">
                            <Footprints className="h-2 w-2" />
                            <span>Tried On - Worn & tested</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.interactionType && (
                      <div className="mt-[var(--space-md)] p-[var(--space-md)] bg-red-50 border border-red-200 rounded flex items-start gap-[var(--space-md)]">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs font-semibold text-red-700">{errors.interactionType.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Product Details Section */}
              <h3 className="font-semibold text-gray-700 border-b pb-[var(--space-md)]">Product Details</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-lg)]">
                {/* LEFT COLUMN */}
                <div className="space-y-[var(--space-base)]">
                  {/* Model */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Model <span className="text-red-500">*</span></Label>
                    <Input
                      {...register("model")}
                      placeholder="Air Jordan 1, Air Max 90, etc."
                      className="mt-[var(--space-md)] h-6"
                    />
                    {errors.model && (
                      <div className="mt-[var(--space-md)] p-[var(--space-md)] bg-red-50 border border-red-200 rounded flex items-start gap-[var(--space-md)]">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs font-semibold text-red-700">{errors.model.message}</p>
                      </div>
                    )}
                  </div>

                  {/* Brand */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Brand <span className="text-red-500">*</span></Label>
                    <div className="mt-[var(--space-md)] max-w-xs">
                      <BrandCombobox
                        value={watchedBrand}
                        onChange={(value) =>
                          setValue("brand", value, {
                            shouldValidate: true,
                            shouldDirty: true,
                            shouldTouch: true
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>
                    {errors.brand && (
                      <div className="mt-[var(--space-md)] p-[var(--space-md)] bg-red-50 border border-red-200 rounded flex items-start gap-[var(--space-md)]">
                        <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs font-semibold text-red-700">{errors.brand.message}</p>
                      </div>
                    )}
                  </div>

                  {/* SKU */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">SKU / Style Code (Optional)</Label>
                    <Input
                      {...register("sku")}
                      placeholder="DM7866-140"
                      className="mt-[var(--space-md)] h-6"
                    />
                  </div>

                  {/* Colorway */}
                  <div>
                    <Label className="text-sm text-gray-600">Colorway (Optional)</Label>
                    <Input
                      {...register("colorway")}
                      placeholder="Bred, Chicago, etc."
                      className="mt-[var(--space-md)] h-6"
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-[var(--space-base)]">
                  {/* Pricing Section */}
                  <div className="space-y-[var(--space-sm)]">
                    <div>
                      <Label className="text-sm text-gray-600">Retail Price (Optional)</Label>
                      <div className="relative mt-[var(--space-md)]">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          {...register("retailPrice")}
                          placeholder="215.00"
                          type="number"
                          step="0.01"
                          className="pl-8 h-6"
                        />
                      </div>

                      {/* Sale Price Alert - Only if detected from scraper */}
                      {watchedSalePrice && watchedRetailPrice && parseFloat(watchedSalePrice) < parseFloat(watchedRetailPrice) && (
                        <div
                          className="mt-2 p-2.5 rounded-lg border flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300"
                          style={{
                            backgroundColor: 'var(--color-green-50)',
                            borderColor: 'var(--color-green-200)'
                          }}
                          role="status"
                          aria-live="polite"
                        >
                          <Sparkles className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-green-600)' }} aria-hidden="true" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold" style={{ color: 'var(--color-green-800)' }}>
                              Active sale detected: ${watchedSalePrice}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--color-green-700)' }}>
                              Save ${(parseFloat(watchedRetailPrice) - parseFloat(watchedSalePrice)).toFixed(2)} • {discountPercentage}% off
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600">Ideal Price Im willing to Pay (Optional)</Label>
                      <div className="relative mt-[var(--space-md)]">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          {...register("idealPrice")}
                          placeholder="120.00"
                          type="number"
                          step="0.01"
                          className="pl-8 h-6"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-[var(--space-xs)]">Price you'd be willing to pay</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Purchase Price (Optional)</Label>
                      <div className="relative mt-[var(--space-md)]">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          {...register("purchasePrice")}
                          placeholder="150.00"
                          type="number"
                          step="0.01"
                          className="pl-8 h-6"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-[var(--space-xs)]">What you actually paid (for cost-per-wear tracking)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photos Section */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-[var(--space-sm)] flex items-center gap-[var(--space-md)]">
                  <Camera className="h-4 w-4" />
                  Photos <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(Min 1)</span>
                </Label>
                <MultiPhotoUpload
                  photos={combinedPhotos}
                  onPhotosChange={handlePhotosChange}
                  maxPhotos={5}
                />
                {combinedPhotos.length === 0 && (
                  <div className="flex items-center gap-[var(--space-xs)] mt-[var(--space-xs)]">
                    <AlertTriangle className="h-3 w-3 text-orange-600" />
                    <p className="text-xs text-orange-600">At least one photo is required</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-600">Notes (Optional)</Label>
                  {watch("notes") && (
                    <span className="text-xs text-gray-500">{watch("notes")?.length || 0} / 80</span>
                  )}
                </div>
                <Textarea
                  {...register("notes")}
                  placeholder={
                    watchedInteractionType === "tried"
                      ? "e.g., 'Tight on pinky toe', 'Great for walking', 'Runs small compared to other Nikes'"
                      : "e.g., 'Love the colorway', 'Perfect for summer', 'Saw on Instagram'"
                  }
                  className="mt-[var(--space-md)] resize-none"
                  rows={3}
                  maxLength={80}
                />
                <div className="mt-[var(--space-md)] text-xs text-gray-500">
                  💡 Quick tips:{" "}
                  {watchedInteractionType === "tried"
                    ? "Mention fit issues, comfort level, or comparisons with other shoes"
                    : "Note where you saw them, what caught your eye, or styling ideas"}
                </div>
              </div>

              {/* Try-On Details Section */}
              {watchedInteractionType === "tried" && (
                <div className="border-t pt-[var(--space-base)]">
                  <h4 className="font-semibold text-gray-700 mb-[var(--space-sm)] flex items-center gap-[var(--space-md)] mt-4">
                    Try-On Details
                  </h4>

                  <div className="flex justify-between gap-x-12">
                    {/* Size Selection */}
                    <div className="mb-4 mt-4 w-full">
                      <Label className="text-sm font-medium text-gray-700">Size Tried <span className="text-red-500">*</span></Label>
                      <div className="mt-[var(--space-md)] max-w-sm">
                        <SizeCombobox
                          value={watch("sizeTried")}
                          onChange={(value) =>
                            setValue("sizeTried", value, {
                              shouldValidate: true,
                              shouldDirty: true,
                              shouldTouch: true
                            })
                          }
                          disabled={isLoading}
                          preferredSize={sizePreferences[watchedBrand]}
                        />
                      </div>
                      {errors.sizeTried && (
                        <div className="mt-[var(--space-md)] p-[var(--space-md)] bg-red-50 border border-red-200 rounded flex items-start gap-[var(--space-md)]">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-red-700">{errors.sizeTried.message}</p>
                            <p className="text-xs text-red-600 mt-0.5">Select the US Men's size you tried on</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Comfort Rating */}
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-700">
                        How comfortable were they? <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center gap-[var(--space-xs)]">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() =>
                              setValue("comfortRating", rating, {
                                shouldValidate: true
                              })
                            }
                            className="group p-[var(--space-sm)] md:p-[var(--space-md)] hover:scale-110 transition-transform touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 rounded"
                            title={`${rating} star${rating !== 1 ? "s" : ""}`}
                            aria-label={`${rating} star${rating !== 1 ? "s" : ""} comfort rating`}
                          >
                            <Star
                              className={cn(
                                "h-4 w-4 md:h-4 md:w-4 transition-colors",
                                watch("comfortRating") && watch("comfortRating")! >= rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300 group-hover:text-gray-400"
                              )}
                              aria-hidden="true"
                            />
                          </button>
                        ))}
                        {watch("comfortRating") && (
                          <button
                            type="button"
                            onClick={() => setValue("comfortRating", undefined)}
                            className="ml-3 text-xs text-gray-500 hover:text-gray-700 underline min-h-[44px] flex items-center focus:ring-2 focus:ring-blue-300 rounded px-2"
                            aria-label="Clear comfort rating"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      {watch("comfortRating") && (
                        <div className="mt-1 p-1 rounded bg-blue-50 border border-blue-200">
                          <p className="text-sm text-blue-900">
                            <span className="font-semibold">{watch("comfortRating")} / 5 stars</span> -{" "}
                            {watch("comfortRating") === 1
                              ? "Very uncomfortable"
                              : watch("comfortRating") === 2
                              ? "Uncomfortable"
                              : watch("comfortRating") === 3
                              ? "Decent comfort"
                              : watch("comfortRating") === 4
                              ? "Very comfortable"
                              : "Extremely comfortable"}
                          </p>
                        </div>
                      )}
                      {errors.comfortRating && (
                        <div className="mt-[var(--space-md)] p-[var(--space-md)] bg-red-50 border border-red-200 rounded flex items-start gap-[var(--space-md)]">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs font-semibold text-red-700">{errors.comfortRating.message}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Rate overall comfort - cushioning, support, breathability
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploadProgress && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">{uploadProgress}</AlertDescription>
                </Alert>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="h-6 px-4 text-sm hover:bg-gray-100"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="btn-primary rounded-lg px-6 py-3 font-semibold"
                  disabled={isLoading || !isValid || combinedPhotos.length === 0}
                  aria-label={isLoading ? "Saving changes" : "Save changes to entry"}
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
