/**
 * WardrobeListItem - Individual row in list view
 *
 * Mobile: stacked card (image left, content right, absolute actions)
 * Desktop (md+): full horizontal row with dedicated columns
 *
 * Click row to expand inline details.
 */

"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Pin, Archive, Plus } from "lucide-react";
import { toast } from "sonner";
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

	const itemPhotos = prepareItemPhotos(item);
	const displayLogic = useItemDisplayLogic(item);
	const permissions = useItemPermissions(item.category);
	const purchasedDate = item.purchase_date || purchaseDate;

	const mainImage = itemPhotos[0]?.image_url || "/images/placeholder.svg";

	const categoryConfig = CATEGORY_CONFIGS[item.category as keyof typeof CATEGORY_CONFIGS] || CATEGORY_CONFIGS.shoes;
	const CategoryIcon = categoryConfig.icon;

	const getPriceDisplay = () => {
		if (displayLogic.isOwned) {
			if (item.purchase_price) return `$${item.purchase_price}`;
			return "—";
		}
		if (displayLogic.isOnSale && item.sale_price) return `$${item.sale_price}`;
		if (item.retail_price) return `$${item.retail_price}`;
		return "—";
	};

	const handleIncrementWear = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		actions.onIncrementWear?.(item);
		toast.success("Wear count updated!");
	};

	const handleRowClick = (e: React.MouseEvent) => {
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
		<div className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors">
			{/* Main Row */}
			<div
				className="relative flex flex-row items-start md:items-center gap-4 p-4 cursor-pointer"
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
				{/* Expand Icon - desktop only, in-flow */}
				<div className="hidden md:flex flex-shrink-0 w-5 items-center text-muted-foreground">
					{isExpanded ? (
						<ChevronDown className="h-5 w-5" />
					) : (
						<ChevronRight className="h-5 w-5" />
					)}
				</div>

				{/* Thumbnail */}
				<div className="flex-shrink-0">
					<div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative">
						<img
							src={mainImage}
							alt={`${item.brand} ${item.model}`}
							className="w-full h-full object-cover"
							onError={(e) => {
								e.currentTarget.src = '/images/placeholder.svg';
							}}
						/>
						{!isReadOnly && displayLogic.isPinned && !item.is_archived && (
							<div
								className="absolute top-1 left-1 bg-orange-500 text-white rounded-full p-1 shadow-sm"
								title="Pinned"
								aria-label="This item is pinned"
							>
								<Pin className="h-3 w-3" />
							</div>
						)}
						{itemPhotos.length > 1 && (
							<div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
								{itemPhotos.length}
							</div>
						)}
					</div>
				</div>

				{/* Content zone — flex-1, stacks on mobile */}
				<div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 pr-10 md:pr-0">
					{/* Brand + Model */}
					<div className="flex items-center gap-2 min-w-0">
						{item.brands?.brand_logo && (
							<div className="relative w-4 h-4 flex-shrink-0">
								<img
									src={item.brands.brand_logo}
									alt={item.brands.name || "Brand logo"}
									className="w-full h-full object-contain"
								/>
							</div>
						)}
						<span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground truncate">
							{item.brands?.name || item.brand}
						</span>
					</div>
					<h3 className="text-base font-semibold leading-tight line-clamp-2 md:line-clamp-1">
						{item.model}
					</h3>

					{/* Mobile: size + price inline */}
					<div className="flex items-center gap-3 mt-1 md:hidden">
						{item.size_tried && (
							<span className="text-xs text-muted-foreground">{item.size_tried}</span>
						)}
						<span className="text-sm font-semibold">{getPriceDisplay()}</span>
						{!displayLogic.isOwned && displayLogic.isOnSale && (
							<Badge
								variant="outline"
								className="text-xs px-1.5 py-0 rounded-md border-emerald-500 bg-emerald-500 text-white font-bold"
							>
								Sale
							</Badge>
						)}
					</div>
				</div>

				{/* Size — desktop only */}
				<div className="hidden md:flex flex-shrink-0 w-20 items-center justify-end">
					<span className="text-sm font-medium">{item.size_tried || "—"}</span>
				</div>

				{/* Price — desktop only */}
				<div className="hidden sm:flex flex-shrink-0 w-48 flex-col items-end gap-1 justify-center">
					<span className="text-base font-semibold">{getPriceDisplay()}</span>
					{!displayLogic.isOwned && displayLogic.isOnSale && item.retail_price && (
						<div className="flex items-center gap-2">
							<span className="text-xs text-muted-foreground line-through">
								${item.retail_price}
							</span>
							<Badge
								variant="outline"
								className="text-xs px-2 py-0.5 rounded-md border-emerald-500 bg-emerald-500 text-white font-bold"
							>
								Sale
							</Badge>
						</div>
					)}
				</div>

				{/* Status Badges — large desktop only */}
				<div className="hidden lg:flex items-center gap-2 flex-shrink-0 w-[300px] ml-12">
					{item.is_archived && viewMode !== "archive" && (
						<Badge
							variant="outline"
							className="text-xs px-2 py-0.5 rounded-md border-slate-300 bg-slate-100 text-slate-700"
						>
							<Archive className="h-3 w-3 mr-1" />
							Archived
						</Badge>
					)}
					{viewMode === "wishlist" && !isReadOnly && (
						<PriceStatusBadge
							lastPriceCheckAt={item.last_price_check_at ?? null}
							isAutoTrackingEnabled={item.auto_price_tracking_enabled ?? true}
							priceCheckFailures={item.price_check_failures ?? 0}
						/>
					)}
				</div>

				{/* Actions — absolute on mobile, in-flow on desktop */}
				<div
					className="absolute top-2 right-2 md:relative md:top-auto md:right-auto flex-shrink-0 md:w-24 md:ml-4 flex items-center justify-end gap-2 pr-4"
					onClick={(e) => e.stopPropagation()}
				>
					{displayLogic.isOwned && permissions.canTrackWearCount && !isReadOnly && (
						<button
							onClick={handleIncrementWear}
							className="text-xs px-2 py-1 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1"
							aria-label="Increment wear count"
							title="Log a wear"
						>
							<Plus size={12} />
							Wear
						</button>
					)}
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
						<div className="px-4 pb-4 pl-4 md:pl-16 border-t border-slate-100 bg-slate-50/30">
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
													<p className="text-sm mt-1 font-semibold text-emerald-500">
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

							{item.notes &&
								item.notes.trim() &&
								item.notes.toLowerCase() !== "no note added" && (
									<div className="mt-4 pt-4 border-t border-slate-200">
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
