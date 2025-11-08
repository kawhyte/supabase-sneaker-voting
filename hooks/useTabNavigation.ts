'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Hash-based tab navigation hook
 *
 * Syncs active tab state with URL hash for deep linking and browser history.
 *
 * @param defaultTab - The default tab to show if no hash is present
 * @returns Object with activeTab state and setActiveTab function
 *
 * @example
 * ```tsx
 * const { activeTab, setActiveTab } = useTabNavigation('profile')
 *
 * <Tabs value={activeTab} onValueChange={setActiveTab}>
 *   <TabsTrigger value="profile">Profile</TabsTrigger>
 *   <TabsTrigger value="notifications">Notifications</TabsTrigger>
 * </Tabs>
 * ```
 */
export function useTabNavigation(defaultTab: string = 'profile') {
  const pathname = usePathname()

  // Initialize active tab from URL hash or default
  const [activeTab, setActiveTabState] = useState<string>(() => {
    // Only access window on client side
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1) // Remove '#' prefix
      return hash || defaultTab
    }
    return defaultTab
  })

  // Update URL hash when active tab changes
  const setActiveTab = useCallback((tab: string) => {
    setActiveTabState(tab)

    // Update URL hash without triggering page reload
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `${pathname}#${tab}`)
    }
  }, [pathname])

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || defaultTab
      setActiveTabState(hash)
    }

    // Handle popstate (back/forward) events
    window.addEventListener('hashchange', handleHashChange)

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [defaultTab])

  // Sync with hash on mount (for direct URL navigation)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1)
      if (hash && hash !== activeTab) {
        setActiveTabState(hash)
      }
    }
  }, []) // Run once on mount

  return {
    activeTab,
    setActiveTab
  }
}

/**
 * Keyboard shortcuts hook for tab navigation
 *
 * Enables Cmd+1/2/3 shortcuts for quick tab switching.
 *
 * @param tabs - Array of tab values (e.g., ['profile', 'purchase-prevention', 'notifications'])
 * @param setActiveTab - Function to update active tab
 *
 * @example
 * ```tsx
 * const { activeTab, setActiveTab } = useTabNavigation()
 * useTabKeyboardShortcuts(['profile', 'purchase-prevention', 'notifications'], setActiveTab)
 * ```
 */
export function useTabKeyboardShortcuts(
  tabs: string[],
  setActiveTab: (tab: string) => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+1/2/3 (Mac) or Ctrl+1/2/3 (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1

        // Check if index is within tabs array
        if (index < tabs.length) {
          e.preventDefault() // Prevent browser default (e.g., tab switching)
          setActiveTab(tabs[index])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [tabs, setActiveTab])
}
