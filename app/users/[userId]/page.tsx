import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfileView } from "@/components/social/UserProfile/PublicProfileView";
import { createClient } from "@/utils/supabase/server";

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
}

// Shared function to fetch profile data directly from database
async function fetchProfileData(targetUserId: string) {
  const supabase = await createClient();

  // Get current user (may be null for unauthenticated requests)
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // Fetch target user's profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, wishlist_privacy, follower_count, following_count")
    .eq("id", targetUserId)
    .single();

  if (profileError || !profile) {
    return null;
  }

  // Transform profile to match expected interface (display_name → name)
  const transformedProfile = {
    id: profile.id,
    name: profile.display_name || 'Anonymous',
    avatar_url: profile.avatar_url,
    follower_count: profile.follower_count || 0,
    following_count: profile.following_count || 0,
  };

  // Check if current user is viewing their own profile
  const isOwnProfile = currentUser?.id === targetUserId;

  // If viewing own profile, return full data
  if (isOwnProfile) {
    const { data: items, error: itemsError } = await supabase
      .from("items")
      .select(`
        *,
        item_photos (
          id,
          image_url,
          image_order
        )
      `)
      .eq("user_id", targetUserId)
      .eq("status", "wishlisted")
      .eq("is_archived", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (itemsError) {
      console.error("Error fetching own wishlist items:", itemsError);
    }
    console.log(`[User Profile] Own profile - found ${items?.length || 0} wishlist items for user ${targetUserId}`);

    return {
      profile: transformedProfile,
      items: items || [],
      canView: true,
      isOwnProfile: true,
    };
  }

  // Check privacy settings for other users
  const privacy = profile.wishlist_privacy || "private";

  // Private wishlist - no one can view
  if (privacy === "private") {
    return {
      profile: transformedProfile,
      items: [],
      canView: false,
      reason: "private" as const,
      isOwnProfile: false,
    };
  }

  // Public wishlist - anyone can view
  if (privacy === "public") {
    const { data: items, error: itemsError } = await supabase
      .from("items")
      .select(`
        *,
        item_photos (
          id,
          image_url,
          image_order
        )
      `)
      .eq("user_id", targetUserId)
      .eq("status", "wishlisted")
      .eq("is_archived", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (itemsError) {
      console.error("Error fetching public wishlist items:", itemsError);
    }
    console.log(`[User Profile] Public profile - found ${items?.length || 0} wishlist items for user ${targetUserId}`);

    return {
      profile: transformedProfile,
      items: items || [],
      canView: true,
      reason: "public" as const,
      isOwnProfile: false,
    };
  }

  // Followers-only wishlist - check follow status
  if (privacy === "followers_only") {
    if (!currentUser) {
      // Not authenticated - can't view followers-only
      return {
        profile: transformedProfile,
        items: [],
        canView: false,
        reason: "followers_only" as const,
        isFollowing: false,
        isOwnProfile: false,
      };
    }

    // Check if current user is following target user
    const { data: isFollowingData } = await supabase
      .rpc("is_following", { target_user_id: targetUserId });

    const isFollowing = isFollowingData === true;

    if (!isFollowing) {
      // Not following - can't view
      return {
        profile: transformedProfile,
        items: [],
        canView: false,
        reason: "followers_only" as const,
        isFollowing: false,
        isOwnProfile: false,
      };
    }

    // Following - can view
    const { data: items, error: itemsError } = await supabase
      .from("items")
      .select(`
        *,
        item_photos (
          id,
          image_url,
          image_order
        )
      `)
      .eq("user_id", targetUserId)
      .eq("status", "wishlisted")
      .eq("is_archived", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (itemsError) {
      console.error("Error fetching followers-only wishlist items:", itemsError);
    }
    console.log(`[User Profile] Followers-only profile - found ${items?.length || 0} wishlist items for user ${targetUserId}`);

    return {
      profile: transformedProfile,
      items: items || [],
      canView: true,
      reason: "followers_only" as const,
      isFollowing: true,
      isOwnProfile: false,
    };
  }

  // Fallback - treat as private
  return {
    profile: transformedProfile,
    items: [],
    canView: false,
    reason: "private" as const,
    isOwnProfile: false,
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params;

  try {
    const data = await fetchProfileData(userId);

    if (!data) {
      return {
        title: "User Not Found",
      };
    }

    const userName = data.profile?.name || "User";

    return {
      title: `${userName}'s Wishlist | PurrView`,
      description: `Check out ${userName}'s wishlist on PurrView`,
      openGraph: {
        title: `${userName}'s Wishlist`,
        description: `Check out ${userName}'s wishlist on PurrView`,
        type: "profile",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "User Profile",
    };
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const { userId } = await params;

  try {
    const data = await fetchProfileData(userId);

    if (!data) {
      notFound();
    }

    return <PublicProfileView data={data} />;
  } catch (error) {
    console.error("Error loading profile:", error);
    notFound();
  }
}
