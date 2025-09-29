'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'
import { Star, ThumbsUp, Calendar, MapPin, DollarSign, User, Search, Filter, Edit } from 'lucide-react'
import { EditSneakerModal } from './edit-sneaker-modal'

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

  const supabase = createClient()

  useEffect(() => {
    loadExperiences()
  }, [])

  const loadExperiences = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('sneaker_experiences')
        .select('*')
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
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your sneaker experiences...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">👟 Sneaker Experiences</h1>
          <p className="text-gray-600">Your try-on history and sizing insights</p>
        </div>
        <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700">
          ➕ Add New Experience
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search sneakers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{experiences.length}</div>
            <div className="text-sm text-gray-600">Total Experiences</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {experiences.filter(exp => exp.fit_rating === 3 && exp.interaction_type === 'tried').length}
            </div>
            <div className="text-sm text-gray-600">Perfect Fits</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {experiences.filter(exp => exp.would_recommend && exp.interaction_type === 'tried').length}
            </div>
            <div className="text-sm text-gray-600">Recommended</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {experiences.filter(exp => exp.interaction_type === 'seen').length}
            </div>
            <div className="text-sm text-gray-600">Spotted</div>
          </CardContent>
        </Card>
      </div>

      {/* Experiences List */}
      <div className="space-y-4">
        {filteredExperiences.length === 0 ? (
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
        ) : (
          filteredExperiences.map((experience) => {
            const fitInfo = getFitRatingInfo(experience.fit_rating)
            return (
              <Card key={experience.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Image */}
                    {experience.image_url && (
                      <div className="lg:col-span-1">
                        <img
                          src={experience.image_url}
                          alt={`${experience.brand} ${experience.model}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Main Info */}
                    <div className={experience.image_url ? "lg:col-span-2" : "lg:col-span-3"}>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {experience.user_name}
                        </Badge>
                        <Badge variant="outline">{experience.brand}</Badge>
                        {fitInfo ? (
                          <Badge className={fitInfo.color}>
                            {fitInfo.icon} {fitInfo.label}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            👀 Spotted
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold mb-2">
                        {experience.brand} {experience.model}
                        {experience.colorway !== 'Standard' && (
                          <span className="text-gray-600"> - {experience.colorway}</span>
                        )}
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {experience.size_tried && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Size:</span>
                            <span className="text-lg font-bold text-blue-600">{experience.size_tried}</span>
                          </div>
                        )}

                        {experience.comfort_rating && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Comfort:</span>
                            <span>{getComfortStars(experience.comfort_rating)}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(experience.try_on_date)}</span>
                        </div>

                        {experience.store_name && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{experience.store_name}</span>
                          </div>
                        )}

                        {experience.listed_price && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span>${experience.listed_price}</span>
                          </div>
                        )}
                      </div>

                      {experience.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">{experience.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions & Indicators */}
                    <div className={`flex flex-col justify-between ${experience.image_url ? "" : "lg:col-span-1"}`}>
                      <div className="space-y-2">
                        {experience.would_recommend && experience.interaction_type === 'tried' && (
                          <div className="flex items-center gap-2 text-green-600 text-sm">
                            <ThumbsUp className="h-4 w-4" />
                            <span>Recommended</span>
                          </div>
                        )}
                        {experience.interaction_type === 'seen' && (
                          <div className="flex items-center gap-2 text-blue-600 text-sm">
                            <span className="text-lg">👀</span>
                            <span>Spotted</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="text-xs text-gray-500">
                          Added {formatDate(experience.created_at)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditExperience(experience)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
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
    </div>
  )
}