import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const ITEMS_PER_PAGE = 20;
const PREVIEW_ITEMS_COUNT = 4;

interface ExploreUser {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  follower_count: number;
  following_count: number;
  is_following: boolean;
  preview_items: {
    id: string;
    photo_url: string | null;
    brand: string | null;
    model: string | null;
  }[];
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      parseInt(searchParams.get('limit') || String(ITEMS_PER_PAGE)),
      50
    );
    const offset = parseInt(searchParams.get('offset') || '0');

    // Step 1: Users with a public collection OR public wishlist, sorted by recency
    const { data: publicProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, follower_count, following_count, wishlist_privacy, collection_privacy, updated_at')
      .or('wishlist_privacy.eq.public,collection_privacy.eq.public')
      .neq('id', user.id)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (profilesError) {
      console.error('Error fetching public profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    if (!publicProfiles || publicProfiles.length === 0) {
      return NextResponse.json({ users: [], total: 0, hasMore: false });
    }

    // Step 2: Total count for pagination
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .or('wishlist_privacy.eq.public,collection_privacy.eq.public')
      .neq('id', user.id);

    const totalCount = count || 0;

    // Step 3: Follow status
    const userIds = publicProfiles.map((p) => p.id);

    const { data: followData } = await supabase
      .from('followers')
      .select('following_user_id')
      .eq('follower_user_id', user.id)
      .in('following_user_id', userIds);

    const followingIds = new Set(followData?.map((f) => f.following_user_id) || []);

    // Step 4a: Owned sneakers for users with public collection (privacy = 'public' only)
    const publicCollectionUserIds = publicProfiles
      .filter((p) => p.collection_privacy === 'public')
      .map((p) => p.id);

    const ownedItemsByUser = new Map<string, { id: string; photo_url: string | null; brand: string | null; model: string | null }[]>();

    if (publicCollectionUserIds.length > 0) {
      const { data: ownedItems, error: ownedError } = await supabase
        .from('items')
        .select('id, user_id, brand, model, item_photos(id, image_url, image_order, is_main_image)')
        .eq('status', 'owned')
        .eq('is_archived', false)
        .eq('category', 'sneakers')
        .in('user_id', publicCollectionUserIds)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .order('is_main_image', { foreignTable: 'item_photos', ascending: false })
        .order('image_order', { foreignTable: 'item_photos', ascending: true });

      if (ownedError) {
        console.error('Error fetching owned preview items:', ownedError);
      } else if (ownedItems) {
        for (const item of ownedItems) {
          const uid = item.user_id;
          if (!ownedItemsByUser.has(uid)) ownedItemsByUser.set(uid, []);
          const bucket = ownedItemsByUser.get(uid)!;
          if (bucket.length < PREVIEW_ITEMS_COUNT) {
            bucket.push({
              id: item.id,
              photo_url: Array.isArray(item.item_photos) && item.item_photos.length > 0
                ? item.item_photos[0].image_url
                : null,
              brand: item.brand,
              model: item.model,
            });
          }
        }
      }
    }

    // Step 4b: Wishlisted sneakers to backfill slots (all public-wishlist users)
    const publicWishlistUserIds = publicProfiles
      .filter((p) => p.wishlist_privacy === 'public')
      .map((p) => p.id);

    const wishlistItemsByUser = new Map<string, { id: string; photo_url: string | null; brand: string | null; model: string | null }[]>();

    if (publicWishlistUserIds.length > 0) {
      const { data: wishlistItems, error: wishlistError } = await supabase
        .from('items')
        .select('id, user_id, brand, model, item_photos(id, image_url, image_order, is_main_image)')
        .eq('status', 'wishlisted')
        .eq('is_archived', false)
        .eq('category', 'sneakers')
        .in('user_id', publicWishlistUserIds)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .order('is_main_image', { foreignTable: 'item_photos', ascending: false })
        .order('image_order', { foreignTable: 'item_photos', ascending: true });

      if (wishlistError) {
        console.error('Error fetching wishlist preview items:', wishlistError);
      } else if (wishlistItems) {
        for (const item of wishlistItems) {
          const uid = item.user_id;
          if (!wishlistItemsByUser.has(uid)) wishlistItemsByUser.set(uid, []);
          const bucket = wishlistItemsByUser.get(uid)!;
          if (bucket.length < PREVIEW_ITEMS_COUNT) {
            bucket.push({
              id: item.id,
              photo_url: Array.isArray(item.item_photos) && item.item_photos.length > 0
                ? item.item_photos[0].image_url
                : null,
              brand: item.brand,
              model: item.model,
            });
          }
        }
      }
    }

    // Step 5: Merge — owned sneakers first, fill remaining slots with wishlist
    const users: ExploreUser[] = publicProfiles.map((profile) => {
      const owned = ownedItemsByUser.get(profile.id) || [];
      const wishlist = wishlistItemsByUser.get(profile.id) || [];

      // Fill up to PREVIEW_ITEMS_COUNT: owned first, then wishlist
      const preview = [...owned];
      for (const item of wishlist) {
        if (preview.length >= PREVIEW_ITEMS_COUNT) break;
        if (!preview.find((p) => p.id === item.id)) preview.push(item);
      }

      return {
        user_id: profile.id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        follower_count: profile.follower_count || 0,
        following_count: profile.following_count || 0,
        is_following: followingIds.has(profile.id),
        preview_items: preview,
      };
    });

    return NextResponse.json({
      users,
      total: totalCount,
      hasMore: offset + limit < totalCount,
    });
  } catch (error) {
    console.error('Unexpected error in /api/social/explore:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
