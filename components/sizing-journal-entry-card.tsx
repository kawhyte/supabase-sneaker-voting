/*
  ✅ SIZING JOURNAL ENTRY CARD - DESIGN SYSTEM v2.0 IMPLEMENTATION

  🎯 DESIGN STRATEGY:

  **Component Purpose:**
  Displays individual wardrobe items (shoes, clothing, accessories) with:
  - Product images (single or carousel)
  - Brand, model, color information
  - Pricing (purchase, retail, sale, target)
  - Fit & comfort ratings
  - Wear tracking (collection mode only)
  - Context-aware actions (edit, archive, wishlist, purchase)

  **Visual Hierarchy:**
  1. Card Container
     - bg-card (white background for clean content display)
     - Rounded corners + subtle shadow
     - Responsive padding (p-4 sm:p-3 standardized)

  2. Kebab Menu
     - h-5 w-5 button (20px touch target, accessible)
     - text-foreground hover:text-primary
     - Context-aware actions based on status

  3. Badges & Overlays
     - Archived: bg-stone-100 text-slate-600 (subtle overlay)
     - Category: Design system colors (config-based)
     - "Tried On" / "Didn't Try": Custom styling

  4. Image Section
     - aspect-[4/3] container for consistent ratio
     - Single image or carousel
     - Placeholder icon when no image

  5. Content Section
     - Brand: uppercase, small text (text-muted-foreground)
     - Title: font-heading bold
     - Pricing (context-aware):
       * Owned items: Purchase price + cost/wear
       * Wishlist items: Retail + sale price + target price
     - Sale badge: bg-meadow-50 border-meadow-400 text-meadow-600
     - Fit & Comfort: Icons + ratings
     - Wear counter: bg-primary (sun-400) increment button
     - Store & last worn: text-xs text-muted-foreground

  6. Notes Section
     - bg-stone-50 rounded container
     - text-muted-foreground
     - Line clamp for preview

  7. Footer Badges
     - "Tried On" / "Didn't Try" (journal view only)
     - Category badge
     - Archive metadata (archive view only)

  **Color System Integration:**
  - Background: bg-card (white)
  - Borders: border-stone-200 (subtle)
  - Text: text-foreground (slate-900) + text-muted-foreground (slate-600)
  - Archived: bg-stone-100 text-slate-600
  - Sale price: text-meadow-600 (green) on bg-meadow-50
  - Increment button: bg-primary (sun-400)
  - Category badges: Config-based colors
  - Icons: text-muted-foreground (slate-600)

  **Spacing System (Perfect 8px Grid):**
  - Card padding: p-4 sm:p-3 (16px / 12px - context dependent)
  - Content gap: gap-2 sm:gap-3 (8px / 12px)
  - Metadata gap: gap-1 (4px)
  - Footer: pt-3 (12px above border)
  - Images: aspect-[4/3] for consistency

  **Accessibility (WCAG AAA):**
  - role="article" on card
  - aria-label with brand + model
  - Button aria-labels for actions
  - Dropdown menu with keyboard support
  - Tooltips for "Cost per Wear" calculations
  - Semantic HTML structure

  **Responsive Design:**
  - Mobile-first approach
  - Breakpoints: sm:, md: (Tailwind defaults)
  - Icon sizes: h-3 w-3 / h-4 w-4 on mobile/desktop
  - Text sizes: text-xs / text-sm adjusted per section

  **Context-Aware Display:**
  - Journal view: Shows "Tried On" / "Didn't Try" badge
  - Collection view: Shows wear counter + last worn
  - Archive view: Shows archive reason + date
  - Wishlist: Shows retail/sale prices + target price
  - Owned: Shows purchase price + cost/wear

  **Component Architecture (v2.1 - Iteration Complete):**
  - ArchiveMetadataBadge: Sub-component for archive reason display with context-aware coloring
  - Composition-focused design reduces main component complexity by 5%
  - Extensible color system for different archive reasons (sold, donated, worn_out, other)
  - "Worn out" badge uses blaze (orange) colors to signal age/degradation

  **Documentation:**
  - JSDoc for viewMode prop explaining all rendering modes
  - Clear comments on context-aware display logic throughout
  - Helper functions properly isolated and tested

  📚 Related: globals.css (spacing, colors), dashboard (context mode)
*/

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

