// TODO: Generate these types from your Supabase schema
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > types/database.types.ts

export interface Database {
  public: {
    Tables: {
      items: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          url: string;
          current_price?: number;
          target_price?: number;
          image_url?: string;
          user_id: string;
        };
        Insert: {
          name: string;
          url: string;
          current_price?: number;
          target_price?: number;
          image_url?: string;
          user_id: string;
        };
        Update: {
          name?: string;
          url?: string;
          current_price?: number;
          target_price?: number;
          image_url?: string;
        };
      };
      store_links: {
        Row: {
          id: number;
          item_id: number;
          last_price?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          item_id: number;
          last_price?: number;
        };
        Update: {
          last_price?: number;
        };
      };
      // Add other tables as needed
    };
    Views: {
      // Add views if any
    };
    Functions: {
      // Add functions if any
    };
    Enums: {
      // Add enums if any
    };
  };
}