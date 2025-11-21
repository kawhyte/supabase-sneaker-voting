/**
 * DashboardGrid - Client component wrapper for dashboard grid/list with density support
 *
 * Conditionally renders either:
 * - Grid view (compact, comfortable, detailed) - Card layout
 * - List view (list) - Horizontal rows with inline expansion
 *
 * On mobile (<768px), always renders grid regardless of density
 */

"use client";

import { motion } from "framer-motion";
import { useDensity, getDensityGridClasses } from "@/lib/view-density-context";
import { WardrobeItem } from './types/WardrobeItem';
import { WardrobeCard } from "./WardrobeCard";
import { WardrobeListView } from "./wardrobe-list-view/WardrobeListView";
import { ReactNode } from "react";

interface DashboardGridProps {
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

export function DashboardGrid({
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
}: DashboardGridProps) {
	const { density } = useDensity();
	const gridClasses = getDensityGridClasses(density);

	if (entries.length === 0) {
		return emptyState || null;
	}

	// List View: Show on desktop/tablet (≥768px), fall back to compact grid on mobile
	if (density === "list") {
		return (
			<>
				{/* Desktop/Tablet: List View */}
				<div className="hidden md:block">
					<WardrobeListView
						entries={entries}
						onEdit={onEdit}
						onDelete={onDelete}
						onIncrementWear={onIncrementWear}
						onDecrementWear={onDecrementWear}
						onMoveToWatchlist={onMoveToWatchlist}
						onArchive={onArchive}
						onMarkAsPurchased={onMarkAsPurchased}
						onCreateOutfit={onCreateOutfit}
						onRefreshPrice={onRefreshPrice}
						onManualEntrySuccess={onManualEntrySuccess}
						onTogglePinned={onTogglePinned}
						emptyState={emptyState}
						viewMode={viewMode}
						isArchivePage={isArchivePage}
						userWardrobe={userWardrobe}
					/>
				</div>

				{/* Mobile: Comfortable Grid Fallback */}
				<motion.div
					className="grid md:hidden grid-cols-1 sm:grid-cols-2 gap-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
				>
					{entries.map((entry) => (
						<WardrobeCard
							key={entry.id}
							entry={entry}
							viewMode={viewMode}
							onEdit={onEdit}
							onDelete={onDelete}
							onIncrementWear={onIncrementWear}
							onDecrementWear={onDecrementWear}
							onMoveToWatchlist={onMoveToWatchlist}
							onArchive={onArchive}
							onMarkAsPurchased={onMarkAsPurchased}
							onCreateOutfit={onCreateOutfit}
							onRefreshPrice={onRefreshPrice}
							onManualEntrySuccess={onManualEntrySuccess}
							onTogglePinned={onTogglePinned}
							isArchivePage={isArchivePage}
							userWardrobe={userWardrobe}
						/>
					))}
				</motion.div>
			</>
		);
	}

	// Grid View: Compact, Comfortable, Detailed
	return (
		<motion.div
			className={`grid ${gridClasses}`}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}>
			{entries.map((entry) => (
				<WardrobeCard
					key={entry.id}
					entry={entry}
					viewMode={viewMode}
					onEdit={onEdit}
					onDelete={onDelete}
					onIncrementWear={onIncrementWear}
					onDecrementWear={onDecrementWear}
					onMoveToWatchlist={onMoveToWatchlist}
					onArchive={onArchive}
					onMarkAsPurchased={onMarkAsPurchased}
					onCreateOutfit={onCreateOutfit}
					onRefreshPrice={onRefreshPrice}
					onManualEntrySuccess={onManualEntrySuccess}
					onTogglePinned={onTogglePinned}
					isArchivePage={isArchivePage}
					userWardrobe={userWardrobe}
				/>
			))}
		</motion.div>
	);
}
