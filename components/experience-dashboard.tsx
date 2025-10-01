'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'
import { Star, ThumbsUp, Calendar, MapPin, DollarSign, User, Search, Filter, Edit, Trash2, Loader2, Image as ImageIcon } from 'lucide-react'
import { EditSneakerModal } from './edit-sneaker-modal'
import { PhotoCarousel } from './photo-carousel'

interface SneakerPhoto {
  id: string
  image_url: string
  image_order: number
  is_main_image: boolean
}

interface SneakerExperience {
  id: string
  created_at: string
  user_name: string
  brand: string
  model: string
  colorway: string
  interaction_type: 'seen' | 'tried'
  size_tried: string | null
  fit_rating: number | null
  comfort_rating?: number
  store_name?: string
  try_on_date: string
  notes?: string
  listed_price?: number
  would_recommend: boolean | null
  interested_in_buying: boolean
  image_url?: string
  cloudinary_id?: string
  sneaker_photos?: SneakerPhoto[]
}

// Fit rating descriptions
const FIT_RATINGS = [
  { value: 1, label: 'Too Small', icon: '🔴', color: 'bg-red-100 text-red-800' },
  { value: 2, label: 'Snug', icon: '🟠', color: 'bg-orange-100 text-orange-800' },
  { value: 3, label: 'Perfect', icon: '🟢', color: 'bg-green-100 text-green-800' },
  { value: 4, label: 'Loose', icon: '🟡', color: 'bg-yellow-100 text-yellow-800' },
  { value: 5, label: 'Too Big', icon: '🔴', color: 'bg-red-100 text-red-800' }
]

interface ExperienceDashboardProps {
  onAddNew?: () => void
}

