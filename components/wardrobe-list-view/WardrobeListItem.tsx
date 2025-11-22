/**
 * WardrobeListItem - Individual row in list view
 *
 * Displays a horizontal row with essential item information:
 * - Thumbnail (96x96 desktop, 80x80 tablet, 64x64 mobile)
 * - Brand + Model
 * - Size
 * - Price (purchase for owned, retail/sale for wishlist)
 * - Status badges (wishlist, owned, pinned)
 * - Actions menu
 *
 * Click row to expand inline and show:
 * - Color, Category, Wear count
 * - Notes (if any)
 * - Full pricing details
 * - Purchase date / tracking info
 *
 * Industry standard: Gmail, Notion, Linear, GitHub Issues
 */

"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Pin, Archive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { WardrobeItem } from "@/components/types/WardrobeItem";
import { prepareItemPhotos, formatDate } from "@/lib/wardrobe-item-utils";
import { useItemDisplayLogic } from "@/hooks/useItemDisplayLogic";
import { useItemPermissions } from "@/hooks/useItemPermissions";
import { ItemCardActions } from "../wardrobe-item-card/WardrobeItemActions";
import { PriceStatusBadge } from "../wardrobe-item-card/PriceStatusBadge";
import { CATEGORY_CONFIGS } from "@/components/types/item-category";

interface WardrobeListItemProps {
	item: WardrobeItem;
	viewMode?: "journal" | "collection" | "archive" | "wishlist";
	actions: {
		onEdit: (item: WardrobeItem) => void;
		onDelete: (item: WardrobeItem) => void;
		onIncrementWear?: (item: WardrobeItem) => void;
		onDecrementWear?: (item: WardrobeItem) => void;
		onMoveToWatchlist?: (item: WardrobeItem) => void;
		onArchive?: (item: WardrobeItem) => void;
		onUnarchive?: (item: WardrobeItem) => void;
		onMarkAsPurchased?: (item: WardrobeItem) => void;
		onCreateOutfit?: (item: WardrobeItem) => void;
		onRefreshPrice?: (itemId: string) => Promise<void>;
		onManualEntrySuccess?: () => void;
		onTogglePinned?: (item: WardrobeItem) => void;
	};
	isArchivePage?: boolean;
	isReadOnly?: boolean;
	purchaseDate?: string | null;
}

