'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Globe, ShoppingCart, AlertCircle, Check } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'

interface ParsedProduct {
  name: string
  brand: string
  model: string
  colorway?: string
  price: number
  salePrice?: number
  sku?: string
  images: string[]
  sizes: string[]
  inStock: boolean
  storeId: string
  url: string
}

interface Store {
  id: string
  name: string
  domain: string
}

interface UrlParserProps {
  onProductParsed?: (product: ParsedProduct & { store: Store }) => void
}

const supportedStores = [
  { name: 'Snipes USA', domain: 'snipesusa.com' },
  { name: 'Nike', domain: 'nike.com' },
  { name: 'Shoe Palace', domain: 'shoepalace.com' },
  { name: 'Foot Locker', domain: 'footlocker.com' },
  { name: 'Hibbett Sports', domain: 'hibbett.com' }
]

export function UrlParser({ onProductParsed }: UrlParserProps) {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [parsedProduct, setParsedProduct] = useState<ParsedProduct & { store: Store } | null>(null)
  const supabase = createClient()

  const handleParseUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    setIsLoading(true)
    setError('')
    setParsedProduct(null)

    try {
      const response = await fetch('/api/parse-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      if (result.success && result.product) {
        const productWithStore = {
          ...result.product,
          store: result.store,
          fromCache: result.fromCache || false
        }
        setParsedProduct(productWithStore)
        onProductParsed?.(productWithStore)
      } else {
        throw new Error('Failed to parse product data')
      }
    } catch (err) {
      console.error('Parse error:', err)
      setError(err instanceof Error ? err.message : 'Failed to parse product URL')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToDatabase = async () => {
    if (!parsedProduct) return

    try {
      // First check if the store exists, if not add it
      const { data: existingStore } = await supabase
        .from('stores')
        .select('id')
        .eq('domain', parsedProduct.store.domain)
        .single()

      let storeId = existingStore?.id

      if (!storeId) {
        const { data: newStore, error: storeError } = await supabase
          .from('stores')
          .insert({
            name: parsedProduct.store.name,
            domain: parsedProduct.store.domain,
            active: true
          })
          .select('id')
          .single()

        if (storeError) throw storeError
        storeId = newStore.id
      }

      // Add or update the product
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('sku', parsedProduct.sku || parsedProduct.name)
        .single()

      let productId = existingProduct?.id

      if (!productId) {
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert({
            sku: parsedProduct.sku || `${parsedProduct.brand}-${Date.now()}`,
            brand: parsedProduct.brand,
            model: parsedProduct.model,
            colorway: parsedProduct.colorway,
            retail_price: parsedProduct.price,
            image_url: parsedProduct.images[0] || null
          })
          .select('id')
          .single()

        if (productError) throw productError
        productId = newProduct.id
      }

      // Add price history entry for each size
      const priceEntries = parsedProduct.sizes.length > 0
        ? parsedProduct.sizes.map(size => ({
            product_id: productId,
            store_id: storeId,
            size,
            price: parsedProduct.price,
            sale_price: parsedProduct.salePrice,
            in_stock: parsedProduct.inStock,
            checked_at: new Date().toISOString()
          }))
        : [{
            product_id: productId,
            store_id: storeId,
            size: 'One Size',
            price: parsedProduct.price,
            sale_price: parsedProduct.salePrice,
            in_stock: parsedProduct.inStock,
            checked_at: new Date().toISOString()
          }]

      const { error: priceError } = await supabase
        .from('price_history')
        .insert(priceEntries)

      if (priceError) throw priceError

      alert('Product successfully added to database!')
      setParsedProduct(null)
      setUrl('')

    } catch (err) {
      console.error('Database error:', err)
      setError(err instanceof Error ? err.message : 'Failed to add product to database')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            URL Product Parser
          </CardTitle>
          <CardDescription>
            Parse product data from supported sneaker retailer websites
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleParseUrl}
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Parsing...
                </>
              ) : (
                'Parse URL'
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <p className="text-sm text-muted-foreground mb-2">Supported stores:</p>
            <div className="flex flex-wrap gap-2">
              {supportedStores.map((store) => (
                <Badge key={store.domain} variant="secondary" className="text-xs">
                  {store.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {parsedProduct && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Parsed Product</span>
              <div className="flex gap-2">
                {(parsedProduct as any).fromCache && (
                  <Badge variant="outline" className="text-xs">
                    📦 Cached
                  </Badge>
                )}
                <Badge variant={parsedProduct.inStock ? 'default' : 'secondary'}>
                  {parsedProduct.inStock ? 'In Stock' : 'Out of Stock'}
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              From {parsedProduct.store.name} ({parsedProduct.store.domain})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Images */}
            {parsedProduct.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {parsedProduct.images.slice(0, 3).map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={image}
                      alt={`${parsedProduct.name} ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Product Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">{parsedProduct.name}</h3>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline">{parsedProduct.brand}</Badge>
                  {parsedProduct.colorway && (
                    <Badge variant="outline">{parsedProduct.colorway}</Badge>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {parsedProduct.salePrice && parsedProduct.salePrice < parsedProduct.price ? (
                    <>
                      <span className="text-2xl font-bold text-red-600">
                        ${parsedProduct.salePrice}
                      </span>
                      <span className="text-lg line-through text-muted-foreground">
                        ${parsedProduct.price}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold">
                      ${parsedProduct.price}
                    </span>
                  )}
                </div>
                {parsedProduct.sku && (
                  <p className="text-sm text-muted-foreground">SKU: {parsedProduct.sku}</p>
                )}
              </div>
            </div>

            {/* Sizes */}
            {parsedProduct.sizes.length > 0 && (
              <div>
                <p className="font-medium mb-2">Available Sizes</p>
                <div className="flex flex-wrap gap-2">
                  {parsedProduct.sizes.map((size) => (
                    <Badge key={size} variant="outline">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                <p>Model: {parsedProduct.model}</p>
                <p>Store ID: {parsedProduct.storeId}</p>
              </div>
              <Button onClick={handleAddToDatabase} className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Add to Database
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}