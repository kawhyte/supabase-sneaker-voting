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
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Calendar,
	MapPin,
	DollarSign,
	Edit,
	Trash2,
	Image as ImageIcon,
	MoreVertical,
	Star,
	SquareCheckBig,
	Heart,
	Bookmark,
	Plus,
	Minus,
	Archive,
	ArchiveRestore,
	ShoppingBag,
	BadgeCentIcon
} from "lucide-react";
import { PhotoCarousel } from "./photo-carousel";
import {
	SizingJournalEntry,
	ItemPhoto,
	FIT_RATINGS,
} from "./types/sizing-journal-entry";
import {
	getCategoryConfig,
	canAddToCollection,
	canTrackWears,
	canMarkAsPurchased
} from "./types/item-category";

interface SizingJournalEntryCardProps {
	entry: SizingJournalEntry;
	onEdit: (entry: SizingJournalEntry) => void;
	onDelete: (entry: SizingJournalEntry) => void;
	onToggleCollection?: (entry: SizingJournalEntry) => void;
	viewMode?: 'journal' | 'collection' | 'archive' | 'wishlist';
	onIncrementWear?: (entry: SizingJournalEntry) => void;
	onDecrementWear?: (entry: SizingJournalEntry) => void;
	onMoveToWatchlist?: (entry: SizingJournalEntry) => void;
	onArchive?: (entry: SizingJournalEntry) => void;
	onRestore?: (entry: SizingJournalEntry) => void;
}

