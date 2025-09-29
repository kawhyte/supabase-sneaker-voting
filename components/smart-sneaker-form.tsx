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
import { CheckCircle, Zap, Camera, Loader2, ThumbsUp, Upload } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

// Apple-style contextual form schema
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
  { value: 1, label: 'Too Small', icon: '🔴', description: 'Cramped, uncomfortable' },
  { value: 2, label: 'Snug', icon: '🟠', description: 'Tight but wearable' },
  { value: 3, label: 'Perfect', icon: '🟢', description: 'Just right!' },
  { value: 4, label: 'Loose', icon: '🟡', description: 'A bit roomy' },
  { value: 5, label: 'Too Big', icon: '🔴', description: 'Swimming in them' }
]

interface SmartSneakerFormProps {
  onSneakerAdded?: () => void
}

export function SmartSneakerForm({ onSneakerAdded }: SmartSneakerFormProps = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [sizePreferences, setSizePreferences] = useState<Record<string, string>>({})
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

  const watchedUser = watch('userName')
  const watchedBrand = watch('brand')
  const watchedInteractionType = watch('interactionType')
  const watchedFitRating = watch('fitRating')

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
        setValue('sizeTried', data.preferred_size)
        setSizePreferences({ [brand]: data.preferred_size })
      }
    } catch (error) {
      // No preference found, that's okay
    }
  }

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
      let imageUrl = null
      let cloudinaryId = null

      // Upload image to Cloudinary if provided
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
        // Only include try-on specific fields if actually tried on
        size_tried: data.interactionType === 'tried' ? data.sizeTried : null,
        fit_rating: data.interactionType === 'tried' ? data.fitRating : null,
        comfort_rating: data.interactionType === 'tried' ? (data.comfortRating || null) : null,
        would_recommend: data.interactionType === 'tried' ? (data.wouldRecommend || false) : null,
        // Always optional fields
        store_name: data.storeName || null,
        listed_price: data.listedPrice ? parseFloat(data.listedPrice) : null,
        notes: data.notes || null,
        interested_in_buying: true, // If they're adding it, they're interested
        try_on_date: new Date().toISOString().split('T')[0],
        image_url: imageUrl,
        cloudinary_id: cloudinaryId
      }

      const { error } = await supabase
        .from('sneaker_experiences')
        .insert(experienceData)

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      setSuccessMessage(data.interactionType === 'tried' ? '⚡ Try-on experience saved!' : '✨ Sneaker added to your list!')

      // Auto-reset after 2 seconds for rapid entry
      setTimeout(() => {
        reset()
        setSuccessMessage('')
        setUploadProgress('')
        setImagePreview(null)
        onSneakerAdded?.()
      }, 2000)

    } catch (error) {
      console.error('Error saving:', error)
      setSuccessMessage('')
      setUploadProgress('')
      alert(`Failed to save: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const quickFillFromPreference = (brand: string) => {
    setValue('brand', brand)
    if (watchedUser && sizePreferences[brand]) {
      setValue('sizeTried', sizePreferences[brand])
    }
  }

  const getFitRatingInfo = (rating: number) => {
    return FIT_RATINGS.find(r => r.value === rating)
  }

  const getFormTitle = () => {
    if (!watchedInteractionType) return '👟 Track Sneaker'
    return watchedInteractionType === 'tried' ? '⚡ Try-On Experience' : '👀 Sneaker Spotted'
  }

  const getFormDescription = () => {
    if (!watchedInteractionType) return 'Add a sneaker to your collection'
    return watchedInteractionType === 'tried'
      ? 'Rate your try-on experience'
      : 'Save this sneaker for later'
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <Zap className="h-6 w-6 text-yellow-500" />
          {getFormTitle()}
        </CardTitle>
        <p className="text-sm text-gray-600">{getFormDescription()}</p>
      </CardHeader>

      <CardContent>
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: User Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Who's tracking this sneaker?</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Button
                type="button"
                variant={watchedUser === 'Kenny' ? 'default' : 'outline'}
                onClick={() => setValue('userName', 'Kenny')}
                className="h-12 text-base"
              >
                👤 Kenny
              </Button>
              <Button
                type="button"
                variant={watchedUser === 'Rene' ? 'default' : 'outline'}
                onClick={() => setValue('userName', 'Rene')}
                className="h-12 text-base"
              >
                👤 Rene
              </Button>
            </div>
            {errors.userName && (
              <p className="text-xs text-red-600 mt-1">{errors.userName.message}</p>
            )}
          </div>

          {/* Step 2: Interaction Type */}
          {watchedUser && (
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
              {errors.interactionType && (
                <p className="text-xs text-red-600 mt-1">{errors.interactionType.message}</p>
              )}
            </div>
          )}

          {/* Step 3: Sneaker Details */}
          {watchedInteractionType && (
            <>
              {/* Brand Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Brand</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {COMMON_BRANDS.slice(0, 4).map((brand) => (
                    <Button
                      key={brand}
                      type="button"
                      variant={watchedBrand === brand ? 'default' : 'outline'}
                      onClick={() => quickFillFromPreference(brand)}
                      className="h-10 text-xs"
                    >
                      {brand}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {COMMON_BRANDS.slice(4).map((brand) => (
                    <Button
                      key={brand}
                      type="button"
                      variant={watchedBrand === brand ? 'default' : 'outline'}
                      onClick={() => quickFillFromPreference(brand)}
                      className="h-10 text-xs"
                    >
                      {brand}
                    </Button>
                  ))}
                </div>
                <Input
                  {...register('brand')}
                  placeholder="Or type brand name"
                  className="mt-2"
                />
                {errors.brand && (
                  <p className="text-xs text-red-600 mt-1">{errors.brand.message}</p>
                )}
              </div>

              {/* Model */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Model</Label>
                <Input
                  {...register('model')}
                  placeholder="Air Jordan 1, Air Max 90, etc."
                  className="mt-2"
                />
                {errors.model && (
                  <p className="text-xs text-red-600 mt-1">{errors.model.message}</p>
                )}
              </div>
            </>
          )}

          {/* Step 4: Try-On Specific Fields */}
          {watchedInteractionType === 'tried' && (
            <>
              {/* Size Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700">What size did you try?</Label>
                <Select onValueChange={(value) => setValue('sizeTried', value)}>
                  <SelectTrigger className="h-12 mt-2">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                        {sizePreferences[watchedBrand] === size && (
                          <Badge variant="secondary" className="ml-2 text-xs">Your usual</Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sizeTried && (
                  <p className="text-xs text-red-600 mt-1">{errors.sizeTried.message}</p>
                )}
              </div>

              {/* Fit Rating */}
              <div>
                <Label className="text-sm font-medium text-gray-700">How did it fit? ⭐</Label>
                <div className="grid grid-cols-5 gap-1 mt-2">
                  {FIT_RATINGS.map((rating) => (
                    <Button
                      key={rating.value}
                      type="button"
                      variant={watchedFitRating === rating.value ? 'default' : 'outline'}
                      onClick={() => setValue('fitRating', rating.value)}
                      className="h-16 flex flex-col items-center justify-center p-1"
                    >
                      <span className="text-lg">{rating.icon}</span>
                      <span className="text-xs font-medium">{rating.value}</span>
                    </Button>
                  ))}
                </div>
                {watchedFitRating && (
                  <p className="text-xs text-gray-600 mt-1 text-center">
                    {getFitRatingInfo(watchedFitRating)?.description}
                  </p>
                )}
                {errors.fitRating && (
                  <p className="text-xs text-red-600 mt-1">{errors.fitRating.message}</p>
                )}
              </div>

              {/* Would Recommend */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Would you recommend this sneaker?</Label>
                <div className="mt-2">
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

          {/* Step 5: Universal Fields */}
          {watchedInteractionType && (
            <>
              {/* Photo Upload */}
              <div>
                <Label className="text-sm font-medium text-gray-700">📸 Add Photo (Optional)</Label>
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
                      <p className="text-xs text-gray-600">📷 Tap to add photo or drag & drop</p>
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

              {/* Quick Note */}
              <div>
                <Label className="text-sm font-medium text-gray-700">💭 Quick Note (Optional)</Label>
                <Textarea
                  {...register('notes')}
                  placeholder={watchedInteractionType === 'tried'
                    ? "How did they feel? Any thoughts? Comparisons?"
                    : "Why are you interested? Where did you see them?"
                  }
                  className="mt-2 resize-none"
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Quick thoughts: {watchedInteractionType === 'tried'
                    ? '"Tight on pinky toe", "Great for walking"'
                    : '"Love the colorway", "Perfect for summer"'
                  }
                </p>
              </div>

              {/* Advanced Details Toggle */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Colorway (Optional)</Label>
                    <Input {...register('colorway')} placeholder="Bred, Chicago, etc." className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Store (Optional)</Label>
                    <Input {...register('storeName')} placeholder="Foot Locker, etc." className="mt-1" />
                  </div>
                </div>
                <div className="mt-4">
                  <Label className="text-sm text-gray-600">Listed Price (Optional)</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input {...register('listedPrice')} placeholder="170.00" type="number" step="0.01" className="pl-8" />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12 text-lg"
                disabled={isLoading || !isValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  watchedInteractionType === 'tried' ? '⚡ Save Try-On Experience' : '✨ Add to Collection'
                )}
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  )
}