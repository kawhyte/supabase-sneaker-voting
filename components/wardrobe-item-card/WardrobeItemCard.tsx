/**
 * WardrobeItemCard - Main orchestrator component
 *
 * Composes all sub-components to display a wardrobe item card
 * with context-aware content based on viewMode and density
 *
 * Memoized for performance optimization in large grids.
 *
 * Former name: SizingJournalEntryCard (renamed for clarity)
 * Lines: ~120 (vs 719 in original)
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Archive } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { SizingJournalEntry } from "@/components/types/sizing-journal-entry";
import { prepareItemPhotos, isItemOnSale, formatDate } from "@/lib/wardrobe-item-utils";
import { useItemDisplayLogic } from "@/hooks/useItemDisplayLogic";
import { useItemPermissions } from "@/hooks/useItemPermissions";
import { useDensity } from "@/lib/view-density-context";
import { memo } from "react";
import { ItemCardActions } from "./ItemCardActions";
import { ItemCardImage } from "./ItemCardImage";
import { ItemPricingDisplay } from "./ItemPricingDisplay";
import { ItemSizeComfortWears } from "./ItemSizeComfortWears";
import { ItemStoreAndDate } from "./ItemStoreAndDate";
import { ItemFooterBadges } from "./ItemFooterBadges";
import { CostPerWearProgress } from "./CostPerWearProgress";

/**
 * Props for WardrobeItemCard component
 *
 * @property item - The wardrobe item to display
 * @property viewMode - Controls what content is shown:
 *   - 'journal': Shows "Tried On" / "Didn't Try" badge
 *   - 'collection': Shows wear counter and last worn date
 *   - 'archive': Shows archive reason, restricted actions
 *   - 'wishlist': Shows pricing info
 * @property actions - All callback functions grouped together
 * @property permissions - Derived permissions (if not provided, computed from category)
 * @property isArchivePage - Whether displaying on archive page (affects actions/display)
 */
interface WardrobeItemCardProps {
	item: SizingJournalEntry;
	viewMode?: 'journal' | 'collection' | 'archive' | 'wishlist';
	actions: {
		onEdit: (item: SizingJournalEntry) => void;
		onDelete: (item: SizingJournalEntry) => void;
		onIncrementWear?: (item: SizingJournalEntry) => void;
		onDecrementWear?: (item: SizingJournalEntry) => void;
		onMoveToWatchlist?: (item: SizingJournalEntry) => void;
		onArchive?: (item: SizingJournalEntry) => void;
		onUnarchive?: (item: SizingJournalEntry) => void;
		onMarkAsPurchased?: (item: SizingJournalEntry) => void;
	};
	isArchivePage?: boolean;
	purchaseDate?: string | null;
}