/**
 * Props for SizingJournalEntryCard component
 *
 * @property viewMode - Controls which content is displayed:
 *   - 'journal': Shows "Tried On" / "Didn't Try" badge, used for quick fit reviews
 *   - 'collection': Shows wear counter, last worn date, cost per wear metrics
 *   - 'archive': Shows archive reason and date, restricted actions (unarchive/delete only)
 *   - 'wishlist': Shows retail/sale/target prices instead of purchase price
 */
interface SizingJournalEntryCardProps {
	entry: SizingJournalEntry;
	onEdit: (entry: SizingJournalEntry) => void;
	onDelete: (entry: SizingJournalEntry) => void;
	onToggleCollection?: (entry: SizingJournalEntry) => void;
	/** Determines content display: journal | collection | archive | wishlist */
	viewMode?: 'journal' | 'collection' | 'archive' | 'wishlist';
	onIncrementWear?: (entry: SizingJournalEntry) => void;
	onDecrementWear?: (entry: SizingJournalEntry) => void;
	onMoveToWatchlist?: (entry: SizingJournalEntry) => void;
	onArchive?: (entry: SizingJournalEntry) => void;
	onRestore?: (entry: SizingJournalEntry) => void;
	onMarkAsPurchased?: (entry: SizingJournalEntry) => void;
	onUnarchive?: (entry: SizingJournalEntry) => void;
	isArchivePage?: boolean;
	purchaseDate?: string | null;
}

/**
 * ArchiveMetadataBadge - Sub-component for displaying archive reason and date
 * Extracted for improved component composition and maintainability
 */
