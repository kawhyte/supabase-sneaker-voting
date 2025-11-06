/**
 * Canvas Preview Generator
 *
 * Generates outfit preview images using HTML Canvas API (100% free)
 * No external services required beyond what's already in use
 */

import { OutfitWithItems } from "@/components/types/outfit";
import {
	prepareOutfitForCard,
	CARD_CANVAS_WIDTH,
	CARD_CANVAS_HEIGHT,
} from "./card-layout-engine";
import { getStandardizedImageUrl } from "./image-standardization";

/**
 * Generates preview image as data URL using Canvas API
 * Browser-based, 100% free
 */
export async function generatePreviewDataUrl(
	outfit: OutfitWithItems
): Promise<string | null> {
	try {
		const { items, backgroundColor } = prepareOutfitForCard(outfit);

		if (items.length === 0) return null;

		// Create canvas
		const canvas = document.createElement("canvas");
		canvas.width = CARD_CANVAS_WIDTH;
		canvas.height = CARD_CANVAS_HEIGHT;
		const ctx = canvas.getContext("2d");

		if (!ctx) return null;

		// Fill background
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, CARD_CANVAS_WIDTH, CARD_CANVAS_HEIGHT);

		// Load and draw each item
		for (const item of items) {
			const imageUrl =
				item.cropped_image_url ||
				item.item?.image_url ||
				item.item?.item_photos?.[0]?.image_url;

			if (!imageUrl) continue;

			const standardizedUrl = getStandardizedImageUrl(
				imageUrl,
				item.item?.category || "other"
			);

			try {
				// Load image
				const img = await loadImage(standardizedUrl);

				// Calculate position (center-adjusted)
				const x =
					item.position_x * CARD_CANVAS_WIDTH -
					(item.display_width * CARD_CANVAS_WIDTH) / 2;
				const y =
					item.position_y * CARD_CANVAS_HEIGHT -
					(item.display_height * CARD_CANVAS_HEIGHT) / 2;
				const width = item.display_width * CARD_CANVAS_WIDTH;
				const height = item.display_height * CARD_CANVAS_HEIGHT;

				// Save context and apply z-index via drawing order
				ctx.globalAlpha = 1.0;
				ctx.drawImage(img, x, y, width, height);
			} catch (imageError) {
				console.warn(`Failed to load image for item ${item.id}:`, imageError);
				// Continue with next item if one fails
			}
		}

		// Convert to data URL (JPEG for smaller file size)
		return canvas.toDataURL("image/jpeg", 0.9);
	} catch (error) {
		console.error("Error generating preview:", error);
		return null;
	}
}

/**
 * Helper: Load image from URL with CORS support
 */
function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
		img.src = url;
	});
}

/**
 * Upload data URL to Cloudinary and return secure URL
 * Uses existing Cloudinary setup
 */
export async function uploadPreviewToCloudinary(
	dataUrl: string,
	outfitId: string
): Promise<{ url: string; publicId: string } | null> {
	try {
		const response = await fetch("/api/upload-preview", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				dataUrl,
				outfitId,
			}),
		});

		if (!response.ok) {
			console.error("Upload failed:", await response.text());
			return null;
		}

		const data = await response.json();
		return { url: data.url, publicId: data.publicId };
	} catch (error) {
		console.error("Error uploading preview:", error);
		return null;
	}
}

/**
 * Complete flow: Generate and upload preview
 */
export async function generateAndUploadPreview(
	outfit: OutfitWithItems
): Promise<{ url: string; publicId: string } | null> {
	// Generate data URL from canvas
	const dataUrl = await generatePreviewDataUrl(outfit);

	if (!dataUrl) {
		console.warn("Could not generate preview data URL");
		return null;
	}

	// Upload to Cloudinary
	return uploadPreviewToCloudinary(dataUrl, outfit.id);
}
