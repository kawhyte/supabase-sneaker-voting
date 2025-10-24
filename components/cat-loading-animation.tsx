'use client'

import { useEffect, useState } from 'react'

export type CatLoadingType = 'organizing' | 'searching' | 'napping'

const CAT_ANIMATIONS = {
  organizing: {
    emoji: '🧹',
    text: 'Organizing your closet...',
    messages: [
      'Hanging up those tops...',
      'Organizing by color...',
      'Arranging shoes just right...',
    ],
  },
  searching: {
    emoji: '🔍',
    text: 'Finding the perfect outfit...',
    messages: [
      'Searching wardrobe...',
      'Checking item compatibility...',
      'Creating magic...',
    ],
  },
  napping: {
    emoji: '😴',
    text: 'PurrView is loading...',
    messages: [
      'Waking up the cat...',
      'Preparing your wardrobe...',
      'Almost there...',
    ],
  },
}

/**
 * Placeholder cat loading animation using emoji and rotating text
 * In a real app, replace with Lottie JSON animations
 */
export function CatLoadingAnimation({ type = 'organizing' }: { type?: CatLoadingType }) {
  const [messageIndex, setMessageIndex] = useState(0)
  const animation = CAT_ANIMATIONS[type]

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % animation.messages.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [animation.messages.length])

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Animated cat emoji */}
      <div className="text-6xl mb-4 animate-bounce">{animation.emoji}</div>

      {/* Loading text */}
      <p className="text-lg font-medium text-foreground mb-4">{animation.text}</p>

      {/* Rotating messages */}
      <p className="text-sm text-muted-foreground text-center min-h-6 transition-all duration-500">
        {animation.messages[messageIndex]}
      </p>

      {/* Loading dots */}
      <div className="flex gap-1 mt-4">
        <div className="w-2 h-2 bg-sun-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-sun-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-sun-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

/**
 * Minimal inline loading spinner with cat emoji
 * Use for smaller loading states
 */
export function CatLoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-sun-400 border-t-transparent`} />
      <span className="text-sm text-muted-foreground">Loading...</span>
    </div>
  )
}

/**
 * Skeleton loader that shows placeholder while loading
 */
export function CatLoadingCardSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-muted rounded-lg h-20 animate-pulse" />
      ))}
    </div>
  )
}

/**
 * Suspense boundary fallback component
 */
export function LoadingFallback({ type = 'organizing' }: { type?: CatLoadingType }) {
  return (
    <div className="flex items-center justify-center py-12">
      <CatLoadingAnimation type={type} />
    </div>
  )
}
