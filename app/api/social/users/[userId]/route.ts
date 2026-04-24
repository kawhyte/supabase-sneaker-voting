import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const ITEM_SELECT = `
  *,
  item_photos (
    id,
    image_url,
    image_order,
    is_main_image
  ),
  brands (
    id,
    name,
    brand_logo
  )
`;

async function queryItems(
  supabase: SupabaseClient,
  userId: string,
  status: "owned" | "wishlisted"
) {
  const { data, error } = await supabase
    .from("items")
    .select(ITEM_SELECT)
    .eq("user_id", userId)
    .eq("status", status)
    .eq("is_archived", false)
    .eq("category", "sneakers")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .order("is_main_image", { foreignTable: "item_photos", ascending: false })
    .order("image_order", { foreignTable: "item_photos", ascending: true });

  if (error) console.error(`[API /social/users] Error fetching ${status} items:`, error);
  return data || [];
}

/**
 * GET /api/social/users/[userId]
 * Returns collectionItems + wishlistItems with per-type privacy enforcement.
 * RLS is the authoritative gate; this is the application-level UX layer.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetUserId } = await params;
    const supabase = await createClient();

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, wishlist_privacy, collection_privacy, follower_count, following_count")
      .eq("id", targetUserId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const transformedProfile = {
      id: profile.id,
      name: profile.display_name || "Anonymous",
      avatar_url: profile.avatar_url,
      follower_count: profile.follower_count || 0,
      following_count: profile.following_count || 0,
    };

    const isOwnProfile = currentUser?.id === targetUserId;

    if (isOwnProfile) {
      const [collectionItems, wishlistItems] = await Promise.all([
        queryItems(supabase, targetUserId, "owned"),
        queryItems(supabase, targetUserId, "wishlisted"),
      ]);
      return NextResponse.json({
        profile: transformedProfile,
        collectionItems,
        wishlistItems,
        sneakerCount: collectionItems.length,
        collectionCanView: true,
        wishlistCanView: true,
        isOwnProfile: true,
      });
    }

    // Resolve follow status once for both privacy checks
    let isFollowing = false;
    const needsFollowCheck =
      profile.wishlist_privacy === "followers_only" ||
      profile.collection_privacy === "followers_only";

    if (needsFollowCheck && currentUser) {
      const { data } = await supabase.rpc("is_following", { target_user_id: targetUserId });
      isFollowing = data === true;
    }

    // Collection access
    const collectionPrivacy = profile.collection_privacy || "private";
    let collectionCanView = false;
    let collectionItems: Awaited<ReturnType<typeof queryItems>> = [];
    let collectionReason: "private" | "followers_only" | undefined;

    if (collectionPrivacy === "public") {
      collectionCanView = true;
      collectionItems = await queryItems(supabase, targetUserId, "owned");
    } else if (collectionPrivacy === "followers_only" && currentUser && isFollowing) {
      collectionCanView = true;
      collectionItems = await queryItems(supabase, targetUserId, "owned");
    } else {
      collectionReason = collectionPrivacy === "followers_only" ? "followers_only" : "private";
    }

    // Wishlist access
    const wishlistPrivacy = profile.wishlist_privacy || "private";
    let wishlistCanView = false;
    let wishlistItems: Awaited<ReturnType<typeof queryItems>> = [];
    let wishlistReason: "private" | "followers_only" | undefined;

    if (wishlistPrivacy === "public") {
      wishlistCanView = true;
      wishlistItems = await queryItems(supabase, targetUserId, "wishlisted");
    } else if (wishlistPrivacy === "followers_only" && currentUser && isFollowing) {
      wishlistCanView = true;
      wishlistItems = await queryItems(supabase, targetUserId, "wishlisted");
    } else {
      wishlistReason = wishlistPrivacy === "followers_only" ? "followers_only" : "private";
    }

    return NextResponse.json({
      profile: transformedProfile,
      collectionItems,
      wishlistItems,
      sneakerCount: collectionItems.length,
      collectionCanView,
      wishlistCanView,
      collectionReason,
      wishlistReason,
      isFollowing,
      isOwnProfile: false,
    });
  } catch (error) {
    console.error("Error in GET /api/social/users/[userId]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
