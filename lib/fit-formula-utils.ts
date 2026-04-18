type FormulaId = 'monochromatic' | 'high-contrast' | 'anchor'

export interface FormulaAdvice {
  advice: string
  swatches: [string, string, string]
}

function hexToHsl(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) return [0, 0, Math.round(l * 100)]

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let hue: number
  if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) hue = ((b - r) / d + 2) / 6
  else hue = ((r - g) / d + 4) / 6

  return [Math.round(hue * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h: number, s: number, l: number): string {
  const hNorm = (((h % 360) + 360) % 360) / 360
  const sNorm = Math.max(0, Math.min(100, s)) / 100
  const lNorm = Math.max(0, Math.min(100, l)) / 100

  if (sNorm === 0) {
    const v = Math.round(lNorm * 255).toString(16).padStart(2, '0')
    return `#${v}${v}${v}`
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm
  const p = 2 * lNorm - q
  const r = hue2rgb(p, q, hNorm + 1 / 3)
  const g = hue2rgb(p, q, hNorm)
  const bl = hue2rgb(p, q, hNorm - 1 / 3)

  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`
}

function getHueLabel(h: number, s: number, l: number): string {
  if (s < 15) {
    if (l > 80) return 'white'
    if (l > 50) return 'grey'
    if (l > 25) return 'charcoal'
    return 'black'
  }
  if (h < 15 || h >= 345) return 'red'
  if (h < 45) return 'amber'
  if (h < 75) return 'gold'
  if (h < 105) return 'olive'
  if (h < 150) return 'green'
  if (h < 195) return 'teal'
  if (h < 240) return 'blue'
  if (h < 280) return 'indigo'
  if (h < 315) return 'purple'
  return 'rose'
}

const TONAL_GARMENTS: Record<string, string> = {
  white:    'ecru trousers and an off-white crewneck',
  grey:     'light grey denim and a heather fleece',
  charcoal: 'dark grey denim and a charcoal hoodie',
  black:    'black denim and a black tee',
  red:      'oxblood trousers and a muted crimson zip-up',
  amber:    'rust chinos and a terracotta long-sleeve',
  gold:     'mustard trousers and a butter crewneck',
  olive:    'olive cargos and a sage quarter-zip',
  green:    'forest denim and a moss ribbed knit',
  teal:     'petrol chinos and a slate henley',
  blue:     'indigo denim and a navy crewneck',
  indigo:   'deep-navy trousers and a cobalt tee',
  purple:   'plum chinos and a mauve henley',
  rose:     'dusty-rose trousers and a blush overshirt',
}

function buildMonochromaticAdvice(colors: [string, string, string]): FormulaAdvice {
  const [h, s, l] = hexToHsl(colors[0])
  const label = getHueLabel(h, s, l)
  const garments = TONAL_GARMENTS[label] ?? 'tonal layers in the same hue family'

  const lighter = hslToHex(h, Math.max(s - 10, 5), Math.min(l + 20, 90))
  const darker = hslToHex(h, Math.min(s + 10, 90), Math.max(l - 20, 10))

  return {
    advice: `Stay in the ${label} family — ${garments} let texture carry the look, not contrast.`,
    swatches: [lighter, colors[0], darker],
  }
}

function buildHighContrastAdvice(colors: [string, string, string]): FormulaAdvice {
  const [h, s, l] = hexToHsl(colors[0])
  const compH = (h + 180) % 360
  const compS = Math.max(Math.min(s, 70), 40)
  const compL = Math.max(Math.min(l, 65), 35)
  const complementHex = hslToHex(compH, compS, compL)
  const compLabel = getHueLabel(compH, compS, compL)

  return {
    advice: `Set the sneaker's ${getHueLabel(h, s, l)} against its complement — a ${compLabel} piece up top creates immediate visual tension.`,
    swatches: [colors[0], complementHex, '#1C1C1E'],
  }
}

function buildAnchorAdvice(colors: [string, string, string]): FormulaAdvice {
  const [h, s] = hexToHsl(colors[0])
  // Warm-neutral off-white, barely tinted toward the shoe's hue
  const warmNeutral = hslToHex(h, Math.min(s * 0.08, 6), 93)

  return {
    advice: `Dress in white, cream, or light grey — every other piece steps back so the sneaker owns the frame.`,
    swatches: ['#FFFFFF', warmNeutral, '#EBEBEB'],
  }
}

export function buildFormulaAdvice(
  formulaId: FormulaId,
  colors: [string, string, string]
): FormulaAdvice {
  const safeColors = colors.map(c =>
    /^#[0-9A-Fa-f]{6}$/.test(c) ? c : '#888888'
  ) as [string, string, string]

  switch (formulaId) {
    case 'monochromatic': return buildMonochromaticAdvice(safeColors)
    case 'high-contrast': return buildHighContrastAdvice(safeColors)
    case 'anchor':        return buildAnchorAdvice(safeColors)
  }
}
