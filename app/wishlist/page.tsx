'use client'

import { SizingJournalEntryCard } from '@/components/sizing-journal-entry-card'
import { SizingJournalEntry } from '@/components/types/sizing-journal-entry'
import { Button } from '@/components/ui/button'
import { EditItemModal } from '@/components/edit-item-modal'
import { Plus, Heart } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function WishlistPage() {
  const supabase = createClient()
  const [wishlistItems, setWishlistItems] = useState<SizingJournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [editingEntry, setEditingEntry] = useState<SizingJournalEntry | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Fetch wishlist data
  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          item_photos (
            id,
            image_url,
            image_order,
            is_main_image
          )
        `)
        .eq('status', 'wishlisted')
        .eq('is_archived', false)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching wishlist:', error)
        toast.error('Failed to load wishlist')
      } else {
        setWishlistItems(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred while loading wishlist')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (entry: SizingJournalEntry) => {
    setEditingEntry(entry)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingEntry(null)
  }

  const handleSaveEdit = () => {
    fetchWishlist()
  }

  const handleDelete = async (entry: SizingJournalEntry) => {
    if (!confirm('Are you sure you want to remove this item from your wishlist?')) {
      return
    }

    // Optimistic update - remove from view
    setWishlistItems(prev => prev.filter(item => item.id !== entry.id))

    // Delete from database
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', entry.id)

    if (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
      // Revert on error
      fetchWishlist()
    } else {
      toast.success('Item removed from wishlist')
    }
  }

  const handleMoveToOwned = async (entry: SizingJournalEntry) => {
    // Optimistic update - remove from view
    setWishlistItems(prev => prev.filter(item => item.id !== entry.id))

    // Update in database
    const { error } = await supabase
      .from('items')
      .update({
        status: 'owned',
      })
      .eq('id', entry.id)

    if (error) {
      console.error('Error moving to collection:', error)
      toast.error('Failed to move item to collection')
      // Revert on error
      fetchWishlist()
    } else {
      toast.success('Item moved to collection!')
    }
  }

  const handleToggleCollection = async (entry: SizingJournalEntry) => {
    // For wishlist, "toggle collection" means moving to owned
    await handleMoveToOwned(entry)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1920px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1
              className="text-4xl font-bold tracking-tight"
              style={{ color: 'var(--color-black)' }}
            >
              My Wishlist
            </h1>
            <p
              className="mt-2 text-lg"
              style={{ color: 'var(--color-gray-500)' }}
            >
              Items you're interested in purchasing
            </p>
            {wishlistItems.length > 0 && (
              <p
                className="mt-1 text-sm font-medium"
                style={{ color: 'var(--color-gray-600)' }}
              >
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} on your wishlist
              </p>
            )}
          </div>
          <Link href="/add-new-item">
            <Button
              size="lg"
              className="font-semibold"
              style={{
                backgroundColor: 'var(--color-primary-500)',
                color: 'var(--color-black)',
              }}
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Item
            </Button>
          </Link>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div
            className="text-center py-24 rounded-xl border-2 border-dashed"
            style={{
              borderColor: 'var(--color-gray-300)',
              backgroundColor: 'var(--color-white)',
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-gray-100)' }}
              >
                <Heart
                  className="w-8 h-8"
                  style={{ color: 'var(--color-gray-400)' }}
                  aria-hidden="true"
                />
              </div>
              <div className="space-y-2">
                <h2
                  className="text-2xl font-bold"
                  style={{ color: 'var(--color-black)' }}
                >
                  Your wishlist is empty
                </h2>
                <p
                  className="text-base max-w-sm mx-auto"
                  style={{ color: 'var(--color-gray-500)' }}
                >
                  Start adding items you're interested in purchasing
                </p>
              </div>
              <Link href="/add-new-item" className="mt-4">
                <Button
                  size="lg"
                  className="font-semibold"
                  style={{
                    backgroundColor: 'var(--color-primary-500)',
                    color: 'var(--color-black)',
                  }}
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Add Your First Item
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-6"
            role="list"
            aria-label="Wishlist items"
          >
            {wishlistItems.map((item) => (
              <SizingJournalEntryCard
                key={item.id}
                entry={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleCollection={handleToggleCollection}
                viewMode="wishlist"
              />
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingEntry && (
          <EditItemModal
            experience={editingEntry}
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            onSave={handleSaveEdit}
          />
        )}
      </div>
    </div>
  )
}
