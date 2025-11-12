// components/avatar/AvatarDisplay.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface AvatarDisplayProps {
  avatarType: 'custom' | 'preset' | null
  avatarUrl?: string | null
  presetAvatarId?: string | null
  avatarVersion?: number
  displayName?: string | null
  email?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' // 32, 48, 96, 128
  className?: string
}

export function AvatarDisplay({
  avatarType,
  avatarUrl,
  presetAvatarId,
  avatarVersion = 1,
  displayName,
  email,
  size = 'md',
  className
}: AvatarDisplayProps) {
  const [isLoading, setIsLoading] = useState(true)

  // Update loading state when avatar changes
  useEffect(() => {
    setIsLoading(true)
  }, [presetAvatarId, avatarUrl, avatarType, avatarVersion])

  // Size mapping (follows 8px grid)
  const sizeClasses = {
    sm: 'h-8 w-8',      // 32px - navbar
    md: 'h-12 w-12',    // 48px - dropdown
    lg: 'h-24 w-24',    // 96px - picker
    xl: 'h-32 w-32',    // 128px - profile page
  }

  // Determine image source with version-based cache busting
  const imageSrc = useMemo(() => {
    if (avatarType === 'preset' && presetAvatarId) {
      return `/avatars/${presetAvatarId}.webp?v=${avatarVersion}`
    }
    return avatarUrl || undefined
  }, [avatarType, presetAvatarId, avatarUrl, avatarVersion])

  // Fallback initials
  const getInitials = () => {
    if (displayName) {
      const names = displayName.split(' ')
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return displayName.substring(0, 2).toUpperCase()
    }
    return email?.substring(0, 2).toUpperCase() || 'U'
  }

  return (
    <Avatar key={imageSrc} className={cn(sizeClasses[size], className)}>
      {isLoading && imageSrc && (
        <div className="absolute inset-0 rounded-full bg-muted animate-pulse" />
      )}
      <AvatarImage
        key={imageSrc}
        src={imageSrc}
        alt={displayName || 'User avatar'}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
      <AvatarFallback className="bg-sun-400 text-slate-900 font-semibold">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  )
}
