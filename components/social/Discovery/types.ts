export interface ExploreUser {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  follower_count: number;
  following_count: number;
  is_following: boolean;
  preview_items: PreviewItem[];
}

export interface PreviewItem {
  id: string;
  photo_url: string | null;
  brand: string | null;
  model: string | null;
}

export interface ExploreResponse {
  users: ExploreUser[];
  total: number;
  hasMore: boolean;
}
