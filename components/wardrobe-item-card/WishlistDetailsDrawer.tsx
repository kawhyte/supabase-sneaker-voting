"use client";

import { useState, useEffect } from "react";
import {
	RefreshCw,
	Edit3,
	ShoppingBag,
	Archive,
	AlertCircle,
	AlertTriangle,
	XCircle,
	CheckCircle2,
	ChevronRight,
	ExternalLink,
} from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { WardrobeItem } from "@/components/types/WardrobeItem";
import { getComfortLabel } from "@/lib/wardrobe-item-utils";
import { isPriceStale, getDaysSincePriceCheck } from "@/lib/price-tracking-utils";
import { getShoppingUrl } from "@/lib/item-utils";
import { ManualPriceEntryDialog } from "./ManualPriceEntryDialog";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface PriceCheckLogRow {
	id: string;
	item_id: string;
	price: number | null;
	checked_at: string;
	retailer: string | null;
	source: string;
	success: boolean;
}

interface WishlistDetailsDrawerProps {
	item: WardrobeItem;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onRefreshPrice?: (itemId: string) => Promise<void>;
	onManualEntrySuccess?: () => void;
	onMarkAsPurchased?: (item: WardrobeItem) => void;
	onArchive?: (item: WardrobeItem) => void;
}

function formatPrice(n: number) {
	return `$${n.toFixed(2)}`;
}

