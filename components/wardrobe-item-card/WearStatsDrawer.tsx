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
				<SheetHeader className="px-6 pt-6 pb-4 border-b border-stone-200">
					<SheetTitle className="text-lg font-semibold">Wear Statistics</SheetTitle>
					<SheetDescription className="text-xs text-muted-foreground">
						{item.brand} {item.model}
					</SheetDescription>
				</SheetHeader>

				{/* Content */}
				<div className="flex-1 overflow-y-auto px-6 py-6">
					<div className="flex flex-col gap-6">
						{/* Wear Counter Section */}
						<div className="flex flex-col gap-3">
							<h3 className="text-sm font-semibold text-foreground">Wear Count</h3>

							{/* Counter Controls */}
							<div className="dense flex items-center justify-between gap-4 bg-stone-50 p-4 rounded-lg">
								{/* Decrement Button */}
								<Tooltip delayDuration={200}>
									<TooltipTrigger asChild>
										<button
											onClick={() => onDecrementWear?.(item)}
											disabled={!item.wears || item.wears === 0}
											className="h-10 w-10 rounded-lg flex items-center justify-center transition-all bg-stone-100 hover:bg-stone-200 active:bg-stone-300 disabled:opacity-30 disabled:cursor-not-allowed text-muted-foreground font-semibold"
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
									<div className="text-3xl font-bold text-foreground">{item.wears || 0}</div>
									<div className="text-xs text-muted-foreground mt-1">
										{item.wears === 1 ? "wear" : "wears"}
									</div>
								</div>

								{/* Increment Button */}
								<Tooltip delayDuration={200}>
									<TooltipTrigger asChild>
										<button
											onClick={() => onIncrementWear?.(item)}
											className="h-10 w-10 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 bg-primary text-white font-semibold shadow-sm"
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

							{/* Info text */}
							<p className="text-xs text-muted-foreground">
								Track how many times you've worn this item to calculate cost per wear.
							</p>
						</div>

						{/* Divider */}
						<div className="h-px bg-stone-200" />

						{/* Cost Per Wear Section */}
						{hasWearPrice && (
							<div className="flex flex-col gap-3">
								<h3 className="text-sm font-semibold text-foreground">Cost Per Wear</h3>

								{/* CPW Value Display */}
								<div className="bg-gradient-to-br from-sun-50 to-meadow-50 p-4 rounded-lg border border-sun-200">
									<div className="flex items-baseline gap-1">
										<span className="text-2xl font-bold text-foreground">
											${calculateCostPerWear(item.purchase_price, item.retail_price, item.wears)}
										</span>
										<span className="text-sm text-muted-foreground">/wear</span>
									</div>

									{/* Calculation explanation */}
									<div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-sun-200">
										<p>
											${item.purchase_price || item.retail_price} ÷ {item.wears || 0}{" "}
											{item.wears === 1 ? "wear" : "wears"}
										</p>
									</div>
								</div>

								{/* Progress Section */}
								<div className="mt-2">
									<CostPerWearProgress item={item} />
								</div>

								<p className="text-xs text-muted-foreground">
									Add more wears to improve your cost per wear value and justify the purchase!
								</p>
							</div>
						)}

						{/* Size & Comfort Info */}
						{(item.size_tried || comfortInfo) && (
							<>
								<div className="h-px bg-stone-200" />

								<div className="flex flex-col gap-2">
									<h3 className="text-sm font-semibold text-foreground">Item Details</h3>

									<div className="space-y-2">
										{item.size_tried && (
											<div className="flex items-center justify-between text-sm">
												<span className="text-muted-foreground">Size</span>
												<span className="font-medium">{item.size_tried}</span>
											</div>
										)}

										{comfortInfo && (
											<div className="flex items-center justify-between text-sm">
												<span className="text-muted-foreground">Comfort</span>
												<span className={`font-medium ${comfortInfo.color}`}>
													{comfortInfo.label}
												</span>
											</div>
										)}

										{item.store_name && (
											<div className="flex items-center justify-between text-sm">
												<span className="text-muted-foreground">Store</span>
												<span className="font-medium text-xs">{item.store_name}</span>
											</div>
										)}
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
