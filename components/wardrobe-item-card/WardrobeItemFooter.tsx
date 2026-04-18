"use client";

import { useState } from "react";
import { ArrowUpRight, Minus, Plus } from "lucide-react";
import { WardrobeItem } from '@/components/types/WardrobeItem';
import { WearStatsDrawer } from "./WearStatsDrawer";
import { calculateCostPerWear, calculateWorthItMetrics } from "@/lib/wardrobe-item-utils";

interface ItemFooterBadgesProps {
	item: WardrobeItem;
	viewMode: 'journal' | 'collection' | 'archive' | 'wishlist';
	canTrackWears?: boolean;
	onIncrementWear?: (item: WardrobeItem) => void;
	onDecrementWear?: (item: WardrobeItem) => void;
	userWardrobe?: WardrobeItem[];
}

export function ItemFooterBadges({
	item,
	viewMode,
	canTrackWears = false,
	onIncrementWear,
	onDecrementWear,
}: ItemFooterBadgesProps) {
	const [wearDrawerOpen, setWearDrawerOpen] = useState(false);
	const showWearRow = viewMode === 'collection' && canTrackWears && onIncrementWear && onDecrementWear;

	const cpw = (item.purchase_price || item.retail_price) && (item.wears ?? 0) > 0
		? calculateCostPerWear(item.purchase_price, item.retail_price, item.wears)
		: null;
	const isWorthIt = calculateWorthItMetrics(item).isWorthIt;

	if (!showWearRow) return null;

	return (
		<>
			{/* Unified editorial footer row */}
			<div className="dense flex items-center justify-between w-full">

				{/* Quick +/− with inline wear count */}
				<div className="flex items-center gap-0.5">
					<button
						onClick={(e) => { e.stopPropagation(); onDecrementWear(item); }}
						disabled={!item.wears || item.wears === 0}
						className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-accent transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
						type="button"
						aria-label="Decrease wear count">
						<Minus className="h-3.5 w-3.5" />
					</button>
					<span className="font-mono text-xs text-muted-foreground tabular-nums min-w-[4.5rem] text-center select-none">
						{item.wears ?? 0} {(item.wears ?? 0) === 1 ? 'wear' : 'wears'}
					</span>
					<button
						onClick={(e) => { e.stopPropagation(); onIncrementWear(item); }}
						className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-accent transition-colors"
						type="button"
						aria-label="Increase wear count">
						<Plus className="h-3.5 w-3.5" />
					</button>
				</div>

				{/* CPW row — Worth It dot + drawer trigger */}
				<div className="flex items-center gap-1">
				{isWorthIt && (
					<span
						className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"
						aria-label="Worth It milestone reached"
					/>
				)}
				<button
					onClick={(e) => { e.stopPropagation(); setWearDrawerOpen(true); }}
					className="group font-mono text-xs text-muted-foreground hover:text-accent transition-colors flex items-center gap-0.5"
					type="button"
					aria-label="View wear statistics">
					<span>{cpw ? `$${cpw} / wear` : '— / wear'}</span>
					<ArrowUpRight className="w-3 h-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
				</button>
				</div>
			</div>

			<WearStatsDrawer
				item={item}
				isOpen={wearDrawerOpen}
				onOpenChange={setWearDrawerOpen}
				onIncrementWear={onIncrementWear}
				onDecrementWear={onDecrementWear}
			/>
		</>
	);
}
