'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'
import { Upload, Loader2 } from 'lucide-react'

interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  updated_at?: string | null
}

interface ProfileFormProps {
  profile: Profile
  user: User
}

export function ProfileForm({ profile, user }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile.display_name || '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Format the last sign in date
  const formatLastSignIn = (date: string | undefined) => {
    if (!date) return 'Never'

    const signInDate = new Date(date)
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }

    return signInDate.toLocaleDateString('en-US', options)
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (displayName) {
      const names = displayName.split(' ')
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return displayName.substring(0, 2).toUpperCase()
    }
    return user.email?.substring(0, 2).toUpperCase() || 'U'
  }

  // Handle avatar upload using Cloudinary
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setIsUploading(true)

    try {
      // Upload to Cloudinary
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()

      if (data.url) {
        setAvatarUrl(data.url)
        toast.success('Avatar uploaded successfully')
      } else {
        throw new Error('No URL returned from upload')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!displayName.trim()) {
      toast.error('Display name is required')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        toast.error('Failed to update profile')
        return
      }

      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred while updating profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="   border-stone-200  hover:shadow-md motion-safe:transition-shadow motion-safe:duration-300">
      {/* <CardHeader className="pb-6 border-b border-stone-200/50">
        <CardTitle className="text-2xl font-bold text-foreground">Profile Information</CardTitle>
        <CardDescription className="text-base text-muted-foreground">Update your personal details and profile picture</CardDescription>
      </CardHeader> */}
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-6 pb-8 border-b border-stone-200/50">
            <div className="group relative motion-safe:transition-all motion-safe:duration-300">
              <Avatar className="h-32 w-32 ring-2 ring-stone-300/40 motion-safe:transition-all motion-safe:duration-300">
                <AvatarImage src={avatarUrl || undefined} alt={displayName || 'User avatar'} />
                <AvatarFallback className="text-4xl font-semibold text-foreground">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 motion-safe:transition-colors motion-safe:duration-300"></div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:scale-105"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Avatar
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                JPG, PNG or GIF (Max 5MB)
              </p>
            </div>
          </div>

          {/* Form Fields Section */}
          <div className="space-y-6">
            {/* Display Name */}
            <div className="space-y-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
              <div>
                <Label htmlFor="displayName" className="text-base font-semibold text-foreground">Display Name</Label>
                <p className="text-xs text-muted-foreground mt-1">This is how others will see you</p>
              </div>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                required
                className="motion-safe:transition-all motion-safe:duration-200 border-stone-200 focus:ring-2 focus:ring-stone-400/40"
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700">
              <div>
                <Label htmlFor="email" className="text-base font-semibold text-foreground">Email Address</Label>
                <p className="text-xs text-muted-foreground mt-1">Your account email cannot be changed</p>
              </div>
              <Input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
                className="bg-muted/50 text-muted-foreground cursor-not-allowed border-stone-200/50"
              />
            </div>

            {/* Last Sign In */}
            <div className="space-y-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-900">
              <Label className="text-base font-semibold text-foreground">Last Signed In</Label>
              <div className="text-sm text-foreground bg-stone-50/50 border border-stone-200/50 px-4 py-3 rounded-lg">
                {formatLastSignIn(user.last_sign_in_at)}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-stone-200/50">
            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:shadow-lg motion-safe:hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
