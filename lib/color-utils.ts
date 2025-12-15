/**
 * Color Analysis Utilities for Sneaker Inspiration Feature
 *
 * Hybrid approach combining node-vibrant extraction with tinycolor2 color theory
 * to generate harmonious 5-color palettes from sneaker images.
 */

import { Vibrant } from 'node-vibrant/node';
import tinycolor from 'tinycolor2';

export interface ColorPalette {
  colors: string[];
  primaryColor: string;
}

/**
 * Generates a harmonious 5-color palette from a sneaker image URL
 *
 * Palette Structure (Staff Engineer Hybrid Logic):
 * - Slot 1 (Dominant): Most vibrant color from image
 * - Slot 2 (Grounding): Muted/dark tone for pants
 * - Slot 3 (Harmony): Split-complementary of dominant
 * - Slot 4 (Neutral/Light): Light tint of grounding color for shirts
 * - Slot 5 (Pop): Desaturated complementary accent
 *
 * @param imageUrl - Cloudinary URL or any CORS-accessible image URL
 * @returns ColorPalette with 5 hex colors and primary color
 */
export async function generateSneakerPalette(imageUrl: string): Promise<ColorPalette> {
  try {
    // Extract colors using node-vibrant
    const palette = await Vibrant.from(imageUrl).getPalette();

    // Extract available swatches with fallbacks
    const vibrantSwatch = palette.Vibrant || palette.DarkVibrant || palette.LightVibrant;
    const mutedSwatch = palette.Muted || palette.DarkMuted || palette.LightMuted;
    const darkSwatch = palette.DarkVibrant || palette.DarkMuted || vibrantSwatch;

    if (!vibrantSwatch) {
      throw new Error('Could not extract any vibrant colors from image');
    }

    // Slot 1: Dominant (most vibrant color)
    const dominantColor = tinycolor(vibrantSwatch.hex);
    const slot1 = dominantColor.toHexString();

    // Slot 2: Grounding (muted/dark tone for pants)
    let slot2: string;
    if (mutedSwatch || darkSwatch) {
      const groundingHex = mutedSwatch?.hex || darkSwatch?.hex || vibrantSwatch.hex;
      const groundingColor = tinycolor(groundingHex);
      // Ensure it's darker and less saturated
      slot2 = groundingColor
        .darken(10)
        .desaturate(20)
        .toHexString();
    } else {
      // Fallback: create dark version of dominant
      slot2 = dominantColor
        .clone()
        .darken(30)
        .desaturate(40)
        .toHexString();
    }

    // Slot 3: Harmony (split-complementary of dominant)
    const splitComplementary = dominantColor.splitcomplement();
    // Use the first split-complementary color (150° rotation)
    const slot3 = splitComplementary[1].toHexString();

    // Slot 4: Neutral/Light (light tint of grounding color for shirts)
    const slot4 = tinycolor(slot2)
      .lighten(40)
      .desaturate(30)
      .toHexString();

    // Slot 5: Pop (desaturated complementary accent)
    const complementary = dominantColor.complement();
    const slot5 = complementary
      .desaturate(15)
      .toHexString();

    const colors = [slot1, slot2, slot3, slot4, slot5];

    return {
      colors,
      primaryColor: slot1
    };

  } catch (error) {
    console.error('Error generating palette:', error);

    // Fallback: Generate a monochromatic palette from a default color
    const fallbackColor = tinycolor('#666666');
    const colors = [
      fallbackColor.toHexString(),
      fallbackColor.clone().darken(20).toHexString(),
      fallbackColor.clone().lighten(20).toHexString(),
      fallbackColor.clone().lighten(40).toHexString(),
      fallbackColor.clone().spin(180).toHexString()
    ];

    return {
      colors,
      primaryColor: colors[0]
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
