'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Zap, Loader2, ThumbsUp, Upload, Brain, Link, Bell, Target, Globe } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { calculateSizeRecommendations, type FitData } from '@/lib/size-analytics'
import { MultiPhotoUpload } from '@/components/multi-photo-upload'

interface PhotoItem {
  id: string
  file: File
  preview: string
  isMain: boolean
  order: number
}

// Apple-style contextual form schema
const itemSchema = z.object({
  userName: z.enum(['Kenny', 'Rene'], { required_error: 'Select who is tracking this item' }),
  interactionType: z.enum(['seen', 'tried'], { required_error: 'Select your experience' }),
  // URL import fields
  productUrl: z.string().optional(),
  targetPrice: z.string().optional(),
  enableNotifications: z.boolean().optional(),
  // Product fields
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  color: z.string().optional(),
  // Try-on specific (conditional)
  sizeTried: z.string().optional(),
  fitRating: z.coerce.number().min(1).max(5).optional(),
  comfortRating: z.coerce.number().min(1).max(5).optional(),
  // General fields
  storeName: z.string().optional(),
  retailPrice: z.string().optional(),
  idealPrice: z.string().optional(),
  notes: z.string().optional()
}).refine((data) => {
  if (data.interactionType === 'tried') {
    return data.sizeTried && data.fitRating
  }
  return true
}, {
  message: "Size and fit rating are required when you've tried the item",
  path: ["sizeTried"]
})

type ItemFormData = z.infer<typeof itemSchema>

// Common item brands for quick selection
const COMMON_BRANDS = ['Nike', 'Jordan', 'Adidas', 'New Balance', 'Asics', 'Puma', 'Vans', 'Converse']

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

// Fit rating descriptions
const FIT_RATINGS = [
  { value: 1, label: 'Too Small', icon: '🔴', description: 'Cramped, uncomfortable' },
  { value: 2, label: 'Snug', icon: '🟠', description: 'Tight but wearable' },
  { value: 3, label: 'Perfect', icon: '🟢', description: 'Just right!' },
  { value: 4, label: 'Loose', icon: '🟡', description: 'A bit roomy' },
  { value: 5, label: 'Too Big', icon: '🔴', description: 'Swimming in them' }
]

interface SmartItemFormProps {
  onItemAdded?: () => void
}

