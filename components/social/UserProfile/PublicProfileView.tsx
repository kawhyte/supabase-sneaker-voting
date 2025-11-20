"use client";

import { WardrobeItem } from "@/components/types/WardrobeItem";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";
import { WishlistSection } from "./WishlistSection";
import { EmptyWishlist } from "./EmptyWishlist";
import { FollowButton } from "@/components/social/FollowButton";

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
