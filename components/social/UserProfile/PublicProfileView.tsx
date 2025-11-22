"use client";

import { useEffect } from "react";
import { WardrobeItem } from "@/components/types/WardrobeItem";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";
import { WishlistSection } from "./WishlistSection";
import { EmptyWishlist } from "./EmptyWishlist";
import { FollowButton } from "@/components/social/FollowButton";
import { trackEvent, AnalyticsEvent } from "@/lib/analytics";

interface PublicProfileData {
  profile: {
    id: string;
    name: string;
    avatar_url: string | null;
    follower_count: number;
    following_count: number;
  };
  items: WardrobeItem[];
  canView: boolean;
  reason?: "private" | "public" | "followers_only";
  isFollowing?: boolean;
  isOwnProfile: boolean;
}

interface PublicProfileViewProps {
  data: PublicProfileData;
}

export function PublicProfileView({ data }: PublicProfileViewProps) {
  const { profile, items, canView, reason, isFollowing, isOwnProfile } = data;

  // Debug logging
  console.log("[PublicProfileView] Received data:", {
    profileId: profile.id,
    profileName: profile.name,
    itemCount: items.length,
    canView,
    reason,
    isOwnProfile,
    hasItems: items && items.length > 0,
  });

  // Debug first item's photo structure
  if (items && items.length > 0) {
    console.log("[PublicProfileView] First item sample:", {
      id: items[0].id,
      brand: items[0].brand,
      model: items[0].model,
      hasItemPhotos: !!items[0].item_photos,
      itemPhotosLength: items[0].item_photos?.length || 0,
      itemPhotos: items[0].item_photos,
      hasImageUrl: !!items[0].image_url,
    });
  }

  // Track profile view on mount
  useEffect(() => {
    if (!isOwnProfile) {
      trackEvent(AnalyticsEvent.PUBLIC_PROFILE_VIEWED, {
        profile_user_id: profile.id,
        can_view: canView,
        privacy_reason: reason,
        item_count: items.length,
      });
    }
  }, [profile.id, canView, reason, items.length, isOwnProfile]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <ProfileHeader
        userId={profile.id}
        name={profile.name}
        avatarUrl={profile.avatar_url}
        isOwnProfile={isOwnProfile}
      />

      {/* Profile Stats */}
      <ProfileStats
        userId={profile.id}
        followerCount={profile.follower_count || 0}
        followingCount={profile.following_count || 0}
        wishlistCount={items.length}
      />

      {/* Wishlist Content */}
      <div className="mt-8">
        {canView ? (
          items.length > 0 ? (
            <WishlistSection items={items} />
          ) : (
            <EmptyWishlist
              reason="empty"
              userName={isOwnProfile ? "You" : profile.name}
            />
          )
        ) : (
          <EmptyWishlist
            reason={reason === "private" ? "private" : "followers_only"}
            userName={profile.name}
            action={
              reason === "followers_only" && !isFollowing ? (
                <FollowButton
                  targetUserId={profile.id}
                  source="profile"
                  variant="default"
                />
              ) : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
