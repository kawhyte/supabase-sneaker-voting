/**
 * WishlistDetailsDrawer - Side sheet for wishlist item details and price management
 *
 * Opens from the right side to show:
 * - Price monitoring status and actions
 * - Try-on details (size, comfort)
 * - User notes
 * - Quick actions (Mark as Purchased, Archive)
 */

"use client";

import { useState } from "react";
import { RefreshCw, Edit3, ShoppingBag, Archive, AlertCircle } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { WardrobeItem } from '@/components/types/WardrobeItem';
import { getComfortLabel } from "@/lib/wardrobe-item-utils";
import { isPriceStale, getDaysSincePriceCheck } from '@/lib/price-tracking-utils';
import { ManualPriceEntryDialog } from './ManualPriceEntryDialog';
import { toast } from 'sonner';

interface WishlistDetailsDrawerProps {
	item: WardrobeItem;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onRefreshPrice?: (itemId: string) => Promise<void>;
	onManualEntrySuccess?: () => void;
	onMarkAsPurchased?: (item: WardrobeItem) => void;
	onArchive?: (item: WardrobeItem) => void;
}

export function WishlistDetailsDrawer({
	item,
	isOpen,
	onOpenChange,
	onRefreshPrice,
	onManualEntrySuccess,
	onMarkAsPurchased,
	onArchive,
}: WishlistDetailsDrawerProps) {
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
	const comfortInfo = item.comfort_rating ? getComfortLabel(item.comfort_rating) : null;

	// Price status calculations
	const daysSince = getDaysSincePriceCheck(item.last_price_check_at || null);
	const isStale = isPriceStale(item.last_price_check_at || null);
	const isTrackingDisabled = item.auto_price_tracking_enabled === false;

	// Status message and styling
	const getStatusInfo = () => {
		if (isTrackingDisabled) {
			return {
				text: 'Tracking disabled',
				description: 'Price tracking has been disabled due to repeated check failures.',
				color: 'text-red-700',
				bgColor: 'bg-red-50',
				borderColor: 'border-red-200',
				icon: '🔴',
			};
		}
		if (!item.last_price_check_at) {
			return {
				text: 'Price not checked',
				description: 'Price has never been checked. Click "Check Price" to get the latest price.',
				color: 'text-amber-700',
				bgColor: 'bg-amber-50',
				borderColor: 'border-amber-200',
				icon: '🟡',
			};
		}
		if (isStale) {
			return {
				text: `Last checked ${daysSince} ${daysSince === 1 ? 'day' : 'days'} ago`,
				description: `Price data is ${daysSince} days old and may not reflect current prices.`,
				color: 'text-amber-700',
				bgColor: 'bg-amber-50',
				borderColor: 'border-amber-200',
				icon: '🟡',
			};
		}
		return {
			text: `Checked ${daysSince === 0 ? 'today' : daysSince === 1 ? 'yesterday' : `${daysSince} days ago`}`,
			description: 'Price is up to date. Prices are checked automatically every Sunday.',
			color: 'text-meadow-700',
			bgColor: 'bg-meadow-50',
			borderColor: 'border-meadow-200',
			icon: '🟢',
		};
	};

	const statusInfo = getStatusInfo();

	const handleRefresh = async () => {
		if (!onRefreshPrice) {
			toast.info('Manual refresh coming soon');
			return;
		}

		try {
			setIsRefreshing(true);
			await onRefreshPrice(item.id);
			toast.success('Price updated');
		} catch (error) {
			console.error('Failed to refresh price:', error);
			toast.error('Failed to refresh price');
		} finally {
			setIsRefreshing(false);
		}
	};

	const handleMarkAsPurchased = () => {
		if (onMarkAsPurchased) {
			onMarkAsPurchased(item);
			onOpenChange(false);
		}
	};

	const handleArchive = () => {
		if (onArchive) {
			onArchive(item);
			onOpenChange(false);
		}
	};

	return (
		<>
			<Sheet open={isOpen} onOpenChange={onOpenChange}>
				<SheetContent side="right" className="w-full sm:w-96 p-0 flex flex-col">
					{/* Header */}
					<SheetHeader className="px-6 pt-6 pb-4 border-b border-stone-200">
						<SheetTitle className="text-lg font-semibold">Wishlist Details</SheetTitle>
						<SheetDescription className="text-xs text-muted-foreground">
							{item.model}
						</SheetDescription>
					</SheetHeader>

					{/* Content */}
					<div className="flex-1 overflow-y-auto px-6 py-6">
						<div className="flex flex-col gap-6">
							{/* Price Monitoring Section */}
							<div className="flex flex-col gap-3">
								<h3 className="text-sm font-semibold text-foreground">Price Monitoring</h3>

								{/* Status Display */}
								<div className={`p-4 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
									<div className="flex items-start gap-3">
										<span className="text-2xl">{statusInfo.icon}</span>
										<div className="flex-1">
											<p className={`text-sm font-medium ${statusInfo.color}`}>
												{statusInfo.text}
											</p>
											<p className="text-xs text-muted-foreground mt-1">
												{statusInfo.description}
											</p>
										</div>
									</div>
								</div>

								{/* Price Check Actions */}
								<div className="flex flex-col gap-2">
									<Button
										onClick={handleRefresh}
										disabled={isRefreshing}
										className="w-full justify-start gap-2 h-10"
										variant="outline"
									>
										<RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
										{isRefreshing ? 'Checking price...' : 'Check Price'}
									</Button>

									<Button
										onClick={() => setIsManualEntryOpen(true)}
										className="w-full justify-start gap-2 h-10"
										variant="outline"
									>
										<Edit3 className="h-4 w-4" />
										Enter Manually
									</Button>
								</div>

								<p className="text-xs text-muted-foreground">
									Prices are checked automatically every Sunday, or you can refresh manually at any time.
								</p>
							</div>

							{/* Divider */}
							<div className="h-px bg-stone-200" />

							{/* Try-On Details Section */}
							{(item.size_tried || comfortInfo) && (
								<>
									<div className="flex flex-col gap-3">
										<h3 className="text-sm font-semibold text-foreground">Try-On Details</h3>

										<div className="space-y-3">
											{item.size_tried && (
												<div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
													<span className="text-sm text-muted-foreground">Ideal Size</span>
													<span className="text-base font-semibold">{item.size_tried}</span>
												</div>
											)}

											{comfortInfo && (
												<div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
													<span className="text-sm text-muted-foreground">Comfort Rating</span>
													<span className={`text-base font-semibold ${comfortInfo.color}`}>
														{comfortInfo.label}
													</span>
												</div>
											)}
										</div>
									</div>

									{/* Divider */}
									<div className="h-px bg-stone-200" />
								</>
							)}

							{/* Notes Section */}
							{item.notes && item.notes.trim() && item.notes.toLowerCase() !== 'no note added' && (
								<>
									<div className="flex flex-col gap-3">
										<h3 className="text-sm font-semibold text-foreground">Notes</h3>

										<div className="p-4 bg-stone-50 rounded-lg">
											<p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
												{item.notes}
											</p>
										</div>

										<p className="text-xs text-muted-foreground">
											Edit this item to update your notes.
										</p>
									</div>

									{/* Divider */}
									<div className="h-px bg-stone-200" />
								</>
							)}

							{/* Quick Actions Section */}
							<div className="flex flex-col gap-3">
								<h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>

								<div className="flex flex-col gap-2">
									{onMarkAsPurchased && (
										<Button
											onClick={handleMarkAsPurchased}
											className="w-full justify-start gap-2 h-10 bg-meadow-500 hover:bg-meadow-600 text-white"
											variant="default"
										>
											<ShoppingBag className="h-4 w-4" />
											Mark as Purchased
										</Button>
									)}

									{onArchive && (
										<Button
											onClick={handleArchive}
											className="w-full justify-start gap-2 h-10"
											variant="outline"
										>
											<Archive className="h-4 w-4" />
											Archive Item
										</Button>
									)}
								</div>
							</div>

							{/* Product Info */}
							<div className="flex flex-col gap-2 pt-4 border-t border-stone-200">
								<div className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">Added to wishlist</span>
									<span className="font-medium">
										{new Date(item.created_at).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric",
										})}
									</span>
								</div>

								{item.product_url && (
									<div className="flex items-center justify-between text-xs">
										<span className="text-muted-foreground">Product URL</span>
										<a
											href={item.product_url}
											target="_blank"
											rel="noopener noreferrer"
											className="font-medium text-sun-600 hover:text-sun-700 hover:underline max-w-[180px] truncate"
										>
											View Product
										</a>
									</div>
								)}
							</div>
						</div>
					</div>
				</SheetContent>
			</Sheet>

			{/* Manual price entry dialog */}
			<ManualPriceEntryDialog
				itemId={item.id}
				itemName={`${item.brand} ${item.model}`}
				retailPrice={item.retail_price}
				currentPrice={item.sale_price}
				isOpen={isManualEntryOpen}
				onClose={() => setIsManualEntryOpen(false)}
				onSuccess={() => {
					setIsManualEntryOpen(false);
					onManualEntrySuccess?.();
				}}
			/>
		</>
	);
}
