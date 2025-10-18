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
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Plus, X, Upload, Loader2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

// Common item sizes
const COMMON_SIZES = ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '14']

const sizesSchema = z.object({
  sizes: z.array(z.object({
    size: z.string().min(1, 'Size is required'),
    stock_count: z.number().min(0, 'Stock count must be 0 or more'),
    in_stock: z.boolean(),
    current_price: z.number().optional(),
    sale_price: z.number().optional()
  })).min(1, 'At least one size is required'),
  customSize: z.string().optional()
})

type SizesFormData = z.infer<typeof sizesSchema>

interface EnhancedProductDetailsProps {
  productId: string
  onBack: () => void
  onComplete: () => void
}

export function EnhancedProductDetails({ productId, onBack, onComplete }: EnhancedProductDetailsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set())
  const [customSizes, setCustomSizes] = useState<string[]>([])
  const [sizeData, setSizeData] = useState<Record<string, { stock: number, inStock: boolean, currentPrice?: number, salePrice?: number }>>({})

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<SizesFormData>({
    resolver: zodResolver(sizesSchema),
    defaultValues: {
      sizes: [],
      customSize: ''
    }
  })

  // Toggle size selection
  const toggleSize = (size: string) => {
    const newSelected = new Set(selectedSizes)
    if (newSelected.has(size)) {
      newSelected.delete(size)
      const newSizeData = { ...sizeData }
      delete newSizeData[size]
      setSizeData(newSizeData)
    } else {
      newSelected.add(size)
      setSizeData({
        ...sizeData,
        [size]: { stock: 0, inStock: true }
      })
    }
    setSelectedSizes(newSelected)
  }

  // Add custom size
  const addCustomSize = () => {
    const customSize = (document.getElementById('customSize') as HTMLInputElement)?.value
    if (customSize && !selectedSizes.has(customSize) && !COMMON_SIZES.includes(customSize)) {
      setCustomSizes([...customSizes, customSize])
      toggleSize(customSize)
      ;(document.getElementById('customSize') as HTMLInputElement).value = ''
    }
  }

  // Update size data
  const updateSizeData = (size: string, field: string, value: any) => {
    setSizeData({
      ...sizeData,
      [size]: {
        ...sizeData[size],
        [field]: value
      }
    })
  }

  const onSubmit = async (data: SizesFormData) => {
    setIsLoading(true)
    setSuccessMessage('')

    try {
      // Prepare sizes data for database
      const sizesToInsert = Array.from(selectedSizes).map(size => ({
        product_id: productId,
        size,
        stock_count: sizeData[size]?.stock || 0,
        in_stock: sizeData[size]?.inStock ?? true,
        current_price: sizeData[size]?.currentPrice || null,
        sale_price: sizeData[size]?.salePrice || null
      }))

      console.log('Inserting sizes:', sizesToInsert)

      // Insert sizes
      const { error: sizesError } = await supabase
        .from('product_sizes')
        .insert(sizesToInsert)

      if (sizesError) {
        console.error('Sizes error:', sizesError)
        throw sizesError
      }

      setSuccessMessage('✅ Sizes and inventory saved successfully!')

      // Auto-advance after 2 seconds
      setTimeout(() => {
        onComplete()
      }, 2000)

    } catch (error) {
      console.error('Error saving sizes:', error)
      alert(`Failed to save sizes: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <CardTitle className="text-2xl">📏 Add Sizes & Inventory</CardTitle>
          <div></div>
        </div>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Size Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Available Sizes</Label>

            {/* Common Sizes */}
            <div>
              <p className="text-sm text-slate-600 mb-3">Click sizes to add them:</p>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {COMMON_SIZES.map((size) => (
                  <Button
                    key={size}
                    type="button"
                    variant={selectedSizes.has(size) ? "default" : "outline"}
                    className={`h-12 ${selectedSizes.has(size) ? 'bg-blue-600 text-white' : ''}`}
                    onClick={() => toggleSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Size Input */}
            <div className="flex gap-2">
              <Input
                id="customSize"
                placeholder="Custom size (e.g., 15, 6Y, XS)"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
              />
              <Button type="button" onClick={addCustomSize} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Custom Sizes Display */}
            {customSizes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customSizes.map((size) => (
                  <Badge
                    key={size}
                    variant={selectedSizes.has(size) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleSize(size)}
                  >
                    {size}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Size Details */}
          {selectedSizes.size > 0 && (
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Size Details</Label>
              <div className="grid gap-4">
                {Array.from(selectedSizes).sort().map((size) => (
                  <div key={size} className="p-4 border rounded-lg bg-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div className="font-medium">Size {size}</div>

                      <div>
                        <Label className="text-sm">Stock Count</Label>
                        <Input
                          type="number"
                          min="0"
                          value={sizeData[size]?.stock || 0}
                          onChange={(e) => updateSizeData(size, 'stock', parseInt(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Current Price ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Override retail"
                          value={sizeData[size]?.currentPrice || ''}
                          onChange={(e) => updateSizeData(size, 'currentPrice', parseFloat(e.target.value) || undefined)}
                          className="mt-1"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`inStock-${size}`}
                          checked={sizeData[size]?.inStock ?? true}
                          onChange={(e) => updateSizeData(size, 'inStock', e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor={`inStock-${size}`} className="text-sm">In Stock</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-lg"
            disabled={isLoading || selectedSizes.size === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving Sizes...
              </>
            ) : (
              <>💾 Save Sizes & Inventory</>
            )}
          </Button>

          {selectedSizes.size === 0 && (
            <p className="text-center text-sm text-slate-500">
              Select at least one size to continue
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}