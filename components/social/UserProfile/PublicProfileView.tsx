"use client";

import { useEffect } from "react";
import { WardrobeItem } from "@/components/types/WardrobeItem";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";
import { ItemGrid } from "./ItemGrid";
import { EmptyWishlist } from "./EmptyWishlist";
import { FollowButton } from "@/components/social/FollowButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackEvent, AnalyticsEvent } from "@/lib/analytics";

export interface PublicProfileData {
  profile: {
    id: string;
    name: string;
    avatar_url: string | null;
    follower_count: number;
    following_count: number;
  };
  collectionItems: WardrobeItem[];
  wishlistItems: WardrobeItem[];
  sneakerCount: number;
  collectionCanView: boolean;
  wishlistCanView: boolean;
  collectionReason?: "private" | "followers_only";
  wishlistReason?: "private" | "followers_only";
  isFollowing?: boolean;
  isOwnProfile: boolean;
}

interface PublicProfileViewProps {
  data: PublicProfileData;
}

export function PublicProfileView({ data }: PublicProfileViewProps) {
  const {
    profile,
    collectionItems,
    wishlistItems,
    sneakerCount,
    collectionCanView,
    wishlistCanView,
    collectionReason,
    wishlistReason,
    isFollowing,
    isOwnProfile,
  } = data;

  useEffect(() => {
    if (!isOwnProfile) {
      trackEvent(AnalyticsEvent.PUBLIC_PROFILE_VIEWED, {
        profile_user_id: profile.id,
        collection_can_view: collectionCanView,
        wishlist_can_view: wishlistCanView,
        collection_count: collectionItems.length,
        wishlist_count: wishlistItems.length,
      });
    }
  }, [profile.id, collectionCanView, wishlistCanView, collectionItems.length, wishlistItems.length, isOwnProfile]);

  const followAction =
    !isFollowing && !isOwnProfile ? (
      <FollowButton targetUserId={profile.id} source="profile" variant="default" />
    ) : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Instagram-style header: avatar left, name + stats right */}
      <ProfileHeader
        userId={profile.id}
        name={profile.name}
        avatarUrl={profile.avatar_url}
        isOwnProfile={isOwnProfile}
        statsSlot={
          <ProfileStats
            userId={profile.id}
            sneakerCount={sneakerCount}
            followerCount={profile.follower_count || 0}
            followingCount={profile.following_count || 0}
          />
        }
      />

      {/* Collection / Wishlist tabs */}
      <Tabs defaultValue="collection" className="mt-2">
        <TabsList className="w-full justify-start rounded-none bg-transparent border-b border-border h-auto p-0 gap-0">
          <TabsTrigger
            value="collection"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-colors"
          >
            Collection
          </TabsTrigger>
          <TabsTrigger
            value="wishlist"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-6 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-colors"
          >
            Wishlist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collection" className="mt-8">
          {collectionCanView && collectionItems.length > 0 ? (
            <ItemGrid items={collectionItems} viewMode="collection" />
          ) : (
            <EmptyWishlist
              reason={collectionReason ?? "empty"}
              userName={isOwnProfile ? "You" : profile.name}
              context="collection"
              action={
                collectionReason === "followers_only" ? followAction : undefined
              }
            />
          )}
        </TabsContent>

        <TabsContent value="wishlist" className="mt-8">
          {wishlistCanView && wishlistItems.length > 0 ? (
            <ItemGrid items={wishlistItems} viewMode="wishlist" />
          ) : (
            <EmptyWishlist
              reason={wishlistReason ?? "empty"}
              userName={isOwnProfile ? "You" : profile.name}
              context="wishlist"
              action={
                wishlistReason === "followers_only" ? followAction : undefined
              }
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
