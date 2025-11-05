'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
// Analytics removed - not configured yet
// TODO: Re-add when Google Analytics 4 is set up
// import analytics from '@/lib/analytics'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class AchievementsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Achievements error:', error, errorInfo)

    // Track error in analytics
    // try {
    //   analytics.trackError(error, {
    //     page: 'achievements',
    //     componentStack: errorInfo.componentStack,
    //   })
    // } catch (e) {
    //   console.error('Failed to track error:', e)
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              We encountered an error while loading your achievements. This has been logged and our team will look into it.
            </p>
            <div className="flex gap-4">
              <Button onClick={this.handleReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
              <Button variant="outline" asChild>
                <a href="/dashboard">Back to Dashboard</a>
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
