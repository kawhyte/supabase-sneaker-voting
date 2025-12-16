/**
 * DEPRECATED: OutfitCalendar - Replaced by Sneaker Inspiration (Inspo) Grid
 *
 * This calendar-based outfit planning feature has been superseded by the new
 * dual-vibe color palette system. The app now focuses on color inspiration
 * from sneakers rather than manual outfit scheduling.
 *
 * Legacy Features (no longer actively maintained):
 * - Drag outfits onto calendar days
 * - View scheduled outfits
 * - Mark outfits as worn
 * - Filter by date range
 */

'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Outfit, OutfitWithItems } from '@/components/types/outfit'
import { toast } from 'sonner'

interface OutfitCalendarProps {
  outfits: OutfitWithItems[]
  onOutfitWorn: (outfitId: string) => Promise<void>
  onUnscheduleOutfit: (outfitId: string) => Promise<void>
}

interface DayOutfit {
  date: string
  outfit: OutfitWithItems
}

/**
 * OutfitCalendar - Monthly calendar view
 */
export function OutfitCalendar({
  outfits,
  onOutfitWorn,
  onUnscheduleOutfit,
}: OutfitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [scheduledOutfits, setScheduledOutfits] = useState<DayOutfit[]>([])
  const [view, setView] = useState<'month' | 'week'>('month')
  const [loadingOutfitId, setLoadingOutfitId] = useState<string | null>(null)

  // Get all days in current month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  // Build scheduled outfits map from outfit wear dates
  useEffect(() => {
    const scheduled: DayOutfit[] = outfits
      .filter((outfit) => outfit.date_worn)
      .map((outfit) => ({
        date: new Date(outfit.date_worn!).toISOString().split('T')[0],
        outfit,
      }))
    setScheduledOutfits(scheduled)
  }, [outfits])

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const handleMarkAsWorn = async (outfitId: string) => {
    setLoadingOutfitId(outfitId)
    try {
      await onOutfitWorn(outfitId)
      toast.success('Outfit marked as worn!')
    } catch (error) {
      toast.error('Failed to mark outfit as worn')
    } finally {
      setLoadingOutfitId(null)
    }
  }

  const handleUnschedule = async (outfitId: string) => {
    setLoadingOutfitId(outfitId)
    try {
      await onUnscheduleOutfit(outfitId)
      setScheduledOutfits(
        scheduledOutfits.filter((item) => item.outfit.id !== outfitId)
      )
      toast.success('Outfit unscheduled')
    } catch (error) {
      toast.error('Failed to unschedule outfit')
    } finally {
      setLoadingOutfitId(null)
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    )
  }

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    )
  }

  const getOutfitsForDay = (day: number) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    )
      .toISOString()
      .split('T')[0]
    return scheduledOutfits.filter((item) => item.date === dateStr)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 sm:h-5 w-4 sm:w-5 text-sun-400" />
            <CardTitle className="text-lg sm:text-xl">Outfit Calendar</CardTitle>
          </div>

          {/* View Toggle */}
          <div className="dense flex gap-2">
            <Button
              variant={view === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('month')}
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              Month
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('week')}
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              Week
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6">
        {/* Header with Month Navigation - Responsive */}
        <div className="dense flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
          >
            <ChevronLeft className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <h3 className="text-base sm:text-lg font-semibold text-center flex-1">{monthName}</h3>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        {view === 'month' && (
          <div className="space-y-2 sm:space-y-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="text-xs font-semibold text-muted-foreground py-1 sm:py-2"
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.slice(0, 1)}</span>
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Empty Days */}
              {emptyDays.map((i) => (
                <div
                  key={`empty-${i}`}
                  className="aspect-square bg-stone-50 rounded-lg"
                />
              ))}

              {/* Days with Outfits */}
              {days.map((day) => {
                const dayOutfits = getOutfitsForDay(day)
                const isToday =
                  new Date().toDateString() ===
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day
                  ).toDateString()

                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-lg border-2 p-1 sm:p-2 flex flex-col text-xs sm:text-sm transition-colors ${
                      isToday
                        ? 'border-sun-400 bg-sun-50'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    {/* Day Number */}
                    <div
                      className={`font-semibold ${
                        isToday ? 'text-sun-600' : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </div>

                    {/* Outfits Stack */}
                    <div className="flex-1 flex flex-col gap-0.5 mt-0.5 sm:mt-1 overflow-hidden">
                      {dayOutfits.length > 0 ? (
                        dayOutfits.map((item) => (
                          <OutfitDayBadge
                            key={item.outfit.id}
                            outfit={item.outfit}
                            isLoading={loadingOutfitId === item.outfit.id}
                            onWorn={() => handleMarkAsWorn(item.outfit.id)}
                            onRemove={() => handleUnschedule(item.outfit.id)}
                          />
                        ))
                      ) : (
                        <div className="text-stone-300 flex-1 flex items-center justify-center">
                          -
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Week View */}
        {view === 'week' && (
          <OutfitWeekView
            currentDate={currentDate}
            scheduledOutfits={scheduledOutfits}
            loadingOutfitId={loadingOutfitId}
            onWorn={handleMarkAsWorn}
            onRemove={handleUnschedule}
          />
        )}

        {/* Scheduled Outfits List */}
        {scheduledOutfits.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">
              No outfits scheduled yet. Drag outfits to the calendar to schedule
              them!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface OutfitDayBadgeProps {
  outfit: OutfitWithItems
  isLoading?: boolean
  onWorn: () => void
  onRemove: () => void
}

/**
 * OutfitDayBadge - Small compact badge for calendar day
 */
function OutfitDayBadge({ outfit, isLoading, onWorn, onRemove }: OutfitDayBadgeProps) {
  return (
    <div className="group flex items-center gap-1 bg-sun-100 rounded px-1 py-0.5 text-xs opacity-100">
      <span className={`truncate flex-1 font-medium text-sun-700 line-clamp-1 ${isLoading ? 'opacity-60' : ''}`}>
        {outfit.name}
      </span>

      <div className={`hidden group-hover:flex gap-0.5 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
        {outfit.times_worn === 0 && (
          <button
            onClick={onWorn}
            disabled={isLoading}
            className="p-0.5 hover:bg-sun-200 rounded text-sun-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Mark as worn"
          >
            {isLoading ? (
              <div className="h-3 w-3 border-2 border-sun-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </button>
        )}

        <button
          onClick={onRemove}
          disabled={isLoading}
          className="p-0.5 hover:bg-red-200 rounded text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Unschedule"
        >
          {isLoading ? (
            <div className="h-3 w-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </button>
      </div>
    </div>
  )
}

interface OutfitWeekViewProps {
  currentDate: Date
  scheduledOutfits: DayOutfit[]
  loadingOutfitId: string | null
  onWorn: (outfitId: string) => void
  onRemove: (outfitId: string) => void
}

/**
 * OutfitWeekView - Week-based calendar view
 */
function OutfitWeekView({
  currentDate,
  scheduledOutfits,
  loadingOutfitId,
  onWorn,
  onRemove,
}: OutfitWeekViewProps) {
  // Get Monday of current week
  const date = new Date(currentDate)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(date.setDate(diff))

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return d
  })

  const getOutfitsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return scheduledOutfits.filter((item) => item.date === dateStr)
  }

  return (
    <div className="space-y-3">
      {weekDays.map((date) => {
        const dayOutfits = getOutfitsForDate(date)
        const isToday = new Date().toDateString() === date.toDateString()
        const dayName = date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })

        return (
          <div
            key={date.toISOString()}
            className={`p-3 rounded-lg border-2 ${
              isToday
                ? 'border-sun-400 bg-sun-50'
                : 'border-stone-200 bg-white'
            }`}
          >
            <div
              className={`text-sm font-semibold mb-2 ${
                isToday ? 'text-sun-600' : 'text-slate-700'
              }`}
            >
              {dayName}
            </div>

            {dayOutfits.length > 0 ? (
              <div className="space-y-2">
                {dayOutfits.map((item) => (
                  <div
                    key={item.outfit.id}
                    className="flex items-center justify-between bg-sun-100 p-2 rounded"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-sun-700">
                        {item.outfit.name}
                      </p>
                      {item.outfit.occasion && (
                        <p className="text-xs text-sun-600">
                          {item.outfit.occasion}
                        </p>
                      )}
                    </div>

                    <div className="dense flex gap-1">
                      {item.outfit.times_worn === 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onWorn(item.outfit.id)}
                          disabled={loadingOutfitId === item.outfit.id}
                          className="h-6 w-6 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingOutfitId === item.outfit.id ? (
                            <div className="h-3 w-3 border-2 border-sun-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check className="h-3 w-3 text-sun-600" />
                          )}
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(item.outfit.id)}
                        disabled={loadingOutfitId === item.outfit.id}
                        className="h-6 w-6 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingOutfitId === item.outfit.id ? (
                          <div className="h-3 w-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3 text-red-600" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400">No outfit scheduled</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
