'use client'

import { Plus } from 'lucide-react'

export interface FitFormulaCardProps {
  title: string
  description: string
  colorAdvice?: string
  recommendedSwatches?: [string, string, string]
  extractedColors: [string, string, string]
  sneakerName: string
  projectedCPW: number
  onLogWear: () => void
  isPending?: boolean
}

export function FitFormulaCard({
  title,
  description,
  colorAdvice,
  recommendedSwatches,
  extractedColors,
  projectedCPW,
  onLogWear,
  isPending = false,
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
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{colorAdvice ?? description}</p>
          {recommendedSwatches && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400 shrink-0">Wear</span>
              <div className="flex gap-1.5">
                {recommendedSwatches.map((hex, i) => (
                  <div
                    key={i}
                    className="h-4 w-4 rounded-full border border-white shadow-sm ring-1 ring-gray-200/60"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <hr className="border-gray-200/50" />

        <div className="flex items-end justify-between">
          <div className="text-left">
            <span className="block text-xs font-medium uppercase tracking-wider text-gray-500">
              Worth It Metric
            </span>
            <span className="block text-sm text-gray-600 mt-1">Wearing this drops CPW to</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xl font-bold tracking-tight text-emerald-600">
              ${projectedCPW.toFixed(2)}
            </span>
            <button
              type="button"
              disabled={isPending}
              className="flex items-center gap-1 font-mono uppercase text-[10px] tracking-widest text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={(e) => {
                e.stopPropagation()
                onLogWear()
              }}
            >
              <Plus className="h-3 w-3" />
              {isPending ? 'Logging...' : 'Log Wear'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
