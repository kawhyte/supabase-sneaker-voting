// components/avatar/AvatarPicker.tsx
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AvatarOption } from './AvatarOption'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
// Analytics removed - not configured yet
// TODO: Re-add when Google Analytics 4 is set up
// import { AvatarAnalytics } from '@/lib/avatar-analytics'

interface Avatar {
  id: string
  name: string
}

const CAT_AVATARS: Avatar[] = [
  { id: 'cat-1', name: 'Cozy Cat' },
  { id: 'cat-2', name: 'Fancy Cat' },
  { id: 'cat-3', name: 'Playful Cat' },
  { id: 'cat-4', name: 'Cool Cat' },
  { id: 'cat-5', name: 'Curious Cat' },
  { id: 'cat-6', name: 'Wise Cat' },
  
]

interface AvatarPickerProps {
  isOpen: boolean
  onClose: () => void
  currentAvatarId: string | null
  onSelect: (avatarId: string) => Promise<void>
}

export function AvatarPicker({ isOpen, onClose, currentAvatarId, onSelect }: AvatarPickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(currentAvatarId)
  const [isLoading, setIsLoading] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  // Track when picker opens
  // useEffect(() => {
  //   if (isOpen) {
  //     AvatarAnalytics.pickerOpened()
  //   }
  // }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Get current index
    const currentIndex = CAT_AVATARS.findIndex(a => a.id === selectedId)

    // Navigate with arrow keys
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex = (currentIndex + 1) % CAT_AVATARS.length
      const nextAvatar = CAT_AVATARS[nextIndex]
      setSelectedId(nextAvatar.id)
      setAnnouncement(`${nextAvatar.name} selected`)
      return
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prevIndex = (currentIndex - 1 + CAT_AVATARS.length) % CAT_AVATARS.length
      const prevAvatar = CAT_AVATARS[prevIndex]
      setSelectedId(prevAvatar.id)
      setAnnouncement(`${prevAvatar.name} selected`)
      return
    }

    // Select with Enter key
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSelect()
      return
    }

    // Close with Escape key
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  const handleSelect = async () => {
    if (!selectedId) {
      toast.error('Please select an avatar')
      return
    }

    setIsLoading(true)
    try {
      await onSelect(selectedId)
      const selectedAvatar = CAT_AVATARS.find(a => a.id === selectedId)
      setAnnouncement(`${selectedAvatar?.name || 'Avatar'} saved successfully`)

      // Track successful selection
      // AvatarAnalytics.avatarSelected(
      //   selectedId,
      //   selectedAvatar?.name || 'Unknown',
      //   currentAvatarId ? 'preset' : null
      // )

      toast.success('Avatar selected!')
      onClose()
    } catch (error) {
      console.error('Error updating avatar:', error)

      // Track failure
      // AvatarAnalytics.avatarSaveFailed(error instanceof Error ? error.message : 'Unknown error')

      toast.error('Failed to update avatar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl p-6"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Choose Your Avatar</DialogTitle>
          <DialogDescription>
            Select an avatar that represents your personality. Use arrow keys to navigate, Enter to select, Escape to close.
          </DialogDescription>
        </DialogHeader>

        {/* Screen Reader Announcements */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcement}
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-3 gap-4 py-6">
          {CAT_AVATARS.map((avatar) => (
            <AvatarOption
              key={avatar.id}
              id={avatar.id}
              name={avatar.name}
              isSelected={selectedId === avatar.id}
              onClick={() => {
                setSelectedId(avatar.id)
                setAnnouncement(`${avatar.name} selected`)
              }}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            disabled={isLoading || !selectedId}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Select Avatar'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
