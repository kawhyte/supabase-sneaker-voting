'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NotificationSettings } from '@/components/notification-settings'

export default function SimpleTestPage() {
  const [count, setCount] = useState(0)

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Simple Test Page</h1>
        <p className="text-gray-600 mb-6">Testing basic functionality</p>
      </div>

      {/* Basic Counter Test */}
      <Card>
        <CardHeader>
          <CardTitle>Basic React State Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={() => setCount(count + 1)}>
              Count: {count}
            </Button>
            <Badge>{count > 5 ? 'High' : 'Low'}</Badge>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Click the button to test React state updates
          </p>
        </CardContent>
      </Card>

      {/* Notification Test */}
      <Card>
        <CardHeader>
          <CardTitle>Notification System Test</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationSettings />
        </CardContent>
      </Card>

      {/* Browser Info */}
      <Card>
        <CardHeader>
          <CardTitle>Browser Environment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>User Agent: {typeof window !== 'undefined' ? navigator.userAgent : 'Server-side'}</div>
            <div>Service Worker Support: {typeof navigator !== 'undefined' && 'serviceWorker' in navigator ? '✅ Yes' : '❌ No'}</div>
            <div>Notification Support: {typeof window !== 'undefined' && 'Notification' in window ? '✅ Yes' : '❌ No'}</div>
            <div>Push Manager Support: {typeof window !== 'undefined' && 'PushManager' in window ? '✅ Yes' : '❌ No'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}