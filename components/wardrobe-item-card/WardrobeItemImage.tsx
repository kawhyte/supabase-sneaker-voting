/**
 * ItemCardImage - Image display section
 *
 * Handles:
 * - Single image display
 * - Carousel for multiple images
 * - Placeholder for missing images
 */

"use client";

import { Image as ImageIcon } from "lucide-react";
import { PhotoCarousel } from '@/components/PhotoCarousel';
import { ItemPhoto } from '@/components/types/WardrobeItem';
import { getImageAltText } from "@/lib/wardrobe-item-utils";
import { ViewDensity } from "@/lib/view-density-context";
import { buildCloudinaryUrlWithSize, extractPublicIdFromUrl } from '@/lib/cloudinary-url-builder';

interface ItemCardImageProps {
	photos: ItemPhoto[];
	brand: string;
	model: string;
	color?: string;
	density?: ViewDensity;
}

/**
 * Get aspect ratio - ALWAYS square (1:1) for visual consistency
 * Density affects grid layout & metadata, NOT image size
 */
function getAspectRatio(): string {
	return "aspect-square"; // 1:1 square - consistent across all density modes
}

export function ItemCardImage({
	photos,
	brand,
	model,
	color,
	density,
}: ItemCardImageProps) {
	const altText = getImageAltText(brand, model, color);
	const aspectClass = getAspectRatio();

	if (photos.length === 0) {
		return (
			<div className='relative w-full overflow-hidden'>
				<div className={`w-full ${aspectClass} bg-gradient-to-b from-white via-white to-stone-50/30 flex items-center justify-center transition-all duration-200 card-image-container`}>
					<ImageIcon className='h-12 w-12 text-muted-foreground' />
				</div>
			</div>
		);
	}

	return (
		<div className='relative w-full overflow-hidden'>
			<div className={`relative w-full ${aspectClass} bg-gradient-to-b from-white via-white to-stone-50/30 flex items-center justify-center p-2 sm:p-4 lg:p-5 transition-all duration-200 card-image-container group`}>
				{photos.length === 1 ? (
					<img
						src={buildCloudinaryUrlWithSize(
							extractPublicIdFromUrl(photos[0].image_url),
							'card'
						)}
						alt={altText}
						className='w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-105'
						loading='lazy'
						decoding='async'
						onError={(e) => {
							e.currentTarget.src = '/images/placeholder.jpg';
						}}
					/>
				) : (
					<div className='w-full h-full transition-transform duration-300 group-hover:scale-105'>
						<PhotoCarousel
							photos={photos}
							showControls={true}
							showIndicators={true}
							autoHeight={false}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