export function ExperienceDashboard({ onAddNew }: ExperienceDashboardProps = {}) {
  const [experiences, setExperiences] = useState<SneakerExperience[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterUser, setFilterUser] = useState<string>('all')
  const [filterBrand, setFilterBrand] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date-desc')
  const [editingExperience, setEditingExperience] = useState<SneakerExperience | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deletingExperience, setDeletingExperience] = useState<SneakerExperience | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadExperiences()
  }, [])

  const loadExperiences = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
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
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading experiences:', error)
        return
      }

      setExperiences(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFitRatingInfo = (rating: number | null) => {
    if (!rating) return null
    return FIT_RATINGS.find(r => r.value === rating) || FIT_RATINGS[2]
  }

  const getComfortStars = (rating?: number) => {
    if (!rating) return null
    return '⭐'.repeat(rating)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleEditExperience = (experience: SneakerExperience) => {
    setEditingExperience(experience)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingExperience(null)
  }

  const handleSaveEdit = () => {
    // Refresh the experiences list
    loadExperiences()
  }

  const handleDeleteExperience = (experience: SneakerExperience) => {
    setDeletingExperience(experience)
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingExperience) return

    setIsDeleting(true)
    try {
      // Step 1: Delete the image from Cloudinary if it exists
      if (deletingExperience.cloudinary_id) {
        try {
          const deleteImageResponse = await fetch('/api/delete-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              publicId: deletingExperience.cloudinary_id
            })
          })

          if (!deleteImageResponse.ok) {
            console.warn('Failed to delete image from Cloudinary, but continuing with experience deletion')
          }
        } catch (imageError) {
          console.warn('Error deleting image from Cloudinary:', imageError)
          // Continue with experience deletion even if image deletion fails
        }
      }

      // Step 2: Delete the experience from database
      const { error } = await supabase
        .from('sneakers')
        .delete()
        .eq('id', deletingExperience.id)

      if (error) {
        console.error('Error deleting experience:', error)
        alert('Failed to delete experience. Please try again.')
        return
      }

      // Step 3: Refresh the experiences list
      loadExperiences()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to delete experience. Please try again.')
    } finally {
      setIsDeleting(false)
      setIsDeleteConfirmOpen(false)
      setDeletingExperience(null)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false)
    setDeletingExperience(null)
  }

  // Filter and sort experiences
  const filteredExperiences = experiences
    .filter(exp => {
      const matchesSearch = searchTerm === '' ||
        exp.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.colorway.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesUser = filterUser === 'all' || exp.user_name === filterUser
      const matchesBrand = filterBrand === 'all' || exp.brand === filterBrand

      return matchesSearch && matchesUser && matchesBrand
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'fit-rating':
          return a.fit_rating - b.fit_rating
        case 'brand':
          return a.brand.localeCompare(b.brand)
        default:
          return 0
      }
    })

  // Get unique brands for filter
  const uniqueBrands = [...new Set(experiences.map(exp => exp.brand))].sort()

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-[var(--space-xl)] py-[var(--space-xl)]">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[var(--space-base)] mb-[var(--space-xl)]">
          <div>
            <h1 className="text-3xl font-bold">👟 Sneaker Experiences</h1>
            <p className="text-gray-600">Your try-on history and sizing insights</p>
          </div>
        </div>

        {/* Loading Skeleton Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[var(--space-xl)]">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden flex flex-col animate-pulse">
              {/* Image Skeleton */}
              <div className="relative w-full bg-gray-200" style={{ paddingBottom: '56.25%' }} />

              {/* Content Skeleton */}
              <CardContent className="flex-1 p-[var(--space-base)] flex flex-col gap-[var(--space-xs)]">
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
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-[var(--space-xl)] py-[var(--space-xl)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[var(--space-base)] mb-[var(--space-xl)]">
        <div>
          <h1 className="text-3xl font-bold">👟 Sneaker Experiences</h1>
          <p className="text-gray-600">Your try-on history and sizing insights</p>
        </div>
        
      </div>

      {/* Filters and Search */}
      <Card className="mb-[var(--space-xl)]">
        <CardContent className="p-[var(--space-base)]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[var(--space-base)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-2 w-2 text-gray-400" />
              <Input
                placeholder="Search sneakers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-6"
              />
            </div>

            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="Kenny">Kenny</SelectItem>
                <SelectItem value="Rene">Rene</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBrand} onValueChange={setFilterBrand}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {uniqueBrands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="fit-rating">By Fit Rating</SelectItem>
                <SelectItem value="brand">By Brand</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[var(--space-xl)] mb-[var(--space-xl)]">
        <Card className="hover-lift">
          <CardContent className="p-[var(--space-base)] text-center">
            <div className="text-3xl font-bold mb-[var(--space-2xs)]" style={{ color: 'var(--color-primary-500)' }}>
              {experiences.length}
            </div>
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Experiences</div>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="p-[var(--space-base)] text-center">
            <div className="text-3xl font-bold mb-[var(--space-2xs)]" style={{ color: 'var(--color-accent-green-500)' }}>
              {experiences.filter(exp => exp.fit_rating === 3 && exp.interaction_type === 'tried').length}
            </div>
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Perfect Fits</div>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="p-[var(--space-base)] text-center">
            <div className="text-3xl font-bold mb-[var(--space-2xs)]" style={{ color: 'var(--color-accent-blue-500)' }}>
              {experiences.filter(exp => exp.would_recommend && exp.interaction_type === 'tried').length}
            </div>
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Recommended</div>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="p-[var(--space-base)] text-center">
            <div className="text-3xl font-bold mb-[var(--space-2xs)]" style={{ color: 'var(--color-accent-purple-500)' }}>
              {experiences.filter(exp => exp.interaction_type === 'seen').length}
            </div>
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Spotted</div>
          </CardContent>
        </Card>
      </div>

      {/* Experiences List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[var(--space-xl)]">
        {filteredExperiences.length === 0 ? (
          <div className="col-span-1 md:col-span-2 xl:col-span-3">
            <Card>
              <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto mb-2" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {experiences.length === 0 ? 'No experiences yet' : 'No matching experiences'}
              </h3>
              <p className="text-gray-600 mb-4">
                {experiences.length === 0
                  ? 'Start tracking your sneaker try-on experiences!'
                  : 'Try adjusting your search or filters.'}
              </p>
              {experiences.length === 0 && (
                <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700">
                  Add Your First Experience
                </Button>
              )}
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredExperiences.map((experience) => {
            const fitInfo = getFitRatingInfo(experience.fit_rating)
            const isTried = experience.interaction_type === 'tried'

            // Prepare photos for carousel
            const photos = experience.sneaker_photos && experience.sneaker_photos.length > 0
              ? experience.sneaker_photos
              : experience.image_url
                ? [{
                    id: 'main',
                    image_url: experience.image_url,
                    image_order: 0,
                    is_main_image: true
                  }]
                : []

            return (
              <Card
                key={experience.id}
                className="overflow-hidden hover-lift card-interactive flex flex-col"
              >
                {/* Image Section - 16:9 Aspect Ratio with Carousel */}
                {photos.length > 0 ? (
                  <div className="relative">
                    {/* Badge Overlay - Single distinction */}
                    <div className="absolute top-[var(--space-xs)] left-[var(--space-xs)] z-20">
                      <Badge
                        variant="secondary"
                        className="bg-black/80 text-white border-none"
                      >
                        {isTried ? '✓ Tried' : '👀 Seen'}
                      </Badge>
                    </div>

                    {/* Photo Display */}
                    {photos.length === 1 ? (
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <img
                          src={photos[0].image_url}
                          alt={`${experience.brand} ${experience.model}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <div className="absolute inset-0">
                          <PhotoCarousel
                            photos={photos}
                            showControls={true}
                            showIndicators={true}
                            autoHeight={false}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-300" />
                    </div>

                    {/* Badge Overlay - Single distinction */}
                    <div className="absolute top-[var(--space-xs)] left-[var(--space-xs)]">
                      <Badge
                        variant="secondary"
                        className="bg-black/80 text-white border-none"
                      >
                        {isTried ? '✓ Tried' : '👀 Seen'}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Content Section */}
                <CardContent className="flex-1 p-[var(--space-base)] flex flex-col gap-[var(--space-xs)]">
                  {/* Brand */}
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {experience.brand}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold leading-snug line-clamp-2">
                    {experience.model}
                    {experience.colorway !== 'Standard' && (
                      <span className="block text-sm font-normal text-gray-600 mt-1">
                        {experience.colorway}
                      </span>
                    )}
                  </h3>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-x-[var(--space-xs)] gap-y-[var(--space-2xs)] text-xs mt-[var(--space-xs)]">
                    {experience.size_tried && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Size:</span>
                        <span className="font-semibold">{experience.size_tried}</span>
                      </div>
                    )}

                    {fitInfo && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Fit:</span>
                        <span className="font-medium">{fitInfo.icon} {fitInfo.label}</span>
                      </div>
                    )}

                    {experience.comfort_rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Comfort:</span>
                        <span>{getComfortStars(experience.comfort_rating)}</span>
                      </div>
                    )}

                    {experience.listed_price && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="font-medium">${experience.listed_price}</span>
                      </div>
                    )}

                    {experience.store_name && (
                      <div className="flex items-center gap-1 col-span-2">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="truncate">{experience.store_name}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 col-span-2">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span>{formatDate(experience.try_on_date)}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {experience.notes && (
                    <div className="mt-[var(--space-xs)] p-[var(--space-xs)] bg-gray-50 rounded text-xs text-gray-700 line-clamp-2">
                      {experience.notes}
                    </div>
                  )}

                  {/* Footer - Actions */}
                  <div className="flex items-center justify-between mt-auto pt-[var(--space-xs)] border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {experience.user_name}
                      </Badge>
                      {experience.would_recommend && isTried && (
                        <ThumbsUp className="h-3 w-3 text-green-600" />
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditExperience(experience)}
                        className="h-7 px-2 text-xs"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExperience(experience)}
                        className="h-7 px-2 text-xs hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Edit Modal */}
      {editingExperience && (
        <EditSneakerModal
          experience={editingExperience}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteConfirmOpen && deletingExperience && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Delete Experience</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <div className="font-medium text-gray-900">
                {deletingExperience.brand} {deletingExperience.model}
              </div>
              <div className="text-sm text-gray-600">
                {deletingExperience.colorway !== 'Standard' && deletingExperience.colorway && (
                  <span>{deletingExperience.colorway} • </span>
                )}
                {deletingExperience.user_name} • {deletingExperience.interaction_type === 'tried' ? 'Tried On' : 'Spotted'}
                {deletingExperience.size_tried && ` • Size ${deletingExperience.size_tried}`}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this sneaker experience? This will permanently remove it from your collection and analytics.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                className="flex-1"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                className="flex-1"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}