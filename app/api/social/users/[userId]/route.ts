import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/social/users/[userId]
 * Fetch public profile data for a user with privacy enforcement
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetUserId } = await params;
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
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
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
            photo_url,
            display_order
          )
        `)
        .eq("user_id", targetUserId)
        .eq("status", "wishlisted")
        .eq("is_archived", false)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (itemsError) {
        console.error("Error fetching own items:", itemsError);
        return NextResponse.json(
          { error: "Failed to fetch items" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        profile: transformedProfile,
        items: items || [],
        canView: true,
        isOwnProfile: true,
      });
    }

    // Check privacy settings for other users
    const privacy = profile.wishlist_privacy || "private";

    // Private wishlist - no one can view
    if (privacy === "private") {
      return NextResponse.json({
        profile: transformedProfile,
        items: [],
        canView: false,
        reason: "private",
        isOwnProfile: false,
      });
    }

    // Public wishlist - anyone can view
    if (privacy === "public") {
      const { data: items, error: itemsError } = await supabase
        .from("items")
        .select(`
          *,
          item_photos (
            id,
            photo_url,
            display_order
          )
        `)
        .eq("user_id", targetUserId)
        .eq("status", "wishlisted")
        .eq("is_archived", false)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (itemsError) {
        console.error("Error fetching public items:", itemsError);
        return NextResponse.json(
          { error: "Failed to fetch items" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        profile: transformedProfile,
        items: items || [],
        canView: true,
        reason: "public",
        isOwnProfile: false,
      });
    }

    // Followers-only wishlist - check follow status
    if (privacy === "followers_only") {
      if (!currentUser) {
        // Not authenticated - can't view followers-only
        return NextResponse.json({
          profile: transformedProfile,
          items: [],
          canView: false,
          reason: "followers_only",
          isFollowing: false,
          isOwnProfile: false,
        });
      }

      // Check if current user is following target user
      const { data: isFollowingData } = await supabase
        .rpc("is_following", { target_user_id: targetUserId });

      const isFollowing = isFollowingData === true;

      if (!isFollowing) {
        // Not following - can't view
        return NextResponse.json({
          profile: transformedProfile,
          items: [],
          canView: false,
          reason: "followers_only",
          isFollowing: false,
          isOwnProfile: false,
        });
      }

      // Following - can view
      const { data: items, error: itemsError } = await supabase
        .from("items")
        .select(`
          *,
          item_photos (
            id,
            photo_url,
            display_order
          )
        `)
        .eq("user_id", targetUserId)
        .eq("status", "wishlisted")
        .eq("is_archived", false)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (itemsError) {
        console.error("Error fetching followers-only items:", itemsError);
        return NextResponse.json(
          { error: "Failed to fetch items" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        profile: transformedProfile,
        items: items || [],
        canView: true,
        reason: "followers_only",
        isFollowing: true,
        isOwnProfile: false,
      });
    }

    // Fallback - treat as private
    return NextResponse.json({
      profile: transformedProfile,
      items: [],
      canView: false,
      reason: "private",
      isOwnProfile: false,
    });
  } catch (error) {
    console.error("Error in GET /api/social/users/[userId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
