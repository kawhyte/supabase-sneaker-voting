'use client'

import { Bell } from 'lucide-react'

export function NotificationEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Bell className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        All caught up!
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        You're all set. We'll notify you when there's something new.
      </p>
    </div>
  )
}