export function SizingJournalEntryCard({
	entry,
	onEdit,
	onDelete,
	onToggleCollection,
	viewMode = 'journal',
	onIncrementWear,
	onDecrementWear,
	onMoveToWatchlist,
	onArchive,
	onRestore,
}: SizingJournalEntryCardProps) {
	const isTried = entry.interaction_type === "tried";
	const fitInfo = getFitRatingInfo(entry.fit_rating);
	const photos = preparePhotos(entry);
	const categoryConfig = getCategoryConfig(entry.category);
	const isShoe = canAddToCollection(entry.category);
	const canBePurchased = canMarkAsPurchased(entry.category);
	const canTrack = canTrackWears(entry.category);

	return (
		<TooltipProvider delayDuration={300}>
			<Card
				className='overflow-hidden hover-lift-subtle card-interactive transition-all duration-300 group relative rounded-xl w-full'
				tabIndex={0}
				role='article'
				aria-label={`${entry.brand} ${entry.model}`}>
				<div className='flex flex-col'>
					{/* Collection/Purchase Toggle & Kebab Menu */}
					<div className='absolute right-2 z-50 flex items-center gap-1'>
						{/* Collection/Purchase Toggle */}
						{onToggleCollection && viewMode === 'journal' && (
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										onClick={() => onToggleCollection(entry)}
										className='h-9 w-9 sm:h-8 sm:w-8 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 active:bg-gray-200'
										type='button'
										aria-label={
											isShoe
												? (entry.in_collection ? 'Remove from collection' : 'Add to collection')
												: (entry.is_purchased ? 'Unmark as purchased' : 'Mark as purchased')
										}>
										{isShoe ? (
											<Bookmark
												className='h-3 w-3 transition-all'
												style={{
													color: entry.in_collection
														? 'var(--color-primary-500)'
														: 'var(--color-gray-500)',
												}}
											/>
										) : (
											<ShoppingBag
												className='h-3 w-3 transition-all'
												style={{
													color: entry.is_purchased
														? 'var(--color-green-500)'
														: 'var(--color-gray-500)',
												}}
											/>
										)}
									</button>
								</TooltipTrigger>
								<TooltipContent side="bottom" className="z-[9999]">
									<p>
										{isShoe
											? (entry.in_collection ? 'Remove from collection' : 'Add to collection')
											: (entry.is_purchased ? 'Unmark as purchased' : 'Mark as purchased')
										}
									</p>
								</TooltipContent>
							</Tooltip>
						)}

						{/* Move to Watchlist Button - Collection Mode Only */}
						{viewMode === 'collection' && onMoveToWatchlist && !entry.is_archived && (
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										onClick={() => onMoveToWatchlist(entry)}
										className='h-9 w-9 sm:h-8 sm:w-8 rounded-full flex items-center justify-center transition-all hover:bg-blue-50 active:bg-blue-100'
										type='button'
										aria-label='Move to watchlist'>
										<Bookmark
											className='h-3 w-3 transition-all'
											style={{ color: 'var(--color-blue-500)' }}
										/>
									</button>
								</TooltipTrigger>
								<TooltipContent side="bottom" className="z-[9999]">
									<p>Move to watchlist</p>
								</TooltipContent>
							</Tooltip>
						)}

						{/* Archive Button - Show in Journal/Collection, not in Archive view or if already archived */}
						{!entry.is_archived && viewMode !== 'archive' && onArchive && (
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										onClick={() => onArchive(entry)}
										className='h-9 w-9 sm:h-8 sm:w-8 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 active:bg-gray-200'
										type='button'
										aria-label='Archive item'>
										<Archive
											className='h-3 w-3 transition-colors'
											style={{ color: 'var(--color-gray-600)' }}
											onMouseEnter={(e) => {
												e.currentTarget.style.color = 'var(--color-gray-900)'
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.color = 'var(--color-gray-600)'
											}}
										/>
									</button>
								</TooltipTrigger>
								<TooltipContent side="bottom" className="z-[9999]">
									<p>Archive item</p>
								</TooltipContent>
							</Tooltip>
						)}

						{/* Restore Button - Only in Archive view for archived items */}
						{viewMode === 'archive' && entry.is_archived && onRestore && (
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										onClick={() => onRestore(entry)}
										className='h-9 w-9 sm:h-8 sm:w-8 rounded-full flex items-center justify-center transition-all hover:bg-green-50 active:bg-green-100'
										type='button'
										aria-label='Restore to collection'>
										<ArchiveRestore
											className='h-3 w-3 transition-colors'
											style={{ color: 'var(--color-green-500)' }}
										/>
									</button>
								</TooltipTrigger>
								<TooltipContent side="bottom" className="z-[9999]">
									<p>Restore to collection</p>
								</TooltipContent>
							</Tooltip>
						)}

						{/* Kebab Menu */}
						<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<button
								className='h-3 w-3 sm:h-4 sm:w-4 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100 active:bg-gray-200'
								type='button'
								aria-label='Card actions'>
								<MoreVertical className='h-3 w-3 text-gray-700' />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='w-48 z-50'>
							<DropdownMenuItem
								onSelect={() => onEdit(entry)}
								className='cursor-pointer'>
								<Edit className='h-3 w-3 mr-2' />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={() => onDelete(entry)}
								className='cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50'>
								<Trash2 className='h-3 w-3 mr-2' />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Category Badge */}
				{/* {categoryConfig && (
					<div
						className='absolute top-2 left-2 z-40 px-2 py-1 rounded-md text-xs font-semibold shadow-sm flex items-center gap-1'
						style={{
							backgroundColor: categoryConfig.bgColor,
							borderColor: categoryConfig.borderColor,
							color: categoryConfig.textColor,
							border: '1px solid',
						}}>
						<categoryConfig.icon className='h-2 w-2' />
						{categoryConfig.label}
					</div>
				)} */}

				{/* In Collection / Purchased Badge - Only show in journal view when applicable */}
				{viewMode === 'journal' && (isShoe ? entry.in_collection : entry.is_purchased) && (
					<div
						className='absolute  top-2 left-2 z-40 px-2 py-1 rounded-md text-xs font-semibold shadow-sm flex items-center gap-1'
						style={{
							backgroundColor: isShoe ? 'var(--color-primary-500)' : 'var(--color-green-500)',
							color: 'var(--color-black)',
						}}>
						{isShoe ? (
							<>
								<Heart className='h-2 w-2 fill-current' />
								In Collection
							</>
						) : (
							<>
								<ShoppingBag className='h-2 w-2' />
								Purchased
							</>
						)}
					</div>
				)}

				{/* Archived Badge - Show when archived but not in archive view */}
				{entry.is_archived && viewMode !== 'archive' && (
					<div
						className='absolute top-2 left-2 z-40 px-2 py-1 rounded-md text-xs font-semibold shadow-sm flex items-center gap-1'
						style={{
							backgroundColor: 'var(--color-gray-200)',
							color: 'var(--color-gray-700)',
						}}>
						<Archive className='h-2 w-2' />
						Archived
					</div>
				)}

				{/* Image Section */}
				{photos.length > 0 ? (
					<div className='relative w-full overflow-hidden'>
						<div className='relative w-full aspect-[4/3] flex items-center justify-center p-2 sm:p-4 lg:p-5 transition-all duration-200 card-image-container'>
							{photos.length === 1 ? (
								<img
									src={photos[0].image_url}
									alt={`${entry.brand} ${entry.model}${
										entry.color !== "Standard" ? ` in ${entry.color}` : ""
									}`}
									className='w-full h-full object-contain'
                  loading="lazy"
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
					<div className='relative w-full overflow-hidden'>
						<div className='w-full aspect-[4/3] flex items-center justify-center transition-all duration-200 card-image-container'>
							<ImageIcon className='h-12 w-12 text-gray-300' />
						</div>
					</div>
				)}

				{/* Content Section */}
				<CardContent className='flex-1 p-4 sm:p-3 flex flex-col gap-2 sm:gap-3 md:border-l md:border-gray-200'>
					{/* Brand */}
					<div className='text-[10px] font-semibold uppercase tracking-widest text-gray-500'>
						{entry.brand}
					</div>

					{/* Title */}
					<h3 className='text-base sm:text-lg font-bold leading-tight line-clamp-2'>
						{entry.model}
						{entry.color !== "Standard" && (
							<span className='block text-sm font-normal text-gray-600 mt-1'>
								{entry.color}
							</span>
						)}
					</h3>

					{/* Metadata Grid */}

					<div className='flex flex-col gap-2 mt-2'>
						<div className='flex items-center gap-2 text-xs flex-wrap'>
							{entry.size_tried && (
								<>
									<span className='badge-size-highlight'>
										{viewMode === 'collection' ? 'Size' : 'Ideal Size'}: {entry.size_tried}
									</span>
									{(fitInfo || entry.comfort_rating) && (
										<span className='hidden sm:inline text-gray-300 mx-0.5'>
											|
										</span>
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
										<span className='hidden sm:inline text-gray-300 mx-0.5'>
											|
										</span>
									)}
								</>
							)}

							{entry.comfort_rating && (
								<div className='flex items-center gap-1'>
									<span className='text-gray-500'>Comfort:</span>
									<span>{getComfortStars(entry.comfort_rating)}</span>
								</div>
							)}

							{/* Wear Counter - Collection Mode Only (shoes only) */}
							{viewMode === 'collection' && canTrack && onIncrementWear && onDecrementWear && (
								<>
									{(fitInfo || entry.comfort_rating) && (
										<span className='hidden sm:inline text-gray-300 mx-0.5'>
											|
										</span>
									)}
									<div className='flex items-center gap-1.5'>
										<span className='text-gray-500 text-xs'>Wears:</span>

										{/* Decrement Button */}
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													onClick={() => onDecrementWear(entry)}
													disabled={!entry.wears || entry.wears === 0}
													className='h-5 w-5 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed'
													type='button'
													aria-label='Subtract one wear'>
													<Minus className='h-3 w-3' style={{ color: 'var(--color-gray-600)' }} />
												</button>
											</TooltipTrigger>
											<TooltipContent side="top" className="z-[9999]">
												<p>Subtract wear (-1)</p>
											</TooltipContent>
										</Tooltip>

										{/* Count Display */}
										<span className='font-bold text-sm' style={{ color: 'var(--color-black-soft)' }}>
											{entry.wears || 0}
										</span>

										{/* Increment Button */}
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													onClick={() => onIncrementWear(entry)}
													className='h-5 w-5 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95'
													style={{
														backgroundColor: 'var(--color-green-500)',
														color: 'white'
													}}
													type='button'
													aria-label='Add one wear'>
													<Plus className='h-3 w-3' />
												</button>
											</TooltipTrigger>
											<TooltipContent side="top" className="z-[9999]">
												<p>Add wear (+1)</p>
											</TooltipContent>
										</Tooltip>

										{/* Cost Per Wear */}
										<span className='text-gray-300 mx-1'>•</span>
										<Tooltip>
											<TooltipTrigger asChild>
												<span
													className='text-xs font-medium cursor-help'
													style={{ color: 'var(--color-gray-600)' }}
												>
													${calculateCostPerWear(entry.purchase_price, entry.retail_price, entry.wears)}/wear
												</span>
											</TooltipTrigger>
											<TooltipContent side="top" className="z-[9999]">
												<p className="text-xs">
													{entry.purchase_price || entry.retail_price
														? `$${entry.purchase_price || entry.retail_price} ÷ ${entry.wears || 0} wears`
														: 'Set a price to calculate cost per wear'}
												</p>
											</TooltipContent>
										</Tooltip>
									</div>
								</>
							)}
						</div>

						{/* Divider line */}
						{(entry.retail_price || entry.store_name) && (
							<div className='metadata-divider'></div>
						)}

						{/* Row 2: Secondary metadata */}
						<div className='flex items-center gap-2 text-xs flex-wrap text-gray-600'>
							{entry.retail_price && (
								<>
									<div className='flex items-center gap-1'>
										<DollarSign className='h-3.5 w-3.5 text-gray-400' />
										<span className='font-medium'>${entry.retail_price}</span>
									</div>
									{(entry.store_name || entry.try_on_date) && (
										<span className='hidden sm:inline text-gray-300 mx-0.5'>
											|
										</span>
									)}
								</>
							)}

							{entry.store_name && (
								<>
									<div className='flex items-center gap-1'>
										<MapPin className='h-2.5 w-2.5 text-gray-400' />
										<span className='truncate max-w-[160px] sm:max-w-[200px]'>
											{entry.store_name}
										</span>
									</div>
									<span className='hidden sm:inline text-gray-300 mx-0.5'>
										|
									</span>
								</>
							)}

							<div className='flex items-center gap-1'>
								<Calendar className='h-2.5 w-2.5 text-gray-400' />
								<span>{formatDate(entry.try_on_date)}</span>
							</div>

							{/* Last Worn Date - Collection Mode Only (shoes only) */}
							{viewMode === 'collection' && canTrack && entry.last_worn_date && (
								<>
									<span className='hidden sm:inline text-gray-300 mx-0.5'>
										|
									</span>
									<div className='flex items-center gap-1'>
										<Calendar className='h-2.5 w-2.5 text-gray-400' />
										<span className='text-xs'>Last worn: {formatDate(entry.last_worn_date)}</span>
									</div>
								</>
							)}
						</div>
					</div>

					{/* Notes */}
					{entry.notes ? (
						<div className='mt-2 sm:mt-3 p-2.5 sm:p-2 bg-gray-50/50 rounded-lg text-xs text-gray-600 line-clamp-3 leading-relaxed'>
							{entry.notes}
						</div>
					):<div className="mt-2 sm:mt-3 p-2.5 sm:p-2 bg-gray-50/50 rounded-lg text-xs text-gray-300 line-clamp-3 leading-relaxed italic"> No notes added.</div>}

					{/* Footer */}
					<div className='flex items-center gap-2 flex-wrap mt-auto pt-3 border-t border-gray-100'>
						<Badge variant='outline' className='text-[11px] sm:text-xs'>
							{entry.user_name}
						</Badge>


				

						{/* Tried On/Not Tried Badge - Only show in journal view */}
						{viewMode === 'journal' && (
							<Badge
							
								variant='outline'
									
							className={isTried ? "badge-tried" : "badge-not-tried"}>
								{isTried ? "Tried On" : "Didnt Try"}
							</Badge>
						)}

						{categoryConfig && (
					<Badge
					
						variant='outline'
									className='text-[11px] sm:text-xs'
						
						style={{
							backgroundColor: categoryConfig.bgColor,
							borderColor: categoryConfig.borderColor,
							color: categoryConfig.textColor,
							border: '1px solid',
						}}>
						<categoryConfig.icon className='h-2 w-2 mr-1' />
						{categoryConfig.label}
					</Badge>
				)}

						{/* Archive Metadata - Only show in archive view */}
						{viewMode === 'archive' && entry.archive_reason && (
							<>
								<Badge
									variant='outline'
									className='text-[11px] sm:text-xs'
									style={{
										borderColor: 'var(--color-gray-300)',
										backgroundColor: 'var(--color-gray-50)',
										color: 'var(--color-gray-700)',
									}}
								>
									{formatArchiveReason(entry.archive_reason)}
								</Badge>
								{entry.archived_at && (
									<span className='text-xs' style={{ color: 'var(--color-gray-500)' }}>
										{formatDate(entry.archived_at)}
									</span>
								)}
							</>
						)}

						{/* {entry.would_recommend && isTried && (
              <ThumbsUp className="h-3 w-3 text-green-600" />
            )} */}
					</div>
				</CardContent>
			</div>
		</Card>
		</TooltipProvider>
	);
}

// Helper functions
function getFitRatingInfo(rating: number | null) {
	if (!rating) return null;
	return FIT_RATINGS.find((r) => r.value === rating) || FIT_RATINGS[2];
}

function getComfortStars(rating: number) {
	return (
		<div className="flex items-center gap-0.5">
			{Array.from({ length: rating }, (_, i) => (
				<Star
					key={i}
					className="h-2 w-2"
					fill="currentColor"
					style={{ color: 'var(--color-primary-500)' }}
				/>
			))}
		</div>
	);
}

function formatDate(dateString: string) {
	return new Date(dateString).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatArchiveReason(reason: string) {
	const reasonMap: Record<string, string> = {
		sold: 'Sold',
		donated: 'Donated',
		worn_out: 'Worn Out',
		other: 'Other',
	};
	return reasonMap[reason] || reason;
}

function calculateCostPerWear(
	purchasePrice: number | undefined,
	listPrice: number | undefined,
	wears: number | undefined
): string {
	const price = purchasePrice ?? listPrice;
	if (!price || !wears || wears === 0) return 'N/A';
	return (price / wears).toFixed(2);
}

function preparePhotos(entry: SizingJournalEntry): ItemPhoto[] {
	if (entry.item_photos && entry.item_photos.length > 0) {
		return entry.item_photos;
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