export function SmartItemForm({ onItemAdded }: SmartItemFormProps = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [sizePreferences, setSizePreferences] = useState<Record<string, string>>({})
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [uploadProgress, setUploadProgress] = useState('')
  const [fitData, setFitData] = useState<FitData[]>([])
  const [sizeRecommendation, setSizeRecommendation] = useState<any>(null)

  // New URL processing states
  const [isScrapingUrl, setIsScrapingUrl] = useState(false)
  const [urlData, setUrlData] = useState<any>(null)
  const [showUrlImport, setShowUrlImport] = useState(false)
  const [priceMonitorCreated, setPriceMonitorCreated] = useState(false)

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    mode: 'onChange'
  })

  const watchedUser = watch('userName')
  const watchedBrand = watch('brand')
  const watchedInteractionType = watch('interactionType')

  // Load fit data on component mount
  useEffect(() => {
    loadFitData()
  }, [])

  // Generate size recommendation when user/brand changes
  useEffect(() => {
    if (watchedUser && watchedBrand && fitData.length > 0 && watchedInteractionType === 'tried') {
      const recommendation = calculateSizeRecommendations(fitData, watchedBrand, watchedUser)
      setSizeRecommendation(recommendation)
    } else {
      setSizeRecommendation(null)
    }
  }, [watchedUser, watchedBrand, watchedInteractionType, fitData])
  const watchedFitRating = watch('fitRating')

  // Load size preferences when user/brand changes
  useEffect(() => {
    if (watchedUser && watchedBrand) {
      loadSizePreference(watchedUser, watchedBrand)
    }
  }, [watchedUser, watchedBrand])

  const loadFitData = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('user_name, brand, size_tried, fit_rating')
        .eq('category', 'shoes')
        .eq('interaction_type', 'tried')
        .not('size_tried', 'is', null)
        .not('fit_rating', 'is', null)

      if (error) {
        console.error('Error loading fit data:', error)
        return
      }

      // Transform to FitData format with frequency calculation
      const transformedData: FitData[] = []
      const groupedData = data.reduce((acc, item) => {
        const key = `${item.user_name}-${item.brand}-${item.size_tried}-${item.fit_rating}`
        if (!acc[key]) {
          acc[key] = { ...item, frequency: 0 }
        }
        acc[key].frequency += 1
        return acc
      }, {} as Record<string, any>)

      Object.values(groupedData).forEach((item: any) => {
        transformedData.push({
          user_name: item.user_name,
          brand: item.brand,
          size_tried: item.size_tried,
          fit_rating: item.fit_rating,
          frequency: item.frequency
        })
      })

      setFitData(transformedData)
    } catch (error) {
      console.error('Error loading fit data:', error)
    }
  }

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

  // URL scraping function
  const handleUrlScrape = async (url: string) => {
    if (!url.trim()) return

    setIsScrapingUrl(true)
    setUploadProgress('🔍 Analyzing product URL...')

    try {
      const response = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze URL')
      }

      const data = await response.json()

      console.log('🔍 Scraped data received:', data)

      if (data.success) {
        // Clean and trim all text data
        const cleanBrand = data.brand ? data.brand.replace(/[\n\t\r]/g, ' ').replace(/\s+/g, ' ').trim() : ''
        const cleanModel = data.model ? data.model.replace(/[\n\t\r]/g, ' ').replace(/\s+/g, ' ').trim() : ''
        const cleanColor = data.color ? data.color.replace(/[\n\t\r]/g, ' ').replace(/\s+/g, ' ').trim() : ''

        // Extract store name from URL
        const storeName = new URL(url).hostname.replace('www.', '').split('.')[0]
        const capitalizedStoreName = storeName.charAt(0).toUpperCase() + storeName.slice(1)

        // Store the scraped data for display
        setUrlData({
          title: `${cleanBrand} ${cleanModel}`.trim(),
          price: data.retailPrice,
          image: data.images?.[0],
          storeName: capitalizedStoreName
        })

        // Auto-fill form with scraped data
        // Use setTimeout to ensure form fields are rendered before setting values
        setTimeout(() => {
          if (cleanBrand) {
            console.log('✅ Setting brand:', cleanBrand)
            setValue('brand', cleanBrand, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
          }

          if (cleanModel) {
            console.log('✅ Setting model:', cleanModel)
            setValue('model', cleanModel, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
          }

          if (cleanColor && cleanColor !== 'Standard') {
            console.log('✅ Setting color:', cleanColor)
            setValue('color', cleanColor, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
          }

          if (capitalizedStoreName) {
            console.log('✅ Setting store name:', capitalizedStoreName)
            setValue('storeName', capitalizedStoreName, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
          }

          if (data.retailPrice) {
            console.log('✅ Setting retail price:', data.retailPrice)
            setValue('retailPrice', data.retailPrice.toString(), { shouldValidate: true, shouldDirty: true, shouldTouch: true })
          }
        }, 100)

        if (data.images && data.images.length > 0 && photos.length === 0) {
          console.log('📸 Product images available:', data.images.length)
        }

        setUploadProgress('✅ Product data imported!')
        setTimeout(() => setUploadProgress(''), 2000)
      } else {
        console.error('❌ Scraping failed:', data.error)
        setUploadProgress('❌ Could not extract product data')
        setTimeout(() => setUploadProgress(''), 3000)
      }
    } catch (error) {
      console.error('URL scraping error:', error)
      setUploadProgress('❌ Could not analyze URL')
      setTimeout(() => setUploadProgress(''), 3000)
    } finally {
      setIsScrapingUrl(false)
    }
  }

  // Create price monitor function
  const createPriceMonitor = async (data: ItemFormData) => {
    if (!data.productUrl || !data.userName) return

    try {
      const response = await fetch('/api/create-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: data.productUrl,
          userName: data.userName,
          targetPrice: data.targetPrice ? parseFloat(data.targetPrice) : null,
          enableNotifications: data.enableNotifications || false
        })
      })

      if (response.ok) {
        setPriceMonitorCreated(true)
        return true
      }
    } catch (error) {
      console.error('Failed to create price monitor:', error)
    }
    return false
  }


  const onSubmit = async (data: ItemFormData) => {
    setIsLoading(true)
    setSuccessMessage('')

    try {
      let mainImageUrl = null
      let mainCloudinaryId = null

      // Upload main photo to Cloudinary if provided
      const mainPhoto = photos.find(p => p.isMain) || photos[0]
      if (mainPhoto) {
        setUploadProgress(`📤 Uploading ${photos.length} photo${photos.length > 1 ? 's' : ''}...`)
        const formData = new FormData()
        formData.append('file', mainPhoto.file)

        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json()
          throw new Error(error.error || 'Failed to upload image')
        }

        const uploadResult = await uploadResponse.json()
        mainImageUrl = uploadResult.data.url
        mainCloudinaryId = uploadResult.data.publicId
        setUploadProgress(`✅ ${photos.length} photo${photos.length > 1 ? 's' : ''} uploaded!`)
      }

      const experienceData = {
        user_name: data.userName,
        brand: data.brand,
        model: data.model,
        color: data.color || 'Standard',
        // Only include try-on specific fields if actually tried on
        size_tried: data.interactionType === 'tried' ? data.sizeTried : null,
        fit_rating: data.interactionType === 'tried' ? data.fitRating : null,
        comfort_rating: data.interactionType === 'tried' ? (data.comfortRating || null) : null,
        // Always optional fields
        store_name: data.storeName || null,
        retail_price: data.retailPrice ? parseFloat(data.retailPrice) : null,
        notes: data.notes || null,
        try_on_date: new Date().toISOString().split('T')[0],
        image_url: mainImageUrl,
        cloudinary_id: mainCloudinaryId,

        // PHASE 1: DUAL-WRITE to both old and new columns
        // OLD COLUMNS (maintain for backward compatibility)
        interested_in_buying: true,
        interaction_type: data.interactionType,
        would_buy_at_price: data.idealPrice ? parseFloat(data.idealPrice) : null,

        // NEW COLUMNS (future schema)
        status: 'wishlisted' as const,
        has_been_tried: data.interactionType === 'tried',
        target_price: data.idealPrice ? parseFloat(data.idealPrice) : null,
      }

      const { error } = await supabase
        .from('items')
        .insert(experienceData)

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      // Create price monitor if URL provided
      if (data.productUrl) {
        setUploadProgress('📊 Setting up price monitoring...')
        const monitorCreated = await createPriceMonitor(data)
        if (monitorCreated) {
          setUploadProgress('🎯 Price monitoring enabled!')
        }
      }

      setSuccessMessage(
        data.interactionType === 'tried'
          ? '⚡ Try-on experience saved!'
          : data.productUrl
            ? '✨ Item added with price monitoring!'
            : '✨ Item added to your list!'
      )

      // Auto-reset after 3 seconds for rapid entry
      setTimeout(() => {
        reset()
        setSuccessMessage('')
        setUploadProgress('')
        setPhotos([])
        setUrlData(null)
        setShowUrlImport(false)
        onItemAdded?.()
      }, 3000)

    } catch (error) {
      console.error('Error saving:', error)
      setSuccessMessage('')
      setUploadProgress('')
      alert(`Failed to save: ${(error as Error).message || 'Unknown error'}`)
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
    if (!watchedInteractionType) return '👟 Track Item'
    return watchedInteractionType === 'tried' ? '⚡ Try-On Experience' : '👀 Item Spotted'
  }

  const getFormDescription = () => {
    if (!watchedInteractionType) return 'Add a item to your collection'
    return watchedInteractionType === 'tried'
      ? 'Rate your try-on experience'
      : 'Save this item for later'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
    >
      <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <CardHeader className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CardTitle className="text-3xl flex items-center justify-center gap-[var(--space-md)] bg-gradient-to-r from-blue-600 via-teal-600 to-orange-500 bg-clip-text text-transparent">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Zap className="h-7 w-7 text-yellow-500" />
              </motion.div>
              {getFormTitle()}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-[var(--space-md)]">{getFormDescription()}</p>
          </motion.div>
        </CardHeader>

      <CardContent>
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-[var(--space-lg)]">
          {/* Step 1: User Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Who's tracking this item?</Label>
            <div className="grid grid-cols-2 gap-[var(--space-sm)] mt-[var(--space-md)]">
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
              <p className="text-xs text-red-600 mt-[var(--space-xs)]">{errors.userName.message}</p>
            )}
          </div>

          {/* Step 2: Interaction Type */}
          {watchedUser && (
            <div>
              <Label className="text-sm font-medium text-gray-700">What's your experience with this item?</Label>
              <div className="grid grid-cols-2 gap-[var(--space-sm)] mt-[var(--space-md)]">
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
                <p className="text-xs text-red-600 mt-[var(--space-xs)]">{errors.interactionType.message}</p>
              )}
            </div>
          )}

          {/* Step 2.5: URL Import Feature */}
          {watchedInteractionType && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-[var(--space-md)] mb-[var(--space-sm)]">
                    <motion.div
                      animate={{ rotate: showUrlImport ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Globe className="h-5 w-5 text-blue-600" />
                    </motion.div>
                    <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      🚀 Smart Import (Optional)
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUrlImport(!showUrlImport)}
                      className="ml-auto text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      {showUrlImport ? 'Hide' : 'Import from URL'}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {showUrlImport && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-[var(--space-base)]"
                      >
                        {/* URL Input */}
                        <div>
                          <Label className="text-xs text-blue-700 dark:text-blue-300 mb-[var(--space-md)] block">
                            Paste product URL from Nike, Adidas, Foot Locker, etc.
                          </Label>
                          <div className="flex gap-[var(--space-md)]">
                            <Input
                              {...register('productUrl')}
                              placeholder="https://www.nike.com/t/..."
                              className="flex-1"
                              disabled={isScrapingUrl}
                            />
                            <Button
                              type="button"
                              onClick={() => handleUrlScrape(watch('productUrl') || '')}
                              disabled={isScrapingUrl || !watch('productUrl')}
                              size="sm"
                              className="px-3"
                            >
                              {isScrapingUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        {/* URL Data Preview */}
                        {urlData && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700"
                          >
                            <div className="flex items-start gap-[var(--space-sm)]">
                              {urlData.image && (
                                <img src={urlData.image} alt="Product" className="w-16 h-16 object-cover rounded-lg" />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-green-800 dark:text-green-200 truncate">
                                  {urlData.title || 'Product Found'}
                                </h4>
                                <div className="flex gap-[var(--space-base)] mt-[var(--space-xs)]">
                                  {urlData.price && (
                                    <span className="text-lg font-bold text-green-600">${urlData.price}</span>
                                  )}
                                  {urlData.storeName && (
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{urlData.storeName}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Price Monitoring Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--space-sm)]">
                          <div>
                            <Label className="text-xs text-blue-700 dark:text-blue-300 mb-1 block">
                              Target Price (Optional)
                            </Label>
                            <div className="relative">
                              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                {...register('targetPrice')}
                                placeholder="120.00"
                                type="number"
                                step="0.01"
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-center">
                            <label className="flex items-center gap-[var(--space-md)] cursor-pointer">
                              <input
                                type="checkbox"
                                {...register('enableNotifications')}
                                className="rounded"
                              />
                              <Bell className="h-4 w-4 text-yellow-600" />
                              <span className="text-xs text-blue-700 dark:text-blue-300">
                                Notify when price drops
                              </span>
                            </label>
                          </div>
                        </div>

                        <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 p-2 rounded">
                          💡 This will automatically fill product details and optionally monitor prices
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Step 3: Item Details */}
          {watchedInteractionType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Brand Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Brand</Label>
                <div className="grid grid-cols-4 gap-[var(--space-md)] mt-[var(--space-md)]">
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
                <div className="grid grid-cols-4 gap-[var(--space-md)] mt-[var(--space-md)]">
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
                  className="mt-[var(--space-md)]"
                />
                {errors.brand && (
                  <p className="text-xs text-red-600 mt-[var(--space-xs)]">{errors.brand.message}</p>
                )}
              </div>

              {/* Model */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Item Name</Label>
                <Input
                  {...register('model')}
                  placeholder="Air Jordan 1, Air Max 90, etc."
                  className="mt-[var(--space-md)]"
                />
                {errors.model && (
                  <p className="text-xs text-red-600 mt-[var(--space-xs)]">{errors.model.message}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Try-On Specific Fields */}
          {watchedInteractionType === 'tried' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {/* Size Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700">What size did you try?</Label>

                {/* Smart Size Recommendation */}
                {sizeRecommendation && (
                  <Alert className="mt-[var(--space-md)] border-blue-200 bg-blue-50">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Smart Suggestion:</strong> Try size <strong>{sizeRecommendation.recommendedSize}</strong>
                      <span className="text-sm block mt-[var(--space-xs)]">
                        {sizeRecommendation.reasoning} ({sizeRecommendation.confidence}% confidence)
                      </span>
                    </AlertDescription>
                  </Alert>
                )}

                <Select onValueChange={(value) => setValue('sizeTried', value)}>
                  <SelectTrigger className="h-12 mt-[var(--space-md)]">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_SIZES.map((size) => (
                      <SelectItem key={size.us} value={size.us}>
                        <div className="flex flex-col">
                          <span>US M {size.us} / W {size.women}</span>
                          <span className="text-xs text-gray-500">EU {size.eu}</span>
                        </div>
                        {sizePreferences[watchedBrand] === size.us && (
                          <Badge variant="secondary" className="ml-2 text-xs">Your usual</Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sizeTried && (
                  <p className="text-xs text-red-600 mt-[var(--space-xs)]">{errors.sizeTried.message}</p>
                )}
              </div>

              {/* Fit Rating */}
              <div>
                <Label className="text-sm font-medium text-gray-700">How did it fit? ⭐</Label>
                <div className="grid grid-cols-5 gap-[var(--space-xs)] mt-[var(--space-md)]">
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
                  <p className="text-xs text-gray-600 mt-[var(--space-xs)] text-center">
                    {getFitRatingInfo(watchedFitRating)?.description}
                  </p>
                )}
                {errors.fitRating && (
                  <p className="text-xs text-red-600 mt-[var(--space-xs)]">{errors.fitRating.message}</p>
                )}
              </div>

            </motion.div>
          )}

          {/* Step 5: Universal Fields */}
          {watchedInteractionType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              {/* Multi-Photo Upload */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-[var(--space-sm)] block">📸 Add Photos (Optional - Up to 5)</Label>
                <MultiPhotoUpload
                  photos={photos}
                  onPhotosChange={setPhotos}
                  maxPhotos={5}
                />
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
                  className="mt-[var(--space-md)] resize-none"
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-[var(--space-xs)]">
                  💡 Quick thoughts: {watchedInteractionType === 'tried'
                    ? '"Tight on pinky toe", "Great for walking"'
                    : '"Love the color", "Perfect for summer"'
                  }
                </p>
              </div>

              {/* Advanced Details Toggle */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-[var(--space-base)]">
                  <div>
                    <Label className="text-sm text-gray-600">Color (Optional)</Label>
                    <Input {...register('color')} placeholder="Bred, Chicago, etc." className="mt-[var(--space-xs)]" />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Store (Optional)</Label>
                    <Input {...register('storeName')} placeholder="Foot Locker, etc." className="mt-[var(--space-xs)]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-[var(--space-base)] mt-4">
                  <div>
                    <Label className="text-sm text-gray-600">Retail Price (Optional)</Label>
                    <div className="relative mt-[var(--space-xs)]">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input {...register('retailPrice')} placeholder="170.00" type="number" step="0.01" className="pl-8" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Ideal Price Im willing to Pay (Optional)</Label>
                    <div className="relative mt-[var(--space-xs)]">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input {...register('idealPrice')} placeholder="120.00" type="number" step="0.01" className="pl-8" />
                    </div>
                    <p className="text-xs text-gray-500 mt-[var(--space-xs)]">Price you'd be willing to pay</p>
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
            </motion.div>
          )}
        </form>
      </CardContent>
    </Card>
    </motion.div>
  )
}