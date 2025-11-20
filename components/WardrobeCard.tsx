/**
 * DEPRECATED: Use WardrobeItemCard instead
 *
 * This file is maintained for backwards compatibility.
 * It adapts the old API to the new modular WardrobeItemCard.
 *
 * @deprecated - Use @/components/wardrobe-item-card/WardrobeItemCard instead
 */

"use client";

import { WardrobeItem } from './types/WardrobeItem';
import { WardrobeItemCard } from "./wardrobe-item-card/WardrobeItemCard";

/**
 * @deprecated - Props interface kept for backwards compatibility
 * Use WardrobeItemCard with grouped `actions` prop instead
 */
export interface WardrobeItemCardProps {
	entry: WardrobeItem;
	onEdit: (entry: WardrobeItem) => void;
	onDelete: (entry: WardrobeItem) => void;
	viewMode?: 'journal' | 'collection' | 'archive' | 'wishlist';
	onIncrementWear?: (entry: WardrobeItem) => void;
	onDecrementWear?: (entry: WardrobeItem) => void;
	onMoveToWatchlist?: (entry: WardrobeItem) => void;
	onArchive?: (entry: WardrobeItem) => void;
	onRestore?: (entry: WardrobeItem) => void;
	onMarkAsPurchased?: (entry: WardrobeItem) => void;
	onUnarchive?: (entry: WardrobeItem) => void;
	onCreateOutfit?: (entry: WardrobeItem) => void;
	onRefreshPrice?: (itemId: string) => Promise<void>;
	onManualEntrySuccess?: () => void;
	onTogglePinned?: (entry: WardrobeItem) => void;
	isArchivePage?: boolean;
	purchaseDate?: string | null;
	userWardrobe?: WardrobeItem[];
}

/**
 * @deprecated - Use WardrobeItemCard directly
 *
 * Backwards-compatible adapter component.
 * Converts old prop structure to new WardrobeItemCard API.
 *
 * @example
 * // OLD (deprecated)
 * <WardrobeItemCard
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
	onRefreshPrice,
	onManualEntrySuccess,
	onTogglePinned,
	isArchivePage = false,
	purchaseDate,
	userWardrobe = [],
}: WardrobeItemCardProps) {
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
				onRefreshPrice,
				onManualEntrySuccess,
				onTogglePinned,
			}}
			isArchivePage={isArchivePage}
			purchaseDate={purchaseDate}
			userWardrobe={userWardrobe}
		/>
	);
}

// Export WardrobeItemCard directly for new implementations
export { WardrobeItemCard } from "./wardrobe-item-card/WardrobeItemCard";
