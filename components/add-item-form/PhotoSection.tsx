/**
 * Photo Section - Multi-photo upload UI
 *
 * Contains the photo upload widget:
 * - Drag-and-drop photo upload
 * - Up to 5 photos per item
 * - Photo reordering with DnD Kit
 * - Main image selection
 * - Delete functionality
 */

"use client";

import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";
import { MultiPhotoUpload } from "@/components/MultiPhotoUpload";
import { PhotoItem } from "@/components/types/photo-item";

interface PhotoSectionProps {
	photos: PhotoItem[];
	onPhotosChange: (photos: PhotoItem[]) => void;
	errors?: any;
}

/**
 * PhotoSection Component
 *
 * Renders the photo upload interface with multi-photo support.
 * Displays error message when no photos are uploaded (min 1 required).
 */
export function PhotoSection({
	photos,
	onPhotosChange,
	errors,
}: PhotoSectionProps) {
	return (
		<div className="space-y-6 mt-16">
			<div className="flex items-center gap-2 pb-2 border-b border-stone-300">
				<Camera className="relative -top-[8px] h-5 w-5 text-slate-600 flex-shrink-0" />
				<h3 className="font-semibold font-heading text-base text-slate-900 leading-5">
					Photos
				</h3>
			</div>
			<div>
				<Label className="text-sm font-medium text-slate-900">
					Photos <span className="text-red-500">*</span>{" "}
					<span className="text-xs text-muted-foreground font-normal">
						(Min 1, Max 5)
					</span>
				</Label>
				<MultiPhotoUpload
					photos={photos}
					onPhotosChange={onPhotosChange}
					maxPhotos={5}
				/>
				{photos.length === 0 && errors?.root && (
					<p className="text-sm text-red-600 mt-1">
						At least one photo is required
					</p>
				)}
			</div>
		</div>
	);
}
