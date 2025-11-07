'use client'

import { useState, useEffect } from 'react'
import {
  buildCloudinaryUrl,
  buildBlurPlaceholder,
  isCloudinaryUrl,
  extractPublicIdFromUrl
} from '@/lib/cloudinary-url-builder'

export interface OptimizedImageProps {
  src: string
  alt: string
  style?: React.CSSProperties
  className?: string
  width?: number
  height?: number
  priority?: boolean
  useBlurPlaceholder?: boolean
}

/**
 * OptimizedImage - Progressive image loading with blur placeholder
 *
 * Features:
 * - Blur placeholder while loading (professional LQIP effect)
 * - Fade-in animation on complete
 * - Error state handling
 * - Lazy loading by default
 * - Automatic image optimization via Next.js and Cloudinary
 * - Supports Cloudinary blur transformation for ultra-fast placeholders
 *
 * Success Criteria:
 * - Images load without blocking interaction
 * - Smooth fade-in animation
 * - Error state visible if load fails
 * - Works with both Next/Image and native img
 * - Blur placeholder loads instantly (Cloudinary optimization)
 */
export function OptimizedImage({
  src,
  alt,
  style,
  className,
  width,
  height,
  priority = false,
  useBlurPlaceholder = true,
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Generate optimized URL if Cloudinary
  const optimizedSrc = isCloudinaryUrl(src)
    ? buildCloudinaryUrl(extractPublicIdFromUrl(src), {
        width: width || 'auto',
        quality: 'auto:good',
        format: 'auto',
      })
    : src

  // Generate blur placeholder if Cloudinary
  const blurSrc = isCloudinaryUrl(src) && useBlurPlaceholder
    ? buildBlurPlaceholder(extractPublicIdFromUrl(src))
    : undefined

  // Reset states when src changes
  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
  }, [src])

  // Error fallback
  if (imageError) {
    return (
      <div
        className="flex items-center justify-center bg-slate-200 text-slate-500 text-xs p-2 rounded"
        style={style}
      >
        Failed to load image
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded" style={style}>
      {/* Blur placeholder (Cloudinary optimized) */}
      {!imageLoaded && blurSrc ? (
        <img
          src={blurSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          decoding="async"
          draggable={false}
          style={{ opacity: 0.8 }}
        />
      ) : !imageLoaded ? (
        // Fallback: animate pulse if no blur available
        <div className="absolute inset-0 bg-slate-200 animate-pulse rounded" />
      ) : null}

      {/* Main image with fade-in */}
      <img
        src={imageError ? '/images/placeholder.jpg' : optimizedSrc}
        alt={alt}
        style={{
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : '100%',
          objectFit: 'cover',
          ...style,
        }}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        draggable={false}
      />
    </div>
  )
}
