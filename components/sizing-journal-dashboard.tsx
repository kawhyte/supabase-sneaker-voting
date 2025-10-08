'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { EditSneakerModal } from './edit-sneaker-modal'
import { SizingJournalFilters } from './sizing-journal-filters'
import { SizingJournalStats } from './sizing-journal-stats'
import { SizingJournalEntryCard } from './sizing-journal-entry-card'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { SizingJournalEntry } from './types/sizing-journal-entry'
import { filterJournalEntries, sortJournalEntries, getUniqueBrands } from '@/lib/sizing-journal-utils'
import { type ItemCategory } from '@/components/types/item-category'

interface SizingJournalDashboardProps {
  onAddNew?: () => void
  viewMode?: 'watchlist' | 'purchased'
  // We no longer need to pass category state in, this component will handle it.
  // selectedCategories?: ItemCategory[] 
  // onCategoriesChange?: (categories: ItemCategory[]) => void
}

export function SizingJournalDashboard({ onAddNew, viewMode = 'watchlist' }: SizingJournalDashboardProps) {
  // State - Data
  const [journalEntries, setJournalEntries] = useState<SizingJournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // State - Filters (UPDATED)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState(new Set<string>())
  const [selectedBrands, setSelectedBrands] = useState(new Set<string>())
  const [sortBy, setSortBy] = useState<string>('date-desc')
  const [selectedCategories, setSelectedCategories] = useState<ItemCategory[]>([])

  // State - Modals
  const [editingEntry, setEditingEntry] = useState<SizingJournalEntry | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deletingEntry, setDeletingEntry] = useState<SizingJournalEntry | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadJournalEntries()
  }, [viewMode])

  const loadJournalEntries = async () => {
    // ... (rest of this function is unchanged)
    try {
      setIsLoading(true)
      let query = supabase
        .from('items')
        .select(`*, item_photos (id, image_url, image_order, is_main_image)`)
        .eq('is_archived', false)
        .order('image_order', { foreignTable: 'item_photos', ascending: true })
      if (viewMode === 'purchased') {
        query = query.eq('is_purchased', true).neq('category', 'shoes')
      } else {
        query = query.or('category.eq.shoes,is_purchased.eq.false')
      }
      let { data, error } = await query.order('created_at', { ascending: false })
      if (error && error.message?.includes('item_photos')) {
        let basicQuery = supabase
          .from('items')
          .select('*')
          .eq('is_archived', false)
        if (viewMode === 'purchased') {
          basicQuery = basicQuery.eq('is_purchased', true).neq('category', 'shoes')
        } else {
          basicQuery = basicQuery.or('category.eq.shoes,is_purchased.eq.false')
        }
        const basicResult = await basicQuery.order('created_at', { ascending: false })
        data = basicResult.data
        error = basicResult.error
      }
      if (error) {
        console.error('Error loading journal entries:', error)
        return
      }
      setJournalEntries(data || [])
    } catch (error) {
      console.error('Error:', error)
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
        console.warn('Error fetching sneaker photos:', photosError)
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
    if (entry.category === 'shoes') {
      const newCollectionStatus = !entry.in_collection
      if (newCollectionStatus && !entry.purchase_price && !entry.retail_price) {
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
        prev.map(e => e.id === entry.id ? { ...e, in_collection: newCollectionStatus } : e)
      )
      try {
        const { error } = await supabase
          .from('items')
          .update({ in_collection: newCollectionStatus })
          .eq('id', entry.id)
        if (error) {
          console.error('Error toggling collection status:', error)
          setJournalEntries(prev =>
            prev.map(e => e.id === entry.id ? { ...e, in_collection: !newCollectionStatus } : e)
          )
          toast.error('Failed to update collection')
          return
        }
        toast.success(
          newCollectionStatus ? 'Added to collection' : 'Removed from collection',
          {
            description: `${entry.brand} ${entry.model}`,
            duration: 3000,
          }
        )
      } catch (error) {
        console.error('Error:', error)
        setJournalEntries(prev =>
          prev.map(e => e.id === entry.id ? { ...e, in_collection: !newCollectionStatus } : e)
        )
        toast.error('Failed to update collection')
      }
    } else {
      const newPurchasedStatus = !entry.is_purchased
      setJournalEntries(prev =>
        prev.map(e => e.id === entry.id ? { ...e, is_purchased: newPurchasedStatus } : e)
      )
      try {
        const { error } = await supabase
          .from('items')
          .update({ is_purchased: newPurchasedStatus })
          .eq('id', entry.id)
        if (error) {
          console.error('Error toggling purchased status:', error)
          setJournalEntries(prev =>
            prev.map(e => e.id === entry.id ? { ...e, is_purchased: !newPurchasedStatus } : e)
          )
          toast.error('Failed to update purchased status')
          return
        }
        toast.success(
          newPurchasedStatus ? 'Marked as purchased' : 'Unmarked as purchased',
          {
            description: `${entry.brand} ${entry.model}`,
            duration: 3000,
          }
        )
        loadJournalEntries()
      } catch (error) {
        console.error('Error:', error)
        setJournalEntries(prev =>
          prev.map(e => e.id === entry.id ? { ...e, is_purchased: !newPurchasedStatus } : e)
        )
        toast.error('Failed to update purchased status')
      }
    }
  }

  // Computed values (UPDATED)
  const filteredAndSortedEntries = sortJournalEntries(
    filterJournalEntries(journalEntries, searchTerm, selectedUsers, selectedBrands, selectedCategories),
    sortBy
  )
  const availableBrands = getUniqueBrands(journalEntries)

  if (isLoading) {
    return (
      <div className="max-w-[1920px] mx-auto px-[var(--space-xl)] py-[var(--space-xl)]">
        <DashboardHeader viewMode={viewMode} />
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="max-w-[1920px] mx-auto px-[var(--space-xl)] py-[var(--space-xl)]">
      <DashboardHeader viewMode={viewMode} />

      {/* SizingJournalFilters props are now fully updated */}
      <SizingJournalFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedUsers={selectedUsers}
        onUserChange={setSelectedUsers}
        selectedBrands={selectedBrands}
        onBrandChange={setSelectedBrands}
        sortBy={sortBy}
        onSortChange={setSortBy}
        availableBrands={availableBrands}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
      />

      <SizingJournalStats journalEntries={journalEntries} />

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-6">
        {filteredAndSortedEntries.length === 0 ? (
          <EmptyState
            hasEntries={journalEntries.length > 0}
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
            />
          ))
        )}
      </div>

      {editingEntry && (
        <EditSneakerModal
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
    </div>
  )
}

// Sub-components (unchanged)
function DashboardHeader({ viewMode }: { viewMode: 'watchlist' | 'purchased' }) {
    // ...
    const titles = {
    watchlist: {
      title: 'Personal Pricing Watchlist',
      description: 'Track items you\'re interested in and monitor price changes'
    },
    purchased: {
      title: 'Purchased Items',
      description: 'Items you\'ve bought and own'
    }
  }

  const { title, description } = titles[viewMode]

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[var(--space-base)] mb-[var(--space-xl)]">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
    // ...
      return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-[var(--space-xl)]">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="overflow-hidden flex flex-col md:flex-row animate-pulse">
          <div className="relative w-full h-[360px] md:h-[280px] md:w-[280px] bg-gray-200 flex-shrink-0" />
          <CardContent className="flex-1 p-[var(--space-lg)] flex flex-col gap-[var(--space-sm)] md:border-l md:border-gray-200">
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-[var(--space-xs)] mt-[var(--space-xs)]">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface EmptyStateProps {
  hasEntries: boolean
  onAddNew?: () => void
}

function EmptyState({ hasEntries, onAddNew }: EmptyStateProps) {
    // ...
      return (
    <div className="col-span-1 xl:col-span-2">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {hasEntries ? 'No matching entries' : 'No journal entries yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {hasEntries
              ? 'Try adjusting your search or filters.'
              : 'Start tracking your sizing and fit insights!'}
          </p>
          {!hasEntries && onAddNew && (
            <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700">
              Add Your First Entry
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}