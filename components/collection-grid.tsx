/**
 * CollectionGrid - Client component wrapper for grid with density support
 *
 * Separates density logic from server-side logic to avoid SSR issues
 */

"use client";

import { useDensity, getDensityGridClasses } from "@/lib/view-density-context";
import { SizingJournalEntry, ArchiveReason } from "./types/sizing-journal-entry";
import { SizingJournalEntryCard } from "./sizing-journal-entry-card";
import { ReactNode } from "react";

interface CollectionGridProps {
	items: SizingJournalEntry[];
	role: string;
	ariaLabel: string;
	onEdit: (entry: SizingJournalEntry) => void;
	onDelete: (entry: SizingJournalEntry) => void;
	onArchive?: (entry: SizingJournalEntry, reason: ArchiveReason) => void;
	onUnarchive?: (entry: SizingJournalEntry) => void;
	onMarkAsPurchased?: (entry: SizingJournalEntry) => void;
	isArchivePage?: boolean;
	emptyState?: ReactNode;
	viewMode?: 'journal' | 'collection' | 'archive' | 'wishlist';
}

export function CollectionGrid({
	items,
	role,
	ariaLabel,
	onEdit,
	onDelete,
	onArchive,
	onUnarchive,
	onMarkAsPurchased,
	isArchivePage,
	emptyState,
	viewMode = 'journal',
}: CollectionGridProps) {
	const { density } = useDensity();
	const gridClasses = getDensityGridClasses(density);

	if (items.length === 0) {
		return emptyState || null;
	}

	return (
		<div className={`grid ${gridClasses}`} role={role} aria-label={ariaLabel}>
			{items.map((item) => (
				<SizingJournalEntryCard
					key={item.id}
					entry={item}
					viewMode={viewMode}
					onEdit={onEdit}
					onDelete={onDelete}
					onRestore={onUnarchive}
					isArchivePage={isArchivePage}
				/>
			))}
		</div>
	);
}
