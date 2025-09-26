'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'

export function TestUrlParser() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  const testWithMockData = async () => {
    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/test-parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url || 'https://www.nike.com/test' }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to parse')
      }
    } catch (err) {
      console.error('Test error:', err)
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const testWithRealParser = async () => {
    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/parse-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url || 'https://www.nike.com/test' }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to parse')
      }
    } catch (err) {
      console.error('Parse error:', err)
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>URL Parser Testing</CardTitle>
          <CardDescription>
            Test the URL parsing functionality with mock data or real parsing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://www.nike.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={testWithMockData}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test with Mock Data'
              )}
            </Button>

            <Button
              onClick={testWithRealParser}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Parsing...
                </>
              ) : (
                'Test Real Parser'
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Test Result</span>
                  <div className="flex gap-2">
                    {result.fromCache && (
                      <Badge variant="outline" className="text-xs">
                        📦 Cached
                      </Badge>
                    )}
                    <Badge variant={result.product?.inStock ? 'default' : 'secondary'}>
                      {result.product?.inStock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{result.product?.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{result.product?.brand}</Badge>
                      {result.product?.colorway && (
                        <Badge variant="outline">{result.product?.colorway}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {result.product?.salePrice && result.product.salePrice < result.product.price ? (
                        <>
                          <span className="text-2xl font-bold text-red-600">
                            ${result.product.salePrice}
                          </span>
                          <span className="text-lg line-through text-muted-foreground">
                            ${result.product.price}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold">
                          ${result.product?.price}
                        </span>
                      )}
                    </div>
                    {result.product?.sku && (
                      <p className="text-sm text-muted-foreground">SKU: {result.product.sku}</p>
                    )}
                  </div>

                  {result.product?.sizes && result.product.sizes.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Available Sizes</p>
                      <div className="flex flex-wrap gap-2">
                        {result.product.sizes.map((size: string) => (
                          <Badge key={size} variant="outline">
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    <p>Store: {result.store?.name} ({result.store?.domain})</p>
                    <p>Store ID: {result.product?.storeId}</p>
                  </div>

                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}