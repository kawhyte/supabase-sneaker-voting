'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { OutfitWithItems } from '@/components/types/outfit'
import { OutfitCardCanvas } from './OutfitCardCanvas'

interface OutfitCardPreviewProps {
  outfit: OutfitWithItems
  className?: string
  priority?: boolean
}

/**
 * Three-tier fallback rendering:
 * 1. Pre-generated preview (instant)
 * 2. On-demand generation (first view)
 * 3. Client-side canvas (always works)
 */
export function OutfitCardPreview({
  outfit,
  className = '',
  priority = false
}: OutfitCardPreviewProps) {
  const [imageError, setImageError] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Tier 1: Pre-generated preview
  if (
    outfit.preview_url &&
    outfit.preview_status === 'generated' &&
    !imageError
  ) {
    return (
      <div className={`relative w-full aspect-[5/6] rounded-lg overflow-hidden ${className}`}>
        <Image
          src={outfit.preview_url}
          alt={`Preview of ${outfit.name}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          onError={() => setImageError(true)}
          priority={priority}
          quality={90}
        />
      </div>
    )
  }

  // Tier 2: On-demand generation
  if (outfit.preview_status === 'pending' && !isGenerating) {
    setIsGenerating(true)
    // Trigger server-side generation (non-blocking)
    fetch(`/api/outfits/${outfit.id}/generate-preview`, { method: 'POST' }).catch(
      console.error
    )
  }

  // Tier 3: Client-side fallback
  return (
    <div className={`relative ${className}`}>
      {isGenerating && (
        <div className="absolute inset-0 bg-slate-100 rounded-lg flex items-center justify-center z-10">
          <div className="text-sm text-slate-500">Generating preview...</div>
        </div>
      )}
      <OutfitCardCanvas outfit={outfit} />
    </div>
  )
}
