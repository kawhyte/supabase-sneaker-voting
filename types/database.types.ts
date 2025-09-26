// SoleTracker Database Types
// Generated from Supabase schema for sneaker price tracking app
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > types/database.types.ts

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          sku: string;
          brand: string;
          model: string;
          colorway: string;
          category: string;
          retail_price: number;
          image_url: string | null;
          cloudinary_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sku: string;
          brand: string;
          model: string;
          colorway: string;
          category?: string;
          retail_price: number;
          image_url?: string | null;
          cloudinary_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sku?: string;
          brand?: string;
          model?: string;
          colorway?: string;
          category?: string;
          retail_price?: number;
          image_url?: string | null;
          cloudinary_id?: string | null;
          updated_at?: string;
        };
      };
      users_extended: {
        Row: {
          id: string;
          display_name: string | null;
          notification_email: boolean;
          notification_push: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          notification_email?: boolean;
          notification_push?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
          notification_email?: boolean;
          notification_push?: boolean;
          updated_at?: string;
        };
      };
      stores: {
        Row: {
          id: string;
          name: string;
          domain: string;
          free_shipping_threshold: number | null;
          selector_rules: Json;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          domain: string;
          free_shipping_threshold?: number | null;
          selector_rules?: Json;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          domain?: string;
          free_shipping_threshold?: number | null;
          selector_rules?: Json;
          active?: boolean;
          updated_at?: string;
        };
      };
      watchlist: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          ideal_size: string;
          target_price: number | null;
          tried_on: boolean;
          owner_name: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          ideal_size: string;
          target_price?: number | null;
          tried_on?: boolean;
          owner_name?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          ideal_size?: string;
          target_price?: number | null;
          tried_on?: boolean;
          owner_name?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      price_history: {
        Row: {
          id: string;
          product_id: string;
          store_id: string;
          size: string;
          price: number;
          sale_price: number | null;
          in_stock: boolean;
          url: string | null;
          checked_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          store_id: string;
          size: string;
          price: number;
          sale_price?: number | null;
          in_stock?: boolean;
          url?: string | null;
          checked_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          store_id?: string;
          size?: string;
          price?: number;
          sale_price?: number | null;
          in_stock?: boolean;
          url?: string | null;
          checked_at?: string;
        };
      };
      price_alerts: {
        Row: {
          id: string;
          watchlist_id: string;
          triggered_at: string;
          price: number;
          store_id: string;
          notified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          watchlist_id: string;
          triggered_at?: string;
          price: number;
          store_id: string;
          notified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          watchlist_id?: string;
          triggered_at?: string;
          price?: number;
          store_id?: string;
          notified?: boolean;
        };
      };
    };
    Views: {
      current_lowest_prices: {
        Row: {
          product_id: string;
          sku: string;
          brand: string;
          model: string;
          colorway: string;
          size: string;
          current_price: number;
          sale_price: number | null;
          regular_price: number;
          store_name: string;
          store_id: string;
          url: string | null;
          in_stock: boolean;
          checked_at: string;
        };
      };
      user_watchlist_with_prices: {
        Row: {
          watchlist_id: string;
          user_id: string;
          ideal_size: string;
          target_price: number | null;
          tried_on: boolean;
          owner_name: string | null;
          notes: string | null;
          created_at: string;
          product_id: string;
          sku: string;
          brand: string;
          model: string;
          colorway: string;
          image_url: string | null;
          retail_price: number;
          current_price: number | null;
          store_name: string | null;
          store_id: string | null;
          product_url: string | null;
          in_stock: boolean | null;
          target_met: boolean | null;
        };
      };
    };
    Functions: {
      get_lowest_price: {
        Args: {
          product_uuid: string;
          size_param?: string;
        };
        Returns: {
          lowest_price: number;
          store_name: string;
          store_id: string;
          url: string | null;
          in_stock: boolean;
        }[];
      };
      get_price_trend: {
        Args: {
          product_uuid: string;
          size_param?: string;
          days?: number;
        };
        Returns: {
          checked_at: string;
          price: number;
          sale_price: number | null;
          store_name: string;
        }[];
      };
      check_price_alerts: {
        Args: Record<PropertyKey, never>;
        Returns: void;
      };
    };
    Enums: {
      // No enums defined yet
    };
  };
}

// Helper type exports
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Specific table types for convenience
export type Product = Tables<'products'>;
export type UserExtended = Tables<'users_extended'>;
export type Store = Tables<'stores'>;
export type WatchlistItem = Tables<'watchlist'>;
export type PriceHistory = Tables<'price_history'>;
export type PriceAlert = Tables<'price_alerts'>;

// View types
export type CurrentLowestPrice = Database['public']['Views']['current_lowest_prices']['Row'];
export type UserWatchlistWithPrices = Database['public']['Views']['user_watchlist_with_prices']['Row'];

// Function return types
export type LowestPriceResult = Database['public']['Functions']['get_lowest_price']['Returns'][0];
export type PriceTrendResult = Database['public']['Functions']['get_price_trend']['Returns'][0];

// JSON type for selector_rules
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Store selector rules interface for type safety
export interface StoreSelectorRules {
  price_selector?: string;
  sale_price_selector?: string;
  availability_selector?: string;
  size_selector?: string;
  image_selector?: string;
  product_name_selector?: string;
}