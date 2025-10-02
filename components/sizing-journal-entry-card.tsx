"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	ThumbsUp,
	Calendar,
	MapPin,
	DollarSign,
	Edit,
	Trash2,
	Image as ImageIcon,
	MoreVertical,
} from "lucide-react";
import { PhotoCarousel } from "./photo-carousel";
import {
	SizingJournalEntry,
	ItemPhoto,
	FIT_RATINGS,
} from "./types/sizing-journal-entry";

interface SizingJournalEntryCardProps {
	entry: SizingJournalEntry;
	onEdit: (entry: SizingJournalEntry) => void;
	onDelete: (entry: SizingJournalEntry) => void;
}

export function SizingJournalEntryCard({
	entry,
	onEdit,
	onDelete,
}: SizingJournalEntryCardProps) {
	const isTried = entry.interaction_type === "tried";
	const fitInfo = getFitRatingInfo(entry.fit_rating);
	const photos = preparePhotos(entry);

	return (
		<Card className='overflow-hidden hover-lift-subtle card-interactive transition-all duration-300 group relative rounded-xl'>
			<div className='flex flex-col md:flex-row'>
				{/* Kebab Menu */}
				<div className='absolute top-2 right-2 z-50'>
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<button
								className='h-3 w-3 rounded-full flex items-center justify-center transition-colors'
								type='button'>
								<MoreVertical className='h-5 w-5 text-gray-700' />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='w-48 z-50'>
							<DropdownMenuItem
								onSelect={() => onEdit(entry)}
								className='cursor-pointer'>
								<Edit className='h-2 w-2 mr-2' />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={() => onDelete(entry)}
								className='cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50'>
								<Trash2 className='h-2 w-2 mr-2' />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Image Section */}
				{photos.length > 0 ? (
					<div className='relative w-full md:w-[280px] md:flex-shrink-0 overflow-hidden'>
						<div className='relative w-full h-[360px] md:h-[280px] bg-gray-50 flex items-center justify-center p-2'>
							{photos.length === 1 ? (
								<img
									src={photos[0].image_url}
									alt={`${entry.brand} ${entry.model}`}
									className='w-full h-full object-contain'
								/>
							) : (
								<div className='w-full h-full'>
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
				) : (
					<div className='relative w-full h-[360px] md:h-[280px] md:w-[280px] md:flex-shrink-0'>
						<div className='w-full h-full bg-gray-50 flex items-center justify-center'>
							<ImageIcon className='h-12 w-12 text-gray-300' />
						</div>
					</div>
				)}

				{/* Content Section */}
				<CardContent className='flex-1 p-6 flex flex-col gap-4 md:border-l md:border-gray-200'>
					{/* Brand */}
					<div className='text-[10px] font-semibold uppercase tracking-widest text-gray-500'>
						{entry.brand}
					</div>

					{/* Title */}
					<h3 className='text-lg font-bold leading-tight line-clamp-3'>
						{entry.model}
						{entry.colorway !== "Standard" && (
							<span className='block text-sm font-normal text-gray-600 mt-1'>
								{entry.colorway}
							</span>
						)}
					</h3>

					{/* Metadata Grid */}

					<div className='flex flex-col gap-2 mt-2'>
						<div className='flex items-center gap-2 text-xs flex-wrap'>
							{entry.size_tried && (
								<>
									<span className='badge-size-highlight'>
										{entry.size_tried}
									</span>
									{(fitInfo || entry.comfort_rating) && (
										<span className='text-gray-300 mx-0.5'>|</span>
									)}
								</>
							)}

							{fitInfo && (
								<>
									<div className='flex items-center gap-1'>
										<span className='text-gray-500'>Fit:</span>
										<span className='font-medium'>
											{fitInfo.icon} {fitInfo.label}
										</span>
									</div>
									{entry.comfort_rating && (
										<span className='text-gray-300 mx-0.5'>|</span>
									)}
								</>
							)}

							{entry.comfort_rating && (
								<div className='flex items-center gap-1'>
									<span className='text-gray-500'>Comfort:</span>
									<span>{getComfortStars(entry.comfort_rating)}</span>
								</div>
							)}
						</div>

						{/* Divider line */}
						{(entry.listed_price || entry.store_name) && (
							<div className='metadata-divider'></div>
						)}

						{/* Row 2: Secondary metadata */}
						<div className='flex items-center gap-2 text-xs flex-wrap text-gray-600'>
							{entry.listed_price && (
								<>
									<div className='flex items-center gap-1'>
										<DollarSign className='h-3.5 w-3.5 text-gray-400' />
										<span className='font-medium'>${entry.listed_price}</span>
									</div>
									{(entry.store_name || entry.try_on_date) && (
										<span className='text-gray-300 mx-0.5'>|</span>
									)}
								</>
							)}

							{entry.store_name && (
								<>
									<div className='flex items-center gap-1'>
										<MapPin className='h-3.5 w-3.5 text-gray-400' />
										<span className='truncate max-w-[140px]'>
											{entry.store_name}
										</span>
									</div>
									<span className='text-gray-300 mx-0.5'>|</span>
								</>
							)}

							<div className='flex items-center gap-1'>
								<Calendar className='h-3.5 w-3.5 text-gray-400' />
								<span>{formatDate(entry.try_on_date)}</span>
							</div>
						</div>
					</div>

					{/* Notes */}
					{entry.notes && (
						<div className='mt-3 p-[var(--space-xs)] bg-gray-50 rounded text-xs text-gray-700 line-clamp-3'>
							{entry.notes}
						</div>
					)}

					{/* Footer */}
					<div className='flex items-center gap-2 mt-auto pt-3 border-t border-gray-100'>
						<Badge variant='outline' className='text-xs'>
							{entry.user_name}
						</Badge>

						<span className={isTried ? "badge-tried" : "badge-not-tried"}>
							{isTried ? "Tried On" : "Didnt Try"}
						</span>

						{/* {entry.would_recommend && isTried && (
              <ThumbsUp className="h-3 w-3 text-green-600" />
            )} */}
					</div>
				</CardContent>
			</div>
		</Card>
	);
}

// Helper functions
function getFitRatingInfo(rating: number | null) {
	if (!rating) return null;
	return FIT_RATINGS.find((r) => r.value === rating) || FIT_RATINGS[2];
}

function getComfortStars(rating: number) {
	return "⭐".repeat(rating);
}

function formatDate(dateString: string) {
	return new Date(dateString).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function preparePhotos(entry: SizingJournalEntry): ItemPhoto[] {
	if (entry.sneaker_photos && entry.sneaker_photos.length > 0) {
		return entry.sneaker_photos;
	}

	if (entry.image_url) {
		return [
			{
				id: "main",
				image_url: entry.image_url,
				image_order: 0,
				is_main_image: true,
			},
		];
	}

	return [];
}
