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
 * EXTRACTION-FIRST APPROACH:
 * Uses node-vibrant to extract ACTUAL colors from the sneaker, ensuring each
 * sneaker gets a unique palette that reflects its real colors.
 *
 * BOLD Palette (Streetwear/High-Contrast):
 * - Source: Vibrant, DarkVibrant, LightVibrant swatches from image
 * - Enhancement: Moderate saturation boost (saturate(20))
 * - Supplements: Complementary/split-complementary only if needed
 * - Result: Real sneaker colors enhanced for streetwear
 * - Use Case: Street style, bold looks, statement outfits
 *
 * MUTED Palette (Office/Low-Key):
 * - Source: Muted, DarkMuted, LightMuted swatches from image
 * - Enhancement: Slight desaturation (desaturate(15))
 * - Fallback: Heavily desaturated vibrant colors if needed
 * - Result: Real sneaker colors muted for professional settings
 * - Use Case: Office wear, minimalist style, understated elegance
 *
 * @param imageUrl - Cloudinary URL or any CORS-accessible image URL
 * @returns ColorPalette with bold[], muted[], and primaryColor
 */
export async function generateSneakerPalette(imageUrl: string): Promise<ColorPalette> {
  try {
    // Convert Cloudinary AVIF/WebP images to PNG for node-vibrant compatibility
    let processableUrl = imageUrl;

    if (imageUrl.includes('cloudinary.com')) {
      // Add format transformation to force PNG
      // Example: https://res.cloudinary.com/xyz/image/upload/v123/abc.avif
      // Becomes: https://res.cloudinary.com/xyz/image/upload/f_png/v123/abc.avif
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

    // ========== BOLD PALETTE (High-Energy Streetwear) ==========
    // Strategy: Use ACTUAL vibrant colors from the sneaker, enhanced moderately

    console.log('🎨 NEW EXTRACTION-FIRST ALGORITHM RUNNING');
    console.log('Available swatches:', availableSwatches.map(([name, swatch]) => ({
      name,
      hex: swatch?.hex,
      population: swatch?.population
    })));

    const boldColors: string[] = [];

    // Collect vibrant swatches (Vibrant, DarkVibrant, LightVibrant)
    const vibrantSwatches = [
      palette.Vibrant,
      palette.DarkVibrant,
      palette.LightVibrant
    ].filter(s => s !== null && s !== undefined);

    console.log('Vibrant swatches found:', vibrantSwatches.length);

    // Add real vibrant colors with moderate enhancement
    vibrantSwatches.forEach(swatch => {
      if (swatch && boldColors.length < 5) {
        const color = tinycolor(swatch.hex);
        boldColors.push(color.saturate(20).toHexString());
      }
    });

    // If we need more colors, add a complementary color based on the most vibrant
    if (boldColors.length < 5 && palette.Vibrant) {
      const complement = tinycolor(palette.Vibrant.hex).complement();
      boldColors.push(complement.saturate(15).toHexString());
    }

    // If still need more, add a split-complementary
    if (boldColors.length < 5 && palette.Vibrant) {
      const splitComp = tinycolor(palette.Vibrant.hex).splitcomplement();
      boldColors.push(splitComp[1].saturate(15).toHexString());
    }

    // Ensure we have exactly 5 colors
    while (boldColors.length < 5) {
      const baseColor = tinycolor(availableSwatches[0][1]?.hex || '#666666');
      boldColors.push(baseColor.spin(boldColors.length * 72).saturate(20).toHexString());
    }

    const boldPalette = boldColors.slice(0, 5);

    // ========== MUTED PALETTE (Low-Key Office/Minimalist) ==========
    // Strategy: Use ACTUAL muted colors from the sneaker directly

    const mutedColors: string[] = [];

    // Collect muted swatches (Muted, DarkMuted, LightMuted)
    const mutedSwatches = [
      palette.Muted,
      palette.DarkMuted,
      palette.LightMuted
    ].filter(s => s !== null && s !== undefined);

    // Add real muted colors with slight desaturation for professional look
    mutedSwatches.forEach(swatch => {
      if (swatch && mutedColors.length < 5) {
        const color = tinycolor(swatch.hex);
        mutedColors.push(color.desaturate(15).toHexString());
      }
    });

    // If we need more muted colors, desaturate the vibrant colors heavily
    if (mutedColors.length < 5) {
      vibrantSwatches.forEach(swatch => {
        if (swatch && mutedColors.length < 5) {
          const color = tinycolor(swatch.hex);
          mutedColors.push(color.desaturate(40).darken(5).toHexString());
        }
      });
    }

    // Ensure we have exactly 5 colors
    while (mutedColors.length < 5) {
      const baseColor = tinycolor(availableSwatches[0][1]?.hex || '#888888');
      mutedColors.push(baseColor.desaturate(35).toHexString());
    }

    const mutedPalette = mutedColors.slice(0, 5);

    console.log('✅ FINAL PALETTES:');
    console.log('Bold:', boldPalette);
    console.log('Muted:', mutedPalette);

    return {
      bold: boldPalette,
      muted: mutedPalette,
      primaryColor: boldPalette[0] // Use first bold color as primary
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
