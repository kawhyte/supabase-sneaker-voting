'use client'

import { useState, useEffect } from 'react'
import { NotificationCenter } from '@/components/notification-center/NotificationCenter'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { createTestNotification } from './actions'

export default function TestNotificationsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [debugLog, setDebugLog] = useState<string[]>([])
  const supabase = createClient()

  const addLog = (message: string) => {
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        addLog(`User loaded: ${user.id}`)
      }
    }
    getUser()
  }, [supabase])

  // Create test notification directly via API
  const handleCreatePriceAlert = async () => {
    if (!userId) {
      toast.error('User not loaded')
      return
    }

    setIsLoading(true)
    addLog('Creating price alert...')
    try {
      // First, ensure user has preferences
      addLog('Checking user preferences...')
      const prefsResponse = await fetch('/api/user-preferences', {
        method: 'GET'
      })

      if (!prefsResponse.ok) {
        addLog('User preferences not found, initializing...')
        const initResponse = await fetch('/api/user-preferences', {
          method: 'POST'
        })
        if (!initResponse.ok) {
          throw new Error('Failed to initialize preferences')
        }
        addLog('Preferences initialized')
      } else {
        addLog('Preferences exist')
      }

      // Create notification directly in database (bypass service)
      const insertResponse = await fetch('/api/notifications-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_type: 'price_alert',
          title: 'Price Drop Alert',
          message: 'The Nike Air Max dropped by $50!',
          severity: 'high',
          metadata: {
            item_id: 'test-item-1',
            old_price: 150,
            new_price: 100,
            discount_percent: 33
          }
        })
      })

      if (!insertResponse.ok) {
        const error = await insertResponse.json()
        throw new Error(error.error || 'Failed to create notification')
      }

      const result = await insertResponse.json()
      addLog(`✓ Notification created with ID: ${result.id}`)
      toast.success('Test notification created!')

      // Open drawer if closed
      setIsDrawerOpen(true)
    } catch (error) {
      console.error('Error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      addLog(`✗ Error: ${errorMsg}`)
      toast.error('Failed to create notification')
    } finally {
      setIsLoading(false)
    }
  }

  // Cleanup all notifications
  const handleCleanup = async () => {
    addLog('Deleting all notifications...')
    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications-cleanup', {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      addLog('✓ All notifications deleted')
      toast.success('Notifications cleared!')
    } catch (error: any) {
      addLog(`✗ Error: ${error.message}`)
      toast.error('Failed to cleanup')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch and display current notifications
  const handleCheckNotifications = async () => {
    addLog('=== Checking API /api/notifications ===')
    try {
      const response = await fetch('/api/notifications')
      const data = await response.json()

      if (!response.ok) {
        addLog(`✗ API Error (${response.status}): ${data.error}`)
        return
      }

      addLog(`✓ Fetched ${data.notifications?.length || 0} notifications`)
      data.notifications?.forEach((n: any) => {
        addLog(`  - ${n.title} (${n.is_read ? 'read' : 'unread'})`)
      })

      if (data.notifications?.length === 0) {
        addLog('\n=== Running full debug ===')
        // Try full debug
        const dbCheck = await fetch('/api/notifications-full-debug')
        const dbData = await dbCheck.json()

        dbData.logs?.forEach((log: string) => {
          addLog(`  ${log}`)
        })

        addLog('\n=== Direct database check ===')
        const directCheck = await fetch('/api/notifications-debug')
        const directData = await directCheck.json()
        addLog(`  Database has ${directData.totalCount || 0} notifications`)
      }
    } catch (error) {
      addLog(`✗ Error fetching: ${error}`)
    }
  }

  if (!userId) {
    return <div className="p-8">Loading user...</div>
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notification Center Test</h1>
          <p className="text-muted-foreground">
            Test the notification center UI with real notifications
          </p>
        </div>

        <div className="space-y-4">
          <Button onClick={() => setIsDrawerOpen(true)} size="lg">
            Open Notification Center
          </Button>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Debug Actions:</h2>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleCreatePriceAlert}
                variant="outline"
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? 'Creating...' : 'Create Price Alert'}
              </Button>
              <Button
                onClick={handleCheckNotifications}
                variant="outline"
                disabled={isLoading}
                size="sm"
              >
                Check Notifications
              </Button>
              <Button
                onClick={handleCleanup}
                variant="destructive"
                disabled={isLoading}
                size="sm"
              >
                Clean All Notifications
              </Button>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">Debug Log:</h3>
            <div className="bg-background p-3 rounded text-xs font-mono max-h-48 overflow-y-auto border border-border">
              {debugLog.length === 0 ? (
                <div className="text-muted-foreground">No logs yet...</div>
              ) : (
                debugLog.map((log, i) => (
                  <div key={i} className="text-foreground">{log}</div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Center Drawer */}
      <NotificationCenter
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        userId={userId}
      />
    </div>
  )
}
