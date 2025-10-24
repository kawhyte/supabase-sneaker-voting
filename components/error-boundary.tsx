'use client'

import React, { ReactNode, ErrorInfo } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  level?: 'page' | 'section' | 'component'
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * ErrorBoundary - Catches React component errors and displays graceful fallback UI
 *
 * Usage:
 * <ErrorBoundary level="section">
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Send to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }

    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback, showDetails = false, level = 'component' } = this.props

    if (hasError) {
      // Custom fallback provided
      if (fallback) {
        return fallback
      }

      // Page-level error (show header + main content area)
      if (level === 'page') {
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <PageErrorFallback
                error={error}
                errorInfo={errorInfo}
                showDetails={showDetails}
                onReset={this.handleReset}
              />
            </div>
          </div>
        )
      }

      // Section-level error (show card in context)
      if (level === 'section') {
        return (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-red-800">
                We encountered an error loading this section. Please try again.
              </p>
              {showDetails && error && (
                <div className="bg-red-100 rounded p-3 font-mono text-xs text-red-900 overflow-auto max-h-32">
                  {error.message}
                </div>
              )}
              <Button
                onClick={this.handleReset}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )
      }

      // Component-level error (minimal, inline)
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-red-900">
                Failed to load component
              </p>
              {showDetails && error && (
                <p className="text-xs text-red-800 mt-1 font-mono truncate">
                  {error.message}
                </p>
              )}
              <button
                onClick={this.handleReset}
                className="text-xs text-red-700 hover:text-red-900 underline mt-1"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )
    }

    return children
  }
}

interface PageErrorFallbackProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  showDetails: boolean
  onReset: () => void
}

/**
 * PageErrorFallback - Full page error UI
 */
function PageErrorFallback({
  error,
  errorInfo,
  showDetails,
  onReset,
}: PageErrorFallbackProps) {
  return (
    <div className="space-y-6 text-center">
      {/* Error Icon */}
      <div className="flex justify-center">
        <div className="rounded-full bg-red-100 p-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
      </div>

      {/* Error Message */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          Oops! Something went wrong
        </h1>
        <p className="text-muted-foreground">
          We're sorry for the inconvenience. Our team has been notified.
        </p>
      </div>

      {/* Error Details (dev only) */}
      {showDetails && error && (
        <div className="bg-slate-100 rounded-lg p-4 text-left space-y-2">
          <p className="text-xs font-semibold text-slate-900">Error Details:</p>
          <div className="bg-slate-50 rounded p-3 font-mono text-xs text-slate-700 overflow-auto max-h-48">
            <p className="font-bold text-red-600">{error.name}</p>
            <p>{error.message}</p>
            {errorInfo?.componentStack && (
              <>
                <p className="mt-3 font-bold">Component Stack:</p>
                <p className="text-slate-600">{errorInfo.componentStack}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-center pt-4">
        <Button
          onClick={onReset}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </Link>
      </div>

      {/* Error ID (for support) */}
      <p className="text-xs text-muted-foreground pt-4">
        Error ID: {generateErrorId(error)}
      </p>
    </div>
  )
}

/**
 * Generate unique error ID for support reference
 */
function generateErrorId(error: Error | null): string {
  if (!error) return 'UNKNOWN'
  const timestamp = Date.now().toString(36)
  const hash = Math.abs(error.message.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a // Convert to 32bit integer
  }, 0)).toString(36).slice(0, 4)
  return `${timestamp}-${hash}`.toUpperCase()
}
