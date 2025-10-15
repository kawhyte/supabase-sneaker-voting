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
        <h1 className="text-4xl font-bold mb-4 font-heading">Simple Test Page</h1>
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

      {/* Design System Test */}
      <Card>
        <CardHeader>
          <CardTitle>Design System Utilities Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Spacing Test */}
            <div>
              <h3 className="text-lg font-semibold mb-md">Spacing Utilities</h3>
              <div className="flex flex-wrap gap-xs items-center">
                <div className="px-xxs py-xxs bg-blue-100 text-xs">px-xxs py-xxs (4px)</div>
                <div className="px-xs py-xs bg-yellow-100 text-xs">px-xs py-xs (8px)</div>
                <div className="px-sm py-sm bg-purple-100 text-xs">px-sm py-sm (12px)</div>
                <div className="px-md py-md bg-pink-100 text-xs">px-md py-md (16px)</div>
              </div>
            </div>

            {/* Gap Test */}
            <div>
              <h3 className="text-lg font-semibold mb-md">Gap Utilities</h3>
              <div className="flex flex-col gap-xs">
                <div className="flex gap-xxs">
                  <div className="w-8 h-8 bg-blue-500"></div>
                  <div className="w-8 h-8 bg-blue-500"></div>
                  <span className="text-xs">gap-xxs (4px)</span>
                </div>
                <div className="flex gap-xs">
                  <div className="w-8 h-8 bg-green-500"></div>
                  <div className="w-8 h-8 bg-green-500"></div>
                  <span className="text-xs">gap-xs (8px)</span>
                </div>
                <div className="flex gap-md">
                  <div className="w-8 h-8 bg-yellow-500"></div>
                  <div className="w-8 h-8 bg-yellow-500"></div>
                  <span className="text-xs">gap-md (16px)</span>
                </div>
                <div className="flex gap-xl">
                  <div className="w-8 h-8 bg-purple-500"></div>
                  <div className="w-8 h-8 bg-purple-500"></div>
                  <span className="text-xs">gap-xl (32px)</span>
                </div>
              </div>
            </div>

            {/* Typography Test */}
            <div>
              <h3 className="text-lg font-semibold mb-md">Typography Scale</h3>
              <div className="space-y-xs">
                <p className="text-xs">text-xs (12px) - Fine print</p>
                <p className="text-sm">text-sm (14px) - Small text</p>
                <p className="text-base">text-base (16px) - Body text</p>
                <p className="text-lg">text-lg (18px) - Large body</p>
                <p className="text-xl">text-xl (20px) - Extra large</p>
                <p className="text-2xl">text-2xl (24px) - Heading 4</p>
              </div>
            </div>

            {/* Badge Variants Test */}
            <div>
              <h3 className="text-lg font-semibold mb-md">Badge Color Variants</h3>
              <div className="flex flex-wrap gap-sm">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="yellow">Yellow</Badge>
                <Badge variant="green">Green</Badge>
                <Badge variant="blue">Blue</Badge>
                <Badge variant="purple">Purple</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>

            {/* Line Height Test */}
            <div>
              <h3 className="text-lg font-semibold mb-md">Line Height Utilities</h3>
              <div className="space-y-md">
                <div className="border-l-4 border-blue-500 pl-md">
                  <p className="text-sm leading-none">leading-none (16px) - Compact text for badges and buttons</p>
                </div>
                <div className="border-l-4 border-green-500 pl-md">
                  <p className="text-base leading-tight">leading-tight (24px) - Tight text blocks and headings</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-md">
                  <p className="text-base leading-normal">leading-normal (32px) - Comfortable body text for paragraphs</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-md">
                  <p className="text-base leading-relaxed">leading-relaxed (40px) - Spacious reading for long-form content</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}