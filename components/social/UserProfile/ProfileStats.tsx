"use client";

import { useState } from "react";
import { FollowersDrawer } from "@/components/social/FollowersDrawer";
import type { DrawerMode } from "@/components/social/FollowersDrawer";
import { trackEvent, AnalyticsEvent } from "@/lib/analytics";

interface ProfileStatsProps {
  userId: string;
  sneakerCount: number;
  followerCount: number;
  followingCount: number;
}

export function ProfileStats({
  userId,
  sneakerCount,
  followerCount,
  followingCount,
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

  return (
    <>
      <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        <span className="font-medium text-foreground">
          {sneakerCount}
        </span>
        <span>{sneakerCount === 1 ? "sneaker" : "sneakers"}</span>

        <span className="select-none mx-1">·</span>

        <button
          type="button"
          className="font-medium text-foreground hover:text-primary transition-colors hover:underline underline-offset-2"
          onClick={openFollowersDrawer}
        >
          {followerCount}
        </button>
        <button
          type="button"
          className="hover:text-primary transition-colors hover:underline underline-offset-2"
          onClick={openFollowersDrawer}
        >
          {followerCount === 1 ? "follower" : "followers"}
        </button>

        <span className="select-none mx-1">·</span>

        <button
          type="button"
          className="font-medium text-foreground hover:text-primary transition-colors hover:underline underline-offset-2"
          onClick={openFollowingDrawer}
        >
          {followingCount}
        </button>
        <button
          type="button"
          className="hover:text-primary transition-colors hover:underline underline-offset-2"
          onClick={openFollowingDrawer}
        >
          following
        </button>
      </div>

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