export function WardrobeListItem({
	item,
	viewMode = "journal",
	actions,
	isArchivePage = false,
	isReadOnly = false,
	purchaseDate,
}: WardrobeListItemProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	// Prepare data
	const itemPhotos = prepareItemPhotos(item);
	const displayLogic = useItemDisplayLogic(item);
	const permissions = useItemPermissions(item.category);
	const purchasedDate = item.purchase_date || purchaseDate;

	// Get main image with fallback to placeholder
	const mainImage = itemPhotos[0]?.image_url || "/images/placeholder.svg";

	// Get category config for icon (fallback to accessories if category not found)
	const categoryConfig = CATEGORY_CONFIGS[item.category as keyof typeof CATEGORY_CONFIGS] || CATEGORY_CONFIGS.accessories;
	const CategoryIcon = categoryConfig.icon;

	// Format price display
	const getPriceDisplay = () => {
		if (displayLogic.isOwned) {
			if (item.purchase_price) return `$${item.purchase_price}`;
			return "—";
		}
		// Wishlist
		if (displayLogic.isOnSale && item.sale_price) {
			return `$${item.sale_price}`;
		}
		if (item.retail_price) return `$${item.retail_price}`;
		return "—";
	};

	// Handle row click (expand/collapse) - but don't trigger on action menu clicks
	const handleRowClick = (e: React.MouseEvent) => {
		// Don't expand if clicking on buttons or links
		const target = e.target as HTMLElement;
		if (
			target.closest("button") ||
			target.closest("a") ||
			target.closest('[role="menu"]')
		) {
			return;
		}
		setIsExpanded(!isExpanded);
	};

	return (
		<div className="border-b border-stone-200 hover:bg-stone-50/50 transition-colors">
			{/* Main Row */}
			<div
				className="flex items-center gap-3 p-4 cursor-pointer"
				onClick={handleRowClick}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						setIsExpanded(!isExpanded);
					}
				}}
				aria-expanded={isExpanded}
				aria-label={`${item.brand} ${item.model} - Click to ${isExpanded ? "collapse" : "expand"} details`}
			>
				{/* Expand Icon - Fixed width */}
				<div className="flex-shrink-0 w-5 text-muted-foreground">
					{isExpanded ? (
						<ChevronDown className="h-5 w-5" />
					) : (
						<ChevronRight className="h-5 w-5" />
					)}
				</div>

				{/* Thumbnail - Fixed width */}
				<div className="flex-shrink-0 w-16 lg:w-20">
					<div className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 relative">
						<img
							src={mainImage}
							alt={`${item.brand} ${item.model}`}
							className="w-full h-full object-cover"
							onError={(e) => {
								e.currentTarget.src = '/images/placeholder.svg';
							}}
						/>
						{/* Pinned indicator - left side */}
						{!isReadOnly && displayLogic.isPinned && !item.is_archived && (
							<div
								className="absolute top-1 left-1 bg-sun-400 text-sun-900 rounded-full p-1 shadow-sm"
								title="Pinned"
								aria-label="This item is pinned"
							>
								<Pin className="h-3 w-3" />
							</div>
						)}
						{/* Photo count indicator - right side */}
						{itemPhotos.length > 1 && (
							<div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
								{itemPhotos.length}
							</div>
						)}
					</div>
				</div>

				{/* Brand + Model - Fixed width with truncation */}
				<div className="flex-1 min-w-0 max-w-[550px]">
					<div className="flex items-center gap-2">
						{item.brands?.brand_logo && (
							<div className="relative w-5 h-5 flex-shrink-0">
								<img
									src={item.brands.brand_logo}
									alt={item.brands.name || "Brand logo"}
									className="w-full h-full object-contain"
								/>
							</div>
						)}
						<div className="flex flex-col min-w-0">
							<div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground truncate">
								{item.brands?.name || item.brand}
							</div>
							<h3 className="text-base font-semibold leading-tight line-clamp-1">
								{item.model}
							</h3>
						</div>
					</div>
				</div>

				{/* Size - Fixed width, centered */}
				<div className="hidden md:flex flex-shrink-0 w-20 text-start ">
					<span className="text-sm font-medium">
						{item.size_tried || "—"}
					</span>
				</div>

				{/* Price - Fixed width, right-aligned */}
				<div className="hidden sm:flex flex-shrink-0 w-48 flex-col text-right gap-1">
					<span className="text-base font-semibold">{getPriceDisplay()}</span>
					{/* Horizontal layout: strikethrough + Sale badge */}
					{displayLogic.isOnSale && item.retail_price && (
						<div className="flex items-center justify-end gap-2">
							<span className="text-xs text-muted-foreground line-through">
								${item.retail_price}
							</span>
							<Badge
								variant="outline"
								className="text-xs px-2 py-0.5 rounded-md border-meadow-400 bg-meadow-50 text-meadow-600"
							>
								Sale
							</Badge>
						</div>
					)}
				</div>

				{/* Status Badges - Fixed width */}
				<div className="hidden lg:flex items-center gap-2 flex-shrink-0 w-[300px] ml-12">
					{/* Archived Badge */}
					{item.is_archived && viewMode !== "archive" && (
						<Badge
							variant="outline"
							className="text-xs px-2 py-0.5 rounded-md border-stone-300 bg-stone-100 text-stone-700"
						>
							<Archive className="h-3 w-3 mr-1" />
							Archived
						</Badge>
					)}

					{/* Price Tracking Badge - Wishlist only */}
					{viewMode === "wishlist" && !isReadOnly && (
						<PriceStatusBadge
							lastPriceCheckAt={item.last_price_check_at ?? null}
							isAutoTrackingEnabled={item.auto_price_tracking_enabled ?? true}
							priceCheckFailures={item.price_check_failures ?? 0}
						/>
					)}
				</div>

				{/* Actions Menu - Click won't trigger expansion */}
				<div className="flex-shrink-0 w-8 ml-4 flex justify-end" onClick={(e) => e.stopPropagation()}>
					<ItemCardActions
						item={item}
						isArchivePage={isArchivePage}
						isReadOnly={isReadOnly}
						variant="list"
						onEdit={actions.onEdit}
						onDelete={actions.onDelete}
						onUnarchive={actions.onUnarchive}
						onMarkAsPurchased={actions.onMarkAsPurchased}
						onMoveToWatchlist={actions.onMoveToWatchlist}
						onArchive={actions.onArchive}
						onTogglePinned={actions.onTogglePinned}
					/>
				</div>
			</div>

			{/* Expanded Details */}
			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2, ease: "easeInOut" }}
						className="overflow-hidden"
					>
						<div className="px-4 pb-4 pl-16 border-t border-stone-100 bg-stone-50/30">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
								{/* Column 1: Basic Info */}
								<div className="space-y-3">
									<div>
										<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
											Color
										</span>
										<p className="text-sm mt-1">{item.color || "—"}</p>
									</div>
									<div>
										<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
											Category
										</span>
										<div className="flex items-center gap-2 mt-1">
											<CategoryIcon className="h-4 w-4 text-muted-foreground" />
											<p className="text-sm">{categoryConfig.label}</p>
										</div>
									</div>
									{permissions.canTrackWearCount && (
										<div>
											<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
												Wears
											</span>
											<p className="text-sm mt-1">{item.wears || 0}×</p>
										</div>
									)}
								</div>

								{/* Column 2: Dates & Store */}
								<div className="space-y-3">
									{displayLogic.isOwned && purchasedDate && (
										<div>
											<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
												Purchased On
											</span>
											<p className="text-sm mt-1">{formatDate(purchasedDate)}</p>
										</div>
									)}
									{!displayLogic.isOwned && (
										<div>
											<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
												Tracked Since
											</span>
											<p className="text-sm mt-1">{formatDate(item.created_at)}</p>
										</div>
									)}
									{item.store_name && (
										<div>
											<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
												Store
											</span>
											<p className="text-sm mt-1">{item.store_name}</p>
										</div>
									)}
									{item.last_worn_date && permissions.canTrackWearCount && (
										<div>
											<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
												Last Worn
											</span>
											<p className="text-sm mt-1">{formatDate(item.last_worn_date)}</p>
										</div>
									)}
								</div>

								{/* Column 3: Pricing Details */}
								<div className="space-y-3">
									{displayLogic.isOwned ? (
										<>
											{item.purchase_price && (
												<div>
													<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
														Purchase Price
													</span>
													<p className="text-sm mt-1 font-semibold">
														${item.purchase_price}
													</p>
												</div>
											)}
											{item.retail_price && (
												<div>
													<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
														Original Retail
													</span>
													<p className="text-sm mt-1">${item.retail_price}</p>
												</div>
											)}
										</>
									) : (
										<>
											{item.retail_price && (
												<div>
													<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
														Retail Price
													</span>
													<p className="text-sm mt-1 font-semibold">
														${item.retail_price}
													</p>
												</div>
											)}
											{item.sale_price && (
												<div>
													<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
														Current Price
													</span>
													<p className="text-sm mt-1 font-semibold text-meadow-600">
														${item.sale_price}
													</p>
												</div>
											)}
											{item.target_price && (
												<div>
													<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
														Target Price
													</span>
													<p className="text-sm mt-1">${item.target_price}</p>
												</div>
											)}
										</>
									)}
								</div>
							</div>

							{/* Notes - Full Width */}
							{item.notes &&
								item.notes.trim() &&
								item.notes.toLowerCase() !== "no note added" && (
									<div className="mt-4 pt-4 border-t border-stone-200">
										<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
											Notes
										</span>
										<p className="text-sm mt-2 italic text-muted-foreground leading-relaxed">
											{item.notes}
										</p>
									</div>
								)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
