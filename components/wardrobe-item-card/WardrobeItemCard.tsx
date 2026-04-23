/**
 * WardrobeItemCard - Main orchestrator component
 *
 * Composes all sub-components to display a wardrobe item card
 * with context-aware content based on viewMode and density
 *
 * Memoized for performance optimization in large grids.
 *
 * Former name: WardrobeItemCard (renamed for clarity)
 * Lines: ~120 (vs 719 in original)
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Pin } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { WardrobeItem } from '@/components/types/WardrobeItem';
import { prepareItemPhotos, formatDate } from "@/lib/wardrobe-item-utils";
import { useItemDisplayLogic } from "@/hooks/useItemDisplayLogic";
import { useItemPermissions } from "@/hooks/useItemPermissions";
import { useDensity } from "@/lib/view-density-context";
import { memo, useState } from "react";
import { ItemCardActions } from "./WardrobeItemActions";
import { ItemCardImage } from "./WardrobeItemImage";
import { ItemPricingDisplay } from "./WardrobeItemPricing";
import { ItemFooterBadges } from "./WardrobeItemFooter";
import { WishlistDetailsDrawer } from "./WishlistDetailsDrawer";

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
	item: WardrobeItem;
	viewMode?: 'journal' | 'collection' | 'archive' | 'wishlist';
	actions: {
		onEdit: (item: WardrobeItem) => void;
		onDelete: (item: WardrobeItem) => void;
		onIncrementWear?: (item: WardrobeItem) => void;
		onDecrementWear?: (item: WardrobeItem) => void;
		onMoveToWishlist?: (item: WardrobeItem) => void;
		onArchive?: (item: WardrobeItem) => void;
		onUnarchive?: (item: WardrobeItem) => void;
		onMarkAsPurchased?: (item: WardrobeItem) => void;
		onRefreshPrice?: (itemId: string) => Promise<void>;
		onManualEntrySuccess?: () => void;
		onTogglePinned?: (item: WardrobeItem) => void; // Toggle pinned status (featured items)
	};
	isArchivePage?: boolean;
	isReadOnly?: boolean; // NEW: If true, viewing someone else's item (hide edit/delete)
	purchaseDate?: string | null;
	userWardrobe?: WardrobeItem[];
}

function WardrobeItemCardComponent({
	item,
	viewMode = 'journal',
	actions,
	isArchivePage = false,
	isReadOnly = false,
	userWardrobe = [],
}: WardrobeItemCardProps) {
	// Drawer state for wishlist items
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	// Prepare data
	const itemPhotos = prepareItemPhotos(item);
	const displayLogic = useItemDisplayLogic(item);
	const permissions = useItemPermissions(item.category);
	const { density } = useDensity();

	// Compute display values
	const hasBeenTriedOn = item.has_been_tried;

	// Public view: Hide personal info (dates, notes, store, size, wears)
	const isPublicView = isReadOnly && viewMode === 'wishlist';
	const showNotes = density !== 'list' && !isPublicView && viewMode !== 'wishlist';

	return (
		<TooltipProvider delayDuration={300}>
			<Card
				className='overflow-hidden hover-lift-subtle card-interactive transition-all duration-300 group relative rounded-xl w-full min-h-[420px] will-change-transform focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
				tabIndex={0}
				role='article'
				aria-label={`${item.brand} ${item.model}`}>
				<div className='flex flex-col h-full'>
					{/* Actions Menu */}
					<ItemCardActions
						item={item}
						isArchivePage={isArchivePage}
						isReadOnly={isReadOnly}
						onEdit={actions.onEdit}
						onDelete={actions.onDelete}
						onUnarchive={actions.onUnarchive}
						onMarkAsPurchased={actions.onMarkAsPurchased}
						onMoveToWishlist={actions.onMoveToWishlist}
						onArchive={actions.onArchive}
						onTogglePinned={actions.onTogglePinned}
					/>

					{/* Pin Button — always visible when not archived and toggle is available */}
					{!isReadOnly && !item.is_archived && actions.onTogglePinned && (
						<button
							className={`absolute top-2 left-2 p-1.5 rounded-full transition-all duration-200 z-20 flex items-center justify-center ${
								displayLogic.isPinned
									? 'bg-orange-500 text-white shadow-md'
									: 'bg-white/70 backdrop-blur-sm text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm'
							}`}
							onClick={(e) => { e.preventDefault(); e.stopPropagation(); actions.onTogglePinned!(item); }}
							onMouseEnter={(e) => e.stopPropagation()}
							onMouseLeave={(e) => e.stopPropagation()}
							aria-label={displayLogic.isPinned ? 'Unpin from profile' : 'Pin to profile'}
							title={displayLogic.isPinned ? 'Unpin from profile' : 'Pin to profile'}
						>
							<Pin className='h-3.5 w-3.5' fill={displayLogic.isPinned ? 'currentColor' : 'none'} />
						</button>
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
					<CardContent className='flex-1 p-4 flex flex-col gap-3'>
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
							<span className='font-mono uppercase tracking-[0.1em] text-muted-foreground text-xs'>
								{item.brands?.name || item.brand}
							</span>
							{item.is_archived && viewMode !== 'archive' && (
								<span className='font-mono text-[10px] text-muted-foreground'>· ARCHIVED</span>
							)}
						</div>

						{/* Title */}
						<h3 className='font-sans font-bold text-lg text-foreground leading-tight line-clamp-2'>
							{item.model}
							{item.color !== "Standard" && (
								<span className='block text-sm font-normal text-muted-foreground mt-1'>
									{item.color}
								</span>
							)}
						</h3>

						{/* Metadata Grid */}
						<div className='flex flex-col gap-2.5 mt-1'>
							{/* Pricing - Wishlist only (renders a "View Details" drawer button) */}
							{viewMode === 'wishlist' && !isPublicView && (
								<ItemPricingDisplay
									item={item}
									isOwned={displayLogic.isOwned}
									isOnSale={displayLogic.isOnSale}
									onRefreshPrice={actions.onRefreshPrice}
									onManualEntrySuccess={actions.onManualEntrySuccess}
									isPublicView={isPublicView}
									useDrawer={true}
									onOpenDrawer={() => setIsDrawerOpen(true)}
								/>
							)}

							{/* Last Worn - Collection view only */}
							{item.last_worn_date && viewMode === 'collection' && permissions.canTrackWearCount && (
								<div className='flex items-baseline gap-1.5'>
									<span className='font-mono uppercase tracking-[0.1em] text-xs text-slate-400'>LAST WORN:</span>
									<span className='font-mono text-xs text-slate-700 font-medium'>{formatDate(item.last_worn_date)}</span>
								</div>
							)}
						</div>

						{/* Notes - Only show if not compact and has meaningful content */}
						{showNotes && item.notes && item.notes.trim() && item.notes.toLowerCase() !== 'no note added' && (
							<Tooltip delayDuration={300}>
								<TooltipTrigger asChild>
									<div className='mt-1 p-2.5 bg-slate-50 rounded-lg italic text-sm text-muted-foreground line-clamp-3 leading-relaxed cursor-help transition-colors hover:bg-slate-100'>
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
						{viewMode === 'collection'  && (
						<div className='flex items-center gap-2 flex-wrap mt-auto pt-4 border-t border-slate-100'>
							<ItemFooterBadges
								item={item}
								viewMode={viewMode}
								canTrackWears={permissions.canTrackWearCount}
								onIncrementWear={actions.onIncrementWear}
								onDecrementWear={actions.onDecrementWear}
								userWardrobe={userWardrobe}
							/>
						</div>


						)}
					</CardContent>
				</div>
			</Card>

			{/* Wishlist Details Drawer - Only for wishlist view */}
			{viewMode === 'wishlist' && !isPublicView && (
				<WishlistDetailsDrawer
					item={item}
					isOpen={isDrawerOpen}
					onOpenChange={setIsDrawerOpen}
					onRefreshPrice={actions.onRefreshPrice}
					onManualEntrySuccess={actions.onManualEntrySuccess}
					onMarkAsPurchased={actions.onMarkAsPurchased}
					onArchive={actions.onArchive}
				/>
			)}
		</TooltipProvider>
	);
}

/**
 * Memoized WardrobeItemCard - prevents unnecessary re-renders when grid density changes
 * or sibling cards update, improving performance with large collections
 */
export const WardrobeItemCard = memo(WardrobeItemCardComponent);
