/**
 * Color Analysis Utilities for Sneaker Inspiration Feature
 *
 * PRIMARY/SECONDARY DOMINANT COLOR APPROACH:
 * Uses node-vibrant to extract actual colors, then identifies the TWO dominant
 * colors (by population) and builds intelligent palettes around them.
 */

import { Vibrant } from 'node-vibrant/node';
import tinycolor from 'tinycolor2';

export interface ColorPalette {
  bold: string[];
  muted: string[];
  primaryColor: string;
}

/**
 * Calculates the Euclidean distance between two colors in RGB space
 * Used to determine if two colors are "distinctly different"
 *
 * @param color1 - First color (hex string)
 * @param color2 - Second color (hex string)
 * @returns Distance value (0-441, where > 50 is considered distinct)
 */
function calculateColorDistance(color1: string, color2: string): number {
  const c1 = tinycolor(color1).toRgb();
  const c2 = tinycolor(color2).toRgb();

  const rDiff = c1.r - c2.r;
  const gDiff = c1.g - c2.g;
  const bDiff = c1.b - c2.b;

  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

/**
 * Generates two harmonious 5-color palettes (Bold & Muted) from a sneaker image URL
 *
 * NEW PRIMARY/SECONDARY ALGORITHM:
 * 1. Extract all swatches using node-vibrant
 * 2. Identify Primary Color: swatch with highest population
 * 3. Identify Secondary Color: swatch with 2nd highest population that's distinct (distance > 50)
 * 4. Build Bold Palette around these two dominant colors (high contrast/streetwear)
 * 5. Build Muted Palette around these two dominant colors (office/chill)
 *
 * BOLD Palette (Streetwear/High-Contrast):
 * - Slot 1: Primary Color (Base)
 * - Slot 2: Direct Complement of Primary (High Contrast)
 * - Slot 3: Direct Complement of Secondary (Secondary Contrast)
 * - Slot 4: Split-Complement of Primary (High saturation)
 * - Slot 5: Secondary Color (Base)
 * - Tweak: High saturation (+10-20%)
 *
 * MUTED Palette (Office/Chill):
 * - Slot 1: Desaturated/Darker Primary
 * - Slot 2: Analogous to Primary (low contrast)
 * - Slot 3: Tetradic/Soft Complement of Secondary (desaturated)
 * - Slot 4: Neutral tone (Grey/Beige/Off-White) matching Primary's warmth
 * - Slot 5: Desaturated Secondary
 * - Tweak: Low saturation (-10-20%)
 *
 * @param imageUrl - Cloudinary URL or any CORS-accessible image URL
 * @returns ColorPalette with bold[], muted[], and primaryColor
 */
export async function generateSneakerPalette(imageUrl: string): Promise<ColorPalette> {
  try {
    // Convert Cloudinary AVIF/WebP images to PNG for node-vibrant compatibility
    let processableUrl = imageUrl;

    if (imageUrl.includes('cloudinary.com')) {
      processableUrl = imageUrl.replace(
        /\/upload\//,
        '/upload/f_png,q_auto/'
      );
      console.log('🔄 Converting Cloudinary image to PNG:', processableUrl);
    }

    // Extract colors using node-vibrant
    const palette = await Vibrant.from(processableUrl).getPalette();

    // Extract ALL available swatches from the image
    const swatches = {
      vibrant: palette.Vibrant,
      darkVibrant: palette.DarkVibrant,
      lightVibrant: palette.LightVibrant,
      muted: palette.Muted,
      darkMuted: palette.DarkMuted,
      lightMuted: palette.LightMuted
    };

    // Filter out null swatches and sort by population (most prominent colors first)
    const availableSwatches = Object.entries(swatches)
      .filter(([_, swatch]) => swatch !== null && swatch !== undefined)
      .sort((a, b) => (b[1]?.population || 0) - (a[1]?.population || 0));

    if (availableSwatches.length === 0) {
      throw new Error('Could not extract any colors from image');
    }

    console.log('🎨 PRIMARY/SECONDARY DOMINANT COLOR ALGORITHM RUNNING');
    console.log('Available swatches:', availableSwatches.map(([name, swatch]) => ({
      name,
      hex: swatch?.hex,
      population: swatch?.population
    })));

    // ========== IDENTIFY PRIMARY AND SECONDARY COLORS ==========

    // Primary Color: Highest population swatch
    const primarySwatch = availableSwatches[0][1];
    if (!primarySwatch) {
      throw new Error('Could not identify primary color');
    }
    let primaryColor = tinycolor(primarySwatch.hex);

    console.log('🎯 Primary Color (highest population):', primaryColor.toHexString(), 'pop:', primarySwatch.population);

    // Secondary Color: Second highest population that is distinctly different (distance > 50)
    let secondaryColor: tinycolor.Instance | null = null;
    const DISTINCT_THRESHOLD = 50; // RGB distance threshold

    for (let i = 1; i < availableSwatches.length; i++) {
      const candidateSwatch = availableSwatches[i][1];
      if (!candidateSwatch) continue;

      const distance = calculateColorDistance(primaryColor.toHexString(), candidateSwatch.hex);
      console.log(`  Checking candidate ${i}: ${candidateSwatch.hex} (pop: ${candidateSwatch.population}, distance: ${distance.toFixed(2)})`);

      if (distance > DISTINCT_THRESHOLD) {
        secondaryColor = tinycolor(candidateSwatch.hex);
        console.log('✅ Secondary Color (distinct from primary):', secondaryColor.toHexString(), 'pop:', candidateSwatch.population);
        break;
      }
    }

    // Fallback: If no distinct secondary found, use DarkVibrant or Muted
    if (!secondaryColor) {
      console.log('⚠️  No distinct secondary color found, using fallback...');
      const fallbackSwatch = palette.DarkVibrant || palette.Muted;
      if (fallbackSwatch) {
        secondaryColor = tinycolor(fallbackSwatch.hex);
      }
    }

    // Edge case: Monochrome shoe (Primary and Secondary are effectively the same)
    if (!secondaryColor || calculateColorDistance(primaryColor.toHexString(), secondaryColor.toHexString()) < DISTINCT_THRESHOLD) {
      console.log('🔲 Monochrome detected - forcing Secondary to White/Black');
      const primaryLuminance = primaryColor.getLuminance();
      // If primary is dark, use white; if light, use black
      secondaryColor = tinycolor(primaryLuminance > 0.5 ? '#000000' : '#FFFFFF');
    }

    console.log('Final Primary:', primaryColor.toHexString());
    console.log('Final Secondary:', secondaryColor.toHexString());

    // ========== GENERATE BOLD PALETTE (High Contrast/Streetwear) ==========

    const boldColors: string[] = [];

    // Slot 1: Primary Color (enhanced saturation)
    boldColors.push(primaryColor.clone().saturate(15).toHexString());

    // Slot 2: Direct Complement of Primary (high contrast)
    const primaryComplement = primaryColor.clone().complement();
    boldColors.push(primaryComplement.saturate(20).toHexString());

    // Slot 3: Direct Complement of Secondary
    const secondaryComplement = secondaryColor.clone().complement();
    boldColors.push(secondaryComplement.saturate(15).toHexString());

    // Slot 4: Split-Complement of Primary (one of the two split colors)
    const splitComplementColors = primaryColor.clone().splitcomplement();
    boldColors.push(splitComplementColors[1].saturate(20).toHexString()); // Pick the second one

    // Slot 5: Secondary Color (enhanced saturation)
    boldColors.push(secondaryColor.clone().saturate(15).toHexString());

    console.log('✅ BOLD PALETTE (Streetwear):', boldColors);

    // ========== GENERATE MUTED PALETTE (Office/Chill) ==========

    const mutedColors: string[] = [];

    // Slot 1: Desaturated/Darker Primary
    mutedColors.push(primaryColor.clone().desaturate(20).darken(10).toHexString());

    // Slot 2: Analogous to Primary (low contrast - 30° rotation)
    const analogousColor = primaryColor.clone().spin(30); // Analogous harmony
    mutedColors.push(analogousColor.desaturate(15).toHexString());

    // Slot 3: Tetradic/Soft Complement of Secondary (very desaturated)
    const secondarySoftComplement = secondaryColor.clone().spin(90); // Tetradic harmony
    mutedColors.push(secondarySoftComplement.desaturate(30).toHexString());

    // Slot 4: Neutral tone (Grey/Beige/Off-White) matching Primary's warmth
    const primaryHsl = primaryColor.toHsl();
    const isWarm = (primaryHsl.h >= 0 && primaryHsl.h < 60) || primaryHsl.h >= 300; // Reds, oranges, yellows, pinks
    const neutralBase = isWarm ? '#D4C5A9' : '#B8C5D4'; // Warm beige vs cool gray-blue
    mutedColors.push(tinycolor(neutralBase).desaturate(10).toHexString());

    // Slot 5: Desaturated Secondary
    mutedColors.push(secondaryColor.clone().desaturate(25).toHexString());

    console.log('✅ MUTED PALETTE (Office):', mutedColors);

    return {
      bold: boldColors,
      muted: mutedColors,
      primaryColor: primaryColor.toHexString() // Use primary as the dominant color
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
