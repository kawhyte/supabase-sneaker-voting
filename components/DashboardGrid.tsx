/**
 * DashboardGrid - Client component wrapper for dashboard grid with density support
 *
 * Separates density logic from server-side logic to avoid SSR issues
 */

"use client";

import { motion } from "framer-motion";
import { useDensity, getDensityGridClasses } from "@/lib/view-density-context";
import { WardrobeItem } from './types/WardrobeItem';
import { WardrobeCard } from "./WardrobeCard";
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
					isArchivePage={isArchivePage}
					userWardrobe={userWardrobe}
				/>
			))}
		</motion.div>
	);
}
