'use client'

import { useState, useRef, useTransition } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { perfMonitor } from '@/lib/performance-monitor'

interface CropArea {
  x: number // 0-1 normalized
  y: number // 0-1 normalized
  width: number // 0-1 normalized
  height: number // 0-1 normalized
}

interface ManualCropToolProps {
  imageUrl: string
  onCropComplete: (cropArea: CropArea) => void
  onCancel: () => void
  itemName: string
}

/**
 * ManualCropTool - Rectangle-based manual crop for outfit item photos
 *
 * Performance Optimization:
 * - Uses React 18's useTransition() for automatic priority batching
 * - Local state for immediate visual feedback during drag
 * - Deferred parent state update (non-blocking)
 * - No manual debouncing needed
 *
 * Success Criteria:
 * - Crop tool feels responsive (no lag during drag)
 * - Visual preview updates immediately
 * - Final crop saved correctly
 * - Parent component doesn't block UI during update
 */
export function ManualCropTool({ imageUrl, onCropComplete, onCancel, itemName }: ManualCropToolProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cropMeasurementRef = useRef<number | null>(null)

  const [cropArea, setCropArea] = useState<CropArea>({
    x: 0.1,
    y: 0.1,
    width: 0.8,
    height: 0.8,
  })

  // Local preview state for immediate visual feedback (urgent updates)
  const [previewCropArea, setPreviewCropArea] = useState<CropArea>(cropArea)

  const [isDragging, setIsDragging] = useState(false)
  const [dragHandle, setDragHandle] = useState<'move' | 'nw' | 'ne' | 'sw' | 'se' | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // useTransition for automatic priority batching of parent updates
  const [isPending, startTransition] = useTransition()

  const getContainerDimensions = () => {
    if (!containerRef.current) return { width: 400, height: 400 }
    return {
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    }
  }

  const handleMouseDown = (e: React.MouseEvent, handle: 'move' | 'nw' | 'ne' | 'sw' | 'se') => {
    setIsDragging(true)
    setDragHandle(handle)
    setDragStart({ x: e.clientX, y: e.clientY })
    cropMeasurementRef.current = perfMonitor.start('crop-tool-drag')
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragHandle) return

    const { width, height } = getContainerDimensions()
    const deltaX = (e.clientX - dragStart.x) / width
    const deltaY = (e.clientY - dragStart.y) / height

    const newCropArea = { ...previewCropArea }

    if (dragHandle === 'move') {
      // Move entire crop area
      const newX = Math.max(0, Math.min(1 - previewCropArea.width, previewCropArea.x + deltaX))
      const newY = Math.max(0, Math.min(1 - previewCropArea.height, previewCropArea.y + deltaY))
      newCropArea.x = newX
      newCropArea.y = newY
    } else if (dragHandle === 'nw') {
      // Resize from top-left
      const newX = Math.max(0, previewCropArea.x + deltaX)
      const newY = Math.max(0, previewCropArea.y + deltaY)
      const newWidth = Math.max(0.1, previewCropArea.width - deltaX)
      const newHeight = Math.max(0.1, previewCropArea.height - deltaY)

      if (newX + newWidth <= 1 && newY + newHeight <= 1) {
        newCropArea.x = newX
        newCropArea.y = newY
        newCropArea.width = newWidth
        newCropArea.height = newHeight
      }
    } else if (dragHandle === 'se') {
      // Resize from bottom-right
      const newWidth = Math.max(0.1, Math.min(1 - previewCropArea.x, previewCropArea.width + deltaX))
      const newHeight = Math.max(0.1, Math.min(1 - previewCropArea.y, previewCropArea.height + deltaY))

      newCropArea.width = newWidth
      newCropArea.height = newHeight
    } else if (dragHandle === 'ne') {
      // Resize from top-right
      const newY = Math.max(0, previewCropArea.y + deltaY)
      const newWidth = Math.max(0.1, Math.min(1 - previewCropArea.x, previewCropArea.width + deltaX))
      const newHeight = Math.max(0.1, previewCropArea.height - deltaY)

      if (newY + newHeight <= 1) {
        newCropArea.y = newY
        newCropArea.width = newWidth
        newCropArea.height = newHeight
      }
    } else if (dragHandle === 'sw') {
      // Resize from bottom-left
      const newX = Math.max(0, previewCropArea.x + deltaX)
      const newWidth = Math.max(0.1, previewCropArea.width - deltaX)
      const newHeight = Math.max(0.1, Math.min(1 - previewCropArea.y, previewCropArea.height + deltaY))

      if (newX + newWidth <= 1) {
        newCropArea.x = newX
        newCropArea.width = newWidth
        newCropArea.height = newHeight
      }
    }

    // Update preview immediately (urgent, high priority)
    setPreviewCropArea(newCropArea)

    // Schedule parent state update with useTransition (non-blocking, low priority)
    startTransition(() => {
      setCropArea(newCropArea)
    })

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    if (cropMeasurementRef.current !== null) {
      const dragDuration = perfMonitor.end('crop-tool-drag', cropMeasurementRef.current)
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[Crop] Duration: ${dragDuration.toFixed(2)}ms`)
      }
      cropMeasurementRef.current = null
    }

    setIsDragging(false)
    setDragHandle(null)
  }

  const { width, height } = getContainerDimensions()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-2">Crop {itemName}</h3>
        <p className="text-xs text-slate-600 mb-4">Drag to move, resize from corners</p>
      </div>

      {/* Crop Canvas */}
      <div
        ref={containerRef}
        className="relative bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-300"
        style={{ width: '100%', maxWidth: '400px', aspectRatio: '1' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Image */}
        <Image
          src={imageUrl}
          alt={itemName}
          fill
          className="object-contain"
          sizes="400px"
        />

        {/* Dark Overlay for non-selected areas - uses preview for immediate visual feedback */}
        <div
          className="absolute bg-black/40 pointer-events-none"
          style={{
            top: 0,
            left: 0,
            right: 0,
            height: `${previewCropArea.y * 100}%`,
          }}
        />
        <div
          className="absolute bg-black/40 pointer-events-none"
          style={{
            top: `${(previewCropArea.y + previewCropArea.height) * 100}%`,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <div
          className="absolute bg-black/40 pointer-events-none"
          style={{
            top: `${previewCropArea.y * 100}%`,
            left: 0,
            width: `${previewCropArea.x * 100}%`,
            height: `${previewCropArea.height * 100}%`,
          }}
        />
        <div
          className="absolute bg-black/40 pointer-events-none"
          style={{
            top: `${previewCropArea.y * 100}%`,
            right: 0,
            width: `${(1 - previewCropArea.x - previewCropArea.width) * 100}%`,
            height: `${previewCropArea.height * 100}%`,
          }}
        />

        {/* Crop Selection Box - uses preview for immediate feedback */}
        <div
          className="absolute border-2 border-white cursor-move transition-shadow hover:shadow-lg"
          onMouseDown={e => handleMouseDown(e, 'move')}
          style={{
            left: `${previewCropArea.x * 100}%`,
            top: `${previewCropArea.y * 100}%`,
            width: `${previewCropArea.width * 100}%`,
            height: `${previewCropArea.height * 100}%`,
            boxShadow: isDragging ? '0 0 0 1px rgba(255,255,255,0.5)' : 'none',
          }}
        >
          {/* Corner/Edge Handles */}
          <Handle
            position="nw"
            onMouseDown={e => handleMouseDown(e, 'nw')}
            isDragging={isDragging && dragHandle === 'nw'}
          />
          <Handle
            position="ne"
            onMouseDown={e => handleMouseDown(e, 'ne')}
            isDragging={isDragging && dragHandle === 'ne'}
          />
          <Handle
            position="sw"
            onMouseDown={e => handleMouseDown(e, 'sw')}
            isDragging={isDragging && dragHandle === 'sw'}
          />
          <Handle
            position="se"
            onMouseDown={e => handleMouseDown(e, 'se')}
            isDragging={isDragging && dragHandle === 'se'}
          />
        </div>
      </div>

      {/* Preview - uses preview state for immediate feedback */}
      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
        <p className="text-xs text-slate-600 mb-2">Preview</p>
        <div className="relative bg-white rounded border border-slate-300" style={{ aspectRatio: '1', width: '100%', maxWidth: '150px' }}>
          <Image
            src={imageUrl}
            alt="Crop preview"
            fill
            className="object-cover rounded"
            style={{
              objectPosition: `${previewCropArea.x * 100}% ${previewCropArea.y * 100}%`,
              width: `${100 / previewCropArea.width}%`,
              height: `${100 / previewCropArea.height}%`,
              transform: `translate(-${(previewCropArea.x / previewCropArea.width) * 100}%, -${(previewCropArea.y / previewCropArea.height) * 100}%)`,
            }}
            sizes="150px"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="dense flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel} size="sm">
          Cancel
        </Button>
        <Button
          onClick={() => onCropComplete(previewCropArea)}
          size="sm"
          disabled={isPending}
        >
          {isPending ? 'Applying...' : 'Apply Crop'}
        </Button>
      </div>
    </div>
  )
}

interface HandleProps {
  position: 'nw' | 'ne' | 'sw' | 'se'
  onMouseDown: (e: React.MouseEvent) => void
  isDragging: boolean
}

/**
 * Resize handle corner/edge
 */
function Handle({ position, onMouseDown, isDragging }: HandleProps) {
  const cursorMap = {
    nw: 'nw-resize',
    ne: 'ne-resize',
    sw: 'sw-resize',
    se: 'se-resize',
  }

  const positionMap = {
    nw: { top: '-6px', left: '-6px' },
    ne: { top: '-6px', right: '-6px' },
    sw: { bottom: '-6px', left: '-6px' },
    se: { bottom: '-6px', right: '-6px' },
  }

  return (
    <div
      onMouseDown={onMouseDown}
      className={`absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full transition-all ${
        isDragging ? 'scale-125 shadow-lg' : 'hover:scale-110'
      }`}
      style={{
        ...positionMap[position],
        cursor: cursorMap[position],
      }}
    />
  )
}
