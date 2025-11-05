/**
 * CollectionGrid - Client component wrapper for grid with density support
 *
 * Separates density logic from server-side logic to avoid SSR issues
 */

"use client";

import { useDensity, getDensityGridClasses } from "@/lib/view-density-context";
import { WardrobeItem } from './types/WardrobeItem';
import { WardrobeCard } from "./WardrobeCard";
import { ReactNode } from "react";

interface CollectionGridProps {
	items: WardrobeItem[];
	role: string;
	ariaLabel: string;
	onEdit: (entry: WardrobeItem) => void;
	onDelete: (entry: WardrobeItem) => void;
	onArchive?: (entry: WardrobeItem) => void;
	onUnarchive?: (entry: WardrobeItem) => void;
	onMarkAsPurchased?: (entry: WardrobeItem) => void;
	isArchivePage?: boolean;
	emptyState?: ReactNode;
	viewMode?: "journal" | "collection" | "archive" | "wishlist";
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
	viewMode = "journal",
}: CollectionGridProps) {
	const { density } = useDensity();
	const gridClasses = getDensityGridClasses(density);

	if (items.length === 0) {
		return emptyState || null;
	}

	return (
		<div className={`grid ${gridClasses}`} role={role} aria-label={ariaLabel}>
			{items.map((item) => (
				<WardrobeCard
					key={item.id}
					entry={item}
					viewMode={viewMode}
					onEdit={onEdit}
					onDelete={onDelete}
					onArchive={onArchive}
					onMarkAsPurchased={onMarkAsPurchased}
					onRestore={onUnarchive}
					isArchivePage={isArchivePage}
				/>
			))}
		</div>
	);
}
