'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Sparkles, ShoppingBag, Heart, Link2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function FTUEChecklist() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check localStorage for dismissal state
    const hasDismissed = localStorage.getItem('hasDismissedFTUE')

    if (!hasDismissed || hasDismissed === 'false') {
      setIsVisible(true)
    }

    setIsLoaded(true)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('hasDismissedFTUE', 'true')
    setIsVisible(false)
  }

  // Don't render anything until we've checked localStorage
  if (!isLoaded) {
    return null
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className="mb-6 border-2"
            style={{
              borderColor: 'var(--color-primary-300)',
              backgroundColor: 'var(--color-primary-50)',
            }}
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--color-primary-100)' }}
                >
                  <Sparkles
                    className="h-5 w-5"
                    style={{ color: 'var(--color-primary-600)' }}
                  />
                </div>
                <div>
                  <CardTitle
                    className="text-xl font-bold"
                    style={{ color: 'var(--color-black)' }}
                  >
                    Getting Started
                  </CardTitle>
                  <CardDescription
                    className="text-sm mt-1"
                    style={{ color: 'var(--color-gray-600)' }}
                  >
                    Welcome! Here are some things you can try to get the most out of your wardrobe tracker
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0 hover:bg-white/50"
                aria-label="Dismiss getting started guide"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {/* Checklist Item 1 */}
                <div
                  className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-white/50"
                  style={{ backgroundColor: 'var(--color-white)' }}
                >
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center mt-0.5"
                    style={{
                      borderColor: 'var(--color-gray-300)',
                      backgroundColor: 'var(--color-white)'
                    }}
                  >
                    {/* Empty checkbox - future: add checkmark when completed */}
                  </div>
                  <div className="flex items-start gap-3 flex-1">
                    <ShoppingBag
                      className="h-5 w-5 mt-0.5 flex-shrink-0"
                      style={{ color: 'var(--color-primary-600)' }}
                    />
                    <div>
                      <p
                        className="font-medium"
                        style={{ color: 'var(--color-black)' }}
                      >
                        Add your first item to your Wardrobe
                      </p>
                      <p
                        className="text-sm mt-0.5"
                        style={{ color: 'var(--color-gray-600)' }}
                      >
                        Click "Add Item" to track shoes, clothing, or accessories
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checklist Item 2 */}
                <div
                  className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-white/50"
                  style={{ backgroundColor: 'var(--color-white)' }}
                >
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center mt-0.5"
                    style={{
                      borderColor: 'var(--color-gray-300)',
                      backgroundColor: 'var(--color-white)'
                    }}
                  >
                    {/* Empty checkbox - future: add checkmark when completed */}
                  </div>
                  <div className="flex items-start gap-3 flex-1">
                    <Heart
                      className="h-5 w-5 mt-0.5 flex-shrink-0"
                      style={{ color: 'var(--color-primary-600)' }}
                    />
                    <div>
                      <p
                        className="font-medium"
                        style={{ color: 'var(--color-black)' }}
                      >
                        Add an item to your Wishlist
                      </p>
                      <p
                        className="text-sm mt-0.5"
                        style={{ color: 'var(--color-gray-600)' }}
                      >
                        Keep track of items you're interested in purchasing
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checklist Item 3 */}
                <div
                  className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-white/50"
                  style={{ backgroundColor: 'var(--color-white)' }}
                >
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center mt-0.5"
                    style={{
                      borderColor: 'var(--color-gray-300)',
                      backgroundColor: 'var(--color-white)'
                    }}
                  >
                    {/* Empty checkbox - future: add checkmark when completed */}
                  </div>
                  <div className="flex items-start gap-3 flex-1">
                    <Link2
                      className="h-5 w-5 mt-0.5 flex-shrink-0"
                      style={{ color: 'var(--color-primary-600)' }}
                    />
                    <div>
                      <p
                        className="font-medium"
                        style={{ color: 'var(--color-black)' }}
                      >
                        Try the URL import
                      </p>
                      <p
                        className="text-sm mt-0.5"
                        style={{ color: 'var(--color-gray-600)' }}
                      >
                        Paste a product URL to auto-fill item details and images
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional: Add a "Get Started" CTA button */}
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-primary-200)' }}>
                <p
                  className="text-xs text-center"
                  style={{ color: 'var(--color-gray-500)' }}
                >
                  You can dismiss this guide anytime by clicking the × button above
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
