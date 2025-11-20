"use client";

import { Lock, Users, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyWishlistProps {
  reason: "private" | "followers_only" | "empty";
  action?: React.ReactNode;
  userName?: string;
}

export function EmptyWishlist({ reason, action, userName }: EmptyWishlistProps) {
  const config = {
    private: {
      icon: Lock,
      title: "This wishlist is private",
      description: `${userName || "This user"} has chosen to keep their wishlist private.`,
    },
    followers_only: {
      icon: Users,
      title: "Follow to see wishlist",
      description: `${userName || "This user"} shares their wishlist with followers only.`,
    },
    empty: {
      icon: Package,
      title: "No wishlist items yet",
      description: `${userName || "This user"} hasn't added any items to their wishlist.`,
    },
  };

  const { icon: Icon, title, description } = config[reason];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-6 rounded-full bg-muted p-6">
        <Icon className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-2xl font-semibold text-foreground">{title}</h3>
      <p className="mb-6 max-w-md text-base text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
