'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Heart, Package, Archive } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { EditItemModal } from './edit-item-modal'
import { SizingJournalFiltersV2 } from './sizing-journal-filters-v2'
import { SizingJournalStats } from './sizing-journal-stats'
import { SizingJournalEntryCard } from './sizing-journal-entry-card'
import { SizingJournalSkeleton } from './sizing-journal-skeleton'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { PurchasedConfirmationModal } from './purchased-confirmation-modal'
import { ArchiveReasonDialog } from './archive-reason-dialog'
import { SizingJournalEntry } from './types/sizing-journal-entry'
import { filterJournalEntries, sortJournalEntries, getUniqueBrands } from '@/lib/sizing-journal-utils'
import { type ItemCategory } from '@/components/types/item-category'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'

interface SizingJournalDashboardProps {
  onAddNew?: () => void
  status: ('owned' | 'wishlisted' | 'journaled'| 'archive')[]
  isArchivePage?: boolean
}

export function SizingJournalDashboard({ onAddNew, status = ['wishlisted'], isArchivePage = false }: SizingJournalDashboardProps) {
  // State - Data
  const [journalEntries, setJournalEntries] = useState<SizingJournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // State - Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrands, setSelectedBrands] = useState(new Set<string>())
  const [sortBy, setSortBy] = useState<string>('date-desc')
  const [selectedCategories, setSelectedCategories] = useState<ItemCategory[]>([])

  // State - Modals
  const [editingEntry, setEditingEntry] = useState<SizingJournalEntry | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deletingEntry, setDeletingEntry] = useState<SizingJournalEntry | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedItemForAction, setSelectedItemForAction] = useState<SizingJournalEntry | null>(null)
  const [isPurchasedModalOpen, setIsPurchasedModalOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadJournalEntries()
  }, [status, isArchivePage])

  const loadJournalEntries = async () => {
    try {
      setIsLoading(true)
      let query = supabase
        .from('items')
        .select(`*, item_photos (id, image_url, image_order, is_main_image)`)
        .eq('is_archived', isArchivePage)
        .in('status', status)
        .order('image_order', { foreignTable: 'item_photos', ascending: true })

      let { data, error } = await query.order('created_at', { ascending: false })

      if (error && error.message?.includes('item_photos')) {
        let basicQuery = supabase
          .from('items')
          .select('*')
          .eq('is_archived', isArchivePage)
          .in('status', status)
        const basicResult = await basicQuery.order('created_at', { ascending: false })
        data = basicResult.data
        error = basicResult.error
      }

      if (error) {
        console.error('Error loading journal entries:', error)
        toast.error('Failed to load items')
        return
      }
      setJournalEntries(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred while loading items')
    } finally {
      setIsLoading(false)
    }
  }
  // ... (handleEditEntry, handleDeleteEntry, handleToggleCollection, etc. are unchanged)
    const handleEditEntry = (entry: SizingJournalEntry) => {
    setEditingEntry(entry)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingEntry(null)
  }

  const handleSaveEdit = () => {
    loadJournalEntries()
  }

  const handleDeleteEntry = (entry: SizingJournalEntry) => {
    setDeletingEntry(entry)
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingEntry) return

    setIsDeleting(true)
    try {
      const { data: photos, error: photosError } = await supabase
        .from('item_photos')
        .select('cloudinary_id')
        .eq('item_id', deletingEntry.id)

      if (photosError) {
        console.warn('Error fetching item photos:', photosError)
      }

      if (photos && photos.length > 0) {
        for (const photo of photos) {
          if (photo.cloudinary_id) {
            try {
              await fetch('/api/delete-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ publicId: photo.cloudinary_id })
              })
            } catch (imageError) {
              console.warn('Error deleting carousel image from Cloudinary:', imageError)
            }
          }
        }
      }

      if (deletingEntry.cloudinary_id) {
        try {
          await fetch('/api/delete-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId: deletingEntry.cloudinary_id })
          })
        } catch (imageError) {
          console.warn('Error deleting main image from Cloudinary:', imageError)
        }
      }

      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', deletingEntry.id)

      if (error) {
        console.error('Error deleting journal entry:', error)
        alert('Failed to delete journal entry. Please try again.')
        return
      }

      loadJournalEntries()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to delete journal entry. Please try again.')
    } finally {
      setIsDeleting(false)
      setIsDeleteConfirmOpen(false)
      setDeletingEntry(null)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false)
    setDeletingEntry(null)
  }

  const handleToggleCollection = async (entry: SizingJournalEntry) => {
    const newStatus = entry.status === 'owned' ? 'journaled' : 'owned'

    if (newStatus === 'owned' && entry.category === 'shoes' && !entry.purchase_price && !entry.retail_price) {
      toast.error('Please set a price before adding to collection', {
        description: 'A price is required to track cost per wear',
        action: {
          label: 'Edit',
          onClick: () => handleEditEntry(entry)
        }
      })
      return
    }

    setJournalEntries(prev =>
      prev.map(e => e.id === entry.id ? { ...e, status: newStatus } : e)
    )

    try {
      const { error } = await supabase
        .from('items')
        .update({ status: newStatus })
        .eq('id', entry.id)

      if (error) {
        console.error('Error toggling collection status:', error)
        setJournalEntries(prev =>
          prev.map(e => e.id === entry.id ? { ...e, status: entry.status } : e)
        )
        toast.error('Failed to update collection')
        return
      }

      toast.success(
        newStatus === 'owned' ? 'Added to collection' : 'Removed from collection',
        {
          description: `${entry.brand} ${entry.model}`,
          duration: 3000,
        }
      )
      loadJournalEntries()
    } catch (error) {
      console.error('Error:', error)
      setJournalEntries(prev =>
        prev.map(e => e.id === entry.id ? { ...e, status: entry.status } : e)
      )
      toast.error('Failed to update collection')
    }
  }

  // New Action Handlers
  const handleOpenPurchasedModal = (item: SizingJournalEntry) => {
    setSelectedItemForAction(item)
    setIsPurchasedModalOpen(true)
  }

  const handleOpenArchiveDialog = (item: SizingJournalEntry) => {
    setSelectedItemForAction(item)
    setIsArchiveDialogOpen(true)
  }

  // Database Functions
  const markItemAsPurchased = async (purchasePrice: number, purchaseDate: Date) => {
    if (!selectedItemForAction) return

    try {
      const { error } = await supabase
        .from('items')
        .update({
          status: 'owned',
          purchase_price: purchasePrice,
          purchase_date: purchaseDate.toISOString().split('T')[0]
        })
        .eq('id', selectedItemForAction.id)

      if (error) {
        console.error('Error marking item as purchased:', error)
        toast.error('Failed to mark item as purchased', {
          description: error.message || 'Database update failed'
        })
        return
      }

      toast.success('Item marked as purchased!', {
        description: `${selectedItemForAction.brand} ${selectedItemForAction.model} - $${purchasePrice}`,
        duration: 3000,
      })

      setIsPurchasedModalOpen(false)
      setSelectedItemForAction(null)
      loadJournalEntries()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to mark item as purchased')
    }
  }

  const moveItemToWishlist = async (item: SizingJournalEntry) => {
    try {
      const { error } = await supabase
        .from('items')
        .update({ status: 'wishlisted' })
        .eq('id', item.id)

      if (error) {
        console.error('Error moving item to wishlist:', error)
        toast.error('Failed to move item to wishlist')
        return
      }

      toast.success('Moved to wishlist', {
        description: `${item.brand} ${item.model}`,
        duration: 3000,
      })
      loadJournalEntries()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to move item to wishlist')
    }
  }

  const archiveItem = async (reason: string) => {
    if (!selectedItemForAction) return

    try {
      const { error } = await supabase
        .from('items')
        .update({
          is_archived: true,
          archive_reason: reason,
          archived_at: new Date().toISOString()
        })
        .eq('id', selectedItemForAction.id)

      if (error) {
        console.error('Error archiving item:', error)
        toast.error('Failed to archive item')
        return
      }

      toast.success('Item archived', {
        description: `${selectedItemForAction.brand} ${selectedItemForAction.model}`,
        duration: 3000,
      })

      setIsArchiveDialogOpen(false)
      setSelectedItemForAction(null)
      loadJournalEntries()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to archive item')
    }
  }

  const unarchiveItem = async (item: SizingJournalEntry) => {
    try {
      const { error } = await supabase
        .from('items')
        .update({
          is_archived: false,
          archive_reason: null,
          archived_at: null
        })
        .eq('id', item.id)

      if (error) {
        console.error('Error unarchiving item:', error)
        toast.error('Failed to unarchive item')
        return
      }

      toast.success('Item restored', {
        description: `${item.brand} ${item.model} has been restored`,
        duration: 3000,
      })
      loadJournalEntries()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to unarchive item')
    }
  }

  // Computed values
  const filteredAndSortedEntries = sortJournalEntries(
    filterJournalEntries(journalEntries, searchTerm, new Set<string>(), selectedBrands, selectedCategories),
    sortBy
  )
  const availableBrands = getUniqueBrands(journalEntries)

  const displayStatus = status.includes('wishlisted') ? 'wishlisted' : status[0]

  if (isLoading) {
    return (
      <div
        className="max-w-[1920px] mx-auto px-xl py-xl"
        role="status"
        aria-busy="true"
        aria-label="Loading items"
      >
        <DashboardHeader status={displayStatus} />
        <SizingJournalSkeleton />
      </div>
    )
  }

  return (
    <div className="max-w-[1920px] mx-auto px-xl py-xl">
      <DashboardHeader status={displayStatus} />

      <SizingJournalFiltersV2
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedBrands={selectedBrands}
        onBrandChange={setSelectedBrands}
        sortBy={sortBy}
        onSortChange={setSortBy}
        availableBrands={availableBrands}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
      />

      <SizingJournalStats journalEntries={journalEntries} />

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {filteredAndSortedEntries.length === 0 ? (
          <EmptyState
            hasEntries={journalEntries.length > 0}
            displayStatus={displayStatus}
            isArchivePage={isArchivePage}
            onAddNew={onAddNew}
          />
        ) : (
          filteredAndSortedEntries.map((entry) => (
            <SizingJournalEntryCard
              key={entry.id}
              entry={entry}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
              onToggleCollection={handleToggleCollection}
              onMarkAsPurchased={handleOpenPurchasedModal}
              onMoveToWatchlist={moveItemToWishlist}
              onArchive={handleOpenArchiveDialog}
              onUnarchive={unarchiveItem}
              isArchivePage={isArchivePage}
              purchaseDate={entry.purchase_date}
            />
          ))
        )}
      </motion.div>

      {editingEntry && (
        <EditItemModal
          experience={editingEntry}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveEdit}
        />
      )}

      <DeleteConfirmDialog
        experience={deletingEntry}
        isOpen={isDeleteConfirmOpen}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <PurchasedConfirmationModal
        isOpen={isPurchasedModalOpen}
        onClose={() => {
          setIsPurchasedModalOpen(false)
          setSelectedItemForAction(null)
        }}
        onConfirm={markItemAsPurchased}
        itemName={selectedItemForAction ? `${selectedItemForAction.brand} ${selectedItemForAction.model}` : undefined}
      />

      <ArchiveReasonDialog
        open={isArchiveDialogOpen}
        onOpenChange={(open) => {
          setIsArchiveDialogOpen(open)
          if (!open) setSelectedItemForAction(null)
        }}
        onConfirm={archiveItem}
        itemName={selectedItemForAction ? `${selectedItemForAction.brand} ${selectedItemForAction.model}` : ''}
      />
    </div>
  )
}

