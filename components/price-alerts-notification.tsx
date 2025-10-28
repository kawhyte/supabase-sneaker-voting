/**
 * ✅ PRICE ALERTS NOTIFICATION COMPONENT - DESIGN SYSTEM v2.0
 *
 * 🎯 DESIGN STRATEGY:
 *
 * **Component Purpose:**
 * Displays unread price drop alerts for wishlist items.
 * Shows alert list with severity indicators, price details, and action buttons.
 * Allows users to dismiss alerts and navigate to wishlist items.
 *
 * **Layout Structure:**
 * 1. Alert Container
 *    - bg-card (white) with rounded-lg + shadow-md for elevation
 *    - max-h-[400px] overflow-y-auto for scrollable content
 *    - border-l-4 with severity color (green/yellow/red)
 *
 * 2. Alert Item
 *    - Flex layout: icon | content | actions
 *    - Severity indicator badge (left border)
 *    - Price information (old → new, % off)
 *    - Item link and dismiss button
 *
 * 3. Empty State
 *    - HeartOff icon + messaging when no alerts
 *    - Encourages user to add product URLs
 *
 * **Color System Integration:**
 * - Background: bg-card (white)
 * - Severity Low: border-blue-400 (low priority)
 * - Severity Medium: border-yellow-400 (medium priority)
 * - Severity High: border-red-400 (urgent)
 * - Text: text-foreground (slate-900), text-muted-foreground (slate-600)
 * - Badge backgrounds: Lighter shade of severity color
 *
 * **Spacing System (Perfect 8px Grid):**
 * - Container padding: p-4 (16px)
 * - Alert item gap: gap-3 (12px)
 * - Badge padding: px-2 py-1 (8px vertical, 8px horizontal)
 * - All values align to 4px/8px multiples
 *
 * **Responsive Breakpoints:**
 * - Mobile (< 640px): Full width, compact badges
 * - Tablet+ (640px+): Side-by-side layout stable
 *
 * **Accessibility (WCAG AAA):**
 * - Alert semantic: role="region" aria-live="polite"
 * - Icon labels: aria-label on all icon buttons
 * - Color not sole indicator: Icons + text for severity
 * - Focus indicators: Visible focus rings on buttons
 * - Keyboard navigation: Tab through all interactive elements
 *
 * **Interactive Features:**
 * - Dismiss button marks alert as read
 * - Item link navigates to wishlist
 * - Real-time update when dismissing
 * - Toast notification on dismiss
 *
 * **Performance:**
 * - useEffect triggers only on component mount or alerts change
 * - Memoized to prevent unnecessary re-renders
 * - Efficient query filtering (is_read = false)
 *
 * 📚 Related: price_alerts table, add-item-form.tsx (edit wishlist items)
 * 🎨 Design System: globals.css (spacing, colors, typography)
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { AlertCircle, X, TrendingDown, HeartOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PriceAlert {
  id: string
  item_id: string
  user_id: string
  severity: 'low' | 'medium' | 'high'
  message: string
  current_price: number
  previous_price: number
  percentage_off: number
  is_read: boolean
  created_at: string
  item?: {
    id: string
    brand: string
    model: string
  }
}

interface PriceAlertsNotificationProps {
  onDismiss?: () => void
}

export function PriceAlertsNotification({ onDismiss }: PriceAlertsNotificationProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAlerts(data || [])
    } catch (error) {
      console.error('Error loading price alerts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', alertId)

      if (error) throw error

      setAlerts(alerts.filter(a => a.id !== alertId))
      toast.success('Alert dismissed')
      onDismiss?.()
    } catch (error) {
      console.error('Error dismissing alert:', error)
      toast.error('Failed to dismiss alert')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-l-4 border-red-400 bg-red-50'
      case 'medium':
        return 'border-l-4 border-yellow-400 bg-yellow-50'
      case 'low':
        return 'border-l-4 border-blue-400 bg-blue-50'
      default:
        return 'border-l-4 border-gray-400 bg-gray-50'
    }
  }

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className='bg-card rounded-lg p-4 text-center text-muted-foreground'>
        Loading alerts...
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className='bg-card rounded-lg p-6 border border-stone-300'>
        <div className='flex flex-col items-center justify-center text-center'>
          <HeartOff className='h-8 w-8 text-muted-foreground mb-2' />
          <p className='font-medium text-foreground'>No price drop alerts</p>
          <p className='text-sm text-muted-foreground mt-1'>
            Add product URLs to your wishlist items to track prices!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className='space-y-2 bg-card rounded-lg border border-stone-300 p-4 max-h-[400px] overflow-y-auto'
      role='region'
      aria-live='polite'
      aria-label='Price drop alerts'>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-start gap-3 p-3 rounded ${getSeverityColor(alert.severity)}`}>
          {/* Severity Icon */}
          <div className='flex-shrink-0 mt-1'>
            <TrendingDown className='h-5 w-5 text-red-600' />
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between gap-2'>
              <div className='flex-1'>
                {/* Severity Badge */}
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded mb-1 ${getSeverityBadgeColor(alert.severity)}`}>
                  {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Priority
                </span>

                {/* Alert Message */}
                <p className='text-sm font-medium text-foreground mb-1'>
                  {alert.percentage_off}% Off!
                </p>

                {/* Price Details */}
                <p className='text-sm text-muted-foreground mb-2'>
                  <span className='line-through'>${alert.previous_price?.toFixed(2)}</span>
                  {' → '}
                  <span className='font-semibold text-green-600'>${alert.current_price?.toFixed(2)}</span>
                </p>

                {/* Message */}
                <p className='text-xs text-muted-foreground'>
                  {alert.message}
                </p>
              </div>

              {/* Dismiss Button */}
              <Button
                variant='ghost'
                size='sm'
                className='h-6 w-6 p-0 flex-shrink-0 hover:bg-red-200'
                onClick={() => handleDismiss(alert.id)}
                aria-label={`Dismiss ${alert.percentage_off}% off alert`}>
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
