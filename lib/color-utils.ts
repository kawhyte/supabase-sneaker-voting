/**
 * Color Analysis Utilities for Sneaker Inspiration Feature
 *
 * Hybrid approach combining node-vibrant extraction with tinycolor2 color theory
 * to generate harmonious 5-color palettes from sneaker images.
 */

import { Vibrant } from 'node-vibrant/node';
import tinycolor from 'tinycolor2';

export interface ColorPalette {
  bold: string[];
  muted: string[];
  primaryColor: string;
}

/**
 * Generates two harmonious 5-color palettes (Bold & Muted) from a sneaker image URL
 *
 * BOLD Palette (Streetwear/High-Contrast):
 * - Anchor: Most vibrant color from image
 * - Harmony: Triadic, Split-Complementary, and Complementary
 * - Enhancement: Saturate(30-40) + Brighten(5-10) for MAXIMUM pop
 * - Result: Vivid, high-energy colors that demand attention
 * - Use Case: Street style, bold looks, statement outfits, nightlife
 *
 * MUTED Palette (Office/Low-Key):
 * - Anchor: Muted or desaturated tones
 * - Harmony: Analogous (±30° hue shifts) and Monochromatic
 * - Enhancement: Desaturate(25-40) for heavily neutral tones
 * - Result: Soft, earthy, neutral colors for professional settings
 * - Use Case: Office wear, minimalist style, understated elegance
 *
 * @param imageUrl - Cloudinary URL or any CORS-accessible image URL
 * @returns ColorPalette with bold[], muted[], and primaryColor
 */
export async function generateSneakerPalette(imageUrl: string): Promise<ColorPalette> {
  try {
    // Extract colors using node-vibrant
    const palette = await Vibrant.from(imageUrl).getPalette();

    // Extract available swatches with fallbacks
    const vibrantSwatch = palette.Vibrant || palette.DarkVibrant || palette.LightVibrant;
    const mutedSwatch = palette.Muted || palette.DarkMuted || palette.LightMuted;
    const darkVibrantSwatch = palette.DarkVibrant || vibrantSwatch;

    if (!vibrantSwatch) {
      throw new Error('Could not extract any vibrant colors from image');
    }

    // ========== BOLD PALETTE (High-Energy Streetwear) ==========
    const dominantColor = tinycolor(vibrantSwatch.hex);

    // Slot 1: Dominant vibrant (anchor) - MAXIMUM POP
    const boldSlot1 = dominantColor
      .saturate(40)
      .lighten(5)
      .toHexString();

    // Slot 2: Dark vibrant for contrast - Deep, saturated
    const boldSlot2 = tinycolor(darkVibrantSwatch?.hex || vibrantSwatch.hex)
      .saturate(30)
      .darken(15)
      .toHexString();

    // Slot 3: Split-complementary harmony (150° rotation) - VIVID
    const splitComplementary = dominantColor.splitcomplement();
    const boldSlot3 = splitComplementary[1]
      .saturate(40)
      .brighten(10)
      .toHexString();

    // Slot 4: Triadic harmony (120° rotation) - HIGH SATURATION
    const triadic = dominantColor.triad();
    const boldSlot4 = triadic[1]
      .saturate(35)
      .brighten(5)
      .toHexString();

    // Slot 5: Complementary pop (180° rotation) - MAXIMUM CONTRAST
    const complementary = dominantColor.complement();
    const boldSlot5 = complementary
      .saturate(40)
      .brighten(10)
      .toHexString();

    const boldPalette = [boldSlot1, boldSlot2, boldSlot3, boldSlot4, boldSlot5];

    // ========== MUTED PALETTE (Low-Key Office/Minimalist) ==========
    // If no muted swatch, derive from vibrant by desaturating heavily
    let mutedAnchor: tinycolor.Instance;
    if (mutedSwatch) {
      mutedAnchor = tinycolor(mutedSwatch.hex);
    } else {
      // Fallback: create muted version from vibrant
      mutedAnchor = dominantColor.clone().desaturate(50).darken(10);
    }

    // Slot 1: Muted anchor (earthy base) - HEAVILY DESATURATED
    const mutedSlot1 = mutedAnchor
      .desaturate(30)
      .toHexString();

    // Slot 2: Darker muted tone (for pants/bottoms) - NEUTRAL DARK
    const mutedSlot2 = mutedAnchor
      .clone()
      .darken(25)
      .desaturate(35)
      .toHexString();

    // Slot 3: Analogous harmony (+30° hue shift) - SUBTLE VARIATION
    const mutedSlot3 = mutedAnchor
      .clone()
      .spin(30)
      .desaturate(25)
      .toHexString();

    // Slot 4: Analogous harmony (-30° hue shift, lighter) - SOFT TONE
    const mutedSlot4 = mutedAnchor
      .clone()
      .spin(-30)
      .lighten(15)
      .desaturate(30)
      .toHexString();

    // Slot 5: Monochromatic light (for layering/shirts) - VERY PALE
    const mutedSlot5 = mutedAnchor
      .clone()
      .lighten(35)
      .desaturate(40)
      .toHexString();

    const mutedPalette = [mutedSlot1, mutedSlot2, mutedSlot3, mutedSlot4, mutedSlot5];

    return {
      bold: boldPalette,
      muted: mutedPalette,
      primaryColor: boldSlot1 // Use bold dominant as primary
    };

  } catch (error) {
    console.error('Error generating palette:', error);

    // Fallback: Generate vibrant bold vs muted neutral palettes
    const fallbackBase = tinycolor('#666666');

    // Bold fallback: Vibrant, saturated colors
    const boldFallback = [
      tinycolor('#FF6B35').toHexString(), // Vibrant orange
      tinycolor('#004E89').toHexString(), // Deep blue
      tinycolor('#F7B801').toHexString(), // Bright yellow
      tinycolor('#1A535C').toHexString(), // Teal
      tinycolor('#FF1654').toHexString()  // Hot pink
    ];

    // Muted fallback: Neutral, desaturated tones
    const mutedFallback = [
      fallbackBase.toHexString(),                          // Medium gray
      fallbackBase.clone().darken(20).toHexString(),      // Dark gray
      fallbackBase.clone().lighten(15).toHexString(),     // Light gray
      fallbackBase.clone().lighten(30).toHexString(),     // Very light gray
      fallbackBase.clone().lighten(40).toHexString()      // Off-white
    ];

    return {
      bold: boldFallback,
      muted: mutedFallback,
      primaryColor: boldFallback[0]
    };
  }
}

