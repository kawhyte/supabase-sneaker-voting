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
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Edit, Camera, Loader2, ThumbsUp, Upload, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

// Same schema as SmartSneakerForm
const sneakerSchema = z.object({
  userName: z.enum(['Kenny', 'Rene'], { required_error: 'Select who is tracking this sneaker' }),
  interactionType: z.enum(['seen', 'tried'], { required_error: 'Select your experience' }),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  colorway: z.string().optional(),
  // Try-on specific (conditional)
  sizeTried: z.string().optional(),
  fitRating: z.coerce.number().min(1).max(5).optional(),
  comfortRating: z.coerce.number().min(1).max(5).optional(),
  wouldRecommend: z.boolean().optional(),
  // General fields
  storeName: z.string().optional(),
  listedPrice: z.string().optional(),
  notes: z.string().optional(),
  image: z.any().optional()
}).refine((data) => {
  if (data.interactionType === 'tried') {
    return data.sizeTried && data.fitRating
  }
  return true
}, {
  message: "Size and fit rating are required when you've tried the sneaker",
  path: ["sizeTried"]
})

type SneakerFormData = z.infer<typeof sneakerSchema>

// Common sneaker brands for quick selection
const COMMON_BRANDS = ['Nike', 'Jordan', 'Adidas', 'New Balance', 'Asics', 'Puma', 'Vans', 'Converse']

// Common sizes
const COMMON_SIZES = ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '14']

// Fit rating descriptions
const FIT_RATINGS = [
  { value: 1, label: '1 - Too Small', icon: '🔴', description: 'Cramped, uncomfortable' },
  { value: 2, label: '2 - Snug', icon: '🟠', description: 'Tight but wearable' },
  { value: 3, label: '3 - Perfect', icon: '🟢', description: 'Just right!' },
  { value: 4, label: '4 - Loose', icon: '🟡', description: 'A bit roomy' },
  { value: 5, label: '5 - Too Big', icon: '🔴', description: 'Swimming in them' }
]

interface EditSneakerModalProps {
  experience: any
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function EditSneakerModal({ experience, isOpen, onClose, onSave }: EditSneakerModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<SneakerFormData>({
    resolver: zodResolver(sneakerSchema),
    mode: 'onChange'
  })

  const watchedInteractionType = watch('interactionType')
  const watchedFitRating = watch('fitRating')

  // Populate form with existing data when modal opens
  useEffect(() => {
    if (isOpen && experience) {
      setValue('userName', experience.user_name)
      setValue('interactionType', experience.interaction_type)
      setValue('brand', experience.brand)
      setValue('model', experience.model)
      setValue('colorway', experience.colorway || '')
      setValue('sizeTried', experience.size_tried || '')
      setValue('fitRating', experience.fit_rating || undefined)
      setValue('comfortRating', experience.comfort_rating || undefined)
      setValue('wouldRecommend', experience.would_recommend || false)
      setValue('storeName', experience.store_name || '')
      setValue('listedPrice', experience.listed_price?.toString() || '')
      setValue('notes', experience.notes || '')

      if (experience.image_url) {
        setImagePreview(experience.image_url)
      }
    }
  }, [isOpen, experience, setValue])

  // Handle file upload
  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setValue('image', file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const onSubmit = async (data: SneakerFormData) => {
    setIsLoading(true)
    setSuccessMessage('')

    try {
      let imageUrl = experience.image_url
      let cloudinaryId = experience.cloudinary_id

      // Upload new image to Cloudinary if provided
      if (data.image) {
        setUploadProgress('📤 Uploading image...')

        const formData = new FormData()
        formData.append('file', data.image)

        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json()
          throw new Error(error.error || 'Failed to upload image')
        }

        const uploadResult = await uploadResponse.json()
        imageUrl = uploadResult.data.url
        cloudinaryId = uploadResult.data.publicId

        setUploadProgress('✅ Image uploaded!')
      }

      const experienceData = {
        user_name: data.userName,
        brand: data.brand,
        model: data.model,
        colorway: data.colorway || 'Standard',
        interaction_type: data.interactionType,
        // Only include try-on specific fields if actually tried on
        size_tried: data.interactionType === 'tried' ? data.sizeTried : null,
        fit_rating: data.interactionType === 'tried' ? data.fitRating : null,
        comfort_rating: data.interactionType === 'tried' ? (data.comfortRating || null) : null,
        would_recommend: data.interactionType === 'tried' ? (data.wouldRecommend || false) : null,
        // Always optional fields
        store_name: data.storeName || null,
        listed_price: data.listedPrice ? parseFloat(data.listedPrice) : null,
        notes: data.notes || null,
        interested_in_buying: true, // If they're keeping it, they're interested
        image_url: imageUrl,
        cloudinary_id: cloudinaryId
      }

      const { error } = await supabase
        .from('sneaker_experiences')
        .update(experienceData)
        .eq('id', experience.id)

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      setSuccessMessage('✅ Experience updated successfully!')

      // Close modal and refresh after 1 second
      setTimeout(() => {
        setSuccessMessage('')
        setUploadProgress('')
        onSave()
        onClose()
      }, 1000)

    } catch (error) {
      console.error('Error updating experience:', error)
      setSuccessMessage('')
      setUploadProgress('')
      alert(`Failed to update: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getFitRatingInfo = (rating: number) => {
    return FIT_RATINGS.find(r => r.value === rating)
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
              Edit Experience
            </CardTitle>
            <p className="text-sm text-gray-600">Update your sneaker details</p>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Size Tried</Label>
                      <Select onValueChange={(value) => setValue('sizeTried', value)} value={watch('sizeTried')}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMON_SIZES.map((size) => (
                            <SelectItem key={size} value={size}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Fit Rating</Label>
                      <Select onValueChange={(value) => setValue('fitRating', parseInt(value))} value={watch('fitRating')?.toString()}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="How did it fit?" />
                        </SelectTrigger>
                        <SelectContent>
                          {FIT_RATINGS.map((rating) => (
                            <SelectItem key={rating.value} value={rating.value.toString()}>
                              {rating.icon} {rating.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Would you recommend this sneaker?</Label>
                    <div className="flex gap-3 mt-2">
                      <Button
                        type="button"
                        variant={watch('wouldRecommend') ? 'default' : 'outline'}
                        onClick={() => setValue('wouldRecommend', !watch('wouldRecommend'))}
                        className="flex items-center gap-2 h-12"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {watch('wouldRecommend') ? 'Yes, recommend' : 'Recommend?'}
                      </Button>
                    </div>
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
                  <Label className="text-sm font-medium text-gray-700">Listed Price ($)</Label>
                  <Input
                    {...register('listedPrice')}
                    placeholder="170.00"
                    type="number"
                    step="0.01"
                    className="mt-2"
                  />
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
              </div>

              {/* Photo Upload */}
              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  📸 Update Photo (Optional)
                </Label>
                <label
                  className={`relative block border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer mt-2 ${
                    dragActive
                      ? 'border-blue-400 bg-blue-50'
                      : imagePreview
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img src={imagePreview} alt="Preview" className="max-h-24 mx-auto rounded" />
                      <p className="text-xs text-green-600">✅ Photo ready</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Camera className="h-6 w-6 mx-auto text-gray-400" />
                      <p className="text-xs text-gray-600">
                        📷 Tap to add photo or drag & drop
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="sr-only"
                  />
                </label>
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