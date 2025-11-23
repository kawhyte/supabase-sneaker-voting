/**
 * URL Shortener Utility
 *
 * Extracts and shortens URLs to show friendly domain names.
 * Example: "https://www.shoepalace.com/products/..." → "shoepalace"
 */

/**
 * Extract domain name from URL and shorten it
 * @param url - Full URL string
 * @returns Shortened domain name or null if invalid
 */
export function shortenStoreUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname;

    // Remove 'www.' prefix if present
    hostname = hostname.replace(/^www\./, '');

    // Remove TLD (.com, .co.uk, etc.) to get just the brand name
    const parts = hostname.split('.');

    // Return the main domain name (second-to-last part before TLD)
    // Examples:
    // "shoepalace.com" → "shoepalace"
    // "nike.co.uk" → "nike"
    // "store.adidas.com" → "adidas" (uses second-to-last)
    if (parts.length >= 2) {
      return parts[parts.length - 2];
    }

    return parts[0]; // Fallback to first part
  } catch (error) {
    console.error('Invalid URL:', url, error);
    return null;
  }
}

/**
 * Get full domain with TLD (for display tooltip)
 * @param url - Full URL string
 * @returns Domain with TLD or null if invalid
 */
export function getFullDomain(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (error) {
    return null;
  }
}
