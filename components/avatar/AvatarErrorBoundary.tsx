// components/avatar/AvatarErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class AvatarErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Avatar Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center gap-4 p-6 border border-red-200 rounded-lg bg-red-50">
          <AlertCircle className="h-8 w-8 text-red-600" />
          <div className="text-center">
            <p className="font-semibold text-red-900">
              Avatar Error
            </p>
            <p className="text-sm text-red-700">
              Unable to load avatar. Please try refreshing the page.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
