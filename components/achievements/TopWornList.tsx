'use client'

import { motion } from 'framer-motion'
import { TopWornItem } from '@/lib/achievements-stats'
import { CATEGORY_CONFIGS } from '@/components/types/item-category'
import Link from 'next/link'
import Image from 'next/image'

interface TopWornListProps {
  items: TopWornItem[]
  variant?: 'full' | 'sidebar' // NEW: Support dual layouts
}

export function TopWornList({ items, variant = 'full' }: TopWornListProps) {
  if (items.length === 0) {
    return variant === 'sidebar' ? null : (
      <section className="mb-12" aria-labelledby="top-worn-title">
        <h2 id="top-worn-title" className="text-2xl font-bold text-foreground mb-6">
          Top 5 Most Worn 👑
        </h2>
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">
            Start logging wears to see your most worn items here!
          </p>
        </div>
      </section>
    )
  }

  // NEW: Sidebar compact layout
  if (variant === 'sidebar') {
    return (
      <section className="bg-card border border-border rounded-lg p-6" aria-labelledby="top-worn-sidebar-title">
        <h3 id="top-worn-sidebar-title" className="text-lg font-bold text-foreground mb-4">
          Top 5 Most Worn 👑
        </h3>

        <div className="space-y-3">
          {items.slice(0, 5).map((item, index) => (
            <Link
              key={item.id}
              href="/dashboard?tab=owned"
              className="flex items-center gap-4 group hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
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
                      return CategoryIcon ? <CategoryIcon className="h-5 w-5" /> : <span className="text-xl">👕</span>
                    })()}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">
                  {item.brand}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Worn {item.wears}x
                </p>
              </div>

              {/* Rank Badge */}
              <p className="font-bold text-primary flex-shrink-0">
                #{index + 1}
              </p>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-12" aria-labelledby="top-worn-title">
      <h2 id="top-worn-title" className="text-2xl font-bold text-foreground mb-6">
        Top 5 Most Worn 👑
      </h2>

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
              className="block bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-sun-400 transition-all"
            >
              {/* Rank Badge */}
              <div className="relative">
                <div className="absolute top-2 left-2 bg-sun-400 text-foreground font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm z-10">
                  #{index + 1}
                </div>

                {/* Image */}
                {item.image_url ? (
                  <div className="relative aspect-square bg-muted">
                    <Image
                      src={item.image_url}
                      alt={`${item.brand} ${item.model}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    {(() => {
                      const CategoryIcon = CATEGORY_CONFIGS[item.category as keyof typeof CATEGORY_CONFIGS]?.icon
                      return CategoryIcon ? <CategoryIcon className="h-16 w-16" /> : <span className="text-4xl">👕</span>
                    })()}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-4">
                <div className="font-semibold text-sm text-foreground mb-1 line-clamp-1">
                  {item.brand}
                </div>
                <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {item.model}
                </div>

                {/* Wear Count */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-sun-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-sun-400 h-full"
                      style={{ width: `${Math.min(100, (item.wears / (items[0]?.wears || 1)) * 100)}%` }}
                    />
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    {item.wears}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
