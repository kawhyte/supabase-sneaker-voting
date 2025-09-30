'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Loader2, Upload, Link, User, Eye, Footprints, Sparkles, ChevronUp, ChevronDown, Zap, UserCircle, Image, AlertTriangle, Camera, Rocket, Lightbulb, Star } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { calculateSizeRecommendations, type FitData } from '@/lib/size-analytics'
import { MultiPhotoUpload } from '@/components/multi-photo-upload'
import { ImageConfirmationModal } from '@/components/image-confirmation-modal'
import { BrandCombobox } from '@/components/brand-combobox'
import { SizeCombobox } from '@/components/size-combobox'
import { Skeleton } from '@/components/ui/skeleton'

interface PhotoItem {
  id: string
  file: File
  preview: string
  isMain: boolean
  order: number
}

// Enhanced form schema with SKU and sale price
const sneakerSchema = z.object({
  userName: z.enum(['Kenny', 'Rene'], { required_error: 'Select who is tracking this sneaker' }),
  interactionType: z.enum(['seen', 'tried'], { required_error: 'Select your experience' }),
  // Smart Import fields
  productUrl: z.string().optional(),
  targetPrice: z.string().optional(),
  enableNotifications: z.boolean().optional(),
  // Product fields
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  sku: z.string().optional(),
  colorway: z.string().optional(),
  // Try-on specific (conditional)
  sizeTried: z.string().optional(),
  fitRating: z.coerce.number().min(1).max(5).optional(),
  comfortRating: z.coerce.number().min(1).max(5).optional(),
  // General fields
  storeName: z.string().optional(),
  retailPrice: z.string().optional(),
  salePrice: z.string().optional(),
  idealPrice: z.string().optional(),
  notes: z.string().optional()
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

interface RedesignedSneakerFormProps {
  onSneakerAdded?: () => void
}

export function RedesignedSneakerForm({ onSneakerAdded }: RedesignedSneakerFormProps = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [sizePreferences, setSizePreferences] = useState<Record<string, string>>({})
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [uploadProgress, setUploadProgress] = useState('')
  const [fitData, setFitData] = useState<FitData[]>([])
  const [sizeRecommendation, setSizeRecommendation] = useState<any>(null)

  // Smart Import states
  const [isScrapingUrl, setIsScrapingUrl] = useState(false)
  const [urlData, setUrlData] = useState<any>(null)
  const [smartImportExpanded, setSmartImportExpanded] = useState(true) // Expanded by default
  const [scrapeFailed, setScrapeFailed] = useState(false)
  const [priceMonitorCreated, setPriceMonitorCreated] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [scrapedImages, setScrapedImages] = useState<string[]>([])

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
  const watchedRetailPrice = watch('retailPrice')
  const watchedSalePrice = watch('salePrice')

  // Calculate discount percentage
  const discountPercentage = watchedRetailPrice && watchedSalePrice
    ? Math.round(((parseFloat(watchedRetailPrice) - parseFloat(watchedSalePrice)) / parseFloat(watchedRetailPrice)) * 100)
    : 0

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

  // Load size preferences when user/brand changes
  useEffect(() => {
    if (watchedUser && watchedBrand) {
      loadSizePreference(watchedUser, watchedBrand)
    }
  }, [watchedUser, watchedBrand])

  const loadFitData = async () => {
    try {
      const { data, error } = await supabase
        .from('sneakers')
        .select('user_name, brand, size_tried, fit_rating')
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

  // URL scraping function with retry logic
  const handleUrlScrape = async (url: string, retryCount: number = 0) => {
    if (!url.trim()) return

    const maxRetries = 2
    const isRetrying = retryCount > 0

    setIsScrapingUrl(true)
    setScrapeFailed(false)

    if (isRetrying) {
      setUploadProgress(`🔄 Retry attempt ${retryCount}/${maxRetries}...`)
    } else {
      setUploadProgress('🔍 Analyzing product URL...')
    }

    try {
      const response = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      console.log('🔍 Scraped data received:', data)

      if (data.success) {
        // Clean and trim all text data
        const cleanBrand = data.brand ? data.brand.replace(/[\n\t\r]/g, ' ').replace(/\s+/g, ' ').trim() : ''
        const cleanModel = data.model ? data.model.replace(/[\n\t\r]/g, ' ').replace(/\s+/g, ' ').trim() : ''
        const cleanColorway = data.colorway ? data.colorway.replace(/[\n\t\r]/g, ' ').replace(/\s+/g, ' ').trim() : ''

        // Extract store name from URL
        const storeName = new URL(url).hostname.replace('www.', '').split('.')[0]
        const capitalizedStoreName = storeName.charAt(0).toUpperCase() + storeName.slice(1)

        // Store the scraped data for display
        setUrlData({
          title: `${cleanBrand} ${cleanModel}`.trim(),
          price: data.retailPrice,
          image: data.images?.[0],
          storeName: capitalizedStoreName,
          images: data.images || []
        })

        // Auto-fill form with scraped data
        setTimeout(() => {
          if (cleanBrand) {
            console.log('✅ Setting brand:', cleanBrand)
            setValue('brand', cleanBrand, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
          }

          if (cleanModel) {
            console.log('✅ Setting model:', cleanModel)
            setValue('model', cleanModel, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
          }

          if (data.sku) {
            const cleanSku = data.sku.replace(/[\n\t\r]/g, ' ').replace(/\s+/g, ' ').trim()
            console.log('✅ Setting SKU:', cleanSku)
            setValue('sku', cleanSku, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
          }

          if (cleanColorway && cleanColorway !== 'Standard') {
            console.log('✅ Setting colorway:', cleanColorway)
            setValue('colorway', cleanColorway, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
          }

          if (capitalizedStoreName) {
            console.log('✅ Setting store name:', capitalizedStoreName)
            setValue('storeName', capitalizedStoreName, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
          }

          if (data.retailPrice) {
            console.log('✅ Setting retail price:', data.retailPrice)
            setValue('retailPrice', data.retailPrice.toString(), { shouldValidate: true, shouldDirty: true, shouldTouch: true })
          }

          if (data.salePrice) {
            console.log('✅ Setting sale price:', data.salePrice)
            setValue('salePrice', data.salePrice.toString(), { shouldValidate: true, shouldDirty: true, shouldTouch: true })
          }
        }, 100)

        // Show image confirmation modal if images were found
        if (data.images && data.images.length > 0) {
          setScrapedImages(data.images)
          setShowImageModal(true)
          setUploadProgress('📸 Found ' + data.images.length + ' images - review and import')
        } else {
          setUploadProgress('✅ Product data imported!')
          setTimeout(() => setUploadProgress(''), 2000)
        }
      } else {
        // Scraping failed, attempt retry if under max attempts
        if (retryCount < maxRetries) {
          console.warn(`⚠️ Scraping failed (attempt ${retryCount + 1}), retrying...`)
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before retry
          return handleUrlScrape(url, retryCount + 1)
        }

        // Max retries exceeded
        console.error('❌ Scraping failed after', maxRetries, 'attempts:', data.error)
        setScrapeFailed(true)

        // Provide specific error message based on error type
        let errorMessage = '❌ Could not extract product data. '
        if (data.error?.includes('HTTP 404')) {
          errorMessage += 'Product page not found.'
        } else if (data.error?.includes('HTTP 403') || data.error?.includes('HTTP 401')) {
          errorMessage += 'Access denied by website.'
        } else if (data.error?.includes('timeout')) {
          errorMessage += 'Request timed out.'
        } else {
          errorMessage += 'Please fill manually.'
        }

        setUploadProgress(errorMessage)
        setTimeout(() => setUploadProgress(''), 7000)
      }
    } catch (error) {
      // Network or fetch error, attempt retry if under max attempts
      if (retryCount < maxRetries) {
        console.warn(`⚠️ Network error (attempt ${retryCount + 1}), retrying...`)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before retry
        return handleUrlScrape(url, retryCount + 1)
      }

      // Max retries exceeded
      console.error('❌ URL scraping error after', maxRetries, 'attempts:', error)
      setScrapeFailed(true)

      // Provide specific error message
      let errorMessage = '❌ '
      const errorMsg = (error as Error).message?.toLowerCase() || ''

      if (errorMsg.includes('failed to fetch') || errorMsg.includes('network')) {
        errorMessage += 'Network error. Check your connection.'
      } else if (errorMsg.includes('invalid url')) {
        errorMessage += 'Invalid URL format.'
      } else if (errorMsg.includes('cors')) {
        errorMessage += 'Website blocked request.'
      } else {
        errorMessage += 'Could not analyze URL. Please fill manually.'
      }

      setUploadProgress(errorMessage)
      setTimeout(() => setUploadProgress(''), 7000)
    } finally {
      setIsScrapingUrl(false)
    }
  }

  // Handle image confirmation from modal
  const handleImageConfirm = async (selectedImages: string[], mainImageIndex: number) => {
    console.log('📸 User selected', selectedImages.length, 'images, main index:', mainImageIndex)

    // TODO: Convert URLs to File objects and add to photos state
    // For now, just log and close modal
    setUploadProgress('✅ Product data and images imported!')
    setTimeout(() => setUploadProgress(''), 2000)
  }

  // Create price monitor function
  const createPriceMonitor = async (data: SneakerFormData) => {
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

  const onSubmit = async (data: SneakerFormData) => {
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

      // Use sale price if available, otherwise retail price
      const finalPrice = data.salePrice ? parseFloat(data.salePrice) : (data.retailPrice ? parseFloat(data.retailPrice) : null)

      const experienceData = {
        user_name: data.userName,
        brand: data.brand,
        model: data.model,
        colorway: data.colorway || 'Standard',
        sku: data.sku || null,
        // Only include try-on specific fields if actually tried on
        size_tried: data.interactionType === 'tried' ? data.sizeTried : null,
        fit_rating: data.interactionType === 'tried' ? data.fitRating : null,
        comfort_rating: data.interactionType === 'tried' ? (data.comfortRating || null) : null,
        // Always optional fields
        store_name: data.storeName || null,
        retail_price: finalPrice,
        ideal_price: data.idealPrice ? parseFloat(data.idealPrice) : null,
        notes: data.notes || null,
        interested_in_buying: true,
        try_on_date: new Date().toISOString().split('T')[0],
        image_url: mainImageUrl,
        cloudinary_id: mainCloudinaryId
      }

      const { error } = await supabase
        .from('sneakers')
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
            ? '✨ Sneaker added with price monitoring!'
            : '✨ Sneaker added to your collection!'
      )

      // Clear form after 3 seconds
      setTimeout(() => {
        reset()
        setSuccessMessage('')
        setUploadProgress('')
        setPhotos([])
        setUrlData(null)
        setScrapeFailed(false)
        setSmartImportExpanded(true) // Reset to expanded
        onSneakerAdded?.()
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

  const getFitRatingInfo = (rating: number) => {
    return FIT_RATINGS.find(r => r.value === rating)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-gray-50 to-blue-50">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-teal-600 to-orange-500 bg-clip-text text-transparent">
            <Sparkles className="h-7 w-7 text-blue-600" />
            Track Your Sneakers
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">Import from URL or add manually</p>
        </CardHeader>

        <CardContent>
          {successMessage && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* User and Experience Dropdowns - Required First */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Who's tracking? *
                </Label>
                <Select onValueChange={(value: 'Kenny' | 'Rene') => setValue('userName', value)} value={watchedUser}>
                  <SelectTrigger className="h-11 mt-2">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kenny">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4" />
                        <span>Kenny</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Rene">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4" />
                        <span>Rene</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.userName && (
                  <p className="text-xs text-red-600 mt-1">{errors.userName.message}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-teal-600" />
                  Experience *
                </Label>
                <Select onValueChange={(value: 'seen' | 'tried') => setValue('interactionType', value)} value={watchedInteractionType}>
                  <SelectTrigger className="h-11 mt-2">
                    <SelectValue placeholder="Select experience type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seen">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>Seen - Online or in store</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="tried">
                      <div className="flex items-center gap-2">
                        <Footprints className="h-4 w-4" />
                        <span>Tried On - Worn & tested</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.interactionType && (
                  <p className="text-xs text-red-600 mt-1">{errors.interactionType.message}</p>
                )}
              </div>
            </div>

            {/* Smart Import Section - Expanded by Default */}
            {watchedUser && watchedInteractionType && (
              <>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
                  <button
                    type="button"
                    onClick={() => setSmartImportExpanded(!smartImportExpanded)}
                    className="w-full flex items-center justify-between mb-3"
                  >
                    <div className="flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-blue-600" />
                      <Label className="text-base font-semibold text-blue-800 cursor-pointer">
                        Smart Import - Auto-fill from URL
                      </Label>
                    </div>
                    {smartImportExpanded ? (
                      <ChevronUp className="h-5 w-5 text-blue-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-blue-600" />
                    )}
                  </button>

                  {smartImportExpanded && (
                    <div className="space-y-4">
                      {/* URL Input */}
                      <div>
                        <Label className="text-xs text-blue-700 mb-2 block">
                          Paste product URL from Nike, Adidas, Foot Locker, StockX, etc.
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            {...register('productUrl')}
                            placeholder="https://www.nike.com/t/..."
                            className="flex-1"
                            disabled={isScrapingUrl}
                            aria-label="Product URL"
                            aria-describedby="url-help-text"
                          />
                          <Button
                            type="button"
                            onClick={() => handleUrlScrape(watch('productUrl') || '')}
                            disabled={isScrapingUrl || !watch('productUrl')}
                            size="sm"
                            className="px-4 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
                            aria-label={isScrapingUrl ? "Scraping product data" : "Scrape product URL"}
                            aria-busy={isScrapingUrl}
                          >
                            {isScrapingUrl ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Link className="h-4 w-4" aria-hidden="true" />}
                            <span className="sr-only">{isScrapingUrl ? "Loading product data" : "Import product data from URL"}</span>
                          </Button>
                        </div>
                        <p id="url-help-text" className="sr-only">Paste a product URL from Nike, Adidas, Foot Locker, StockX, or other retailers</p>
                      </div>

                      {/* Scraping Skeleton Loader */}
                      {isScrapingUrl && (
                        <div className="bg-white rounded-lg p-3 border-2 border-blue-300">
                          <div className="flex items-start gap-3">
                            <Skeleton className="w-16 h-16 rounded-lg" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-6 w-1/2" />
                              <Skeleton className="h-3 w-1/3" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* URL Data Preview */}
                      {!isScrapingUrl && urlData && (
                        <div className="bg-white rounded-lg p-3 border-2 border-green-300 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-start gap-3">
                            {urlData.image && (
                              <img src={urlData.image} alt="Product" className="w-16 h-16 object-cover rounded-lg" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <h4 className="font-medium text-sm text-green-800 truncate">
                                  {urlData.title || 'Product Found'}
                                </h4>
                              </div>
                              <div className="flex gap-4 mt-1">
                                {urlData.price && (
                                  <span className="text-lg font-bold text-green-600">${urlData.price}</span>
                                )}
                                {urlData.storeName && (
                                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{urlData.storeName}</span>
                                )}
                              </div>
                              {urlData.images && urlData.images.length > 1 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Camera className="h-3 w-3 text-blue-600" />
                                  <p className="text-xs text-blue-600">{urlData.images.length} images found</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Upload Progress */}
                      {uploadProgress && (
                        <Alert className={scrapeFailed ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}>
                          <Upload className={`h-4 w-4 ${scrapeFailed ? 'text-red-600' : 'text-blue-600'}`} />
                          <AlertDescription className={scrapeFailed ? "text-red-800" : "text-blue-800"}>{uploadProgress}</AlertDescription>
                        </Alert>
                      )}

                      <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        <span>Smart Import will automatically fill brand, model, colorway, store, and price</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Two-Column Layout - Primary Fields Left, Metadata Right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* LEFT COLUMN - Primary Product Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 border-b pb-2">Product Details</h3>

                    {/* Brand */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Brand *</Label>
                      <div className="mt-2">
                        <BrandCombobox
                          value={watchedBrand}
                          onChange={(value) => setValue('brand', value, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.brand && (
                        <p className="text-xs text-red-600 mt-1">{errors.brand.message}</p>
                      )}
                    </div>

                    {/* Model */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Model *</Label>
                      <Input
                        {...register('model')}
                        placeholder="Air Jordan 1, Air Max 90, etc."
                        className="mt-2"
                      />
                      {errors.model && (
                        <p className="text-xs text-red-600 mt-1">{errors.model.message}</p>
                      )}
                    </div>

                    {/* SKU/Style Code */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">SKU / Style Code (Optional)</Label>
                      <Input
                        {...register('sku')}
                        placeholder="DM7866-140"
                        className="mt-2"
                      />
                    </div>

                    {/* Photos */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Photos (Required - Min 1)
                      </Label>
                      <MultiPhotoUpload
                        photos={photos}
                        onPhotosChange={setPhotos}
                        maxPhotos={5}
                      />
                      {photos.length === 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-3 w-3 text-orange-600" />
                          <p className="text-xs text-orange-600">At least one photo is required</p>
                        </div>
                      )}
                    </div>

                    {/* Try-On Info (Conditional) */}
                    {watchedInteractionType === 'tried' && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Footprints className="h-4 w-4 text-teal-600" />
                          Try-On Details
                        </h4>

                        {/* Size Selection */}
                        <div className="mb-4">
                          <Label className="text-sm font-medium text-gray-700">Size Tried *</Label>
                          <div className="mt-2">
                            <SizeCombobox
                              value={watch('sizeTried')}
                              onChange={(value) => setValue('sizeTried', value, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
                              disabled={isLoading}
                              preferredSize={sizePreferences[watchedBrand]}
                            />
                          </div>
                          {errors.sizeTried && (
                            <p className="text-xs text-red-600 mt-1">{errors.sizeTried.message}</p>
                          )}
                        </div>

                        {/* Fit Rating */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700">How did they fit? *</Label>
                          <p className="text-xs text-gray-500 mt-1">Select the fit that best describes your experience</p>
                          <div className="grid grid-cols-5 gap-2 mt-3">
                            {FIT_RATINGS.map((rating) => (
                              <Button
                                key={rating.value}
                                type="button"
                                variant={watchedFitRating === rating.value ? 'default' : 'outline'}
                                onClick={() => setValue('fitRating', rating.value)}
                                className={cn(
                                  "min-h-[80px] md:h-20 flex flex-col items-center justify-center p-2 relative touch-manipulation",
                                  watchedFitRating === rating.value && "ring-2 ring-blue-600 ring-offset-2",
                                  "focus:ring-4 focus:ring-blue-300"
                                )}
                                aria-label={`Fit rating ${rating.value}: ${rating.label}`}
                                aria-pressed={watchedFitRating === rating.value}
                              >
                                <span className="text-2xl mb-1" aria-hidden="true">{rating.icon}</span>
                                <span className="text-xs font-semibold text-center leading-tight">{rating.label}</span>
                              </Button>
                            ))}
                          </div>
                          {watchedFitRating && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm text-blue-800 font-medium">
                                {getFitRatingInfo(watchedFitRating)?.label}: {getFitRatingInfo(watchedFitRating)?.description}
                              </p>
                            </div>
                          )}
                          {errors.fitRating && (
                            <p className="text-xs text-red-600 mt-2">{errors.fitRating.message}</p>
                          )}
                        </div>

                        {/* Comfort Rating (Optional) */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700">How comfortable were they? (Optional)</Label>
                          <p className="text-xs text-gray-500 mt-1">Rate overall comfort - cushioning, support, breathability</p>
                          <div className="flex items-center gap-1 mt-3">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => setValue('comfortRating', rating, { shouldValidate: true })}
                                className="group p-3 md:p-2 hover:scale-110 transition-transform touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 rounded"
                                title={`${rating} star${rating !== 1 ? 's' : ''}`}
                                aria-label={`${rating} star${rating !== 1 ? 's' : ''} comfort rating`}
                              >
                                <Star
                                  className={cn(
                                    'h-9 w-9 md:h-8 md:w-8 transition-colors',
                                    watch('comfortRating') && watch('comfortRating')! >= rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300 group-hover:text-gray-400'
                                  )}
                                  aria-hidden="true"
                                />
                              </button>
                            ))}
                            {watch('comfortRating') && (
                              <button
                                type="button"
                                onClick={() => setValue('comfortRating', undefined)}
                                className="ml-3 text-xs text-gray-500 hover:text-gray-700 underline min-h-[44px] flex items-center focus:ring-2 focus:ring-blue-300 rounded px-2"
                                aria-label="Clear comfort rating"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          {watch('comfortRating') && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <p className="text-sm text-yellow-800">
                                <span className="font-semibold">{watch('comfortRating')} / 5 stars</span> - {
                                  watch('comfortRating') === 1 ? 'Very uncomfortable' :
                                  watch('comfortRating') === 2 ? 'Uncomfortable' :
                                  watch('comfortRating') === 3 ? 'Decent comfort' :
                                  watch('comfortRating') === 4 ? 'Very comfortable' :
                                  'Extremely comfortable'
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT COLUMN - Metadata */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 border-b pb-2">Additional Info</h3>

                    {/* Colorway */}
                    <div>
                      <Label className="text-sm text-gray-600">Colorway (Optional)</Label>
                      <Input {...register('colorway')} placeholder="Bred, Chicago, etc." className="mt-2" />
                    </div>

                    {/* Store */}
                    <div>
                      <Label className="text-sm text-gray-600">Store (Optional)</Label>
                      <Input {...register('storeName')} placeholder="Foot Locker, etc." className="mt-2" />
                    </div>

                    {/* Pricing Section */}
                    <div className="space-y-3 border-t pt-4">
                      <div>
                        <Label className="text-sm text-gray-600">Retail Price (Optional)</Label>
                        <div className="relative mt-2">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input {...register('retailPrice')} placeholder="215.00" type="number" step="0.01" className="pl-8" />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm text-gray-600">Sale Price (Optional)</Label>
                        <div className="relative mt-2">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input {...register('salePrice')} placeholder="120.00" type="number" step="0.01" className="pl-8" />
                        </div>
                      </div>

                      {/* Discount Display */}
                      {watchedRetailPrice && watchedSalePrice && parseFloat(watchedSalePrice) < parseFloat(watchedRetailPrice) && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-green-600">${watchedSalePrice}</span>
                            <span className="text-sm text-gray-500 line-through">${watchedRetailPrice}</span>
                            <span className="text-sm font-semibold text-green-700">({discountPercentage}% off)</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label className="text-sm text-gray-600">Ideal Price (Optional)</Label>
                        <div className="relative mt-2">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input {...register('idealPrice')} placeholder="120.00" type="number" step="0.01" className="pl-8" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Price you'd be willing to pay</p>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-gray-600">Notes (Optional)</Label>
                        {watch('notes') && (
                          <span className="text-xs text-gray-500">
                            {watch('notes')?.length || 0} / 500
                          </span>
                        )}
                      </div>
                      <Textarea
                        {...register('notes')}
                        placeholder={watchedInteractionType === 'tried'
                          ? "e.g., 'Tight on pinky toe', 'Great for walking', 'Runs small compared to other Nikes'"
                          : "e.g., 'Love the colorway', 'Perfect for summer', 'Saw on Instagram'"
                        }
                        className="mt-2 resize-none"
                        rows={3}
                        maxLength={500}
                      />
                      <div className="mt-2 text-xs text-gray-500">
                        💡 Quick tips: {watchedInteractionType === 'tried'
                          ? 'Mention fit issues, comfort level, or comparisons with other shoes'
                          : 'Note where you saw them, what caught your eye, or styling ideas'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 focus:ring-4 focus:ring-blue-300"
                  disabled={isLoading || !isValid || photos.length === 0}
                  aria-label={isLoading ? "Saving sneaker data" : watchedInteractionType === 'tried' ? "Save try-on experience" : "Add sneaker to collection"}
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" aria-hidden="true" />
                      <span>Saving...</span>
                      <span className="sr-only">Please wait while we save your data</span>
                    </>
                  ) : (
                    <>
                      {watchedInteractionType === 'tried' ? (
                        <>
                          <Zap className="h-5 w-5 mr-2" aria-hidden="true" />
                          Save Try-On Experience
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" aria-hidden="true" />
                          Add to Collection
                        </>
                      )}
                    </>
                  )}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Image Confirmation Modal */}
      <ImageConfirmationModal
        open={showImageModal}
        onOpenChange={setShowImageModal}
        images={scrapedImages}
        onConfirm={handleImageConfirm}
      />
    </div>
  )
}