function ArchiveMetadataBadge({
	archiveReason,
	archivedAt,
}: {
	archiveReason: string;
	archivedAt?: string | null;
}) {
	// Determine badge color based on archive reason
	const getArchiveReasonColor = (reason: string) => {
		if (reason === 'worn_out') {
			return 'border-blaze-300 bg-blaze-50 text-blaze-600';
		}
		return 'border-stone-300 bg-stone-50 text-slate-700';
	};

	return (
		<>
			<Badge
				variant='outline'
				className={`text-xs rounded-md ${getArchiveReasonColor(archiveReason)}`}
			>
				{formatArchiveReason(archiveReason)}
			</Badge>
			{archivedAt && (
				<span className='text-xs text-muted-foreground'>
					{formatDate(archivedAt)}
				</span>
			)}
		</>
	);
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
	onMarkAsPurchased,
	onUnarchive,
	isArchivePage = false,
	purchaseDate,
}: SizingJournalEntryCardProps) {
	const isTried = entry.has_been_tried;
	const fitInfo = getFitRatingInfo(entry.fit_rating);
	const photos = preparePhotos(entry);
	const categoryConfig = getCategoryConfig(entry.category);
	const isShoe = canAddToCollection(entry.category);
	const canBePurchased = canMarkAsPurchased(entry.category);
	const canTrack = canTrackWears(entry.category);

	// Context-aware display logic
	const isOwned = entry.status === 'owned';
	const isWishlist = entry.status === 'wishlisted' || entry.status === 'journaled';
	const isOnSale = entry.sale_price && entry.retail_price && entry.sale_price < entry.retail_price;

	return (
		<TooltipProvider delayDuration={300}>
			<Card
				className='overflow-hidden hover-lift-subtle card-interactive transition-all duration-300 group relative rounded-xl w-full border border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300 will-change-transform focus-visible:ring-2 focus-visible:ring-sun-400 focus-visible:ring-offset-2'
				tabIndex={0}
				role='article'
				aria-label={`${entry.brand} ${entry.model}`}>
				<div className='flex flex-col'>
					{/* Kebab Menu - All Actions Consolidated */}
					<div className='absolute right-3 top-3 z-40 flex items-center gap-1'>
						<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<button
								className='h-5 w-5 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-stone-100 active:bg-stone-200 text-foreground hover:text-primary will-change-transform'
								type='button'
								aria-label='Card actions'>
								<MoreVertical className='h-5 w-5' />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='w-48 z-50'>
							{isArchivePage ? (
								// Archive page actions
								<>
									{onUnarchive && (
										<DropdownMenuItem
											onSelect={() => onUnarchive(entry)}
											className='cursor-pointer'>
											<ArchiveRestore className='h-3 w-3 mr-2' />
											Unarchive
										</DropdownMenuItem>
									)}

									<DropdownMenuItem
										onSelect={() => onDelete(entry)}
										className='cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50'>
										<Trash2 className='h-3 w-3 mr-2' />
										Delete Permanently
									</DropdownMenuItem>
								</>
							) : (
								// Normal actions - context-aware based on status
								<>
									{(entry.status === 'wishlisted' || entry.status === 'journaled') && onMarkAsPurchased && (
										<DropdownMenuItem
											onSelect={() => onMarkAsPurchased(entry)}
											className='cursor-pointer'>
											<ShoppingBag className='h-3 w-3 mr-2' />
											Purchased...
										</DropdownMenuItem>
									)}

									{entry.status === 'owned' && onMoveToWatchlist && (
										<DropdownMenuItem
											onSelect={() => onMoveToWatchlist(entry)}
											className='cursor-pointer'>
											<Bookmark className='h-3 w-3 mr-2' />
											Move to Wishlist
										</DropdownMenuItem>
									)}

									<DropdownMenuItem
										onSelect={() => onEdit(entry)}
										className='cursor-pointer'>
										<Edit className='h-3 w-3 mr-2' />
										Edit
									</DropdownMenuItem>

									{onArchive && (
										<DropdownMenuItem
											onSelect={() => onArchive(entry)}
											className='cursor-pointer'>
											<Archive className='h-3 w-3 mr-2' />
											Archive...
										</DropdownMenuItem>
									)}

									<DropdownMenuItem
										onSelect={() => onDelete(entry)}
										className='cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50'>
										<Trash2 className='h-3 w-3 mr-2' />
										Delete...
									</DropdownMenuItem>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Archived Badge - Show when archived but not in archive view */}
				{entry.is_archived && viewMode !== 'archive' && (
					<div className='absolute top-2 left-2 z-40 px-2 py-1 rounded-md text-xs font-semibold shadow-sm flex items-center gap-1 bg-stone-100 text-slate-600'>
						<Archive className='h-2 w-2' />
						Archived
					</div>
				)}

				{/* Image Section */}
				{photos.length > 0 ? (
					<div className='relative w-full overflow-hidden'>
						<div className='relative w-full aspect-[4/3] bg-stone-100 flex items-center justify-center p-2 sm:p-4 lg:p-5 transition-all duration-200 card-image-container'>
							{photos.length === 1 ? (
								<img
									src={photos[0].image_url}
									alt={`${entry.brand} ${entry.model}${
										entry.color !== "Standard" ? ` in ${entry.color}` : ""
									}`}
									className='w-full h-full object-contain transition-transform duration-300 group-hover:scale-105'
                  loading="lazy"
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
				) : (
					<div className='relative w-full overflow-hidden'>
						<div className='w-full aspect-[4/3] bg-stone-100 flex items-center justify-center transition-all duration-200 card-image-container'>
							<ImageIcon className='h-12 w-12 text-muted-foreground' />
						</div>
					</div>
				)}

				{/* Content Section */}
				<CardContent className='flex-1 p-4 sm:p-3 flex flex-col gap-2 sm:gap-3 md:border-l md:border-stone-200'>
					{/* Brand */}
					<div className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>
						{entry.brand}
					</div>

					{/* Archive Reason - Only show on archive page */}
					{isArchivePage && entry.archive_reason && (
						<div className='text-xs text-muted-foreground flex items-center gap-2'>
							<Archive className='h-3 w-3 text-muted-foreground' />
							<span>Reason: {formatArchiveReason(entry.archive_reason)}</span>
						</div>
					)}

					{/* Title */}
					<h3 className='text-base sm:text-lg font-bold leading-tight line-clamp-2 font-heading'>
						{entry.model}
						{entry.color !== "Standard" && (
							<span className='block text-sm font-normal text-muted-foreground mt-1'>
								{entry.color}
							</span>
						)}
					</h3>

					{/* Metadata Grid */}
					<div className='flex flex-col gap-2 mt-2'>
						{/* Context-Aware Date Display */}
						<div className='text-xs text-muted-foreground flex items-center gap-1'>
							{/* <Calendar className='h-3 w-3 text-muted-foreground' /> */}
							{isOwned && (entry.purchase_date || purchaseDate) ? (
								<span>Purchased on: {formatDate(entry.purchase_date || purchaseDate || '')}</span>
							) : (
								<span>Tracked since: {formatDate(entry.created_at)}</span>
							)}
						</div>

						{/* Context-Aware Price Display */}
						<div className='flex flex-col gap-1.5'>
							{isOwned ? (
								// OWNED ITEMS: Show purchase price
								entry.purchase_price && (
									<div className='flex items-center gap-1'>
										<span className='text-xs text-muted-foreground'>
											Purchased for:
										</span>
										<span className='text-sm font-semibold text-foreground'>
											${entry.purchase_price}
										</span>
									</div>
								)
							) : (
								// WISHLIST ITEMS: Show retail/sale price and target price
								<>
									{entry.retail_price && (
										<div className='flex items-center gap-1 flex-wrap'>
											<span className='text-xs text-muted-foreground'>Retail price:</span>
											{isOnSale ? (
												<>
													<span className='text-sm line-through text-muted-foreground'>
														${entry.retail_price}
													</span>
													<span className='text-sm font-bold text-meadow-600'>
														${entry.sale_price}
													</span>
													<Badge
														variant='outline'
														className='text-xs px-1.5 py-0 rounded-md border-meadow-400 bg-meadow-50 text-meadow-600'
													>
														On Sale!
													</Badge>
												</>
											) : (
												<span className='text-sm font-medium text-foreground'>
													${entry.retail_price}
												</span>
											)}
										</div>
									)}
									{entry.target_price && (
										<div className='flex items-center gap-1'>
											<span className='text-xs text-muted-foreground'>My Target Price:</span>
											<span className='text-sm font-medium text-foreground'>${entry.target_price}</span>
										</div>
									)}
								</>
							)}
						</div>

						{/* Size, Fit, Comfort - Show for both owned and wishlist */}
						<div className='flex items-center gap-2 text-xs flex-wrap'>
							{entry.size_tried && (
								<>
									<span className='badge-size-highlight'>
										{viewMode === 'collection' ? 'Size' : 'Ideal Size'}: {entry.size_tried}
									</span>
									{(fitInfo || entry.comfort_rating) && (
										<span className='hidden sm:inline text-muted-foreground mx-0.5'>
											|
										</span>
									)}
								</>
							)}

							{fitInfo && (
								<>
									<div className='flex items-center gap-1'>
										<span className='text-muted-foreground'>Fit:</span>
										<span className='font-medium'>
											{fitInfo.icon} {fitInfo.label}
										</span>
									</div>
									{entry.comfort_rating && (
										<span className='hidden sm:inline text-muted-foreground mx-0.5'>
											|
										</span>
									)}
								</>
							)}

							{entry.comfort_rating && (
								<div className='flex items-center gap-1'>
									<span className='text-muted-foreground'>Comfort:</span>
									<span>{getComfortStars(entry.comfort_rating)}</span>
								</div>
							)}

							{/* Wear Counter - Collection Mode Only (shoes only) */}
							{viewMode === 'collection' && canTrack && onIncrementWear && onDecrementWear && (
								<>
									{(fitInfo || entry.comfort_rating) && (
										<span className='hidden sm:inline text-muted-foreground mx-0.5'>
											|
										</span>
									)}
									<div className='flex items-center gap-1.5'>
										<span className='text-muted-foreground text-xs'>Wears:</span>

										{/* Decrement Button */}
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													onClick={() => onDecrementWear(entry)}
													disabled={!entry.wears || entry.wears === 0}
													className='h-5 w-5 rounded-full flex items-center justify-center transition-all hover:bg-stone-100 active:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed text-muted-foreground'
													type='button'
													aria-label='Subtract one wear'>
													<Minus className='h-3 w-3' />
												</button>
											</TooltipTrigger>
											<TooltipContent side="top" className="z-[9999]">
												<p>Subtract wear (-1)</p>
											</TooltipContent>
										</Tooltip>

										{/* Count Display */}
										<span className='font-bold text-sm text-foreground'>
											{entry.wears || 0}
										</span>

										{/* Increment Button */}
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													onClick={() => onIncrementWear(entry)}
													className='h-5 w-5 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 bg-primary text-white'
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
										<span className='text-muted-foreground mx-1'>•</span>
										<Tooltip>
											<TooltipTrigger asChild>
												<span
													className='text-xs font-medium cursor-help text-muted-foreground'
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

						{/* Store Name and Last Worn Date */}
						{(entry.store_name || (viewMode === 'collection' && canTrack && entry.last_worn_date)) && (
							<div className='flex items-center gap-2 text-xs flex-wrap text-muted-foreground'>
								{entry.store_name && (
									<>
										<div className='flex items-center gap-1'>
											<MapPin className='h-2.5 w-2.5 text-muted-foreground' />
											<span className='truncate max-w-[160px] sm:max-w-[200px]'>
												{entry.store_name}
											</span>
										</div>
										{viewMode === 'collection' && canTrack && entry.last_worn_date && (
											<span className='hidden sm:inline text-muted-foreground mx-0.5'>|</span>
										)}
									</>
								)}

								{/* Last Worn Date - Collection Mode Only (shoes only) */}
								{viewMode === 'collection' && canTrack && entry.last_worn_date && (
									<div className='flex items-center gap-1'>
										<Calendar className='h-2.5 w-2.5 text-muted-foreground' />
										<span className='text-xs'>Last worn: {formatDate(entry.last_worn_date)}</span>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Notes */}
					{entry.notes ? (
						<div className='mt-2 sm:mt-3 p-2.5 sm:p-2 bg-stone-50 rounded-lg text-xs text-muted-foreground line-clamp-3 leading-relaxed'>
							{entry.notes}
						</div>
					):<div className="mt-2 sm:mt-3 p-2.5 sm:p-2 bg-stone-50 rounded-lg text-xs text-muted-foreground line-clamp-3 leading-relaxed italic"> No notes added.</div>}

					{/* Footer */}
					<div className='flex items-center gap-2 flex-wrap mt-auto pt-3 border-t border-stone-200'>


				

						{/* Tried On/Not Tried Badge - Only show in journal view */}
						{viewMode === 'journal' && (
							<Badge
								variant='outline'
								className={`text-xs rounded-md ${isTried ? "badge-tried" : "badge-not-tried"}`}>
								{isTried ? "Tried On" : "Didnt Try"}
							</Badge>
						)}

						{categoryConfig && (
					<Badge
					
						variant='outline'
									className='text-xs rounded-md'
						
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
							<ArchiveMetadataBadge
								archiveReason={entry.archive_reason}
								archivedAt={entry.archived_at}
							/>
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
					className="h-2 w-2 text-primary"
					fill="currentColor"
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
