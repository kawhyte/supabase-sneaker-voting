/**
 * WearStatsDrawer - Side sheet for detailed wear statistics and cost per wear tracking
 *
 * Opens from the right side to show:
 * - Wear counter with increment/decrement buttons
 * - Cost per wear calculation and display
 * - Cost per wear progress bar
 * - Item summary for context
 */

"use client";

import { Minus, Plus } from "lucide-react";
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
import { WardrobeItem } from '@/components/types/WardrobeItem';
import { getComfortLabel, calculateCostPerWear } from "@/lib/wardrobe-item-utils";
import { CostPerWearProgress } from "./CostPerWearProgress";

interface WearStatsDrawerProps {
	item: WardrobeItem;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onIncrementWear?: (item: WardrobeItem) => void;
	onDecrementWear?: (item: WardrobeItem) => void;
}

export function WearStatsDrawer({
	item,
	isOpen,
	onOpenChange,
	onIncrementWear,
	onDecrementWear,
}: WearStatsDrawerProps) {
	const comfortInfo = item.comfort_rating ? getComfortLabel(item.comfort_rating) : null;
	const hasWearPrice = item.purchase_price || item.retail_price;

	return (
		<Sheet open={isOpen} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-full sm:w-96 p-0 flex flex-col">
				{/* Header */}
				<SheetHeader className="px-6 pt-6 pb-4">
					<SheetTitle className="text-lg font-semibold">Wear Statistics</SheetTitle>
					<SheetDescription className="text-xs text-muted-foreground">
						{item.model}
					</SheetDescription>
				</SheetHeader>

				{/* Content */}
				<div className="flex-1 overflow-y-auto px-6 py-6">
					<div className="flex flex-col gap-8">
						{/* Wear Counter Section */}
						<div className="flex flex-col gap-4">
							<span className="font-mono uppercase tracking-widest text-xs text-muted-foreground">Wear Count</span>

							{/* Counter Controls */}
							<div className="dense flex items-center justify-between gap-4 p-4 rounded-lg bg-card">
								{/* Decrement Button */}
								<Tooltip delayDuration={200}>
									<TooltipTrigger asChild>
										<button
											onClick={() => onDecrementWear?.(item)}
											disabled={!item.wears || item.wears === 0}
											className="h-10 w-10 rounded-lg flex items-center justify-center transition-all bg-slate-100 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-30 disabled:cursor-not-allowed text-muted-foreground font-semibold"
											type="button"
											aria-label="Decrease wear count">
											<Minus className="h-5 w-5" />
										</button>
									</TooltipTrigger>
									<TooltipContent side="bottom">
										<p>Decrease wear count</p>
									</TooltipContent>
								</Tooltip>

								{/* Count Display */}
								<div className="flex-1 text-center">
									<div className="font-sans font-bold text-4xl text-foreground">{item.wears || 0}</div>
									<div className="font-mono uppercase tracking-widest text-xs text-muted-foreground mt-1">
										{item.wears === 1 ? "wear" : "wears"}
									</div>
								</div>

								{/* Increment Button */}
								<Tooltip delayDuration={200}>
									<TooltipTrigger asChild>
										<button
											onClick={() => onIncrementWear?.(item)}
											className="h-10 w-10 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-accent text-white hover:text-accent-foreground font-semibold shadow-sm"
											type="button"
											aria-label="Increase wear count">
											<Plus className="h-5 w-5" />
										</button>
									</TooltipTrigger>
									<TooltipContent side="bottom">
										<p>Increase wear count</p>
									</TooltipContent>
								</Tooltip>
							</div>
						</div>

						{/* Cost Per Wear Section */}
						{hasWearPrice && (
							<div className="flex flex-col gap-4">
								<span className="font-mono uppercase tracking-widest text-xs text-muted-foreground">Cost Per Wear</span>

								{/* CPW Value + formula */}
								<div className="flex flex-col gap-1">
									<span className="font-sans font-bold text-4xl text-foreground">
										${calculateCostPerWear(item.purchase_price, item.retail_price, item.wears)}
									</span>
									<span className="font-mono uppercase tracking-widest text-xs text-muted-foreground">per wear</span>
								</div>

								<p className="font-mono text-xs text-muted-foreground">
									${item.purchase_price || item.retail_price} ÷ {item.wears || 0}{" "}
									{item.wears === 1 ? "wear" : "wears"}
								</p>

								<CostPerWearProgress item={item} />
							</div>
						)}

						{/* Item Details Section */}
						{(item.size_tried || comfortInfo || item.purchase_price || item.store_name) && (
							<div className="flex flex-col gap-4">
								<span className="font-mono uppercase tracking-widest text-xs text-muted-foreground">Item Details</span>

								<div className="space-y-3">
									{item.purchase_price && (
										<div className="flex items-center justify-between">
											<span className="font-mono uppercase tracking-widest text-xs text-muted-foreground">Purchase Price</span>
											<span className="font-sans font-bold text-foreground">${item.purchase_price}</span>
										</div>
									)}

									{item.size_tried && (
										<div className="flex items-center justify-between">
											<span className="font-mono uppercase tracking-widest text-xs text-muted-foreground">Size</span>
											<span className="font-sans font-bold text-foreground">{item.size_tried}</span>
										</div>
									)}

									{comfortInfo && (
										<div className="flex items-center justify-between">
											<span className="font-mono uppercase tracking-widest text-xs text-muted-foreground">Comfort</span>
											<span className={`font-sans font-bold ${comfortInfo.color}`}>
												{comfortInfo.label}
											</span>
										</div>
									)}

									{item.store_name && (
										<div className="flex items-center justify-between">
											<span className="font-mono uppercase tracking-widest text-xs text-muted-foreground">Store</span>
											<span className="font-sans font-bold text-foreground text-sm">{item.store_name}</span>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