/**
 * Validates if a string is a valid hex color code
 */
export function isValidHexColor(hex: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(hex);
}

/**
 * Gets a readable color name from hex (for accessibility)
 */
export function getColorName(hex: string): string {
  const color = tinycolor(hex);
  const hsl = color.toHsl();

  // Simple color naming based on HSL
  const hue = hsl.h;
  const sat = hsl.s;
  const light = hsl.l;

  // Achromatic colors
  if (sat < 0.1) {
    if (light > 0.9) return 'White';
    if (light < 0.1) return 'Black';
    if (light > 0.7) return 'Light Gray';
    if (light < 0.3) return 'Dark Gray';
    return 'Gray';
  }

  // Chromatic colors
  let colorName = '';
  if (hue < 15 || hue >= 345) colorName = 'Red';
  else if (hue < 45) colorName = 'Orange';
  else if (hue < 75) colorName = 'Yellow';
  else if (hue < 165) colorName = 'Green';
  else if (hue < 195) colorName = 'Cyan';
  else if (hue < 255) colorName = 'Blue';
  else if (hue < 285) colorName = 'Purple';
  else if (hue < 315) colorName = 'Magenta';
  else colorName = 'Pink';

  // Add lightness modifier
  if (light > 0.7) colorName = `Light ${colorName}`;
  else if (light < 0.3) colorName = `Dark ${colorName}`;

  return colorName;
}

/**
 * Calculates contrast ratio between two colors (WCAG)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const c1 = tinycolor(color1);
  const c2 = tinycolor(color2);

  const l1 = c1.getLuminance();
  const l2 = c2.getLuminance();

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Ensures a color has sufficient contrast with background
 */
export function ensureContrast(color: string, background: string, minRatio: number = 4.5): string {
  let adjustedColor = tinycolor(color);
  let ratio = getContrastRatio(color, background);

  // If contrast is insufficient, adjust lightness
  if (ratio < minRatio) {
    const bgLuminance = tinycolor(background).getLuminance();
    // If background is dark, lighten the color; if light, darken it
    if (bgLuminance < 0.5) {
      while (ratio < minRatio && adjustedColor.getLuminance() < 1) {
        adjustedColor = adjustedColor.lighten(5);
        ratio = getContrastRatio(adjustedColor.toHexString(), background);
      }
    } else {
      while (ratio < minRatio && adjustedColor.getLuminance() > 0) {
        adjustedColor = adjustedColor.darken(5);
        ratio = getContrastRatio(adjustedColor.toHexString(), background);
      }
    }
  }

  return adjustedColor.toHexString();
}
