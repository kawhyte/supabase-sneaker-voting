import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfileView } from "@/components/social/UserProfile/PublicProfileView";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
}

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

async function fetchWishlistItems(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from("items")
    .select(ITEM_SELECT)
    .eq("user_id", userId)
    .eq("status", "wishlisted")
    .eq("is_archived", false)
    .eq("category", "sneakers")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .order("is_main_image", { foreignTable: "item_photos", ascending: false })
    .order("image_order", { foreignTable: "item_photos", ascending: true });

  if (error) console.error("[User Profile] Error fetching wishlist items:", error);
  return data || [];
}

async function fetchCollectionItems(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from("items")
    .select(ITEM_SELECT)
    .eq("user_id", userId)
    .eq("status", "owned")
    .eq("is_archived", false)
    .eq("category", "sneakers")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .order("is_main_image", { foreignTable: "item_photos", ascending: false })
    .order("image_order", { foreignTable: "item_photos", ascending: true });

  if (error) console.error("[User Profile] Error fetching collection items:", error);
  return data || [];
}

async function fetchProfileData(targetUserId: string) {
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, wishlist_privacy, collection_privacy, follower_count, following_count")
    .eq("id", targetUserId)
    .single();

  if (profileError || !profile) return null;

  const transformedProfile = {
    id: profile.id,
    name: profile.display_name || "Anonymous",
    avatar_url: profile.avatar_url,
    follower_count: profile.follower_count || 0,
    following_count: profile.following_count || 0,
  };

  const isOwnProfile = currentUser?.id === targetUserId;

  // Own profile: full access regardless of privacy settings
  if (isOwnProfile) {
    const [collectionItems, wishlistItems] = await Promise.all([
      fetchCollectionItems(supabase, targetUserId),
      fetchWishlistItems(supabase, targetUserId),
    ]);
    return {
      profile: transformedProfile,
      collectionItems,
      wishlistItems,
      sneakerCount: collectionItems.length,
      collectionCanView: true,
      wishlistCanView: true,
      isOwnProfile: true,
    };
  }

  // Resolve follow status once (reused for both privacy checks below)
  let isFollowing = false;
  const needsFollowCheck =
    profile.wishlist_privacy === "followers_only" ||
    profile.collection_privacy === "followers_only";

  if (needsFollowCheck && currentUser) {
    const { data } = await supabase.rpc("is_following", { target_user_id: targetUserId });
    isFollowing = data === true;
  }

  // --- Collection access ---
  const collectionPrivacy = profile.collection_privacy || "private";
  let collectionCanView = false;
  let collectionItems: Awaited<ReturnType<typeof fetchCollectionItems>> = [];
  let collectionReason: "private" | "followers_only" | undefined;

  if (collectionPrivacy === "public") {
    collectionCanView = true;
    collectionItems = await fetchCollectionItems(supabase, targetUserId);
  } else if (collectionPrivacy === "followers_only") {
    if (currentUser && isFollowing) {
      collectionCanView = true;
      collectionItems = await fetchCollectionItems(supabase, targetUserId);
    } else {
      collectionReason = "followers_only";
    }
  } else {
    collectionReason = "private";
  }

  // --- Wishlist access ---
  const wishlistPrivacy = profile.wishlist_privacy || "private";
  let wishlistCanView = false;
  let wishlistItems: Awaited<ReturnType<typeof fetchWishlistItems>> = [];
  let wishlistReason: "private" | "followers_only" | undefined;

  if (wishlistPrivacy === "public") {
    wishlistCanView = true;
    wishlistItems = await fetchWishlistItems(supabase, targetUserId);
  } else if (wishlistPrivacy === "followers_only") {
    if (currentUser && isFollowing) {
      wishlistCanView = true;
      wishlistItems = await fetchWishlistItems(supabase, targetUserId);
    } else {
      wishlistReason = "followers_only";
    }
  } else {
    wishlistReason = "private";
  }

  return {
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
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params;

  try {
    const data = await fetchProfileData(userId);
    if (!data) return { title: "User Not Found" };

    const userName = data.profile?.name || "User";
    return {
      title: `${userName}'s Sneaker Collection | PurrView`,
      description: `Check out ${userName}'s sneaker collection on PurrView`,
      openGraph: {
        title: `${userName}'s Sneaker Collection`,
        description: `Check out ${userName}'s sneaker collection on PurrView`,
        type: "profile",
      },
    };
  } catch {
    return { title: "User Profile" };
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const { userId } = await params;

  try {
    const data = await fetchProfileData(userId);
    if (!data) notFound();

    return <PublicProfileView data={data} />;
  } catch (error) {
    console.error("Error loading profile:", error);
    notFound();
  }
}
