'use client'

import { useState, useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface Photo {
  id: string
  image_url: string
  image_order: number
  is_main_image: boolean
}

interface PhotoCarouselProps {
  photos: Photo[]
  className?: string
  autoHeight?: boolean
  showControls?: boolean
  showIndicators?: boolean
  onPhotoClick?: (photo: Photo) => void
}

export function PhotoCarousel({
  photos = [],
  className = '',
  autoHeight = false,
  showControls = true,
  showIndicators = true,
  onPhotoClick
}: PhotoCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: photos.length > 1,
    align: 'center'
  })

  // Sort photos by order, with main image first
  const sortedPhotos = [...photos].sort((a, b) => {
    if (a.is_main_image) return -1
    if (b.is_main_image) return 1
    return a.image_order - b.image_order
  })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi, setSelectedIndex])

  useEffect(() => {
    if (!emblaApi) return

    onSelect()
    emblaApi.on('select', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') scrollPrev()
      if (event.key === 'ArrowRight') scrollNext()
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [scrollPrev, scrollNext])

  if (sortedPhotos.length === 0) {
    return (
      <Card className={`bg-gray-50 ${className}`}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📸</div>
            <p>No photos available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (sortedPhotos.length === 1) {
    const photo = sortedPhotos[0]
    return (
      <Card className={className}>
        <CardContent className="p-0 relative">
          {photo.is_main_image && (
            <Badge className="absolute top-3 left-3 z-10 bg-blue-600">
              Main Photo
            </Badge>
          )}

          <div
            className="relative cursor-pointer group"
            onClick={() => onPhotoClick?.(photo)}
          >
            <img
              src={photo.image_url}
              alt="Item photo"
              className="w-full h-full object-contain rounded-lg"
              style={{ aspectRatio: autoHeight ? 'auto' : '1 / 1' }}
            />

            {onPhotoClick && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Maximize2 className="h-4 w-4 mr-1" />
                  View Full Size
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Carousel */}
      <div className="relative h-full">
        <div className="overflow-hidden h-full" ref={emblaRef}>
            <div className="flex h-full">
              {sortedPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="flex-[0_0_100%] min-w-0 relative h-full"
                >
                  <div
                    className="relative cursor-pointer group h-full"
                    onClick={() => onPhotoClick?.(photo)}
                  >
                    <img
                      src={photo.image_url}
                      alt={`Item photo ${index + 1}`}
                      className="w-full h-full object-contain"
                    />

                    {onPhotoClick && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Maximize2 className="h-4 w-4 mr-1" />
                          View Full Size
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls with Counter */}
          {showControls && sortedPhotos.length > 1 && (
            <>
              {/* Photo Counter Badge */}
              <Badge className="absolute top-3/5 left-1/2 -translate-x-1/2 z-10 bg-white/95 text-gray-900 border-0 shadow-md">
                {selectedIndex + 1}/{sortedPhotos.length}
              </Badge>

              {/* Navigation Arrows */}
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white/95 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={scrollPrev}
              >
                <ChevronLeft className="h-2 w-2" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white/95 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={scrollNext}
              >
                <ChevronRight className="h-2 w-2" />
              </Button>
            </>
          )}
      </div>

      {/* Thumbnail Indicators - Hidden for dashboard cards */}
      {showIndicators && sortedPhotos.length > 1 && false && (
        <div className="flex justify-center space-x-2 mt-4">
          {sortedPhotos.map((photo, index) => (
            <button
              key={photo.id}
              className={`
                relative overflow-hidden rounded transition-all duration-200
                ${selectedIndex === index
                  ? 'ring-2 ring-blue-500 ring-offset-2'
                  : 'opacity-60 hover:opacity-80'
                }
              `}
              onClick={() => scrollTo(index)}
            >
              <img
                src={photo.image_url}
                alt={`Thumbnail ${index + 1}`}
                className="w-12 h-12 object-cover"
              />
              {photo.is_main_image && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}