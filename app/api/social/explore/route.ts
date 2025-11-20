import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const ITEMS_PER_PAGE = 20;
const PREVIEW_ITEMS_COUNT = 4;

interface ExploreUser {
  user_id: string;
  display_name: string | null;
  username: string | null;
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

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pagination params
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      parseInt(searchParams.get('limit') || String(ITEMS_PER_PAGE)),
      50
    );
    const offset = parseInt(searchParams.get('offset') || '0');

    // Step 1: Get users with public wishlists
    const { data: publicProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url, follower_count, following_count')
      .eq('wishlist_privacy', 'public')
      .neq('id', user.id) // Exclude current user
      .order('follower_count', { ascending: false }) // Sort by popularity
      .range(offset, offset + limit - 1);

    if (profilesError) {
      console.error('Error fetching public profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      );
    }

    if (!publicProfiles || publicProfiles.length === 0) {
      return NextResponse.json({
        users: [],
        total: 0,
        hasMore: false,
      });
    }

    // Step 2: Get total count for pagination
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('wishlist_privacy', 'public')
      .neq('id', user.id);

    const totalCount = count || 0;

    // Step 3: Get follow status for all users
    const userIds = publicProfiles.map((profile) => profile.id);

    const { data: followData, error: followError } = await supabase
      .from('followers')
      .select('following_id')
      .eq('follower_id', user.id)
      .in('following_id', userIds);

    if (followError) {
      console.error('Error fetching follow status:', followError);
      // Continue even if follow status fails
    }

    const followingIds = new Set(followData?.map((f) => f.following_id) || []);

    // Step 4: Get preview items for each user (4 items per user)
    const { data: previewItems, error: itemsError } = await supabase
      .from('items')
      .select('id, user_id, brand, model, item_photos(photo_url)')
      .eq('status', 'wishlisted')
      .eq('is_archived', false)
      .in('user_id', userIds)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (itemsError) {
      console.error('Error fetching preview items:', itemsError);
      // Continue without preview items
    }

    // Step 5: Group items by user and limit to 4 per user
    const itemsByUser = new Map<string, typeof previewItems>();

    if (previewItems) {
      for (const item of previewItems) {
        const userId = item.user_id;
        if (!itemsByUser.has(userId)) {
          itemsByUser.set(userId, []);
        }

        const userItems = itemsByUser.get(userId)!;
        if (userItems.length < PREVIEW_ITEMS_COUNT) {
          userItems.push(item);
        }
      }
    }

    // Step 6: Build response with all data
    const users: ExploreUser[] = publicProfiles.map((profile) => {
      const items = itemsByUser.get(profile.id) || [];

      return {
        user_id: profile.id,
        display_name: profile.display_name,
        username: profile.username,
        avatar_url: profile.avatar_url,
        follower_count: profile.follower_count || 0,
        following_count: profile.following_count || 0,
        is_following: followingIds.has(profile.id),
        preview_items: items.map((item) => ({
          id: item.id,
          photo_url: Array.isArray(item.item_photos) && item.item_photos.length > 0
            ? item.item_photos[0].photo_url
            : null,
          brand: item.brand,
          model: item.model,
        })),
      };
    });

    return NextResponse.json({
      users,
      total: totalCount,
      hasMore: offset + limit < totalCount,
    });
  } catch (error) {
    console.error('Unexpected error in /api/social/explore:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
