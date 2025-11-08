import { LucideIcon } from 'lucide-react'

/**
 * Tab configuration interface
 */
export interface TabConfig {
  value: string
  label: string
  icon?: LucideIcon
  description?: string
  badge?: number | string
  disabled?: boolean
}

/**
 * Format tab value for URL hash
 *
 * Converts tab labels to URL-safe hash values.
 *
 * @example
 * formatTabValue('Purchase Prevention') // 'purchase-prevention'
 * formatTabValue('Profile') // 'profile'
 */
export function formatTabValue(label: string): string {
  return label
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric except hyphens
}

/**
 * Get tab label from value
 *
 * @example
 * getTabLabel('purchase-prevention') // 'Purchase Prevention'
 * getTabLabel('profile') // 'Profile'
 */
export function getTabLabel(value: string): string {
  return value
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Validate tab value
 *
 * Checks if a tab value is valid within allowed tabs.
 */
export function isValidTab(value: string, allowedTabs: string[]): boolean {
  return allowedTabs.includes(value)
}

/**
 * Get next tab in sequence
 *
 * Useful for keyboard navigation (Arrow Right)
 */
export function getNextTab(currentTab: string, tabs: string[]): string {
  const currentIndex = tabs.indexOf(currentTab)
  const nextIndex = (currentIndex + 1) % tabs.length
  return tabs[nextIndex]
}

/**
 * Get previous tab in sequence
 *
 * Useful for keyboard navigation (Arrow Left)
 */
export function getPreviousTab(currentTab: string, tabs: string[]): string {
  const currentIndex = tabs.indexOf(currentTab)
  const previousIndex = (currentIndex - 1 + tabs.length) % tabs.length
  return tabs[previousIndex]
}
