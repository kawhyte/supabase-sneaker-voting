export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      brands: {
        Row: {
          brand_logo: string | null
          created_at: string
          id: number
          name: string
        }
        Insert: {
          brand_logo?: string | null
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          brand_logo?: string | null
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      item_photos: {
        Row: {
          cloudinary_id: string | null
          created_at: string | null
          id: string
          image_order: number
          image_url: string
          is_main_image: boolean
          item_id: string
          updated_at: string | null
        }
        Insert: {
          cloudinary_id?: string | null
          created_at?: string | null
          id?: string
          image_order?: number
          image_url: string
          is_main_image?: boolean
          item_id: string
          updated_at?: string | null
        }
        Update: {
          cloudinary_id?: string | null
          created_at?: string | null
          id?: string
          image_order?: number
          image_url?: string
          is_main_image?: boolean
          item_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sneaker_photos_sneaker_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          brand: string
          brand_id: number | null
          category: string | null
          cloudinary_id: string | null
          color: string | null
          comfort_rating: number | null
          created_at: string
          has_been_tried: boolean
          id: string
          image_order: number | null
          image_url: string | null
          is_archived: boolean | null
          is_main_image: boolean | null
          last_worn_date: string | null
          model: string
          notes: string | null
          product_url: string | null
          purchase_date: string | null
          purchase_price: number | null
          retail_price: number | null
          sale_price: number | null
          size_tried: string | null
          size_type: string | null
          sku: string | null
          status: Database["public"]["Enums"]["item_status"]
          store_name: string | null
          target_price: number | null
          try_on_date: string | null
          updated_at: string
          user_id: string | null
          wears: number | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          brand: string
          brand_id?: number | null
          category?: string | null
          cloudinary_id?: string | null
          color?: string | null
          comfort_rating?: number | null
          created_at?: string
          has_been_tried?: boolean
          id?: string
          image_order?: number | null
          image_url?: string | null
          is_archived?: boolean | null
          is_main_image?: boolean | null
          last_worn_date?: string | null
          model: string
          notes?: string | null
          product_url?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          retail_price?: number | null
          sale_price?: number | null
          size_tried?: string | null
          size_type?: string | null
          sku?: string | null
          status?: Database["public"]["Enums"]["item_status"]
          store_name?: string | null
          target_price?: number | null
          try_on_date?: string | null
          updated_at?: string
          user_id?: string | null
          wears?: number | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          brand?: string
          brand_id?: number | null
          category?: string | null
          cloudinary_id?: string | null
          color?: string | null
          comfort_rating?: number | null
          created_at?: string
          has_been_tried?: boolean
          id?: string
          image_order?: number | null
          image_url?: string | null
          is_archived?: boolean | null
          is_main_image?: boolean | null
          last_worn_date?: string | null
          model?: string
          notes?: string | null
          product_url?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          retail_price?: number | null
          sale_price?: number | null
          size_tried?: string | null
          size_type?: string | null
          sku?: string | null
          status?: Database["public"]["Enums"]["item_status"]
          store_name?: string | null
          target_price?: number | null
          try_on_date?: string | null
          updated_at?: string
          user_id?: string | null
          wears?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "items_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          checked_at: string | null
          created_at: string | null
          id: string
          in_stock: boolean | null
          monitor_id: string | null
          price: number
        }
        Insert: {
          checked_at?: string | null
          created_at?: string | null
          id?: string
          in_stock?: boolean | null
          monitor_id?: string | null
          price: number
        }
        Update: {
          checked_at?: string | null
          created_at?: string | null
          id?: string
          in_stock?: boolean | null
          monitor_id?: string | null
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_history_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "price_monitors"
            referencedColumns: ["id"]
          },
        ]
      }
      price_monitors: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_checked_at: string | null
          last_price: number | null
          notification_sent: boolean | null
          product_url: string
          sneaker_id: string | null
          store_name: string
          target_price: number | null
          updated_at: string | null
          user_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_checked_at?: string | null
          last_price?: number | null
          notification_sent?: boolean | null
          product_url: string
          sneaker_id?: string | null
          store_name: string
          target_price?: number | null
          updated_at?: string | null
          user_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_checked_at?: string | null
          last_price?: number | null
          notification_sent?: boolean | null
          product_url?: string
          sneaker_id?: string | null
          store_name?: string
          target_price?: number | null
          updated_at?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_monitors_sneaker_id_fkey"
            columns: ["sneaker_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          is_active: boolean | null
          p256dh: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          is_active?: boolean | null
          p256dh: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean | null
          p256dh?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      size_preferences: {
        Row: {
          brand: string
          confidence_level: number | null
          created_at: string
          id: string
          notes: string | null
          preferred_size: string
          user_id: string | null
        }
        Insert: {
          brand: string
          confidence_level?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          preferred_size: string
          user_id?: string | null
        }
        Update: {
          brand?: string
          confidence_level?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          preferred_size?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_lowest_price: {
        Args: { product_uuid: string; size_param?: string }
        Returns: {
          in_stock: boolean
          lowest_price: number
          store_id: string
          store_name: string
          url: string
        }[]
      }
      get_price_trend: {
        Args: { days?: number; product_uuid: string; size_param?: string }
        Returns: {
          checked_at: string
          price: number
          sale_price: number
          store_name: string
        }[]
      }
    }
    Enums: {
      item_status: "owned" | "wishlisted" | "journaled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      item_status: ["owned", "wishlisted", "journaled"],
    },
  },
} as const
