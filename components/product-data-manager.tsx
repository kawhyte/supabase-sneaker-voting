'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UrlParser } from '@/components/url-parser'
import { ManualProductEntry } from '@/components/manual-product-entry'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link, FileEdit } from 'lucide-react'

export function ProductDataManager() {
  const [activeTab, setActiveTab] = useState('url-parser')
  const [recentProducts, setRecentProducts] = useState<any[]>([])

  const handleProductAdded = () => {
    // Refresh recent products or show success message
    console.log('Product added successfully')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Data Manager</CardTitle>
          <CardDescription>
            Add products to SoleTracker by parsing URLs from supported stores or entering data manually
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url-parser" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                URL Parser
              </TabsTrigger>
              <TabsTrigger value="manual-entry" className="flex items-center gap-2">
                <FileEdit className="h-4 w-4" />
                Manual Entry
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url-parser" className="mt-6">
              <UrlParser onProductParsed={handleProductAdded} />
            </TabsContent>

            <TabsContent value="manual-entry" className="mt-6">
              <ManualProductEntry onProductAdded={handleProductAdded} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">URL Parser</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Perfect for quickly adding products from supported retailers. Simply paste a product URL and let the system extract all the details automatically.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Automatic data extraction</Badge>
              <Badge variant="outline">Multiple images</Badge>
              <Badge variant="outline">All sizes detected</Badge>
              <Badge variant="outline">Real-time pricing</Badge>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Manual Entry</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Use when URL parsing isn't available or you need to add custom products. Gives you full control over all product details.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Full customization</Badge>
              <Badge variant="outline">Any store supported</Badge>
              <Badge variant="outline">Custom sizing</Badge>
              <Badge variant="outline">Multiple images</Badge>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Supported Stores (URL Parser)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <span>• Nike (nike.com)</span>
              <span>• Snipes USA (snipesusa.com)</span>
              <span>• Shoe Palace (shoepalace.com)</span>
              <span>• Foot Locker (footlocker.com)</span>
              <span>• Hibbett Sports (hibbett.com)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}