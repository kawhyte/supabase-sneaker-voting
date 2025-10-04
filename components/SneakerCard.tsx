
'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ShoppingBag, Calendar, DollarSign } from 'lucide-react'

// Type for the card props - supports both joined data and direct sneaker data
type SneakerCardProps = {
  sneaker: {
    id: string;
    try_on_date?: string;
    retail_price?: number;
    size_tried?: string;
    wears?: number;
    last_worn_date?: string | null;
    brand?: string;
    model?: string;
    colorway?: string;
    image_url?: string;
    // Legacy format (for backward compatibility)
    purchase_date?: string;
    purchase_price?: number;
    size?: number;
    sneakers?: {
      model: string;
      brand: string;
      colorway: string;
      image_url: string;
    } | null;
  }
}

export function SneakerCard({ sneaker }: SneakerCardProps) {
  // Support both new and legacy data formats
  const sneakerData = sneaker.sneakers || {
    brand: sneaker.brand || 'Unknown',
    model: sneaker.model || 'Unknown',
    colorway: sneaker.colorway || 'Standard',
    image_url: sneaker.image_url || '/placeholder.png',
  }

  const purchase_price = sneaker.retail_price || sneaker.purchase_price || 0
  const wears = sneaker.wears || 0
  const size = sneaker.size_tried || sneaker.size?.toString() || 'N/A'
  const purchase_date = sneaker.try_on_date || sneaker.purchase_date || new Date().toISOString()

  const costPerWear = wears > 0 ? purchase_price / wears : purchase_price;

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="group relative"
      role="article"
      aria-label={`${sneakerData.brand} ${sneakerData.model} sneaker card`}
    >
      <Card
        className="overflow-hidden transition-all duration-300 ease-in-out border-2 hover:shadow-lg hover:-translate-y-1"
        style={{
          borderColor: 'var(--color-gray-200)',
          backgroundColor: 'var(--color-white)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary-400)';
          e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(255, 224, 27, 0.2), 0 8px 10px -6px rgba(255, 224, 27, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-gray-200)';
          e.currentTarget.style.boxShadow = '';
        }}
      >
        {/* Floating Cost Per Wear Badge */}
        <div
          className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-full shadow-md transition-transform duration-300 group-hover:scale-110"
          style={{
            backgroundColor: 'var(--color-primary-500)',
            color: 'var(--color-black)',
          }}
          role="status"
          aria-label={`Cost per wear: $${costPerWear.toFixed(2)}`}
        >
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" aria-hidden="true" />
            <span className="font-bold text-sm">${costPerWear.toFixed(2)}</span>
          </div>
        </div>

        {/* Image Section */}
        <CardHeader className="p-0">
          <div
            className="aspect-square relative"
            style={{ backgroundColor: 'var(--color-gray-50)' }}
          >
            <Image
              src={sneakerData.image_url || '/placeholder.png'}
              alt={`${sneakerData.brand} ${sneakerData.model} in ${sneakerData.colorway}`}
              fill
              className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              priority={false}
              loading="lazy"
            />
          </div>
        </CardHeader>

        {/* Content Section */}
        <CardContent className="p-4 space-y-3">
          {/* Brand and Model */}
          <div>
            <h3
              className="font-bold text-lg leading-tight line-clamp-2"
              style={{ color: 'var(--color-black)' }}
            >
              {sneakerData.brand} {sneakerData.model}
            </h3>
            <p
              className="text-sm mt-1 line-clamp-1"
              style={{ color: 'var(--color-gray-500)' }}
            >
              {sneakerData.colorway} • Size {size}
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Wears */}
            <div className="flex flex-col gap-1">
              <div
                className="flex items-center gap-1.5"
                style={{ color: 'var(--color-gray-600)' }}
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs font-medium">Wears</span>
              </div>
              <span
                className="text-lg font-bold"
                style={{ color: 'var(--color-black-soft)' }}
                aria-label={`${wears} times worn`}
              >
                {wears}
              </span>
            </div>

            {/* Purchase Price */}
            <div className="flex flex-col gap-1">
              <div
                className="flex items-center gap-1.5"
                style={{ color: 'var(--color-gray-600)' }}
              >
                <DollarSign className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs font-medium">Paid</span>
              </div>
              <span
                className="text-lg font-bold"
                style={{ color: 'var(--color-black-soft)' }}
                aria-label={`Purchase price: $${purchase_price}`}
              >
                ${purchase_price}
              </span>
            </div>
          </div>

          {/* Purchase Date */}
          <div
            className="flex items-center gap-2 pt-2 border-t"
            style={{ borderColor: 'var(--color-gray-150)' }}
          >
            <Calendar
              className="h-4 w-4"
              style={{ color: 'var(--color-gray-400)' }}
              aria-hidden="true"
            />
            <span
              className="text-xs"
              style={{ color: 'var(--color-gray-500)' }}
            >
              Purchased {new Date(purchase_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
