import { cn } from '@/lib/utils'

interface ItemNameDisplayProps {
  brand: string
  model: string
  color?: string
  className?: string
  maxLength?: number
}

/**
 * Displays item name as "Brand Model" with muted brand
 * Truncates to single line with tooltip showing full details
 *
 * Example output: "Nike Air Max 90" with "Nike" in muted color
 * Tooltip on hover: "Nike Air Max 90 - Black"
 */
export function ItemNameDisplay({
  brand,
  model,
  color,
  className = '',
  maxLength = 40,
}: ItemNameDisplayProps) {
  const fullName = `${brand} ${model}`.trim()
  const tooltipText = color ? `${fullName} - ${color}` : fullName

  return (
    <div
      className={cn('flex items-center gap-1 group relative', className)}
      title={tooltipText}
      style={{ minWidth: 0 }}
    >
      <span className="text-muted-foreground text-sm truncate flex-shrink-0">
        {brand}
      </span>
      <span className="text-foreground text-sm font-medium truncate">
        {model}
      </span>

      {/* Fallback tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        {tooltipText}
      </div>
    </div>
  )
}

export default ItemNameDisplay
