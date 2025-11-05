'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  message: string
  actionLabel?: string
  actionLink?: string
  icon?: ReactNode
}

export function EmptyState({ title, message, actionLabel, actionLink, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 text-6xl">{icon || '📦'}</div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
      {actionLabel && actionLink && (
        <Button asChild>
          <Link href={actionLink}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  )
}
