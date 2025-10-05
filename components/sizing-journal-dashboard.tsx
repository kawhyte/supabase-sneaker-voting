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

interface SizingJournalDashboardProps {
  onAddNew?: () => void
}

export function SizingJournalDashboard({ onAddNew }: SizingJournalDashboardProps = {}) {
  // State - Data
  const [journalEntries, setJournalEntries] = useState<SizingJournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // State - Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date-desc')

  // State - Modals
  const [editingEntry, setEditingEntry] = useState<SizingJournalEntry | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deletingEntry, setDeletingEntry] = useState<SizingJournalEntry | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadJournalEntries()
  }, [])

  const loadJournalEntries = async () => {
    try {
      setIsLoading(true)

      // Try to fetch with sneaker_photos, fallback to basic query if table doesn't exist
      let { data, error } = await supabase
        .from('sneakers')
        .select(`
          *,
          sneaker_photos (
            id,
            image_url,
            image_order,
            is_main_image
          )
        `)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })

      // If sneaker_photos table doesn't exist, fallback to basic query
      if (error && error.message?.includes('sneaker_photos')) {
        const basicQuery = await supabase
          .from('sneakers')
          .select('*')
          .eq('is_archived', false)
          .order('created_at', { ascending: false })

        data = basicQuery.data
        error = basicQuery.error
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
      // First, fetch all photos associated with this sneaker
      const { data: photos, error: photosError } = await supabase
        .from('sneaker_photos')
        .select('cloudinary_id')
        .eq('sneaker_id', deletingEntry.id)

      if (photosError) {
        console.warn('Error fetching sneaker photos:', photosError)
      }

      // Delete all carousel images from Cloudinary
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

      // Delete main image from Cloudinary if it exists
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

      // Delete the entry from database (cascade will delete sneaker_photos records)
      const { error } = await supabase
        .from('sneakers')
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
    const newCollectionStatus = !entry.in_collection

    // Validate price before adding to collection
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

    // Optimistic update
    setJournalEntries(prev =>
      prev.map(e => e.id === entry.id ? { ...e, in_collection: newCollectionStatus } : e)
    )

    try {
      const { error } = await supabase
        .from('sneakers')
        .update({ in_collection: newCollectionStatus })
        .eq('id', entry.id)

      if (error) {
        console.error('Error toggling collection status:', error)
        // Revert optimistic update on error
        setJournalEntries(prev =>
          prev.map(e => e.id === entry.id ? { ...e, in_collection: !newCollectionStatus } : e)
        )
        toast.error('Failed to update collection')
        return
      }

      // Show success toast
      toast.success(
        newCollectionStatus ? 'Added to collection' : 'Removed from collection',
        {
          description: `${entry.brand} ${entry.model}`,
          duration: 3000,
        }
      )
    } catch (error) {
      console.error('Error:', error)
      // Revert optimistic update on error
      setJournalEntries(prev =>
        prev.map(e => e.id === entry.id ? { ...e, in_collection: !newCollectionStatus } : e)
      )
      toast.error('Failed to update collection')
    }
  }

  // Computed values
  const filteredAndSortedEntries = sortJournalEntries(
    filterJournalEntries(journalEntries, searchTerm, selectedUser, selectedBrand),
    sortBy
  )
  const availableBrands = getUniqueBrands(journalEntries)

  if (isLoading) {
    return (
      <div className="max-w-[1920px] mx-auto px-[var(--space-xl)] py-[var(--space-xl)]">
        <DashboardHeader />
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="max-w-[1920px] mx-auto px-[var(--space-xl)] py-[var(--space-xl)]">
      <DashboardHeader />

      <SizingJournalFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedUser={selectedUser}
        onUserChange={setSelectedUser}
        selectedBrand={selectedBrand}
        onBrandChange={setSelectedBrand}
        sortBy={sortBy}
        onSortChange={setSortBy}
        availableBrands={availableBrands}
      />

      <SizingJournalStats journalEntries={journalEntries} />

      {/* Journal Entries List */}
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

      {/* Modals */}
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

// Sub-components
function DashboardHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[var(--space-base)] mb-[var(--space-xl)]">
      <div>
        <h1 className="text-3xl font-bold"> Personal Pricing Watchlist</h1>
        <p className="text-gray-600">Track your pricing sizing, fit, and comfort across brands</p>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
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
