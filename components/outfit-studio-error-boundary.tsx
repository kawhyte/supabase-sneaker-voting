'use client'

import React, { ReactNode, ErrorInfo } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface Props {
  children: ReactNode
  onClose?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * OutfitStudioErrorBoundary - Specialized error boundary for Outfit Studio modal
 *
 * Displays errors within the modal dialog instead of breaking the entire layout
 */
export class OutfitStudioErrorBoundary extends React.Component<Props, State> {
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
    console.error('OutfitStudioErrorBoundary caught:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleClose = () => {
    this.props.onClose?.()
    this.handleReset()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Dialog open={true} onOpenChange={this.handleClose}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Outfit Creation Error
              </DialogTitle>
              <DialogDescription>
                Something went wrong while creating your outfit.
              </DialogDescription>
            </DialogHeader>

            {/* Error Details */}
            <div className="space-y-3">
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <p className="text-sm text-red-900 font-medium mb-1">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <details className="text-xs text-red-700 mt-2">
                    <summary className="cursor-pointer font-semibold">
                      Component Stack
                    </summary>
                    <pre className="mt-2 bg-red-100 p-2 rounded overflow-auto max-h-40 text-xs">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>

              {/* Help Text */}
              <p className="text-sm text-muted-foreground">
                Try closing this dialog and trying again. If the problem persists,
                reload the page.
              </p>
            </div>

            {/* Actions */}
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={this.handleClose}
              >
                Close
              </Button>
              <Button
                onClick={this.handleReset}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    }

    return this.props.children
  }
}
