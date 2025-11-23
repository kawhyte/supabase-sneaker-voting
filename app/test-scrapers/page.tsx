'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface TestResult {
  url: string
  success: boolean
  data?: any
  error?: string
  timestamp: string
  duration: number
  source?: string
}

export default function TestScrapersPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  // Pre-filled test URLs for quick testing
  const testUrls = [
    // NEW RETAILERS
    {
      name: 'Gymshark (New)',
      url: 'https://www.gymshark.com/products/gymshark-twist-front-bralette-white-aw24',
      tier: 'New',
      color: 'bg-green-500'
    },
    {
      name: 'Sole Retriever (New)',
      url: 'https://www.soleretriever.com/sneaker-release-dates/nike/kobe-9/nike-kobe-9-em-protro-china-ih1400-600',
      tier: 'New',
      color: 'bg-green-500'
    },
    {
      name: 'GOAT (New)',
      url: 'https://www.goat.com/sneakers/air-jordan-11-retro-rare-air-ih0296-400',
      tier: 'New',
      color: 'bg-green-500'
    },
    // EXISTING RETAILERS - HIGH PRIORITY
    {
      name: 'Nike (Existing)',
      url: 'https://www.nike.com/t/air-max-90-mens-shoes-6n8Nd/CN8490-002',
      tier: 'Existing',
      color: 'bg-blue-600'
    },
    {
      name: 'Adidas (Existing)',
      url: 'https://www.adidas.com/us/stan-smith-shoes/FX5501.html',
      tier: 'Existing',
      color: 'bg-blue-600'
    },
    {
      name: 'Foot Locker (Existing)',
      url: 'https://www.footlocker.com/product/jordan-retro-11-mens/378037.html',
      tier: 'Existing',
      color: 'bg-blue-600'
    },
    {
      name: 'Shoe Palace (Existing)',
      url: 'https://www.shoepalace.com/products/asics-mens-gel-kayano-14-1201a019-020-black-pure-silver',
      tier: 'Existing',
      color: 'bg-blue-600'
    },
    {
      name: 'Finish Line (Existing)',
      url: 'https://www.finishline.com/store/product/mens-nike-air-max-90-casual-shoes/prod2794444',
      tier: 'Existing',
      color: 'bg-blue-600'
    },
    // EXISTING RETAILERS - MEDIUM PRIORITY
    {
      name: 'Champs Sports (Existing)',
      url: 'https://www.champssports.com/product/jordan-retro-11-mens/378037.html',
      tier: 'Existing',
      color: 'bg-purple-600'
    },
    {
      name: 'JD Sports (Existing)',
      url: 'https://www.jdsports.com/product/black-nike-air-max-90/16462825',
      tier: 'Existing',
      color: 'bg-purple-600'
    },
    {
      name: "Dick's Sporting Goods (Existing)",
      url: 'https://www.dickssportinggoods.com/p/nike-mens-air-max-90-shoes-20nikmairmx90xxxmsho/20nikmairmx90xxxmsho',
      tier: 'Existing',
      color: 'bg-purple-600'
    }
  ]

  const testScraper = async (testUrl: string) => {
    setLoading(true)
    setResult(null)

    const startTime = Date.now()

    try {
      const response = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl })
      })

      const data = await response.json()
      const endTime = Date.now()

      setResult({
        url: testUrl,
        success: data.success,
        data: data,
        error: data.error,
        timestamp: new Date().toISOString(),
        duration: endTime - startTime,
        source: data.source
      })
    } catch (error) {
      const endTime = Date.now()
      setResult({
        url: testUrl,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        duration: endTime - startTime
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTest = () => {
    if (!url.trim()) return
    testScraper(url)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧪 Scraper Test Lab</h1>
        <p className="text-muted-foreground">
          Test the Smart Hybrid Scraping Architecture with 5-tier resilience system
        </p>
      </div>

      {/* Quick Test Buttons */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Tests</CardTitle>
          <CardDescription>Click to test pre-configured URLs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {testUrls.map((test, index) => (
            <div key={index} className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setUrl(test.url)
                  testScraper(test.url)
                }}
                disabled={loading}
                variant="outline"
                className="flex-1 justify-start"
              >
                <Badge className={`${test.color} mr-2`}>{test.tier}</Badge>
                {test.name}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Custom URL Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Custom URL Test</CardTitle>
          <CardDescription>Test any product URL</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://www.example.com/product/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTest()}
              disabled={loading}
            />
            <Button onClick={handleTest} disabled={loading || !url.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Test Result
              </CardTitle>
              <Badge variant={result.success ? 'default' : 'destructive'}>
                {result.duration}ms
              </Badge>
            </div>
            <CardDescription className="break-all">{result.url}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status */}
            <div>
              <h3 className="font-semibold mb-2">Status</h3>
              <div className="flex items-center gap-2">
                <Badge variant={result.success ? 'default' : 'destructive'}>
                  {result.success ? 'Success' : 'Failed'}
                </Badge>
                {result.source && (
                  <Badge variant="outline">{result.source}</Badge>
                )}
              </div>
            </div>

            {/* Extracted Data */}
            {result.success && result.data && (
              <div>
                <h3 className="font-semibold mb-2">Extracted Data</h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Brand</p>
                    <p className="font-medium">{result.data.brand || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Retail Price</p>
                    <p className="font-medium">
                      {result.data.retailPrice ? `$${result.data.retailPrice}` : 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Model</p>
                    <p className="font-medium">{result.data.model || 'N/A'}</p>
                  </div>
                  {result.data.salePrice && (
                    <div>
                      <p className="text-sm text-muted-foreground">Sale Price</p>
                      <p className="font-medium text-green-600">
                        ${result.data.salePrice}
                      </p>
                    </div>
                  )}
                  {result.data.category && (
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{result.data.category}</p>
                    </div>
                  )}
                  {result.data.images && result.data.images.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        Images ({result.data.images.length})
                      </p>
                      <div className="flex gap-2 overflow-x-auto">
                        {result.data.images.slice(0, 3).map((img: string, idx: number) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Product ${idx + 1}`}
                            className="h-24 w-24 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {!result.success && result.error && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Error Message
                </h3>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{result.error}</p>
                </div>
              </div>
            )}

            {/* Raw JSON */}
            <details>
              <summary className="font-semibold cursor-pointer mb-2">
                Raw JSON Response
              </summary>
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-xs">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}

      {/* Architecture Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>5-Tier Architecture</CardTitle>
          <CardDescription>How the scraping system works</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Badge className="bg-green-500">Tier 1</Badge>
            <p>Shopify JSON Backdoor - 100% reliable, no HTML parsing</p>
          </div>
          <div className="flex items-start gap-2">
            <Badge className="bg-blue-500">Tier 2</Badge>
            <p>Standard Fetch - Cheerio HTML parsing (70-80% success)</p>
          </div>
          <div className="flex items-start gap-2">
            <Badge className="bg-purple-500">Tier 3</Badge>
            <p>Browserless /content - JavaScript rendering (+15-20%)</p>
          </div>
          <div className="flex items-start gap-2">
            <Badge className="bg-orange-500">Tier 4</Badge>
            <p>Browserless /unblock - Residential proxies for anti-bot sites</p>
          </div>
          <div className="flex items-start gap-2">
            <Badge className="bg-red-500">Tier 5</Badge>
            <p>Gemini AI Fallback - When selectors fail but HTML fetched</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
