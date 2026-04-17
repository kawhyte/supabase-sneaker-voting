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
import { extractPublicIdFromUrl } from '@/lib/cloudinary-url-builder';
import { CldImage } from "next-cloudinary";

interface ItemCardImageProps {
	photos: ItemPhoto[];
	brand: string;
	model: string;
	color?: string;
	density?: ViewDensity;
}

export function ItemCardImage({
	photos,
	brand,
	model,
	color,
	density,
}: ItemCardImageProps) {
	const altText = getImageAltText(brand, model, color);

	if (photos.length === 0) {
		return (
			<div className='relative w-full overflow-hidden'>
				<div className='w-full aspect-[4/3] bg-slate-100 flex items-center justify-center card-image-container'>
					<ImageIcon className='h-12 w-12 text-muted-foreground' />
				</div>
			</div>
		);
	}

	return (
		<div className='relative w-full overflow-hidden'>
			<div className='relative w-full aspect-[4/3] overflow-hidden bg-slate-100 flex items-center justify-center transition-all duration-200 card-image-container group'>
				{photos.length === 1 ? (
					<CldImage
						src={extractPublicIdFromUrl(photos[0].image_url) || '/images/placeholder.svg'}
						alt={altText}
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						className='object-contain p-4 mix-blend-multiply drop-shadow-xl transition-transform duration-300 group-hover:scale-105'
						onError={(e: any) => {
							e.currentTarget.src = '/images/placeholder.svg';
						}}
					/>
				) : (
					<div className='w-full h-full'>
						<PhotoCarousel
							photos={photos}
							showControls={true}
							showIndicators={true}
							autoHeight={false}
							size="card"
							crop="fit"
						/>
					</div>
				)}
			</div>
		</div>
	);
}
