'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

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
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [blurSrc, setBlurSrc] = useState<string | null>(null)

  // Generate Cloudinary blur placeholder URL if using Cloudinary
  useEffect(() => {
    if (useBlurPlaceholder && src?.includes('res.cloudinary.com')) {
      // Extract public_id from Cloudinary URL
      // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}
      const urlParts = src.split('/upload/')
      if (urlParts.length === 2) {
        const publicId = urlParts[1].split('?')[0] // Remove query params
        const cloud_name = src.split('/')[3] // Extract cloud name

        // Create blur transformation URL
        // Apply blur + quality reduction + format for instant load
        const blurUrl = `https://res.cloudinary.com/${cloud_name}/image/upload/w_100,h_100,q_20,f_auto,e_blur:300/${publicId}`
        setBlurSrc(blurUrl)
      }
    }
  }, [src, useBlurPlaceholder])

  // Reset states when src changes
  useEffect(() => {
    setLoaded(false)
    setError(false)
  }, [src])

  // Error fallback
  if (error) {
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
      {!loaded && blurSrc ? (
        <img
          src={blurSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          decoding="async"
          draggable={false}
          style={{ opacity: 0.8 }}
        />
      ) : !loaded ? (
        // Fallback: animate pulse if no blur available
        <div className="absolute inset-0 bg-slate-200 animate-pulse rounded" />
      ) : null}

      {/* Main image with fade-in */}
      {width && height ? (
        // Next.js Image (with dimensions) - optimized path
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
          className={className}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          draggable={false}
        />
      ) : (
        // Native img (no dimensions) - fallback for dynamic sizes
        <img
          src={src}
          alt={alt}
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            ...style,
          }}
          className={className}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          draggable={false}
        />
      )}
    </div>
  )
}
