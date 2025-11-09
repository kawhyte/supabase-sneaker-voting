/**
 * TimeRange type for wardrobe statistics queries
 * Defines the time period for filtering data in charts
 */
export type TimeRange = '6mo' | '12mo' | 'all'

/**
 * Human-readable labels for time ranges
 */
export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '6mo': 'Last 6 Months',
  '12mo': 'Last 12 Months',
  all: 'All Time',
}

/**
 * Type guard to validate TimeRange values
 */
export function isValidTimeRange(value: unknown): value is TimeRange {
  return value === '6mo' || value === '12mo' || value === 'all'
}

/**
 * Get default time range
 */
export const DEFAULT_TIME_RANGE: TimeRange = '12mo'
