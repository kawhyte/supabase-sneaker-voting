'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

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
 * Users drag a selection box to isolate the item from background
 * Stores normalized crop coordinates (0-1 range)
 */
export function ManualCropTool({ imageUrl, onCropComplete, onCancel, itemName }: ManualCropToolProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 0.1,
    y: 0.1,
    width: 0.8,
    height: 0.8,
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragHandle, setDragHandle] = useState<'move' | 'nw' | 'ne' | 'sw' | 'se' | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

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
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragHandle) return

    const { width, height } = getContainerDimensions()
    const deltaX = (e.clientX - dragStart.x) / width
    const deltaY = (e.clientY - dragStart.y) / height

    const newCropArea = { ...cropArea }

    if (dragHandle === 'move') {
      // Move entire crop area
      const newX = Math.max(0, Math.min(1 - cropArea.width, cropArea.x + deltaX))
      const newY = Math.max(0, Math.min(1 - cropArea.height, cropArea.y + deltaY))
      newCropArea.x = newX
      newCropArea.y = newY
    } else if (dragHandle === 'nw') {
      // Resize from top-left
      const newX = Math.max(0, cropArea.x + deltaX)
      const newY = Math.max(0, cropArea.y + deltaY)
      const newWidth = Math.max(0.1, cropArea.width - deltaX)
      const newHeight = Math.max(0.1, cropArea.height - deltaY)

      if (newX + newWidth <= 1 && newY + newHeight <= 1) {
        newCropArea.x = newX
        newCropArea.y = newY
        newCropArea.width = newWidth
        newCropArea.height = newHeight
      }
    } else if (dragHandle === 'se') {
      // Resize from bottom-right
      const newWidth = Math.max(0.1, Math.min(1 - cropArea.x, cropArea.width + deltaX))
      const newHeight = Math.max(0.1, Math.min(1 - cropArea.y, cropArea.height + deltaY))

      newCropArea.width = newWidth
      newCropArea.height = newHeight
    } else if (dragHandle === 'ne') {
      // Resize from top-right
      const newY = Math.max(0, cropArea.y + deltaY)
      const newWidth = Math.max(0.1, Math.min(1 - cropArea.x, cropArea.width + deltaX))
      const newHeight = Math.max(0.1, cropArea.height - deltaY)

      if (newY + newHeight <= 1) {
        newCropArea.y = newY
        newCropArea.width = newWidth
        newCropArea.height = newHeight
      }
    } else if (dragHandle === 'sw') {
      // Resize from bottom-left
      const newX = Math.max(0, cropArea.x + deltaX)
      const newWidth = Math.max(0.1, cropArea.width - deltaX)
      const newHeight = Math.max(0.1, Math.min(1 - cropArea.y, cropArea.height + deltaY))

      if (newX + newWidth <= 1) {
        newCropArea.x = newX
        newCropArea.width = newWidth
        newCropArea.height = newHeight
      }
    }

    setCropArea(newCropArea)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
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

        {/* Dark Overlay for non-selected areas */}
        <div
          className="absolute bg-black/40 pointer-events-none"
          style={{
            top: 0,
            left: 0,
            right: 0,
            height: `${cropArea.y * 100}%`,
          }}
        />
        <div
          className="absolute bg-black/40 pointer-events-none"
          style={{
            top: `${(cropArea.y + cropArea.height) * 100}%`,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <div
          className="absolute bg-black/40 pointer-events-none"
          style={{
            top: `${cropArea.y * 100}%`,
            left: 0,
            width: `${cropArea.x * 100}%`,
            height: `${cropArea.height * 100}%`,
          }}
        />
        <div
          className="absolute bg-black/40 pointer-events-none"
          style={{
            top: `${cropArea.y * 100}%`,
            right: 0,
            width: `${(1 - cropArea.x - cropArea.width) * 100}%`,
            height: `${cropArea.height * 100}%`,
          }}
        />

        {/* Crop Selection Box */}
        <div
          className="absolute border-2 border-white cursor-move transition-shadow hover:shadow-lg"
          onMouseDown={e => handleMouseDown(e, 'move')}
          style={{
            left: `${cropArea.x * 100}%`,
            top: `${cropArea.y * 100}%`,
            width: `${cropArea.width * 100}%`,
            height: `${cropArea.height * 100}%`,
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

      {/* Preview */}
      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
        <p className="text-xs text-slate-600 mb-2">Preview</p>
        <div className="relative bg-white rounded border border-slate-300" style={{ aspectRatio: '1', width: '100%', maxWidth: '150px' }}>
          <Image
            src={imageUrl}
            alt="Crop preview"
            fill
            className="object-cover rounded"
            style={{
              objectPosition: `${cropArea.x * 100}% ${cropArea.y * 100}%`,
              width: `${100 / cropArea.width}%`,
              height: `${100 / cropArea.height}%`,
              transform: `translate(-${(cropArea.x / cropArea.width) * 100}%, -${(cropArea.y / cropArea.height) * 100}%)`,
            }}
            sizes="150px"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel} size="sm">
          Cancel
        </Button>
        <Button
          onClick={() => onCropComplete(cropArea)}
          size="sm"
        >
          Apply Crop
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
