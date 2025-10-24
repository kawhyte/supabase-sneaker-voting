'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  WearRemindersContainer,
} from '@/components/wear-reminder-notifications'
import { SizingJournalEntry } from '@/components/types/sizing-journal-entry'

export default function WearRemindersTestPage() {
  // Mock data: items with different last_worn_date values
  const mockItems: SizingJournalEntry[] = [
    {
      id: '1',
      brand: 'Nike',
      brand_id: null,
      model: 'Air Max 90',
      color: 'Blue',
      category: 'shoes',
      size_type: 'shoe',
      size_tried: '10',
      try_on_date: new Date().toISOString(),
      has_been_tried: true,
      status: 'owned' as any,
      user_id: 'test',
      created_at: new Date().toISOString(),
      last_worn_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      wears: 5,
      would_recommend: true,
    },
    {
      id: '2',
      brand: 'Levi\'s',
      brand_id: null,
      model: 'White Tee',
      color: 'White',
      category: 'tops',
      size_type: 'clothing',
      size_tried: 'M',
      try_on_date: new Date().toISOString(),
      has_been_tried: true,
      status: 'owned' as any,
      user_id: 'test',
      created_at: new Date().toISOString(),
      last_worn_date: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
      wears: 12,
      would_recommend: true,
    },
    {
      id: '3',
      brand: 'Carhartt',
      brand_id: null,
      model: 'Brown Jacket',
      color: 'Brown',
      category: 'outerwear',
      size_type: 'clothing',
      size_tried: 'L',
      try_on_date: new Date().toISOString(),
      has_been_tried: true,
      status: 'owned' as any,
      user_id: 'test',
      created_at: new Date().toISOString(),
      last_worn_date: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
      wears: 3,
      would_recommend: true,
    },
    {
      id: '4',
      brand: 'Gap',
      brand_id: null,
      model: 'Gray Sweater',
      color: 'Gray',
      category: 'tops',
      size_type: 'clothing',
      size_tried: 'S',
      try_on_date: new Date().toISOString(),
      has_been_tried: true,
      status: 'owned' as any,
      user_id: 'test',
      created_at: new Date().toISOString(),
      // Worn recently - should not show reminder
      last_worn_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      wears: 8,
      would_recommend: true,
    },
  ]

  const [items, setItems] = useState(mockItems)

  const handleWear = (itemId: string) => {
    alert(`✅ Marked item as worn!`)
    setItems(items.map(item =>
      item.id === itemId
        ? {
            ...item,
            last_worn_date: new Date().toISOString(),
            wears: (item.wears || 0) + 1
          }
        : item
    ))
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/test-phase-5">
            <Button variant="outline" className="mb-4">
              ← Back to Phase 5 Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            👕 Wear Reminder Notifications
          </h1>
          <p className="text-muted-foreground">
            Test unworn item reminders with intelligent messaging
          </p>
        </div>

        {/* Instructions */}
        <div className="mb-8 p-4 bg-sun-50 border-2 border-sun-300 rounded-lg">
          <p className="text-sm text-foreground mb-3">
            Shows up to 3 reminders for items unworn for 30+ days.
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Real usage:</strong> Integrate into dashboard above wardrobe list.
            Shows items that haven&apos;t been worn in 30, 60, or 90+ days with different emoji tones.
          </p>
        </div>

        {/* Test Data Info */}
        <div className="mb-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold text-foreground mb-2 text-sm">Test Data (4 items)</h3>
          <ul className="space-y-1 text-xs text-muted-foreground font-mono">
            <li>• Nike Air Max Blue (shoes): 35 days unworn → 😻 moderate</li>
            <li>• Levi&apos;s White Tee (tops): 65 days unworn → 😸 getting long</li>
            <li>• Carhartt Brown Jacket (outerwear): 95 days unworn → 😿 very long!</li>
            <li>• Gap Gray Sweater (tops): 10 days unworn → (no reminder)</li>
          </ul>
        </div>

        {/* Reminders Container */}
        <div className="mb-8 p-6 bg-white rounded-lg border border-stone-200">
          <WearRemindersContainer
            items={items}
            onWear={handleWear}
          />
        </div>

        {/* Testing Checklist */}
        <div className="p-6 bg-sun-50 border-2 border-sun-300 rounded-lg mb-6">
          <h3 className="font-semibold text-foreground mb-3">✅ Testing Checklist</h3>
          <ul className="space-y-2 text-sm text-foreground">
            <li>☐ Shows up to 3 reminder cards (for 30+ days unworn)</li>
            <li>☐ Each card has appropriate emoji (😿 for 90+, 😸 for 60-89, 😻 for 30-59)</li>
            <li>☐ Messages mention item color and category</li>
            <li>☐ Days since last worn is accurate</li>
            <li>☐ "I'll wear it today!" button updates state</li>
            <li>☐ "I'll wear it today!" closes reminder card</li>
            <li>☐ "Dismiss" button closes reminder card</li>
            <li>☐ After wearing item, it updates wears count</li>
            <li>☐ Gray Sweater (10 days) does NOT show reminder</li>
            <li>☐ Cards are responsive on mobile</li>
          </ul>
        </div>

        {/* Emoji Key */}
        <div className="p-4 bg-muted rounded-lg mb-6">
          <h4 className="font-semibold text-foreground mb-2 text-sm">Emoji Key</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p><strong>😿</strong> (Sad) = 90+ days unworn - Time to bring this back!</p>
            <p><strong>😸</strong> (Smiling) = 60-89 days - This item is getting lonely</p>
            <p><strong>😻</strong> (Heart eyes) = 30-59 days - Let&apos;s give this some love</p>
          </div>
        </div>

        {/* Threshold Details */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900">
            <strong>Reminders show for items with:</strong>
            <ul className="mt-2 ml-4 space-y-1">
              <li>• last_worn_date set (not null)</li>
              <li>• last_worn_date more than 30 days ago</li>
              <li>• Not dismissed in current session</li>
              <li>• Max 3 shown at a time (oldest first)</li>
            </ul>
          </p>
        </div>

        {/* State Info */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold text-foreground mb-2 text-sm">Current Items State</h4>
          <pre className="text-xs overflow-auto max-h-48 p-2 bg-white rounded border border-stone-200">
            {JSON.stringify(items, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  )
}
