// components/avatar/AvatarPicker.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AvatarOption } from './AvatarOption'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

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

  const handleSelect = async () => {
    if (!selectedId) {
      toast.error('Please select an avatar')
      return
    }

    setIsLoading(true)
    try {
      await onSelect(selectedId)
      toast.success('Avatar updated successfully!')
      onClose()
    } catch (error) {
      console.error('Error updating avatar:', error)
      toast.error('Failed to update avatar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Choose Your Avatar</DialogTitle>
          <DialogDescription>
            Select an avatar that represents your personality
          </DialogDescription>
        </DialogHeader>

        {/* Avatar Grid */}
        <div className="grid grid-cols-3 gap-4 py-6">
          {CAT_AVATARS.map((avatar) => (
            <AvatarOption
              key={avatar.id}
              id={avatar.id}
              name={avatar.name}
              isSelected={selectedId === avatar.id}
              onClick={() => setSelectedId(avatar.id)}
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
              'Save Avatar'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