function WardrobeItemCardComponent({
	item,
	viewMode = 'journal',
	actions,
	isArchivePage = false,
	purchaseDate,
}: WardrobeItemCardProps) {
	// Prepare data
	const itemPhotos = prepareItemPhotos(item);
	const displayLogic = useItemDisplayLogic(item);
	const permissions = useItemPermissions(item.category);
	const { density } = useDensity();

	// Compute display values
	const hasBeenTriedOn = item.has_been_tried;
	const onSale = isItemOnSale(item);
	const purchasedDate = item.purchase_date || purchaseDate;

	// Show metadata based on density
	const showDates = density === 'detailed';
	const showNotes = density !== 'compact';
	const showStore = density !== 'compact';

	return (
		<TooltipProvider delayDuration={300}>
			<Card
				className='overflow-hidden hover-lift-subtle card-interactive transition-all duration-300 group relative rounded-xl w-full min-h-[420px] border border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300 will-change-transform focus-visible:ring-2 focus-visible:ring-sun-400 focus-visible:ring-offset-2'
				tabIndex={0}
				role='article'
				aria-label={`${item.brand} ${item.model}`}>
				<div className='flex flex-col h-full'>
					{/* Actions Menu */}
					<ItemCardActions
						item={item}
						isArchivePage={isArchivePage}
						onEdit={actions.onEdit}
						onDelete={actions.onDelete}
						onUnarchive={actions.onUnarchive}
						onMarkAsPurchased={actions.onMarkAsPurchased}
						onMoveToWatchlist={actions.onMoveToWatchlist}
						onArchive={actions.onArchive}
					/>

					{/* Archived Badge - Show when archived but not in archive view */}
					{item.is_archived && viewMode !== 'archive' && (
						<div className='absolute top-2 left-2 z-40 px-2 py-1 rounded-md text-xs font-semibold shadow-sm flex items-center gap-1 bg-stone-100 text-slate-600'>
							<Archive className='h-2 w-2' />
							Archived
						</div>
					)}

					{/* Image Section */}
					<ItemCardImage
						photos={itemPhotos}
						brand={item.brand}
						model={item.model}
						color={item.color}
						density={density}
					/>

					{/* Content Section */}
					<CardContent className='flex-1 p-4 flex flex-col gap-3 md:border-l md:border-stone-200'>
						{/* Brand - With Logo if Available */}
						<div className='flex items-center gap-2'>
							{item.brands?.brand_logo && (
								<div className='relative w-6 h-6 flex-shrink-0'>
									<img
										src={item.brands.brand_logo}
										alt={item.brands.name || 'Brand logo'}
										className='w-full h-full object-contain'
									/>
								</div>
							)}
							<div className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
								{item.brands?.name || item.brand}
							</div>
						</div>

						{/* Archive Reason - Archive page only */}
						{isArchivePage && item.archive_reason && (
							<div className='text-xs text-muted-foreground flex items-center gap-2'>
								<Archive className='h-3 w-3 text-muted-foreground' />
								<span>Reason: {item.archive_reason}</span>
							</div>
						)}

						{/* Title */}
						<h3 className='text-base sm:text-lg font-semibold leading-tight line-clamp-2 font-heading'>
							{item.model}
							{item.color !== "Standard" && (
								<span className='block text-sm font-normal text-muted-foreground mt-1'>
									{item.color}
								</span>
							)}
						</h3>

						{/* Metadata Grid */}
						<div className='flex flex-col gap-2.5 mt-3'>
							{/* Date Display - Only show in detailed mode */}
							{showDates && (
								<div className='text-sm text-muted-foreground flex items-center gap-1'>
									{displayLogic.isOwned && purchasedDate ? (
										<span>Purchased on: {formatDate(purchasedDate)}</span>
									) : (
										<span>Tracked since: {formatDate(item.created_at)}</span>
									)}
								</div>
							)}

							{/* Pricing */}
							<ItemPricingDisplay
								item={item}
								isOwned={displayLogic.isOwned}
								isOnSale={displayLogic.isOnSale}
							/>

							{/* Size, Comfort, Wears */}
							<ItemSizeComfortWears
								item={item}
								viewMode={viewMode}
								canTrackWears={permissions.canTrackWearCount}
								onIncrementWear={actions.onIncrementWear}
								onDecrementWear={actions.onDecrementWear}
							/>

							{/* Store and Last Worn - Only show if not compact */}
							{showStore && (
								<ItemStoreAndDate
									storeName={item.store_name}
									lastWornDate={item.last_worn_date}
									viewMode={viewMode}
									canTrackWears={permissions.canTrackWearCount}
								/>
							)}

						{/* Cost Per Wear Progress - Only show for owned items in collection/archive views */}
						{/* {displayLogic.isOwned && (viewMode === 'collection' || viewMode === 'archive') && (
							<div className='mt-2'>
								<CostPerWearProgress item={item} />jj
							</div>
						)} */}
						</div>

						{/* Notes - Only show if not compact and has meaningful content */}
						{showNotes && item.notes && item.notes.trim() && item.notes.toLowerCase() !== 'no note added' && (
							<Tooltip delayDuration={300}>
								<TooltipTrigger asChild>
									<div className='mt-3 p-2.5 bg-stone-50 rounded-lg text-sm text-muted-foreground line-clamp-3 leading-relaxed cursor-help transition-colors hover:bg-stone-100'>
										{item.notes}
									</div>
								</TooltipTrigger>
								<TooltipContent side="top" className="max-w-xs">
									<p className="text-sm">{item.notes}</p>
								</TooltipContent>
							</Tooltip>
						)}

						{/* Status Badges - Below notes, above footer */}
						<div className='flex items-center gap-2 flex-wrap mt-3'>
							{/* Tried On / Didn't Try Badge - Journal View Only */}
							{viewMode === 'journal' && (
								<span className='inline-flex items-center justify-center text-xs px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 transition-all duration-200'>
									{hasBeenTriedOn ? "Tried On" : "Didn't Try"}
								</span>
							)}

							{/* Archive Metadata - Archive View Only */}
							{viewMode === 'archive' && item.archive_reason && (
								<>
									<span className='inline-flex items-center text-xs px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 transition-all duration-200'>
										{item.archive_reason === 'sold' ? 'Sold' :
										 item.archive_reason === 'donated' ? 'Donated' :
										 item.archive_reason === 'worn_out' ? 'Worn Out' :
										 'Other'}
									</span>
									{item.archived_at && (
										<span className='text-xs text-muted-foreground transition-all duration-200'>
											{new Date(item.archived_at).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
										</span>
									)}
								</>
							)}
						</div>

						{/* Footer - Cost Per Wear Button */}
						<div className='flex items-center gap-2 flex-wrap mt-auto pt-4 border-t border-stone-200'>
							<ItemFooterBadges
								item={item}
								viewMode={viewMode}
								canTrackWears={permissions.canTrackWearCount}
								onIncrementWear={actions.onIncrementWear}
								onDecrementWear={actions.onDecrementWear}
							/>
						</div>
					</CardContent>
				</div>
			</Card>
		</TooltipProvider>
	);
}

/**
 * Memoized WardrobeItemCard - prevents unnecessary re-renders when grid density changes
 * or sibling cards update, improving performance with large collections
 */
export const WardrobeItemCard = memo(WardrobeItemCardComponent);
