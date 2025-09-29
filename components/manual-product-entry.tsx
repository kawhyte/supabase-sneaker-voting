'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Upload, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { EnhancedProductDetails } from './enhanced-product-details'
import { MultiPhotoUpload } from './multi-photo-upload'

interface PhotoItem {
  id: string
  file: File
  preview: string
  isMain: boolean
  order: number
}

// Ultra-simple form schema - Phase 1A
const productSchema = z.object({
  productName: z.string().min(1, 'Product name is required').min(3, 'Product name too short'),
  sku: z.string().min(1, 'SKU/Style code is required'),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Enter a valid price')
})

type ProductFormData = z.infer<typeof productSchema>

interface ManualProductEntryProps {
  onProductAdded?: () => void
}

export function ManualProductEntry({ onProductAdded }: ManualProductEntryProps = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [uploadProgress, setUploadProgress] = useState('')
  const [showProgressiveOptions, setShowProgressiveOptions] = useState(false)
  const [savedProductId, setSavedProductId] = useState<string | null>(null)
  const [showEnhancedDetails, setShowEnhancedDetails] = useState(false)

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'onChange'
  })

  // Smart parsing of product name
  const parseProductName = (productName: string) => {
    const parts = productName.trim().split(' ')
    if (parts.length < 2) {
      return { brand: productName, model: '', colorway: '' }
    }

    const brand = parts[0]
    const remaining = parts.slice(1).join(' ')

    // Try to detect colorway at the end (often in quotes or after keywords)
    const colorwayIndicators = ['"', "'", 'in', 'colorway']
    let model = remaining
    let colorway = ''

    for (const indicator of colorwayIndicators) {
      const index = remaining.toLowerCase().lastIndexOf(indicator)
      if (index > 0) {
        model = remaining.substring(0, index).trim()
        colorway = remaining.substring(index).replace(/["']/g, '').replace(/^(in|colorway)\s*/i, '').trim()
        break
      }
    }

    return { brand, model, colorway }
  }


  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true)
    setSuccessMessage('')

    try {
      // Parse the product name
      const { brand, model, colorway } = parseProductName(data.productName)

      let mainImageUrl = null
      let mainCloudinaryId = null

      // Upload photos to Cloudinary if provided
      if (photos.length > 0) {
        setUploadProgress(`📤 Uploading ${photos.length} photo(s)...`)
        console.log(`Uploading ${photos.length} photos to Cloudinary...`)

        // Upload main photo first
        const mainPhoto = photos.find(p => p.isMain) || photos[0]
        const mainFormData = new FormData()
        mainFormData.append('file', mainPhoto.file)

        const mainUploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: mainFormData
        })

        if (!mainUploadResponse.ok) {
          const error = await mainUploadResponse.json()
          throw new Error(error.error || 'Failed to upload main image')
        }

        const mainUploadResult = await mainUploadResponse.json()
        mainImageUrl = mainUploadResult.data.url
        mainCloudinaryId = mainUploadResult.data.publicId

        setUploadProgress('✅ Photos uploaded!')
        console.log('Main image uploaded successfully:', mainUploadResult.data)
      }

      const productData = {
        sku: data.sku,
        brand,
        model,
        colorway: colorway || 'Standard',
        retail_price: parseFloat(data.price),
        category: 'sneakers',
        image_url: mainImageUrl,
        cloudinary_id: mainCloudinaryId
      }

      console.log('Attempting to insert product data:', productData)

      // Create the product and get the ID back
      const { data: insertedProduct, error: productError } = await supabase
        .from('products')
        .insert(productData)
        .select('id')
        .single()

      if (productError) {
        console.error('Supabase error:', productError)
        throw productError
      }

      setSavedProductId(insertedProduct.id)
      setSuccessMessage('🎉 Product saved successfully!')

      // Show progressive disclosure options after a short delay
      setTimeout(() => {
        setShowProgressiveOptions(true)
      }, 1000)

    } catch (error) {
      console.error('Error saving product:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      setSuccessMessage('')
      setUploadProgress('')
      // Show user-friendly error message
      alert(`Failed to save product: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const watchedProductName = watch('productName')
  const watchedPrice = watch('price')

  // Handle adding more details
  const handleAddMoreDetails = () => {
    setShowEnhancedDetails(true)
  }

  // Handle back from enhanced details
  const handleBackFromEnhanced = () => {
    setShowEnhancedDetails(false)
  }

  // Handle completion of enhanced details
  const handleEnhancedComplete = () => {
    setShowEnhancedDetails(false)
    handleImDone() // Reset everything
  }

  // Handle "I'm Done" - reset everything
  const handleImDone = () => {
    reset()
    // Clean up photo preview URLs
    photos.forEach(photo => URL.revokeObjectURL(photo.preview))
    setPhotos([])
    setSuccessMessage('')
    setUploadProgress('')
    setShowProgressiveOptions(false)
    setSavedProductId(null)
    setShowEnhancedDetails(false)
    onProductAdded?.()
  }

  // Show enhanced details view if requested
  if (showEnhancedDetails && savedProductId) {
    return (
      <EnhancedProductDetails
        productId={savedProductId}
        onBack={handleBackFromEnhanced}
        onComplete={handleEnhancedComplete}
      />
    )
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">✨ Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {uploadProgress && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Upload className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">{uploadProgress}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="productName" className="text-base flex items-center gap-2">
              👟 Product Name
            </Label>
            <Input
              id="productName"
              {...register('productName')}
              placeholder="Nike Air Jordan 1 Bred"
              className={`h-12 text-base ${errors.productName ? 'border-red-300 ring-red-100' : watchedProductName ? 'border-green-300 ring-green-100' : ''}`}
            />
            {errors.productName && (
              <p className="text-sm text-red-600">{errors.productName.message}</p>
            )}
            {watchedProductName && !errors.productName && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Looks good!
              </p>
            )}
            <p className="text-xs text-gray-500">💡 Example: Nike Air Jordan 1 Bred</p>
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <Label htmlFor="sku" className="text-base flex items-center gap-2">
              🏷️ SKU/Style Code
            </Label>
            <Input
              id="sku"
              {...register('sku')}
              placeholder="555088-061"
              className={`h-12 text-base ${errors.sku ? 'border-red-300 ring-red-100' : ''}`}
            />
            {errors.sku && (
              <p className="text-sm text-red-600">{errors.sku.message}</p>
            )}
            <p className="text-xs text-gray-500">💡 Example: 555088-061</p>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-base flex items-center gap-2">
              💰 Price
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="price"
                {...register('price')}
                placeholder="170.00"
                className={`h-12 text-base pl-8 ${errors.price ? 'border-red-300 ring-red-100' : watchedPrice ? 'border-green-300 ring-green-100' : ''}`}
              />
            </div>
            {errors.price && (
              <p className="text-sm text-red-600">{errors.price.message}</p>
            )}
            {watchedPrice && !errors.price && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                ${watchedPrice}
              </p>
            )}
          </div>

          {/* Multi-Photo Upload */}
          <div className="space-y-2">
            <Label className="text-base flex items-center gap-2">
              📸 Product Photos
            </Label>
            <MultiPhotoUpload
              photos={photos}
              onPhotosChange={setPhotos}
              maxPhotos={5}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              💡 Upload up to 5 photos. The first photo will be the main image, or click "Set Main" on any photo.
            </p>
          </div>

          {/* Submit Button */}
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
              <>🚀 Save Product</>
            )}
          </Button>
        </form>

        {/* Progressive Disclosure Options */}
        {showProgressiveOptions && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                🎯 Want to add more details?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Your product is saved! You can add additional details now or come back later.
              </p>

              <div className="grid grid-cols-1 gap-3 mb-4">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <span>📏</span> Available sizes and stock levels
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <span>🏷️</span> Product tags and categories
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <span>💰</span> Sale pricing and promotions
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleAddMoreDetails}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  ➕ Add Details
                </Button>
                <Button
                  onClick={handleImDone}
                  variant="outline"
                  className="border-gray-300"
                >
                  🏁 I'm Done
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Section */}
        {!showProgressiveOptions && watchedProductName && watchedPrice && !errors.productName && !errors.price && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <div className="text-sm text-gray-600">
              <p><strong>{watchedProductName}</strong></p>
              <p>${watchedPrice}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}