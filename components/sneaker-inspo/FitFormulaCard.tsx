'use client'

export interface FitFormulaCardProps {
  title: string
  description: string
  colorAdvice?: string
  recommendedSwatches?: [string, string, string]
  extractedColors: [string, string, string]
  sneakerName: string
}

export function FitFormulaCard({
  title,
  description,
  colorAdvice,
  recommendedSwatches,
  extractedColors,
}: FitFormulaCardProps) {
  const ambientBackgroundStyle = {
    backgroundImage: `radial-gradient(circle at 0% 0%, ${extractedColors[0]}40 0%, transparent 50%), radial-gradient(circle at 100% 100%, ${extractedColors[1]}40 0%, transparent 50%), radial-gradient(circle at 50% 50%, ${extractedColors[2]}20 0%, transparent 50%)`,
  }

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-gray-200/60 shadow-sm transition-all hover:shadow-md">
      <div className="absolute inset-0 z-0 bg-white" style={ambientBackgroundStyle} />
      <div className="absolute inset-0 z-0 bg-white/60 backdrop-blur-3xl" />

      <div className="relative z-10 flex flex-col gap-5 p-6">
        <div className="text-left">
          <h3 className="text-[22px] font-semibold tracking-tight text-gray-900">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{colorAdvice ?? description}</p>
        </div>

        {recommendedSwatches && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400 shrink-0">Wear</span>
            <div className="flex gap-2">
              {recommendedSwatches.map((hex, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-xl border border-white shadow-sm ring-1 ring-gray-200/60"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
