/**
 * Item status values.
 *
 * These represent the lifecycle state of a wardrobe item:
 * - owned: Item is in the user's physical possession
 * - wishlisted: Item the user wants to purchase (Want to Buy)
 *
 * Historical note: The "journaled" status was merged into "wishlisted" in Phase 1.
 */

/**
 * Const object for item status values.
 * Use this instead of magic strings to get autocomplete and type safety.
 *
 * @example
 * ```tsx
 * // ✅ Good - Type-safe, autocompletes
 * if (item.status === ItemStatus.OWNED) { ... }
 *
 * // ❌ Bad - Magic string, typo-prone
 * if (item.status === 'owned') { ... }
 * ```
 */
export const ItemStatus = {
  OWNED: 'owned',
  WISHLISTED: 'wishlisted',
} as const

/**
 * Type for item status.
 * This is inferred from the ItemStatus const object.
 */
export type ItemStatus = typeof ItemStatus[keyof typeof ItemStatus]

/**
 * Type guard to check if a value is a valid ItemStatus.
 *
 * @param value - The value to check
 * @returns True if value is 'owned' or 'wishlisted'
 *
 * @example
 * ```tsx
 * const status: string = getUserInput()
 * if (isItemStatus(status)) {
 *   // TypeScript now knows status is 'owned' | 'wishlisted'
 *   updateItem({ status })
 * }
 * ```
 */
export function isItemStatus(value: unknown): value is ItemStatus {
  return value === 'owned' || value === 'wishlisted'
}

/**
 * Get display label for item status.
 *
 * @param status - The item status
 * @returns User-friendly label
 */
export function getItemStatusLabel(status: ItemStatus): string {
  switch (status) {
    case ItemStatus.OWNED:
      return 'Owned'
    case ItemStatus.WISHLISTED:
      return 'Want to Buy'
    default:
      // TypeScript exhaustiveness check - will error if we miss a status
      const _exhaustive: never = status
      return _exhaustive
  }
}
