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
            referencedRelation: "sneakers"
            referencedColumns: ["id"]
          },
        ]
      }
      size_preferences: {
        Row: {
          brand: string
          confidence_level: number | null
          created_at: string
          id: string
          notes: string | null
          preferred_size: string
          user_name: string
        }
        Insert: {
          brand: string
          confidence_level?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          preferred_size: string
          user_name: string
        }
        Update: {
          brand?: string
          confidence_level?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          preferred_size?: string
          user_name?: string
        }
        Relationships: []
      }
      sneakers: {
        Row: {
          brand: string
          cloudinary_id: string | null
          colorway: string | null
          comfort_rating: number | null
          created_at: string
          fit_rating: number | null
          id: string
          ideal_price: number | null
          image_order: number | null
          image_url: string | null
          interaction_type: string | null
          interested_in_buying: boolean | null
          is_main_image: boolean | null
          model: string
          notes: string | null
          product_url: string | null
          retail_price: number | null
          size_tried: string | null
          store_name: string | null
          try_on_date: string | null
          updated_at: string
          user_name: string
          would_buy_at_price: number | null
        }
        Insert: {
          brand: string
          cloudinary_id?: string | null
          colorway?: string | null
          comfort_rating?: number | null
          created_at?: string
          fit_rating?: number | null
          id?: string
          ideal_price?: number | null
          image_order?: number | null
          image_url?: string | null
          interaction_type?: string | null
          interested_in_buying?: boolean | null
          is_main_image?: boolean | null
          model: string
          notes?: string | null
          product_url?: string | null
          retail_price?: number | null
          size_tried?: string | null
          store_name?: string | null
          try_on_date?: string | null
          updated_at?: string
          user_name: string
          would_buy_at_price?: number | null
        }
        Update: {
          brand?: string
          cloudinary_id?: string | null
          colorway?: string | null
          comfort_rating?: number | null
          created_at?: string
          fit_rating?: number | null
          id?: string
          ideal_price?: number | null
          image_order?: number | null
          image_url?: string | null
          interaction_type?: string | null
          interested_in_buying?: boolean | null
          is_main_image?: boolean | null
          model?: string
          notes?: string | null
          product_url?: string | null
          retail_price?: number | null
          size_tried?: string | null
          store_name?: string | null
          try_on_date?: string | null
          updated_at?: string
          user_name?: string
          would_buy_at_price?: number | null
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
      [_ in never]: never
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
    Enums: {},
  },
} as const

// Helper type exports
export type Sneaker = Tables<'sneakers'>
export type SneakerInsert = TablesInsert<'sneakers'>
export type SneakerUpdate = TablesUpdate<'sneakers'>
export type SizePreference = Tables<'size_preferences'>
export type PriceMonitor = Tables<'price_monitors'>
export type PriceHistory = Tables<'price_history'>