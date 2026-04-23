export interface LevelProgress {
  level: number
  tierName: string
  currentPts: number
  nextThreshold: number
  progressPct: number
}

// Exponential growth curve. Anchor points: L5=300, L10=750, L20=2000, L30=4500, L50=10000
export const LEVEL_THRESHOLDS: number[] = [
  0,    // L1
  50,   // L2
  120,  // L3
  200,  // L4
  300,  // L5
  390,  // L6
  480,  // L7
  570,  // L8
  660,  // L9
  750,  // L10
  875,  // L11
  1000, // L12
  1125, // L13
  1250, // L14
  1375, // L15
  1500, // L16
  1625, // L17
  1750, // L18
  1875, // L19
  2000, // L20
  2250, // L21
  2500, // L22
  2750, // L23
  3000, // L24
  3250, // L25
  3500, // L26
  3750, // L27
  4000, // L28
  4250, // L29
  4500, // L30
  4775, // L31
  5050, // L32
  5325, // L33
  5600, // L34
  5875, // L35
  6150, // L36
  6425, // L37
  6700, // L38
  6975, // L39
  7250, // L40
  7525, // L41
  7800, // L42
  8075, // L43
  8350, // L44
  8625, // L45
  8900, // L46
  9175, // L47
  9450, // L48
  9725, // L49
  10000,// L50
]

const TIER_NAMES: Record<number, string> = {
  1: 'Freshman',
  10: 'Rising Star',
  20: 'Certified Sneakerhead',
  30: 'OG',
  40: 'Legend',
  50: 'GOAT',
}

function getTierName(level: number): string {
  if (level >= 50) return TIER_NAMES[50]
  if (level >= 40) return TIER_NAMES[40]
  if (level >= 30) return TIER_NAMES[30]
  if (level >= 20) return TIER_NAMES[20]
  if (level >= 10) return TIER_NAMES[10]
  return TIER_NAMES[1]
}

export function getLevelFromPoints(pts: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (pts >= LEVEL_THRESHOLDS[i]) return i + 1
  }
  return 1
}

export function getPointsProgress(pts: number): LevelProgress {
  const level = getLevelFromPoints(pts)
  const isMaxLevel = level >= LEVEL_THRESHOLDS.length

  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = isMaxLevel
    ? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
    : LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]

  const ptsIntoLevel = pts - currentThreshold
  const ptsNeededForLevel = nextThreshold - currentThreshold
  const progressPct = isMaxLevel
    ? 100
    : Math.min(100, Math.round((ptsIntoLevel / ptsNeededForLevel) * 100))

  return {
    level,
    tierName: getTierName(level),
    currentPts: pts,
    nextThreshold,
    progressPct,
  }
}
