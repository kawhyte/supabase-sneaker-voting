'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Link2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'

interface ProductUrlInputProps {
  onProductDataLoaded?: (data: any) => void
  className?: string
}

interface ProductData {
  brand?: string
  model?: string
  color?: string
  retailPrice?: number
  images?: string[]
  success: boolean
  error?: string
}

export function ProductUrlInput({ onProductDataLoaded, className = '' }: ProductUrlInputProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProductData | null>(null)
  const [error, setError] = useState<string>('')

  const handleScrape = async () => {
    if (!url.trim()) {
      setError('Please enter a product URL')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data: ProductData = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape product')
      }

      setResult(data)

      if (data.success && onProductDataLoaded) {
        onProductDataLoaded({
          brand: data.brand || '',
          model: data.model || '',
          color: data.color || 'Standard',
          retail_price: data.retailPrice || null,
          image_url: data.images?.[0] || null,
          product_url: url.trim()
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while scraping')
    } finally {
      setLoading(false)
    }
  }

  const getSupportedSites = () => [
    'SoleRetriever.com',
    'Nike.com',
    'Adidas.com',
    'StockX.com',
    'Other item sites'
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="product-url" className="text-sm font-medium flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          Product URL
          <span className="text-xs text-slate-500 font-normal">(Optional - Auto-fill form)</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="product-url"
            type="url"
            placeholder="https://www.nike.com/t/air-jordan-1-retro..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
            disabled={loading}
          />
          <Button
            onClick={handleScrape}
            disabled={loading || !url.trim()}
            className="shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? 'Parsing...' : 'Auto-fill'}
          </Button>
        </div>

        <div className="text-xs text-slate-500">
          Supported: {getSupportedSites().join(', ')}
        </div>
      </div>

      {/* Success Result */}
      {result && result.success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Product data extracted successfully!</span>
            </div>

            <div className="space-y-2 text-sm">
              {result.brand && (
                <div>
                  <span className="font-medium">Brand:</span> {result.brand}
                </div>
              )}
              {result.model && (
                <div>
                  <span className="font-medium">Model:</span> {result.model}
                </div>
              )}
              {result.color && result.color !== 'Standard' && (
                <div>
                  <span className="font-medium">Color:</span> {result.color}
                </div>
              )}
              {result.retailPrice && (
                <div>
                  <span className="font-medium">Retail Price:</span> ${result.retailPrice}
                </div>
              )}
              {result.images && result.images.length > 0 && (
                <div>
                  <span className="font-medium">Images:</span> {result.images.length} found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Failed Result */}
      {result && !result.success && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {result.error || 'Failed to extract product data from this URL'}
          </AlertDescription>
        </Alert>
      )}

      {/* Help Text */}
      <div className="text-xs text-slate-500 space-y-1">
        <p>💡 <strong>How it works:</strong> Paste a item product URL and we'll automatically extract the brand, model, color, and price to fill out your form.</p>
        <p>📝 <strong>Manual entry:</strong> You can still fill out the form manually if auto-fill doesn't work or if you prefer to enter custom information.</p>
      </div>
    </div>
  )
}