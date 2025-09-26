import { ProductDataManager } from '@/components/product-data-manager'

export default function ProductParserPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            SoleTracker Product Parser
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Easily add products to your SoleTracker database by parsing URLs from major sneaker retailers
            or entering product details manually.
          </p>
        </div>

        <ProductDataManager />

        {/* Sample URLs for Testing */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Sample URLs for Testing</h2>
          <p className="text-muted-foreground mb-4">
            Try these sample product URLs to test the parsing functionality:
          </p>

          <div className="grid gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Nike</h3>
              <code className="text-sm text-muted-foreground break-all">
                https://www.nike.com/t/air-force-1-07-mens-shoes-5QFp5Z/DD8959-100
              </code>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Snipes USA</h3>
              <code className="text-sm text-muted-foreground break-all">
                https://www.snipesusa.com/air-jordan-1-retro-high-og-mens-555088-063.html
              </code>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Foot Locker</h3>
              <code className="text-sm text-muted-foreground break-all">
                https://www.footlocker.com/product/nike-dunk-low-mens/DD1391100.html
              </code>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Shoe Palace</h3>
              <code className="text-sm text-muted-foreground break-all">
                https://www.shoepalace.com/product/nike/dd1391-100/mens-nike-dunk-low-basketball-shoes/
              </code>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Hibbett Sports</h3>
              <code className="text-sm text-muted-foreground break-all">
                https://www.hibbett.com/nike-air-force-1-07-mens-shoes/N0012345.html
              </code>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> These are example URL formats. Actual product availability and URLs may vary.
              The parser is designed to handle various URL structures from each supported retailer.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}