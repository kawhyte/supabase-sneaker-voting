'use client'

import React from 'react'
import { Plus, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FitFormulaCardProps {
  title: string
  description: string
  extractedColors: [string, string, string] // [primary, secondary, accent]
  doodleItems: { name: string; icon: React.ElementType; isTinted?: boolean }[]
  sneakerName: string
  projectedCPW: number
}

export function FitFormulaCard({
  title,
  description,
  extractedColors,
  doodleItems,
  sneakerName,
  projectedCPW,
}: FitFormulaCardProps) {
  const ambientBackgroundStyle = {
    backgroundImage: `radial-gradient(circle at 0% 0%, ${extractedColors[0]}40 0%, transparent 50%), radial-gradient(circle at 100% 100%, ${extractedColors[1]}40 0%, transparent 50%), radial-gradient(circle at 50% 50%, ${extractedColors[2]}20 0%, transparent 50%)`,
  }

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-gray-200/60 shadow-sm transition-all hover:shadow-md">
      <div className="absolute inset-0 z-0 bg-white" style={ambientBackgroundStyle} />
      <div className="absolute inset-0 z-0 bg-white/60 backdrop-blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 p-6">
        <div className="text-left">
          <h3 className="text-[22px] font-semibold tracking-tight text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>

        <div className="flex items-center justify-center gap-3 rounded-2xl bg-white/40 border border-white/60 py-5 px-2">
          {doodleItems.map((item, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm',
                    !item.isTinted && 'text-gray-800'
                  )}
                  style={item.isTinted ? { color: extractedColors[0] } : undefined}
                >
                  <item.icon strokeWidth={1.5} className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-gray-600">{item.name}</span>
              </div>
              <Plus className="h-4 w-4 text-gray-300 shrink-0" strokeWidth={2} />
            </React.Fragment>
          ))}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
              <div
                className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundImage: `linear-gradient(135deg, ${extractedColors[0]}, ${extractedColors[1]})` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-900 text-center leading-tight max-w-[56px] truncate">
              {sneakerName}
            </span>
          </div>
        </div>

        <hr className="border-gray-200/50" />

        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div className="text-left">
              <span className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                Worth It Metric
              </span>
              <span className="block text-sm text-gray-600 mt-1">Wearing this drops CPW to</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold tracking-tight text-emerald-600">
                ${projectedCPW.toFixed(2)}
              </span>
            </div>
          </div>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3.5 text-sm font-medium text-white transition-transform active:scale-[0.98]"
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Wear Logic
            }}
          >
            <CheckCircle2 className="h-4 w-4" />
            Log Wear with this Fit
          </button>
        </div>
      </div>
    </div>
  )
}
