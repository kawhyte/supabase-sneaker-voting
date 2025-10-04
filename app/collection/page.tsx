import { SneakerCard } from '@/components/SneakerCard'
import { Button } from '@/components/ui/button'
import { Plus, Package } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

// Define the type for our collection data
type CollectionSneaker = {
  id: string;
  try_on_date: string; // Using try_on_date as purchase_date
  retail_price: number; // Using retail_price as purchase_price
  size_tried: string; // Using size_tried as size
  wears: number;
  last_worn_date?: string | null;
  brand: string;
  model: string;
  colorway: string;
  image_url: string;
};

export default async function CollectionPage() {
  const supabase = await createClient()

  // Fetch sneakers where in_collection = true
  const { data: collectionData, error } = await supabase
    .from('sneakers')
    .select('*')
    .eq('in_collection', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching collection:', error)
  }

  // Map the data to match SneakerCard's expected structure
  const collectionSneakers: CollectionSneaker[] = (collectionData || []).map((sneaker) => ({
    id: sneaker.id,
    try_on_date: sneaker.try_on_date,
    retail_price: sneaker.retail_price || 0,
    size_tried: sneaker.size_tried || 'N/A',
    wears: 0, // Default to 0 since wears isn't in sneakers table
    last_worn_date: null,
    brand: sneaker.brand,
    model: sneaker.model,
    colorway: sneaker.colorway || 'Standard',
    image_url: sneaker.image_url || '/placeholder.png',
  }));

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1920px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1
              className="text-4xl font-bold tracking-tight"
              style={{ color: 'var(--color-black)' }}
            >
              My Collection
            </h1>
            <p
              className="mt-2 text-lg"
              style={{ color: 'var(--color-gray-500)' }}
            >
              A visual inventory of your prized sneakers
            </p>
            {collectionSneakers.length > 0 && (
              <p
                className="mt-1 text-sm font-medium"
                style={{ color: 'var(--color-gray-600)' }}
              >
                {collectionSneakers.length} {collectionSneakers.length === 1 ? 'sneaker' : 'sneakers'} in collection
              </p>
            )}
          </div>
          <Link href="/add-new-item">
            <Button
              size="lg"
              className="font-semibold"
              style={{
                backgroundColor: 'var(--color-primary-500)',
                color: 'var(--color-black)',
              }}
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add to Collection
            </Button>
          </Link>
        </div>

        {/* Collection Grid or Empty State */}
        {collectionSneakers.length === 0 ? (
          <div
            className="text-center py-24 rounded-xl border-2 border-dashed"
            style={{
              borderColor: 'var(--color-gray-300)',
              backgroundColor: 'var(--color-white)',
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-gray-100)' }}
              >
                <Package
                  className="w-8 h-8"
                  style={{ color: 'var(--color-gray-400)' }}
                  aria-hidden="true"
                />
              </div>
              <div className="space-y-2">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: 'var(--color-black)' }}
                >
                  Your collection is empty
                </h2>
                <p
                  className="text-base max-w-sm mx-auto"
                  style={{ color: 'var(--color-gray-500)' }}
                >
                  Start building your sneaker collection by adding your first pair
                </p>
              </div>
              <Link href="/add-new-item" className="mt-4">
                <Button
                  size="lg"
                  className="font-semibold"
                  style={{
                    backgroundColor: 'var(--color-primary-500)',
                    color: 'var(--color-black)',
                  }}
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Add Your First Sneaker
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6"
            role="list"
            aria-label="Sneaker collection"
          >
            {collectionSneakers.map((sneaker) => (
              <SneakerCard key={sneaker.id} sneaker={sneaker} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}