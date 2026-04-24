"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/social/FollowButton";

interface ProfileHeaderProps {
  userId: string;
  name: string;
  avatarUrl: string | null;
  isOwnProfile: boolean;
  statsSlot?: React.ReactNode;
}

export function ProfileHeader({
  userId,
  name,
  avatarUrl,
  isOwnProfile,
  statsSlot,
}: ProfileHeaderProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-start gap-5 py-8">
      {/* Avatar */}
      <Avatar className="h-20 w-20 shrink-0">
        <AvatarImage src={avatarUrl || undefined} alt={name} />
        <AvatarFallback className="text-xl font-semibold">{initials}</AvatarFallback>
      </Avatar>

      {/* Right column: name + follow + stats */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground truncate">{name}</h1>
          {!isOwnProfile && (
            <FollowButton targetUserId={userId} source="profile" className="shrink-0" />
          )}
        </div>
        {statsSlot}
      </div>
    </div>
  );
}
