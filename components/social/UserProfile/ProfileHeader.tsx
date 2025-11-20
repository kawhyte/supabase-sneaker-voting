"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/social/FollowButton";

interface ProfileHeaderProps {
  userId: string;
  name: string;
  avatarUrl: string | null;
  isOwnProfile: boolean;
}

export function ProfileHeader({
  userId,
  name,
  avatarUrl,
  isOwnProfile,
}: ProfileHeaderProps) {
  // Get initials for avatar fallback
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center gap-6 py-8 sm:flex-row sm:items-start">
      {/* Avatar */}
      <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
        <AvatarImage src={avatarUrl || undefined} alt={name} />
        <AvatarFallback className="text-2xl font-semibold sm:text-3xl">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* User Info */}
      <div className="flex flex-1 flex-col items-center gap-4 sm:items-start">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <h1 className="text-3xl font-bold text-foreground">{name}</h1>
        </div>

        {/* Follow Button (only show if not own profile) */}
        {!isOwnProfile && (
          <FollowButton targetUserId={userId} source="profile" />
        )}
      </div>
    </div>
  );
}
