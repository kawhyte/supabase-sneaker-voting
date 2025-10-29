'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { OutfitItem } from '@/components/types/outfit'
import { perfMonitor } from '@/lib/performance-monitor'

export interface UseDragManagerOptions {
  containerRef: React.RefObject<HTMLElement>
  items: OutfitItem[]
  canvasWidth: number
  canvasHeight: number
  onDragEnd: (itemId: string, x: number, y: number) => void
}

export interface UseDragManagerReturn {
  isDraggingItemId: string | null
  onMouseDown: (itemId: string, e: React.MouseEvent) => void
}

/**
 * useDragManager - Custom hook for performant drag interactions
 *
 * Key optimization: Updates DOM directly during drag (no state updates)
 * Only commits to state on mouseUp for minimal re-renders
 *
 * Success Criteria:
 * - Drag lag <30ms (maintained 60fps)
 * - Only dragged item element updated during drag
 * - No parent re-renders until mouseUp
 * - Automatic cleanup of event listeners
 */
export function useDragManager({
  containerRef,
  items,
  canvasWidth,
  canvasHeight,
  onDragEnd,
}: UseDragManagerOptions): UseDragManagerReturn {
  // State: only track which item is being dragged (for visual feedback)
  const [isDraggingItemId, setIsDraggingItemId] = useState<string | null>(null)

  // Refs: track drag state without triggering re-renders
  const draggingItemIdRef = useRef<string | null>(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const dragPositionRef = useRef({ x: 0, y: 0 })
  const itemElementRef = useRef<HTMLElement | null>(null)

  /**
   * Handle mouse down - initialize drag
   * Stores item position and mouse offset for drag calculations
   */
  const handleMouseDown = useCallback(
    (itemId: string, e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const container = containerRef.current
      if (!container) return

      // Find the item in our items array
      const item = items.find(i => i.id === itemId)
      if (!item) return

      // Find the DOM element
      const itemElement = container.querySelector(
        `[data-item-id="${itemId}"]`
      ) as HTMLElement | null
      if (!itemElement) return

      // Calculate offsets
      const rect = container.getBoundingClientRect()
      const itemX = item.position_x * canvasWidth
      const itemY = item.position_y * canvasHeight
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Store in refs
      draggingItemIdRef.current = itemId
      itemElementRef.current = itemElement
      dragPositionRef.current = { x: item.position_x, y: item.position_y }
      dragOffsetRef.current = {
        x: mouseX - itemX,
        y: mouseY - itemY,
      }

      // Update state (for visual feedback - cursor, scale, etc.)
      setIsDraggingItemId(itemId)

      // Start performance measurement
      perfMonitor.start('canvas-drag')
    },
    [items, canvasWidth, canvasHeight]
  )

  /**
   * Main drag logic - attached to document (not container)
   * Updates DOM directly, NO state updates during drag
   */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const itemId = draggingItemIdRef.current
      if (!itemId || !containerRef.current || !itemElementRef.current) return

      // Calculate new position
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - dragOffsetRef.current.x
      const y = e.clientY - rect.top - dragOffsetRef.current.y

      // Normalize to 0-1 range
      let normalizedX = x / canvasWidth
      let normalizedY = y / canvasHeight

      // Clamp to bounds (0-1)
      normalizedX = Math.max(0, Math.min(1, normalizedX))
      normalizedY = Math.max(0, Math.min(1, normalizedY))

      // Store in ref (no state update!)
      dragPositionRef.current = { x: normalizedX, y: normalizedY }

      // Update visual position directly via CSS (no React re-render!)
      // Using transform for GPU acceleration instead of left/top
      const percentX = normalizedX * 100
      const percentY = normalizedY * 100
      itemElementRef.current.style.left = `${percentX}%`
      itemElementRef.current.style.top = `${percentY}%`
    }

    const handleMouseUp = () => {
      const itemId = draggingItemIdRef.current
      if (!itemId) return

      // End performance measurement
      const dragDuration = perfMonitor.end('canvas-drag')

      // Call parent callback with final position (only once!)
      const { x, y } = dragPositionRef.current
      onDragEnd(itemId, x, y)

      // Cleanup refs
      draggingItemIdRef.current = null
      itemElementRef.current = null
      setIsDraggingItemId(null)

      if (process.env.NODE_ENV === 'development') {
        console.debug(`[Drag] Item: ${itemId}, Duration: ${dragDuration.toFixed(2)}ms`)
      }
    }

    // Attach listeners to document (not container)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [canvasWidth, canvasHeight, onDragEnd])

  return {
    isDraggingItemId,
    onMouseDown: handleMouseDown,
  }
}
