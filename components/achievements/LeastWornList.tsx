'use client'

import { motion } from 'framer-motion'
import { Heart, AlertCircle, Shirt } from 'lucide-react'
import { LeastWornItem } from '@/lib/achievements-stats'
import { CATEGORY_CONFIGS } from '@/components/types/item-category'
import Link from 'next/link'
import Image from 'next/image'
import { ItemNameDisplay } from '@/components/shared/ItemNameDisplay'

interface LeastWornListProps {
  items: LeastWornItem[]
  variant?: 'full' | 'sidebar' // NEW: Support dual layouts
}

export function LeastWornList({ items, variant = 'full' }: LeastWornListProps) {
  if (items.length === 0) {
    return null // Don't show section if no data
  }

  // NEW: Sidebar compact layout
  if (variant === 'sidebar') {
    return (
      <section className="bg-card border border-border rounded-xl p-6 shadow-sm" aria-labelledby="least-worn-sidebar-title">
        <div className="flex items-center gap-3 mb-4">
          <Heart
            className="h-5 w-5 text-primary"
            aria-hidden="true"
          />
          <h3 id="least-worn-sidebar-title" className="text-lg font-bold text-foreground">
           Items Needing Love
          </h3>
        </div>

        <div className="space-y-2">
          {items.slice(0, 5).map((item, index) => (
            <Link
              key={item.id}
              href="/dashboard?tab=owned"
              className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors opacity-75 group ${index >= 3 ? 'hidden lg:flex' : ''}`}
            >
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg bg-cover bg-center flex-shrink-0 relative">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={`${item.brand} ${item.model}`}
                    fill
                    className="object-cover rounded-lg"
                    sizes="56px"
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                    {(() => {
                      const CategoryIcon = CATEGORY_CONFIGS[item.category as keyof typeof CATEGORY_CONFIGS]?.icon
                      return CategoryIcon ? <CategoryIcon className="h-5 w-5" /> : <Shirt className="h-5 w-5 text-muted-foreground" />
                    })()}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <ItemNameDisplay
                  brand={item.brand}
                  model={item.model}
                  color={item.color}
                  className="mb-1"
                  maxLength={35}
                />
                <p className="text-xs text-muted-foreground">
                  Last worn: {item.daysSinceLastWorn ? `${item.daysSinceLastWorn} days ago` : 'Never'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-12" aria-labelledby="least-worn-title">
      <div className="flex items-center gap-3 mb-6">
        <AlertCircle className="h-6 w-6 text-amber-600" />
        <h2 id="least-worn-title" className="text-2xl font-bold text-foreground">
          Items Needing Love
        </h2>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
        <p className="text-sm text-amber-900">
          These items haven't been worn much. Create an outfit with them or consider if they still spark joy!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <Link
              href="/dashboard?tab=owned"
              className="block bg-card border-2 border-amber-300 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-amber-500 transition-all"
            >
              {/* Image */}
              {item.image_url ? (
                <div className="relative aspect-square bg-muted">
                  <Image
                    src={item.image_url}
                    alt={`${item.brand} ${item.model}`}
                    fill
                    className="object-cover opacity-75"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-muted flex items-center justify-center opacity-75">
                  {(() => {
                    const CategoryIcon = CATEGORY_CONFIGS[item.category as keyof typeof CATEGORY_CONFIGS]?.icon
                    return CategoryIcon ? <CategoryIcon className="h-16 w-16" /> : <Shirt className="h-16 w-16 text-muted-foreground" />
                  })()}
                </div>
              )}

              {/* Details */}
              <div className="p-4">
                <ItemNameDisplay
                  brand={item.brand}
                  model={item.model}
                  color={item.color}
                  className="mb-2"
                  maxLength={30}
                />

                {/* Wear Info */}
                <div className="text-xs text-amber-700 font-medium">
                  {item.wears === 0 ? (
                    'Never worn'
                  ) : item.daysSinceLastWorn !== null ? (
                    `${item.daysSinceLastWorn} days ago`
                  ) : (
                    `${item.wears} wears`
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
