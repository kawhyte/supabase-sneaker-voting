"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { OutfitWithItems } from "@/components/types/outfit";
import {
	prepareOutfitForCard,
	CARD_CANVAS_WIDTH,
	CARD_CANVAS_HEIGHT,
} from "@/lib/card-layout-engine";
import { getStandardizedImageUrl } from "@/lib/image-standardization";

interface OutfitCardCanvasProps {
	outfit: OutfitWithItems;
	className?: string;
}

/**
 * Client-side canvas renderer for outfit card preview
 * Renders 400×480px flat-lay with standardized item positions
 */
export function OutfitCardCanvas({
	outfit,
	className = "",
}: OutfitCardCanvasProps) {
	const { items, backgroundColor } = useMemo(
		() => prepareOutfitForCard(outfit),
		[outfit]
	);

	if (items.length === 0) {
		return (
			<div
				className={`relative w-full aspect-[5/6] rounded-lg flex items-center justify-center bg-slate-100 ${className}`}
				style={{ backgroundColor }}>
				<span className='text-sm text-slate-400'>No items</span>
			</div>
		);
	}

	return (
		<div
			className={`relative rounded-lg ${className}`}
			style={{
				backgroundColor,
				width: `${CARD_CANVAS_WIDTH}px`,
				height: `${CARD_CANVAS_HEIGHT}px`,
				maxWidth: "100%",
				aspectRatio: `${CARD_CANVAS_WIDTH} / ${CARD_CANVAS_HEIGHT}`,
				overflow: "visible",
			}}>
			{/* Render items in z-index order */}
			{items
				.filter((item) => {
					// Filter out items without images
					const imageUrl =
						item.cropped_image_url ||
						item.item?.image_url ||
						item.item?.item_photos?.[0]?.image_url;
					return !!imageUrl;
				})
				.map((item) => {
					// Get image source (prefer cropped, fallback to original)
					const imageUrl =
						item.cropped_image_url ||
						item.item?.image_url ||
						item.item?.item_photos?.[0]?.image_url;

				// Apply standardization transformation (FREE tier)
				const standardizedUrl = getStandardizedImageUrl(
					imageUrl!,
					item.item?.category || "other"
				);

				// Calculate pixel positions (same as CanvasItem)
				const pixelX = item.position_x * CARD_CANVAS_WIDTH;
				const pixelY = item.position_y * CARD_CANVAS_HEIGHT;
				const pixelWidth = item.display_width * CARD_CANVAS_WIDTH;
				const pixelHeight = item.display_height * CARD_CANVAS_HEIGHT;

				return (
					<div
						key={item.id}
						className='absolute'
						style={{
							left: `${pixelX}px`,
							top: `${pixelY}px`,
							width: `${pixelWidth}px`,
							height: `${pixelHeight}px`,
							zIndex: item.z_index || 0,
						}}>
						<Image
							src={standardizedUrl}
							alt={`${item.item?.brand} ${item.item?.model}`}
							fill
							className='object-contain drop-shadow-md'
							quality={85}
						/>
					</div>
				);
			})}
		</div>
	);
}
