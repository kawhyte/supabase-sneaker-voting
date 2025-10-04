'use client'

import { SizingJournalEntryCard } from '@/components/sizing-journal-entry-card'
import { SizingJournalEntry, ArchiveReason } from '@/components/types/sizing-journal-entry'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ArchiveReasonDialog } from '@/components/archive-reason-dialog'
import { Plus, Package, Archive } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CollectionPage() {
  const supabase = createClient()
  const router = useRouter()
  const [collectionSneakers, setCollectionSneakers] = useState<SizingJournalEntry[]>([])
  const [archivedSneakers, setArchivedSneakers] = useState<SizingJournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [sneakerToArchive, setSneakerToArchive] = useState<SizingJournalEntry | null>(null)

  // Fetch collection data
  useEffect(() => {
    fetchCollection()
    fetchArchived()
  }, [])

  const fetchCollection = async () => {
    const { data: collectionData, error } = await supabase
      .from('sneakers')
      .select('*')
      .eq('in_collection', true)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching collection:', error)
    } else {
      setCollectionSneakers(collectionData || [])
    }
    setLoading(false)
  }

  const fetchArchived = async () => {
    const { data: archivedData, error } = await supabase
      .from('sneakers')
      .select('*')
      .eq('is_archived', true)
      .order('archived_at', { ascending: false })

    if (error) {
      console.error('Error fetching archived:', error)
    } else {
      setArchivedSneakers(archivedData || [])
    }
  }

  const handleIncrementWear = async (entry: SizingJournalEntry) => {
    const newWearCount = (entry.wears || 0) + 1
    const now = new Date().toISOString()

    // Optimistic update
    setCollectionSneakers(prev =>
      prev.map(sneaker =>
        sneaker.id === entry.id
          ? { ...sneaker, wears: newWearCount, last_worn_date: now }
          : sneaker
      )
    )

    // Update in database
    const { error } = await supabase
      .from('sneakers')
      .update({ wears: newWearCount, last_worn_date: now })
      .eq('id', entry.id)

    if (error) {
      console.error('Error updating wears:', error)
      // Revert on error
      fetchCollection()
    }
  }

  const handleDecrementWear = async (entry: SizingJournalEntry) => {
    const currentWears = entry.wears || 0
    if (currentWears === 0) return // Prevent negative values

    const newWearCount = currentWears - 1
    const lastWornDate = newWearCount === 0 ? null : entry.last_worn_date

    // Optimistic update
    setCollectionSneakers(prev =>
      prev.map(sneaker =>
        sneaker.id === entry.id
          ? { ...sneaker, wears: newWearCount, last_worn_date: lastWornDate }
          : sneaker
      )
    )

    // Update in database
    const { error } = await supabase
      .from('sneakers')
      .update({
        wears: newWearCount,
        last_worn_date: lastWornDate
      })
      .eq('id', entry.id)

    if (error) {
      console.error('Error updating wears:', error)
      // Revert on error
      fetchCollection()
    }
  }

  const handleMoveToWatchlist = async (entry: SizingJournalEntry) => {
    // Optimistic update - remove from view
    setCollectionSneakers(prev => prev.filter(sneaker => sneaker.id !== entry.id))

    // Update in database
    const { error } = await supabase
      .from('sneakers')
      .update({ in_collection: false })
      .eq('id', entry.id)

    if (error) {
      console.error('Error moving to watchlist:', error)
      // Revert on error
      fetchCollection()
    }
  }

  const handleEdit = (entry: SizingJournalEntry) => {
    router.push(`/edit/${entry.id}`)
  }

  const handleDelete = async (entry: SizingJournalEntry) => {
    if (!confirm('Are you sure you want to delete this sneaker from your collection?')) {
      return
    }

    // Optimistic update - remove from view
    setCollectionSneakers(prev => prev.filter(sneaker => sneaker.id !== entry.id))

    // Delete from database
    const { error } = await supabase
      .from('sneakers')
      .delete()
      .eq('id', entry.id)

    if (error) {
      console.error('Error deleting sneaker:', error)
      // Revert on error
      fetchCollection()
    }
  }

  const handleToggleCollection = async (entry: SizingJournalEntry) => {
    // This would toggle between collection and not, but in collection view we mainly use move to watchlist
    await handleMoveToWatchlist(entry)
  }

  const handleArchive = (entry: SizingJournalEntry) => {
    setSneakerToArchive(entry)
    setArchiveDialogOpen(true)
  }

  const handleArchiveConfirm = async (reason: ArchiveReason, note?: string) => {
    if (!sneakerToArchive) return

    const now = new Date().toISOString()

    // Optimistic update - remove from active collection, add to archived
    setCollectionSneakers(prev => prev.filter(sneaker => sneaker.id !== sneakerToArchive.id))
    setArchivedSneakers(prev => [
      { ...sneakerToArchive, is_archived: true, archive_reason: reason, archived_at: now },
      ...prev
    ])

    // Update in database
    const { error } = await supabase
      .from('sneakers')
      .update({
        is_archived: true,
        archive_reason: reason,
        archived_at: now,
      })
      .eq('id', sneakerToArchive.id)

    if (error) {
      console.error('Error archiving sneaker:', error)
      // Revert on error
      fetchCollection()
      fetchArchived()
    }
  }

  const handleRestore = async (entry: SizingJournalEntry) => {
    // Optimistic update - remove from archived, add to active collection
    setArchivedSneakers(prev => prev.filter(sneaker => sneaker.id !== entry.id))
    setCollectionSneakers(prev => [
      { ...entry, is_archived: false, archive_reason: null, archived_at: null, in_collection: true },
      ...prev
    ])

    // Update in database
    const { error } = await supabase
      .from('sneakers')
      .update({
        is_archived: false,
        archive_reason: null,
        archived_at: null,
        in_collection: true,
      })
      .eq('id', entry.id)

    if (error) {
      console.error('Error restoring sneaker:', error)
      // Revert on error
      fetchCollection()
      fetchArchived()
    }
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
              My Collection
            </h1>
            <p
              className="mt-2 text-lg"
              style={{ color: 'var(--color-gray-500)' }}
            >
              A visual inventory of your prized sneakers
            </p>
            {collectionSneakers.length > 0 && (
              <p
                className="mt-1 text-sm font-medium"
                style={{ color: 'var(--color-gray-600)' }}
              >
                {collectionSneakers.length} {collectionSneakers.length === 1 ? 'sneaker' : 'sneakers'} in collection
              </p>
            )}
          </div>
          
        </div>

        {/* Tabs for Active/Archived */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6" style={{ backgroundColor: 'var(--color-gray-100)' }}>
            <TabsTrigger
              value="active"
              className="data-[state=active]:border-b-2"
              style={{
                borderColor: 'var(--color-primary-500)',
              }}
            >
              Active Collection
              {collectionSneakers.length > 0 && (
                <span
                  className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: 'var(--color-primary-100)',
                    color: 'var(--color-black-soft)',
                  }}
                >
                  {collectionSneakers.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className="data-[state=active]:border-b-2"
              style={{
                borderColor: 'var(--color-gray-500)',
              }}
            >
              Archived
              {archivedSneakers.length > 0 && (
                <span
                  className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: 'var(--color-gray-200)',
                    color: 'var(--color-gray-700)',
                  }}
                >
                  {archivedSneakers.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Active Collection Tab */}
          <TabsContent value="active">
            {collectionSneakers.length === 0 ? (
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
                    <Package
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
                      Your collection is empty
                    </h2>
                    <p
                      className="text-base max-w-sm mx-auto"
                      style={{ color: 'var(--color-gray-500)' }}
                    >
                      Start building your sneaker collection by adding your first pair
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
                      Add Your First Sneaker
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-6"
                role="list"
                aria-label="Sneaker collection"
              >
                {collectionSneakers.map((sneaker) => (
                  <SizingJournalEntryCard
                    key={sneaker.id}
                    entry={sneaker}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleCollection={handleToggleCollection}
                    onIncrementWear={handleIncrementWear}
                    onDecrementWear={handleDecrementWear}
                    onMoveToWatchlist={handleMoveToWatchlist}
                    onArchive={handleArchive}
                    viewMode="collection"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Archived Tab */}
          <TabsContent value="archived">
            {archivedSneakers.length === 0 ? (
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
                    <Archive
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
                      No archived sneakers
                    </h2>
                    <p
                      className="text-base max-w-sm mx-auto"
                      style={{ color: 'var(--color-gray-500)' }}
                    >
                      Sneakers you archive will appear here
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-6"
                role="list"
                aria-label="Archived sneakers"
              >
                {archivedSneakers.map((sneaker) => (
                  <SizingJournalEntryCard
                    key={sneaker.id}
                    entry={sneaker}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                    viewMode="archive"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Archive Reason Dialog */}
        {sneakerToArchive && (
          <ArchiveReasonDialog
            open={archiveDialogOpen}
            onOpenChange={setArchiveDialogOpen}
            onConfirm={handleArchiveConfirm}
            sneakerName={`${sneakerToArchive.brand} ${sneakerToArchive.model}`}
          />
        )}
      </div>
    </div>
  );
}