"use client";

import { WardrobeItem } from "@/components/types/WardrobeItem";
import { WardrobeItemCard } from "@/components/wardrobe-item-card/WardrobeItemCard";

interface ItemGridProps {
  items: WardrobeItem[];
  viewMode: "collection" | "wishlist";
}

const noopHandler = () => {};
const noopAsyncHandler = async () => {};

export function ItemGrid({ items, viewMode }: ItemGridProps) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <WardrobeItemCard
          key={item.id}
          item={item}
          viewMode={viewMode}
          isReadOnly={true}
          actions={{
            onEdit: noopHandler,
            onDelete: noopHandler,
            onIncrementWear: noopHandler,
            onDecrementWear: noopHandler,
            onMoveToWishlist: noopHandler,
            onArchive: noopHandler,
            onUnarchive: noopHandler,
            onMarkAsPurchased: noopHandler,
            onRefreshPrice: noopAsyncHandler,
            onManualEntrySuccess: noopHandler,
            onTogglePinned: noopHandler,
          }}
        />
      ))}
    </div>
  );
}
