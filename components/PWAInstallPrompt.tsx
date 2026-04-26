'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

const DISMISSED_KEY = 'purrview_pwa_prompt_dismissed'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    const handler = () => setIsVisible(false)
    window.addEventListener('appinstalled', handler)
    return () => window.removeEventListener('appinstalled', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setIsVisible(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setIsVisible(false)
    setDeferredPrompt(null)
  }

  if (!isVisible) return null

  return (
    <div
      role="region"
      aria-label="Install PurrView app"
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg"
    >
      <div className="container mx-auto flex items-center gap-4 px-4 py-4 sm:px-6">
        <Download className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <p className="flex-1 text-sm font-medium text-foreground">
          Add PurrView to your home screen
        </p>
        <Button
          size="sm"
          className="bg-primary text-foreground hover:bg-primary/90 shrink-0"
          onClick={handleInstall}
        >
          Install
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-9 w-9"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
