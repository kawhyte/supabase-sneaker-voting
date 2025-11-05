/**
 * Size measurement systems for wardrobe items.
 *
 * Different regions and categories use different sizing systems:
 * - Shoes: US, EU, UK, JP, KR, CM
 * - Clothing: US, EU, UK, ONE_SIZE
 */

/**
 * Const object for size type values.
 */
export const SizeType = {
  US: 'US',
  EU: 'EU',
  UK: 'UK',
  JP: 'JP',
  KR: 'KR',
  CM: 'CM',
  ONE_SIZE: 'ONE_SIZE',
} as const

/**
 * Type for size measurement system.
 */
export type SizeType = typeof SizeType[keyof typeof SizeType]

/**
 * Size types for footwear (shoes, sneakers, boots).
 */
export const FOOTWEAR_SIZE_TYPES: SizeType[] = [
  SizeType.US,
  SizeType.EU,
  SizeType.UK,
  SizeType.JP,
  SizeType.KR,
  SizeType.CM,
]

/**
 * Size types for clothing (tops, bottoms, outerwear).
 */
export const CLOTHING_SIZE_TYPES: SizeType[] = [
  SizeType.US,
  SizeType.EU,
  SizeType.UK,
  SizeType.ONE_SIZE,
]

/**
 * Get display label for size type.
 */
export function getSizeTypeLabel(sizeType: SizeType): string {
  switch (sizeType) {
    case SizeType.US:
      return 'US'
    case SizeType.EU:
      return 'EU'
    case SizeType.UK:
      return 'UK'
    case SizeType.JP:
      return 'Japan (JP)'
    case SizeType.KR:
      return 'Korea (KR)'
    case SizeType.CM:
      return 'Centimeters (CM)'
    case SizeType.ONE_SIZE:
      return 'One Size'
    default:
      const _exhaustive: never = sizeType
      return _exhaustive
  }
}

/**
 * Type guard to check if a value is a valid SizeType.
 */
export function isSizeType(value: unknown): value is SizeType {
  return Object.values(SizeType).includes(value as SizeType)
}
