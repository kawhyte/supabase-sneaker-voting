"use client";

import { useState } from "react";
import { FollowersDrawer } from "@/components/social/FollowersDrawer";
import type { DrawerMode } from "@/components/social/FollowersDrawer";
import { trackEvent, AnalyticsEvent } from "@/lib/analytics";

interface ProfileStatsProps {
  userId: string;
  followerCount: number;
  followingCount: number;
  wishlistCount: number;
}

export function ProfileStats({
  userId,
  followerCount,
  followingCount,
  wishlistCount,
}: ProfileStatsProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("followers");

  const openFollowersDrawer = () => {
    setDrawerMode("followers");
    setDrawerOpen(true);
    trackEvent(AnalyticsEvent.FOLLOWERS_MODAL_OPENED, {
      profile_user_id: userId,
      follower_count: followerCount,
    });
  };

  const openFollowingDrawer = () => {
    setDrawerMode("following");
    setDrawerOpen(true);
    trackEvent(AnalyticsEvent.FOLLOWING_MODAL_OPENED, {
      profile_user_id: userId,
      following_count: followingCount,
    });
  };

  const stats = [
    { label: "Wishlist", value: wishlistCount, clickable: false },
    {
      label: followerCount === 1 ? "Follower" : "Followers",
      value: followerCount,
      clickable: true,
      onClick: openFollowersDrawer,
    },
    {
      label: "Following",
      value: followingCount,
      clickable: true,
      onClick: openFollowingDrawer,
    },
  ];

  return (
    <>
      <div className="flex items-center justify-center gap-8 border-y border-border py-6 sm:justify-start">
        {stats.map((stat) => (
          <button
            key={stat.label}
            className={`flex flex-col items-center gap-1 sm:items-start ${
              stat.clickable
                ? "cursor-pointer hover:opacity-75 transition-opacity group"
                : "cursor-default"
            }`}
            onClick={stat.clickable ? stat.onClick : undefined}
            disabled={!stat.clickable}
            type="button"
          >
            <span className="text-2xl font-bold text-foreground">
              {stat.value}
            </span>
            <span
              className={`text-sm ${
                stat.clickable
                  ? "text-muted-foreground group-hover:text-sun-400 transition-colors"
                  : "text-muted-foreground"
              }`}
            >
              {stat.label}
            </span>
          </button>
        ))}
      </div>

      {/* Followers/Following Drawer */}
      <FollowersDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        userId={userId}
        mode={drawerMode}
        initialCount={drawerMode === "followers" ? followerCount : followingCount}
      />
    </>
  );
}
