"use client";

import { WardrobeItem } from "@/components/types/WardrobeItem";
import { WardrobeItemCard } from "@/components/wardrobe-item-card/WardrobeItemCard";

interface WishlistSectionProps {
  items: WardrobeItem[];
}

const noopHandler = () => {};
const noopAsyncHandler = async () => {};

export function WishlistSection({ items }: WishlistSectionProps) {

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="py-6">
      <h2 className="mb-6 text-2xl font-bold text-foreground">Wishlist</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <WardrobeItemCard
            key={item.id}
            item={item}
            viewMode="wishlist"
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
    </div>
  );
}
