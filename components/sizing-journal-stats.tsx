'use client'

import { Card, CardContent } from '@/components/ui/card'
import { SizingJournalEntry } from './types/sizing-journal-entry'

interface SizingJournalStatsProps {
  journalEntries: SizingJournalEntry[]
}

export function SizingJournalStats({ journalEntries }: SizingJournalStatsProps) {
  const totalEntries = journalEntries.length
  const recommended = journalEntries.filter(
    entry => entry.would_recommend && entry.has_been_tried
  ).length
  const spotted = journalEntries.filter(
    entry => !entry.has_been_tried
  ).length

  const stats = [
    {
      value: totalEntries,
      label: 'Total Entries',
      color: 'var(--color-primary-500)'
    },
    {
      value: recommended,
      label: 'Recommended',
      color: 'var(--color-accent-blue-500)'
    },
    {
      value: spotted,
      label: 'Spotted',
      color: 'var(--color-accent-purple-500)'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-xl mb-xl my-12">
      {stats.map((stat, index) => (
        <Card key={index} className="hover-lift">
          <CardContent className="p-md text-center">
            <div
              className="text-3xl font-bold mb-xxs"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
            <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              {stat.label}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
