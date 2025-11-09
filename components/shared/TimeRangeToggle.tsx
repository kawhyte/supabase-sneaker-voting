import { Button } from '@/components/ui/button'
import { TimeRange, TIME_RANGE_LABELS } from '@/types/TimeRange'
import { cn } from '@/lib/utils'

interface TimeRangeToggleProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
  disabled?: boolean
  isLoading?: boolean
}

/**
 * Accessible time range selector for charts
 * Displays 3 buttons: 6mo, 12mo, All
 * Active state shows which range is selected
 */
export function TimeRangeToggle({
  value,
  onChange,
  disabled = false,
  isLoading = false,
}: TimeRangeToggleProps) {
  const ranges: TimeRange[] = ['6mo', '12mo', 'all']

  return (
    <div
      className="flex gap-2 items-center"
      role="group"
      aria-label="Time range selector"
    >
      <span className="text-sm text-muted-foreground">Show:</span>
      <div className="flex gap-1">
        {ranges.map((range) => (
          <Button
            key={range}
            variant={value === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(range)}
            disabled={disabled || isLoading}
            aria-pressed={value === range}
            aria-label={`Show ${TIME_RANGE_LABELS[range]}`}
            className={cn(
              'h-8 px-3 text-xs font-medium',
              value === range && 'bg-primary text-primary-foreground'
            )}
          >
            {range === '6mo' ? '6M' : range === '12mo' ? '12M' : 'All'}
          </Button>
        ))}
      </div>
      {isLoading && (
        <span className="text-xs text-muted-foreground">Loading...</span>
      )}
    </div>
  )
}

export default TimeRangeToggle
