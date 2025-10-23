/**
 * DEPRECATED: Use WardrobeItemCard instead
 *
 * This file is maintained for backwards compatibility.
 * It adapts the old API to the new modular WardrobeItemCard.
 *
 * @deprecated - Use @/components/wardrobe-item-card/WardrobeItemCard instead
 */

"use client";

import { SizingJournalEntry } from "./types/sizing-journal-entry";
import { WardrobeItemCard } from "./wardrobe-item-card/wardrobe-item-card";

/**
 * @deprecated - Props interface kept for backwards compatibility
 * Use WardrobeItemCard with grouped `actions` prop instead
 */
export interface SizingJournalEntryCardProps {
	entry: SizingJournalEntry;
	onEdit: (entry: SizingJournalEntry) => void;
	onDelete: (entry: SizingJournalEntry) => void;
	viewMode?: 'journal' | 'collection' | 'archive' | 'wishlist';
	onIncrementWear?: (entry: SizingJournalEntry) => void;
	onDecrementWear?: (entry: SizingJournalEntry) => void;
	onMoveToWatchlist?: (entry: SizingJournalEntry) => void;
	onArchive?: (entry: SizingJournalEntry) => void;
	onRestore?: (entry: SizingJournalEntry) => void;
	onMarkAsPurchased?: (entry: SizingJournalEntry) => void;
	onUnarchive?: (entry: SizingJournalEntry) => void;
	onCreateOutfit?: (entry: SizingJournalEntry) => void;
	isArchivePage?: boolean;
	purchaseDate?: string | null;
	userWardrobe?: SizingJournalEntry[];
}

/**
 * @deprecated - Use WardrobeItemCard directly
 *
 * Backwards-compatible adapter component.
 * Converts old prop structure to new WardrobeItemCard API.
 *
 * @example
 * // OLD (deprecated)
 * <SizingJournalEntryCard
 *   entry={item}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onMarkAsPurchased={handlePurchased}
 * />
 *
 * // NEW (preferred)
 * <WardrobeItemCard
 *   item={item}
 *   actions={{
 *     onEdit: handleEdit,
 *     onDelete: handleDelete,
 *     onMarkAsPurchased: handlePurchased,
 *   }}
 * />
 */
export function WardrobeCard({
	entry,
	onEdit,
	onDelete,
	viewMode = 'journal',
	onIncrementWear,
	onDecrementWear,
	onMoveToWatchlist,
	onArchive,
	onRestore,
	onMarkAsPurchased,
	onUnarchive,
	onCreateOutfit,
	isArchivePage = false,
	purchaseDate,
	userWardrobe = [],
}: SizingJournalEntryCardProps) {
	return (
		<WardrobeItemCard
			item={entry}
			viewMode={viewMode}
			actions={{
				onEdit,
				onDelete,
				onIncrementWear,
				onDecrementWear,
				onMoveToWatchlist,
				onArchive,
				onUnarchive,
				onMarkAsPurchased,
				onCreateOutfit,
			}}
			isArchivePage={isArchivePage}
			purchaseDate={purchaseDate}
			userWardrobe={userWardrobe}
		/>
	);
}

// Export WardrobeItemCard directly for new implementations
export { WardrobeItemCard } from "./wardrobe-item-card/wardrobe-item-card";
