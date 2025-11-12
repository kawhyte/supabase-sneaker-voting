'use client'

import { motion } from 'framer-motion'
import { TrendingDown, Shirt } from 'lucide-react'
import { BestValueItem } from '@/lib/achievements-stats'
import { CATEGORY_CONFIGS } from '@/components/types/item-category'
import Link from 'next/link'
import Image from 'next/image'
import { ItemNameDisplay } from '@/components/shared/ItemNameDisplay'

interface BestValueListProps {
  items: BestValueItem[]
  variant?: 'full' | 'sidebar' // Support dual layouts
}

export function BestValueList({ items, variant = 'full' }: BestValueListProps) {
  if (items.length === 0) {
    return variant === 'sidebar' ? null : (
      <section className="mb-12" aria-labelledby="best-value-title">
        <div className="flex items-center gap-3 mb-6">
          <TrendingDown className="h-6 w-6 text-primary" aria-hidden="true" />
          <h2 id="best-value-title" className="text-2xl font-bold text-foreground">
            Top 5 Best Value
          </h2>
        </div>
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
          <p className="text-muted-foreground">
            Keep wearing your items to unlock cost-per-wear insights!
          </p>
        </div>
      </section>
    )
  }

  // Sidebar compact layout
  if (variant === 'sidebar') {
    return (
      <section className="bg-card border border-border rounded-xl p-6 shadow-sm" aria-labelledby="best-value-sidebar-title">
        <div className="flex items-center gap-3 mb-4">
          <TrendingDown
            className="h-5 w-5 text-primary"
            aria-hidden="true"
          />
          <h3 id="best-value-sidebar-title" className="text-lg font-bold text-foreground">
            Best Value
          </h3>
        </div>

        <div className="space-y-3">
          {items.slice(0, 5).map((item, index) => (
            <Link
              key={item.id}
              href="/dashboard?tab=owned"
              className={`flex items-center gap-4 group hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors ${index >= 3 ? 'hidden lg:flex' : ''}`}
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
                <p className="text-xs text-muted-foreground truncate">
                  ${item.costPerWear.toFixed(2)}/wear
                </p>
              </div>

              {/* Badge */}
              <div className="flex-shrink-0 text-right">
                <p className="text-xs font-bold text-green-600">
                  {Math.round(item.percentOfTarget)}%
                </p>
                <p className="text-[10px] text-muted-foreground">
                  of target
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-12" aria-labelledby="best-value-title">
      <div className="flex items-center gap-3 mb-6">
        <TrendingDown className="h-6 w-6 text-primary" aria-hidden="true" />
        <h2 id="best-value-title" className="text-2xl font-bold text-foreground">
          Top 5 Best Value
        </h2>
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
              className="block bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-sun-400 transition-all"
            >
              {/* Value Badge */}
              <div className="relative">
                <div className="absolute top-2 left-2 bg-green-600 text-white font-bold rounded-full px-3 py-1 text-xs z-10">
                  {Math.round(item.percentOfTarget)}% of target
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
                      return CategoryIcon ? <CategoryIcon className="h-16 w-16" /> : <Shirt className="h-16 w-16 text-muted-foreground" />
                    })()}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-4">
                <ItemNameDisplay
                  brand={item.brand}
                  model={item.model}
                  color={item.color}
                  className="mb-2"
                  maxLength={30}
                />

                {/* Cost Per Wear */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">CPW:</span>
                    <span className="font-bold text-foreground">
                      ${item.costPerWear.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Target:</span>
                    <span className="font-bold text-muted-foreground">
                      ${item.targetCostPerWear.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex-1 bg-green-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-600 h-full"
                      style={{ width: `${Math.min(100, item.percentOfTarget)}%` }}
                    />
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