function formatDate(dateStr: string) {
	return new Date(dateStr).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
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
	const [priceHistory, setPriceHistory] = useState<PriceCheckLogRow[]>([]);
	const [loadedItemId, setLoadedItemId] = useState<string | null>(null);
	const [isInsightsOpen, setIsInsightsOpen] = useState(false);

	const comfortInfo = item.comfort_rating ? getComfortLabel(item.comfort_rating) : null;

	useEffect(() => {
		if (!isOpen || loadedItemId === item.id) return;

		const supabase = createClient();
		supabase
			.from("price_check_log")
			.select("id, item_id, price, checked_at, retailer, source, success")
			.eq("item_id", item.id)
			.eq("success", true)
			.order("checked_at", { ascending: true })
			.then(({ data }) => {
				setPriceHistory(data ?? []);
				setLoadedItemId(item.id);
			});
	}, [isOpen, item.id, loadedItemId]);

	// Price status calculations
	const daysSince = getDaysSincePriceCheck(item.last_price_check_at || null);
	const isStale = isPriceStale(item.last_price_check_at || null);
	const isTrackingDisabled = item.auto_price_tracking_enabled === false;

	const getStatusInfo = () => {
		if (isTrackingDisabled) {
			return {
				Icon: XCircle,
				text: "Tracking disabled",
				description: "Price tracking has been disabled due to repeated check failures.",
				color: "text-red-700",
				iconColor: "text-red-600",
				bgColor: "bg-red-50",
				borderColor: "border-red-200",
			};
		}
		if (!item.last_price_check_at) {
			return {
				Icon: AlertCircle,
				text: "Price not checked",
				description: 'Price has never been checked. Tap "Check Price" below to get the latest.',
				color: "text-amber-700",
				iconColor: "text-amber-600",
				bgColor: "bg-amber-50",
				borderColor: "border-amber-200",
			};
		}
		if (isStale) {
			return {
				Icon: AlertCircle,
				text: `Last checked ${daysSince} ${daysSince === 1 ? "day" : "days"} ago`,
				description: `Price data is ${daysSince} days old and may not reflect current prices.`,
				color: "text-amber-700",
				iconColor: "text-amber-600",
				bgColor: "bg-amber-50",
				borderColor: "border-amber-200",
			};
		}
		return {
			Icon: CheckCircle2,
			text: `Checked ${daysSince === 0 ? "today" : daysSince === 1 ? "yesterday" : `${daysSince} days ago`}`,
			description: "Price is up to date. Prices are checked automatically every Sunday.",
			color: "text-green-700",
			iconColor: "text-green-700",
			bgColor: "bg-green-50",
			borderColor: "border-green-200",
		};
	};

	const statusInfo = getStatusInfo();
	const { Icon: StatusIcon } = statusInfo;

	const handleRefresh = async () => {
		if (!onRefreshPrice) {
			toast.info("Manual refresh coming soon");
			return;
		}
		try {
			setIsRefreshing(true);
			await onRefreshPrice(item.id);
			setLoadedItemId(null);
			toast.success("Price updated");
		} catch (error) {
			console.error("Failed to refresh price:", error);
			toast.error("Failed to refresh price");
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

	// Bento grid data
	const validRecords = priceHistory.filter((r) => r.price !== null);
	const lowestRecord =
		validRecords.length > 0
			? validRecords.reduce((min, r) => (r.price! < min.price! ? r : min))
			: null;
	const currentPrice = item.sale_price ?? null;
	const targetPrice = item.target_price ?? null;
	const retailPrice = item.retail_price ?? null;

	const pctFromTarget =
		currentPrice !== null && targetPrice !== null && targetPrice > 0
			? Math.round(((currentPrice - targetPrice) / targetPrice) * 100)
			: null;

	const shoppingUrl = getShoppingUrl(item);
	const isEbayUrl = !item.product_url && !!shoppingUrl;

	return (
		<>
			<Sheet open={isOpen} onOpenChange={onOpenChange}>
				<SheetContent side="right" className="w-full sm:w-96 p-0 flex flex-col">
					{/* Header */}
					<SheetHeader className="px-6 pt-6 pb-4 border-b border-slate-200 flex-shrink-0">
						<SheetTitle className="text-lg font-semibold">Wishlist Details</SheetTitle>
						<SheetDescription className="text-xs text-muted-foreground">
							{item.model}
						</SheetDescription>
					</SheetHeader>

					{/* Scrollable content */}
					<div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
						<div className="flex flex-col gap-5">

							{/* ── Bento Price Grid ─────────────────────────────────── */}
							<div className="grid grid-cols-2 gap-3">
								{/* Current Market — spans full row if no other data */}
								<div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3 shadow-sm">
									<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
										Market Price
									</span>
									{isRefreshing ? (
										<Skeleton className="h-7 w-20" />
									) : currentPrice !== null ? (
										<span className="text-xl font-bold text-foreground tabular-nums">
											{formatPrice(currentPrice)}
										</span>
									) : (
										<span className="text-sm text-muted-foreground">—</span>
									)}
									<span className="text-[10px] text-muted-foreground">Latest check</span>
								</div>

								{/* All-Time Low */}
								<div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3 shadow-sm">
									<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
										All-Time Low
									</span>
									{isRefreshing ? (
										<Skeleton className="h-7 w-20" />
									) : lowestRecord ? (
										<span className="text-xl font-bold text-foreground tabular-nums">
											{formatPrice(lowestRecord.price!)}
										</span>
									) : (
										<span className="text-sm text-muted-foreground">—</span>
									)}
									{lowestRecord && !isRefreshing && (
										<span className="text-[10px] text-muted-foreground">
											{formatDate(lowestRecord.checked_at)}
										</span>
									)}
								</div>

								{/* Your Target */}
								<div className={`flex flex-col gap-1.5 rounded-xl border p-3 shadow-sm ${
									currentPrice !== null && targetPrice !== null && currentPrice <= targetPrice
										? "border-green-200 bg-green-50"
										: "border-border bg-card"
								}`}>
									<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
										Your Target
									</span>
									{isRefreshing ? (
										<Skeleton className="h-7 w-20" />
									) : targetPrice !== null ? (
										<span className={`text-xl font-bold tabular-nums ${
											currentPrice !== null && currentPrice <= targetPrice
												? "text-green-700"
												: "text-foreground"
										}`}>
											{formatPrice(targetPrice)}
										</span>
									) : (
										<span className="text-sm text-muted-foreground">Not set</span>
									)}
									{pctFromTarget !== null && !isRefreshing && (
										<span className={`text-[10px] font-medium ${pctFromTarget <= 0 ? "text-green-600" : "text-muted-foreground"}`}>
											{pctFromTarget <= 0 ? "Target reached!" : `${pctFromTarget}% above target`}
										</span>
									)}
								</div>

								{/* Retail Reference */}
								<div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3 shadow-sm">
									<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
										Retail
									</span>
									{retailPrice !== null ? (
										<span className="text-xl font-bold text-foreground tabular-nums">
											{formatPrice(retailPrice)}
										</span>
									) : (
										<span className="text-sm text-muted-foreground">—</span>
									)}
									<span className="text-[10px] text-muted-foreground">MSRP</span>
								</div>
							</div>

							{/* ── Market Insights (collapsible stub) ───────────────── */}
							<Collapsible open={isInsightsOpen} onOpenChange={setIsInsightsOpen}>
								<CollapsibleTrigger className="flex w-full items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-0.5">
									<ChevronRight
										className={`h-3 w-3 transition-transform duration-150 ${isInsightsOpen ? "rotate-90" : ""}`}
									/>
									Market Insights
								</CollapsibleTrigger>
								<CollapsibleContent className="mt-2">
									<div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
										Listing count, IQR ranges, and check history coming soon.
									</div>
								</CollapsibleContent>
							</Collapsible>

							{/* ── Status badge ─────────────────────────────────────── */}
							{item.auto_price_tracking_enabled !== false && !item.size_tried && (
								<div className="p-4 rounded-lg border bg-amber-50 border-amber-200">
									<div className="flex items-start gap-3">
										<AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
										<p className="text-sm text-amber-800">
											<span className="font-medium">Missing Target Size.</span> Edit this item and add a Target Size to enable accurate eBay market price calculations.
										</p>
									</div>
								</div>
							)}

							<div className={`p-3 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
								<div className="flex items-start gap-3">
									<StatusIcon className={`h-5 w-5 ${statusInfo.iconColor} flex-shrink-0 mt-0.5`} />
									<div className="flex-1">
										<p className={`text-sm font-medium ${statusInfo.color}`}>
											{statusInfo.text}
										</p>
										<p className="text-xs text-muted-foreground mt-0.5">
											{statusInfo.description}
										</p>
									</div>
								</div>
							</div>

							{/* ── Try-On Details ────────────────────────────────────── */}
							{(item.size_tried || comfortInfo) && (
								<>
									<div className="h-px bg-slate-200" />
									<div className="flex flex-col gap-3">
										<h3 className="text-sm font-semibold text-foreground">Try-On Details</h3>
										<div className="space-y-2">
											{item.size_tried && (
												<div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
													<span className="text-sm text-muted-foreground">Ideal Size</span>
													<span className="text-base font-semibold">{item.size_tried}</span>
												</div>
											)}
											{comfortInfo && (
												<div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
													<span className="text-sm text-muted-foreground">Comfort Rating</span>
													<span className={`text-base font-semibold ${comfortInfo.color}`}>
														{comfortInfo.label}
													</span>
												</div>
											)}
										</div>
									</div>
								</>
							)}

							{/* ── Notes ─────────────────────────────────────────────── */}
							{item.notes && item.notes.trim() && item.notes.toLowerCase() !== "no note added" && (
								<>
									<div className="h-px bg-slate-200" />
									<div className="flex flex-col gap-2">
										<h3 className="text-sm font-semibold text-foreground">Notes</h3>
										<div className="p-4 bg-slate-50 rounded-lg">
											<p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
												{item.notes}
											</p>
										</div>
									</div>
								</>
							)}

							{/* ── Product metadata ──────────────────────────────────── */}
							<div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
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
								<div className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">SKU</span>
									{item.sku ? (
										<span className="font-medium font-mono">{item.sku}</span>
									) : (
										<span className="text-muted-foreground">Not specified</span>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* ── Action Dock (fixed footer) ───────────────────────────── */}
					<div className="border-t border-border bg-card px-4 py-4 flex flex-col gap-2 flex-shrink-0">
						{/* Primary row: Check Price + Buy Now */}
						<div className="grid grid-cols-2 gap-2">
							<Button
								onClick={handleRefresh}
								disabled={isRefreshing}
								className="gap-2 h-10"
								variant="default"
							>
								<RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
								{isRefreshing ? "Checking…" : "Check Price"}
							</Button>

							{shoppingUrl ? (
								<Button
									asChild
									variant="outline"
									className="gap-2 h-10"
								>
									<a href={shoppingUrl} target="_blank" rel="noopener noreferrer">
										<ExternalLink className="h-4 w-4" />
										{isEbayUrl ? "Shop eBay" : "View Product"}
									</a>
								</Button>
							) : (
								<Button
									onClick={() => setIsManualEntryOpen(true)}
									variant="outline"
									className="gap-2 h-10"
								>
									<Edit3 className="h-4 w-4" />
									Enter Manually
								</Button>
							)}
						</div>

						{/* Secondary row: Enter Manually + Mark as Purchased */}
						<div className="grid grid-cols-2 gap-2">
							{shoppingUrl && (
								<Button
									onClick={() => setIsManualEntryOpen(true)}
									variant="outline"
									className="gap-2 h-10"
								>
									<Edit3 className="h-4 w-4" />
									Enter Manually
								</Button>
							)}

							{onMarkAsPurchased && (
								<Button
									onClick={handleMarkAsPurchased}
									variant="outline"
									className={`gap-2 h-10 ${!shoppingUrl ? "col-span-2" : ""}`}
								>
									<ShoppingBag className="h-4 w-4" />
									Mark Purchased
								</Button>
							)}
						</div>

						{/* Archive — destructive ghost */}
						{onArchive && (
							<Button
								onClick={handleArchive}
								variant="ghost"
								className="h-9 gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
							>
								<Archive className="h-4 w-4" />
								Archive Item
							</Button>
						)}
					</div>
				</SheetContent>
			</Sheet>

			<ManualPriceEntryDialog
				itemId={item.id}
				itemName={`${item.brand} ${item.model}`}
				retailPrice={item.retail_price}
				currentPrice={item.sale_price}
				isOpen={isManualEntryOpen}
				onClose={() => setIsManualEntryOpen(false)}
				onSuccess={() => {
					setIsManualEntryOpen(false);
					setLoadedItemId(null);
					onManualEntrySuccess?.();
				}}
			/>
		</>
	);
}
