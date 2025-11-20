"use client";

interface ProfileStatsProps {
  followerCount: number;
  followingCount: number;
  wishlistCount: number;
}

export function ProfileStats({
  followerCount,
  followingCount,
  wishlistCount,
}: ProfileStatsProps) {
  const stats = [
    { label: "Wishlist", value: wishlistCount },
    {
      label: followerCount === 1 ? "Follower" : "Followers",
      value: followerCount,
      // TODO: Add click handler in Phase 4 to open followers modal
      // onClick: () => setShowFollowersModal(true)
    },
    {
      label: "Following",
      value: followingCount,
      // TODO: Add click handler in Phase 4 to open following modal
      // onClick: () => setShowFollowingModal(true)
    },
  ];

  return (
    <div className="flex items-center justify-center gap-8 border-y border-border py-6 sm:justify-start">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="flex flex-col items-center gap-1 sm:items-start"
        >
          <span className="text-2xl font-bold text-foreground">
            {stat.value}
          </span>
          <span className="text-sm text-muted-foreground">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