// Sub-components
function DashboardHeader({ status }: { status: 'owned' | 'wishlisted' | 'journaled' | 'archive' }) {
  const titles = {
    owned: {
      title: 'Owned Items',
      description: 'Items you own and have purchased'
    },
    wishlisted: {
      title: 'Wishlist',
      description: 'Track items you\'re interested in and monitor price changes'
    },
    journaled: {
      title: 'Tried Items',
      description: 'Items you\'ve tried on or seen in person'
    },
    archive: {
      title: 'Archived Items',
      description: 'Items you\'ve archived and no longer need to track'
    }
  }

  const { title, description } = titles[status as keyof typeof titles]

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-xl">
      <div>
        <h1 className="text-3xl font-bold font-heading">{title}</h1>
        <p className="text-slate-600">{description}</p>
      </div>
    </div>
  )
}

interface EmptyStateProps {
  hasEntries: boolean
  displayStatus: 'owned' | 'wishlisted' | 'journaled' | 'archive'
  isArchivePage: boolean
  onAddNew?: () => void
}

function EmptyState({ hasEntries, displayStatus, isArchivePage, onAddNew }: EmptyStateProps) {
  // If there are entries but filters hide them, show search icon
  if (hasEntries) {
    return (
      <div className="col-span-full flex justify-center">
        <Empty className="max-w-md border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>No matching entries</EmptyTitle>
            <EmptyDescription>
              Try adjusting your search or filters.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  // Show different empty states based on the section
  if (isArchivePage) {
    return (
      <div className="col-span-full flex justify-center">
        <Empty className="max-w-md border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Archive />
            </EmptyMedia>
            <EmptyTitle>No Archived Items</EmptyTitle>
            <EmptyDescription>
              Items you archive will appear here. Archive items you're no longer interested in to keep your main lists organized.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  if (displayStatus === 'wishlisted') {
    return (
      <div className="col-span-full flex justify-center">
        <Empty className="max-w-md border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Heart />
            </EmptyMedia>
            <EmptyTitle>Your Wishlist is Empty</EmptyTitle>
            <EmptyDescription>
              Start tracking items you're interested in. Add products to monitor prices and keep track of items you want.
            </EmptyDescription>
          </EmptyHeader>
          {onAddNew && (
            <EmptyContent>
              <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700">
                Add Your First Item
              </Button>
            </EmptyContent>
          )}
        </Empty>
      </div>
    )
  }

  if (displayStatus === 'owned') {
    return (
      <div className="col-span-full flex justify-center">
        <Empty className="max-w-md border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Package />
            </EmptyMedia>
            <EmptyTitle>Your Wardrobe is Empty</EmptyTitle>
            <EmptyDescription>
              You haven't added any items to your collection yet. Start by adding items you own to track your wardrobe.
            </EmptyDescription>
          </EmptyHeader>
          {onAddNew && (
            <EmptyContent>
              <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700">
                Add Your First Item
              </Button>
            </EmptyContent>
          )}
        </Empty>
      </div>
    )
  }

  // Default fallback
  return (
    <div className="col-span-full flex justify-center">
      <Empty className="max-w-md border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Search />
          </EmptyMedia>
          <EmptyTitle>No entries yet</EmptyTitle>
          <EmptyDescription>
            Start tracking your items!
          </EmptyDescription>
        </EmptyHeader>
        {onAddNew && (
          <EmptyContent>
            <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700">
              Add Your First Entry
            </Button>
          </EmptyContent>
        )}
      </Empty>
    </div>
  )
}