/**
 * WardrobeListView - Container for list view display
 *
 * Renders wardrobe items as horizontal rows with inline expansion
 * Replaces the grid layout when density is set to "list"
 *
 * Features:
 * - High information density
 * - Click row to expand details inline
 * - Maintains all card functionality (edit, delete, wear tracking, etc.)
 * - Responsive: shows on desktop/tablet (≥768px)
 * - Falls back to card grid on mobile (<768px)
 */

"use client";

import { motion } from "framer-motion";
import { WardrobeItem } from "@/components/types/WardrobeItem";
import { WardrobeListItem } from "./WardrobeListItem";
import { ReactNode } from "react";

interface WardrobeListViewProps {
	entries: WardrobeItem[];
	onEdit: (entry: WardrobeItem) => void;
	onDelete: (entry: WardrobeItem) => void;
	onIncrementWear?: (entry: WardrobeItem) => void;
	onDecrementWear?: (entry: WardrobeItem) => void;
	onMoveToWatchlist?: (entry: WardrobeItem) => void;
	onArchive?: (entry: WardrobeItem) => void;
	onMarkAsPurchased?: (entry: WardrobeItem) => void;
	onCreateOutfit?: (entry: WardrobeItem) => void;
	onRefreshPrice?: (itemId: string) => Promise<void>;
	onManualEntrySuccess?: () => void;
	onTogglePinned?: (entry: WardrobeItem) => void;
	emptyState?: ReactNode;
	viewMode?: "journal" | "collection" | "archive" | "wishlist";
	isArchivePage?: boolean;
	userWardrobe?: WardrobeItem[];
}

export function WardrobeListView({
	entries,
	onEdit,
	onDelete,
	onIncrementWear,
	onDecrementWear,
	onMoveToWatchlist,
	onArchive,
	onMarkAsPurchased,
	onCreateOutfit,
	onRefreshPrice,
	onManualEntrySuccess,
	onTogglePinned,
	emptyState,
	viewMode = "journal",
	isArchivePage = false,
	userWardrobe = [],
}: WardrobeListViewProps) {
	if (entries.length === 0) {
		return emptyState || null;
	}

	return (
		<motion.div
			className="flex flex-col bg-card rounded-lg border border-stone-200 shadow-sm overflow-hidden"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
		>
			{/* List Header - Matches row column widths exactly */}
			<div className="hidden lg:flex items-center gap-3 px-4 py-3 bg-stone-100 border-b border-stone-200 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
				<div className="flex-shrink-0 w-5"></div> {/* Spacer for expand icon */}
				<div className="flex-shrink-0 w-16 lg:w-20">Image</div>
				<div className="flex-1 min-w-0 max-w-[550px]">Item</div>
				<div className="flex-shrink-0 w-20">Size</div>
				<div className="flex-shrink-0 w-48 text-right">Price</div>
				<div className="flex-shrink-0 w-[300px] ml-12">Status</div>
				<div className="flex-shrink-0 w-8 ml-4 text-right">Actions</div>
			</div>

			{/* List Items */}
			<div className="divide-y divide-stone-200">
				{entries.map((entry) => (
					<WardrobeListItem
						key={entry.id}
						item={entry}
						viewMode={viewMode}
						actions={{
							onEdit,
							onDelete,
							onIncrementWear,
							onDecrementWear,
							onMoveToWatchlist,
							onArchive,
							onMarkAsPurchased,
							onCreateOutfit,
							onRefreshPrice,
							onManualEntrySuccess,
							onTogglePinned,
						}}
						isArchivePage={isArchivePage}
					/>
				))}
			</div>
		</motion.div>
	);
}
