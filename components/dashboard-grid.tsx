/**
 * DashboardGrid - Client component wrapper for dashboard grid with density support
 *
 * Separates density logic from server-side logic to avoid SSR issues
 */

"use client";

import { motion } from "framer-motion";
import { useDensity, getDensityGridClasses } from "@/lib/view-density-context";
import { SizingJournalEntry } from "./types/sizing-journal-entry";
import { SizingJournalEntryCard } from "./sizing-journal-entry-card";
import { ReactNode } from "react";

interface DashboardGridProps {
	entries: SizingJournalEntry[];
	onEdit: (entry: SizingJournalEntry) => void;
	onDelete: (entry: SizingJournalEntry) => void;
	onIncrementWear?: (entry: SizingJournalEntry) => void;
	onDecrementWear?: (entry: SizingJournalEntry) => void;
	onMoveToWatchlist?: (entry: SizingJournalEntry) => void;
	onArchive?: (entry: SizingJournalEntry) => void;
	onMarkAsPurchased?: (entry: SizingJournalEntry) => void;
	emptyState?: ReactNode;
	viewMode?: 'journal' | 'collection' | 'archive' | 'wishlist';
	isArchivePage?: boolean;
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
	emptyState,
	viewMode = 'journal',
	isArchivePage = false,
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
			transition={{ duration: 0.3 }}
		>
			{entries.map((entry) => (
				<SizingJournalEntryCard
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
					isArchivePage={isArchivePage}
				/>
			))}
		</motion.div>
	);
}
