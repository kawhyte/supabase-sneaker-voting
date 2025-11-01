// components/avatar/AvatarOption.tsx
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface AvatarOptionProps {
  id: string
  name: string
  isSelected: boolean
  onClick: () => void
}

export function AvatarOption({ id, name, isSelected, onClick }: AvatarOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'dense relative flex flex-col items-center gap-2 p-4 rounded-2xl',
        'border-2 transition-all duration-200',
        'hover:scale-105 hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        isSelected
          ? 'border-primary bg-sun-200/30 shadow-md'
          : 'border-border bg-card hover:border-sun-400/50'
      )}
      aria-label={`Select ${name} avatar`}
      aria-pressed={isSelected}
    >
      {/* Avatar Image */}
      <div className="relative h-24 w-24 rounded-full overflow-hidden ring-2 ring-border">
        <img
          src={`/avatars/${id}.webp`}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Avatar Name */}
      <span className="text-sm font-medium text-foreground">
        {name}
      </span>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-sm">
          <Check className="h-4 w-4 text-slate-900" />
        </div>
      )}
    </button>
  )
}
