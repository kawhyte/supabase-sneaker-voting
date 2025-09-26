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

// Ultra-simple form schema - Phase 1A
const productSchema = z.object({
  productName: z.string().min(1, 'Product name is required').min(3, 'Product name too short'),
  sku: z.string().min(1, 'SKU/Style code is required'),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Enter a valid price'),
  image: z.any().optional()
})

type ProductFormData = z.infer<typeof productSchema>

interface ManualProductEntryProps {
  onProductAdded?: () => void
}

export function ManualProductEntry({ onProductAdded }: ManualProductEntryProps = {}) {
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

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true)
    setSuccessMessage('')

    try {
      // Parse the product name
      const { brand, model, colorway } = parseProductName(data.productName)

      let imageUrl = null
      let cloudinaryId = null

      // Upload image to Cloudinary if provided
      if (data.image) {
        setUploadProgress('📤 Uploading image...')
        console.log('Uploading image to Cloudinary...')

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
        console.log('Image uploaded successfully:', uploadResult.data)
      }

      const productData = {
        sku: data.sku,
        brand,
        model,
        colorway: colorway || 'Standard',
        retail_price: parseFloat(data.price),
        category: 'sneakers',
        image_url: imageUrl,
        cloudinary_id: cloudinaryId
      }

      console.log('Attempting to insert product data:', productData)

      // Create the product
      const { error: productError } = await supabase
        .from('products')
        .insert(productData)

      if (productError) {
        console.error('Supabase error:', productError)
        throw productError
      }

      setSuccessMessage('🎉 Product saved successfully!')

      // Reset form after short delay
      setTimeout(() => {
        reset()
        setImagePreview(null)
        setSuccessMessage('')
        setUploadProgress('')
        onProductAdded?.()
      }, 2000)

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

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-base flex items-center gap-2">
              📸 Main Photo
            </Label>
            <label
              className={`relative block border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
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
                  <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto rounded" />
                  <p className="text-sm text-green-600">✅ Image ready</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-600">
                    📷 Tap to add photo or drag & drop here
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

        {/* Preview Section */}
        {watchedProductName && watchedPrice && !errors.productName && !errors.price && (
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