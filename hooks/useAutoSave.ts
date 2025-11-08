'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export interface UseAutoSaveOptions<T> {
  /**
   * The data to watch for changes and auto-save
   */
  data: T

  /**
   * Function to call when saving data
   * Should return a promise that resolves on success
   */
  onSave: (data: T, signal: AbortSignal) => Promise<void>

  /**
   * Debounce delay in milliseconds (default: 1000ms)
   * Wait this long after the last change before saving
   */
  delay?: number

  /**
   * Whether auto-save is enabled (default: true)
   * Set to false to disable auto-save temporarily
   */
  enabled?: boolean

  /**
   * Whether to show toast notifications (default: true)
   */
  showToasts?: boolean
}

export interface UseAutoSaveReturn {
  /**
   * Whether a save operation is currently in progress
   */
  isSaving: boolean

  /**
   * Whether there are unsaved changes waiting to be saved
   */
  hasUnsavedChanges: boolean

  /**
   * Manually trigger a save immediately (bypasses debounce)
   */
  saveNow: () => Promise<void>

  /**
   * Last successful save timestamp
   */
  lastSavedAt: Date | null
}

/**
 * Auto-save hook with debouncing and race condition prevention
 *
 * Automatically saves data after user stops making changes for the specified delay.
 * Uses AbortController to cancel previous requests and prevent race conditions.
 *
 * @example
 * ```tsx
 * const { isSaving, hasUnsavedChanges } = useAutoSave({
 *   data: { displayName, email },
 *   onSave: async (data, signal) => {
 *     await supabase.from('profiles').update(data).eq('id', userId)
 *   },
 *   delay: 1000
 * })
 * ```
 */
export function useAutoSave<T>({
  data,
  onSave,
  delay = 1000,
  enabled = true,
  showToasts = true
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  // Track if this is the initial mount (don't save on mount)
  const isInitialMount = useRef(true)

  // Store the debounce timeout
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Store the AbortController for the current save operation
  const abortControllerRef = useRef<AbortController | null>(null)

  // Store previous data to detect changes
  const previousDataRef = useRef<T>(data)

  // Save function that can be called manually or automatically
  const saveNow = async () => {
    if (!enabled || isSaving) return

    // Cancel any previous save request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new AbortController for this request
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setIsSaving(true)
    setHasUnsavedChanges(false)

    try {
      await onSave(data, abortController.signal)

      // Only show success toast if request wasn't aborted
      if (!abortController.signal.aborted) {
        setLastSavedAt(new Date())
        if (showToasts) {
          toast.success('Saved', {
            duration: 2000,
            position: 'bottom-right'
          })
        }
      }
    } catch (error: any) {
      // Don't show error if request was aborted
      if (error?.name === 'AbortError' || abortController.signal.aborted) {
        return
      }

      console.error('Auto-save error:', error)
      setHasUnsavedChanges(true) // Mark as unsaved on error

      if (showToasts) {
        toast.error('Failed to save changes', {
          duration: 3000,
          position: 'bottom-right'
        })
      }
    } finally {
      // Only clear saving state if this request wasn't aborted
      if (!abortController.signal.aborted) {
        setIsSaving(false)
      }
    }
  }

  // Watch for data changes and debounce save
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      previousDataRef.current = data
      return
    }

    // Skip if disabled
    if (!enabled) return

    // Check if data actually changed
    const hasChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current)
    if (!hasChanged) return

    // Update previous data
    previousDataRef.current = data

    // Mark as having unsaved changes
    setHasUnsavedChanges(true)

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout to save after delay
    timeoutRef.current = setTimeout(() => {
      saveNow()
    }, delay)

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, delay, enabled])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    isSaving,
    hasUnsavedChanges,
    saveNow,
    lastSavedAt
  }
}
