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
import { PhotoCarousel } from "@/components/photo-carousel";
import { ItemPhoto } from "@/components/types/sizing-journal-entry";
import { getImageAltText } from "@/lib/wardrobe-item-utils";

interface ItemCardImageProps {
	photos: ItemPhoto[];
	brand: string;
	model: string;
	color?: string;
}

export function ItemCardImage({
	photos,
	brand,
	model,
	color,
}: ItemCardImageProps) {
	const altText = getImageAltText(brand, model, color);

	if (photos.length === 0) {
		return (
			<div className='relative w-full overflow-hidden'>
				<div className='w-full aspect-[4/3] bg-gradient-to-b from-white via-white to-stone-50/30 flex items-center justify-center transition-all duration-200 card-image-container'>
					<ImageIcon className='h-12 w-12 text-muted-foreground' />
				</div>
			</div>
		);
	}

	return (
		<div className='relative w-full overflow-hidden'>
			<div className='relative w-full aspect-[4/3] bg-gradient-to-b from-white via-white to-stone-50/30 flex items-center justify-center p-2 sm:p-4 lg:p-5 transition-all duration-200 card-image-container group'>
				{photos.length === 1 ? (
					<img
						src={photos[0].image_url}
						alt={altText}
						className='w-full h-full object-contain transition-transform duration-300 group-hover:scale-105'
						loading='lazy'
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
