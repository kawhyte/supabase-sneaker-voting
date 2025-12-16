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
      achievements: {
        Row: {
          achievement_key: string
          category: string | null
          created_at: string | null
          description: string
          icon_emoji: string | null
          id: string
          is_active: boolean | null
          name: string
          points: number | null
          unlock_criteria: Json
        }
        Insert: {
          achievement_key: string
          category?: string | null
          created_at?: string | null
          description: string
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points?: number | null
          unlock_criteria: Json
        }
        Update: {
          achievement_key?: string
          category?: string | null
          created_at?: string | null
          description?: string
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points?: number | null
          unlock_criteria?: Json
        }
        Relationships: []
      }
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
      followers: {
        Row: {
          created_at: string | null
          follower_user_id: string
          following_user_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_user_id: string
          following_user_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_user_id?: string
          following_user_id?: string
          id?: string
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
      item_shares: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          owner_id: string
          permission_level: string | null
          shared_with_user_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          owner_id: string
          permission_level?: string | null
          shared_with_user_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          owner_id?: string
          permission_level?: string | null
          shared_with_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_shares_item_id_fkey"
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
          auto_price_tracking_enabled: boolean | null
          brand: string
          brand_id: number | null
          category: string | null
          cloudinary_id: string | null
          color: string | null
          color_palette: Json | null
          comfort_rating: number | null
          created_at: string
          has_been_tried: boolean
          id: string
          image_order: number | null
          image_url: string | null
          is_archived: boolean | null
          is_main_image: boolean | null
          is_pinned: boolean | null
          is_shared: boolean | null
          last_price_check_at: string | null
          last_worn_date: string | null
          lowest_price_seen: number | null
          model: string
          notes: string | null
          price_check_failures: number | null
          primary_color: string | null
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
          store_url: string | null
          target_price: number | null
          try_on_date: string | null
          updated_at: string
          user_id: string | null
          wears: number | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          auto_price_tracking_enabled?: boolean | null
          brand: string
          brand_id?: number | null
          category?: string | null
          cloudinary_id?: string | null
          color?: string | null
          color_palette?: Json | null
          comfort_rating?: number | null
          created_at?: string
          has_been_tried?: boolean
          id?: string
          image_order?: number | null
          image_url?: string | null
          is_archived?: boolean | null
          is_main_image?: boolean | null
          is_pinned?: boolean | null
          is_shared?: boolean | null
          last_price_check_at?: string | null
          last_worn_date?: string | null
          lowest_price_seen?: number | null
          model: string
          notes?: string | null
          price_check_failures?: number | null
          primary_color?: string | null
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
          store_url?: string | null
          target_price?: number | null
          try_on_date?: string | null
          updated_at?: string
          user_id?: string | null
          wears?: number | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          auto_price_tracking_enabled?: boolean | null
          brand?: string
          brand_id?: number | null
          category?: string | null
          cloudinary_id?: string | null
          color?: string | null
          color_palette?: Json | null
          comfort_rating?: number | null
          created_at?: string
          has_been_tried?: boolean
          id?: string
          image_order?: number | null
          image_url?: string | null
          is_archived?: boolean | null
          is_main_image?: boolean | null
          is_pinned?: boolean | null
          is_shared?: boolean | null
          last_price_check_at?: string | null
          last_worn_date?: string | null
          lowest_price_seen?: number | null
          model?: string
          notes?: string | null
          price_check_failures?: number | null
          primary_color?: string | null
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
          store_url?: string | null
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
      notification_preferences: {
        Row: {
          achievements_enabled: boolean | null
          bundle_threshold: number | null
          cost_per_wear_milestones_email: boolean | null
          cost_per_wear_milestones_in_app: boolean | null
          cost_per_wear_milestones_push: boolean | null
          created_at: string | null
          enable_bundling: boolean | null
          enable_email: boolean | null
          enable_in_app: boolean | null
          enable_push: boolean | null
          id: string
          max_daily_notifications: number | null
          outfit_suggestions_enabled: boolean | null
          preferences_version: number | null
          price_alerts_enabled: boolean | null
          quiet_hours_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          seasonal_tips_enabled: boolean | null
          shopping_reminders_email: boolean | null
          shopping_reminders_in_app: boolean | null
          shopping_reminders_push: boolean | null
          updated_at: string | null
          user_id: string
          user_timezone: string | null
          wear_reminders_enabled: boolean | null
        }
        Insert: {
          achievements_enabled?: boolean | null
          bundle_threshold?: number | null
          cost_per_wear_milestones_email?: boolean | null
          cost_per_wear_milestones_in_app?: boolean | null
          cost_per_wear_milestones_push?: boolean | null
          created_at?: string | null
          enable_bundling?: boolean | null
          enable_email?: boolean | null
          enable_in_app?: boolean | null
          enable_push?: boolean | null
          id?: string
          max_daily_notifications?: number | null
          outfit_suggestions_enabled?: boolean | null
          preferences_version?: number | null
          price_alerts_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          seasonal_tips_enabled?: boolean | null
          shopping_reminders_email?: boolean | null
          shopping_reminders_in_app?: boolean | null
          shopping_reminders_push?: boolean | null
          updated_at?: string | null
          user_id: string
          user_timezone?: string | null
          wear_reminders_enabled?: boolean | null
        }
        Update: {
          achievements_enabled?: boolean | null
          bundle_threshold?: number | null
          cost_per_wear_milestones_email?: boolean | null
          cost_per_wear_milestones_in_app?: boolean | null
          cost_per_wear_milestones_push?: boolean | null
          created_at?: string | null
          enable_bundling?: boolean | null
          enable_email?: boolean | null
          enable_in_app?: boolean | null
          enable_push?: boolean | null
          id?: string
          max_daily_notifications?: number | null
          outfit_suggestions_enabled?: boolean | null
          preferences_version?: number | null
          price_alerts_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          seasonal_tips_enabled?: boolean | null
          shopping_reminders_email?: boolean | null
          shopping_reminders_in_app?: boolean | null
          shopping_reminders_push?: boolean | null
          updated_at?: string | null
          user_id?: string
          user_timezone?: string | null
          wear_reminders_enabled?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          bundle_group_key: string | null
          bundled_count: number | null
          bundled_items: Json | null
          bundled_notification_type: string | null
          created_at: string | null
          expiry_at: string | null
          group_key: string | null
          id: string
          is_bundled: boolean | null
          is_read: boolean | null
          legacy_price_alert_id: string | null
          link_url: string | null
          message: string
          metadata: Json | null
          notification_type: string
          read_at: string | null
          severity: string | null
          snoozed_until: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          bundle_group_key?: string | null
          bundled_count?: number | null
          bundled_items?: Json | null
          bundled_notification_type?: string | null
          created_at?: string | null
          expiry_at?: string | null
          group_key?: string | null
          id?: string
          is_bundled?: boolean | null
          is_read?: boolean | null
          legacy_price_alert_id?: string | null
          link_url?: string | null
          message: string
          metadata?: Json | null
          notification_type: string
          read_at?: string | null
          severity?: string | null
          snoozed_until?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          bundle_group_key?: string | null
          bundled_count?: number | null
          bundled_items?: Json | null
          bundled_notification_type?: string | null
          created_at?: string | null
          expiry_at?: string | null
          group_key?: string | null
          id?: string
          is_bundled?: boolean | null
          is_read?: boolean | null
          legacy_price_alert_id?: string | null
          link_url?: string | null
          message?: string
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          severity?: string | null
          snoozed_until?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_legacy_price_alert_id_fkey"
            columns: ["legacy_price_alert_id"]
            isOneToOne: false
            referencedRelation: "price_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      outfit_items: {
        Row: {
          created_at: string | null
          crop_height: number | null
          crop_width: number | null
          crop_x: number | null
          crop_y: number | null
          cropped_image_url: string | null
          display_height: number | null
          display_width: number | null
          id: string
          item_id: string
          item_order: number | null
          outfit_id: string
          position_x: number | null
          position_y: number | null
          updated_at: string | null
          z_index: number | null
        }
        Insert: {
          created_at?: string | null
          crop_height?: number | null
          crop_width?: number | null
          crop_x?: number | null
          crop_y?: number | null
          cropped_image_url?: string | null
          display_height?: number | null
          display_width?: number | null
          id?: string
          item_id: string
          item_order?: number | null
          outfit_id: string
          position_x?: number | null
          position_y?: number | null
          updated_at?: string | null
          z_index?: number | null
        }
        Update: {
          created_at?: string | null
          crop_height?: number | null
          crop_width?: number | null
          crop_x?: number | null
          crop_y?: number | null
          cropped_image_url?: string | null
          display_height?: number | null
          display_width?: number | null
          id?: string
          item_id?: string
          item_order?: number | null
          outfit_id?: string
          position_x?: number | null
          position_y?: number | null
          updated_at?: string | null
          z_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "outfit_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outfit_items_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      outfit_migration_archive: {
        Row: {
          display_height: number | null
          display_width: number | null
          id: string
          item_brand: string | null
          item_category: string | null
          item_id: string
          item_model: string | null
          migrated_at: string
          migrated_by_user_id: string | null
          outfit_id: string
          outfit_name: string | null
          position_x: number | null
          position_y: number | null
          removal_reason: string
          z_index: number | null
        }
        Insert: {
          display_height?: number | null
          display_width?: number | null
          id?: string
          item_brand?: string | null
          item_category?: string | null
          item_id: string
          item_model?: string | null
          migrated_at?: string
          migrated_by_user_id?: string | null
          outfit_id: string
          outfit_name?: string | null
          position_x?: number | null
          position_y?: number | null
          removal_reason: string
          z_index?: number | null
        }
        Update: {
          display_height?: number | null
          display_width?: number | null
          id?: string
          item_brand?: string | null
          item_category?: string | null
          item_id?: string
          item_model?: string | null
          migrated_at?: string
          migrated_by_user_id?: string | null
          outfit_id?: string
          outfit_name?: string | null
          position_x?: number | null
          position_y?: number | null
          removal_reason?: string
          z_index?: number | null
        }
        Relationships: []
      }
      outfits: {
        Row: {
          background_color: string | null
          created_at: string | null
          date_created: string | null
          date_worn: string | null
          description: string | null
          id: string
          is_archived: boolean | null
          last_worn: string | null
          name: string
          occasion: string | null
          preview_error: string | null
          preview_generated_at: string | null
          preview_status: string | null
          preview_url: string | null
          times_worn: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          background_color?: string | null
          created_at?: string | null
          date_created?: string | null
          date_worn?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean | null
          last_worn?: string | null
          name?: string
          occasion?: string | null
          preview_error?: string | null
          preview_generated_at?: string | null
          preview_status?: string | null
          preview_url?: string | null
          times_worn?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          background_color?: string | null
          created_at?: string | null
          date_created?: string | null
          date_worn?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean | null
          last_worn?: string | null
          name?: string
          occasion?: string | null
          preview_error?: string | null
          preview_generated_at?: string | null
          preview_status?: string | null
          preview_url?: string | null
          times_worn?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          created_at: string
          current_price: number
          id: string
          is_read: boolean | null
          item_id: string
          message: string
          percentage_off: number | null
          previous_price: number | null
          read_at: string | null
          severity: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_price: number
          id?: string
          is_read?: boolean | null
          item_id: string
          message: string
          percentage_off?: number | null
          previous_price?: number | null
          read_at?: string | null
          severity?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_price?: number
          id?: string
          is_read?: boolean | null
          item_id?: string
          message?: string
          percentage_off?: number | null
          previous_price?: number | null
          read_at?: string | null
          severity?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_alerts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      price_check_log: {
        Row: {
          checked_at: string
          created_at: string
          error_category: string | null
          error_message: string | null
          http_status_code: number | null
          id: string
          item_id: string
          price: number | null
          retailer: string | null
          source: string
          success: boolean
          user_id: string
        }
        Insert: {
          checked_at?: string
          created_at?: string
          error_category?: string | null
          error_message?: string | null
          http_status_code?: number | null
          id?: string
          item_id: string
          price?: number | null
          retailer?: string | null
          source: string
          success: boolean
          user_id: string
        }
        Update: {
          checked_at?: string
          created_at?: string
          error_category?: string | null
          error_message?: string | null
          http_status_code?: number | null
          id?: string
          item_id?: string
          price?: number | null
          retailer?: string | null
          source?: string
          success?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_check_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
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
          avatar_type: Database["public"]["Enums"]["avatar_type"] | null
          avatar_updated_at: string | null
          avatar_url: string | null
          avatar_version: number
          display_name: string | null
          enable_duplication_warnings: boolean | null
          enable_similar_item_warnings: boolean | null
          follower_count: number | null
          following_count: number | null
          id: string
          preset_avatar_id: string | null
          updated_at: string | null
          wishlist_privacy: string | null
        }
        Insert: {
          avatar_type?: Database["public"]["Enums"]["avatar_type"] | null
          avatar_updated_at?: string | null
          avatar_url?: string | null
          avatar_version?: number
          display_name?: string | null
          enable_duplication_warnings?: boolean | null
          enable_similar_item_warnings?: boolean | null
          follower_count?: number | null
          following_count?: number | null
          id: string
          preset_avatar_id?: string | null
          updated_at?: string | null
          wishlist_privacy?: string | null
        }
        Update: {
          avatar_type?: Database["public"]["Enums"]["avatar_type"] | null
          avatar_updated_at?: string | null
          avatar_url?: string | null
          avatar_version?: number
          display_name?: string | null
          enable_duplication_warnings?: boolean | null
          enable_similar_item_warnings?: boolean | null
          follower_count?: number | null
          following_count?: number | null
          id?: string
          preset_avatar_id?: string | null
          updated_at?: string | null
          wishlist_privacy?: string | null
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
      seasonal_content: {
        Row: {
          created_at: string | null
          end_date: string
          icon_emoji: string | null
          id: string
          is_active: boolean | null
          message: string
          priority: number | null
          season: string
          start_date: string
          suggested_categories: Json | null
          suggested_colors: Json | null
          suggested_tips: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          priority?: number | null
          season: string
          start_date: string
          suggested_categories?: Json | null
          suggested_colors?: Json | null
          suggested_tips?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          priority?: number | null
          season?: string
          start_date?: string
          suggested_categories?: Json | null
          suggested_colors?: Json | null
          suggested_tips?: Json | null
          title?: string
          updated_at?: string | null
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
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_key_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["achievement_key"]
          },
        ]
      }
      user_connections: {
        Row: {
          connected_user_id: string
          connection_type: string | null
          created_at: string | null
          id: string
          share_all_items: boolean | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connected_user_id: string
          connection_type?: string | null
          created_at?: string | null
          id?: string
          share_all_items?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connected_user_id?: string
          connection_type?: string | null
          created_at?: string | null
          id?: string
          share_all_items?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_dismissed_seasonal_alerts: {
        Row: {
          dismissed_at: string | null
          id: string
          season: string
          user_id: string
          year: number
        }
        Insert: {
          dismissed_at?: string | null
          id?: string
          season: string
          user_id: string
          year: number
        }
        Update: {
          dismissed_at?: string | null
          id?: string
          season?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          achievements_preferences: Json | null
          achievements_unlocked: number | null
          average_cost_per_wear: number | null
          created_at: string | null
          last_notification_at: string | null
          most_worn_count: number | null
          most_worn_item_id: string | null
          owned_items: number | null
          total_achievements: number | null
          total_items: number | null
          total_outfits: number | null
          total_savings_from_alerts: number | null
          total_spent: number | null
          unread_notification_count: number | null
          updated_at: string | null
          user_id: string
          wishlisted_items: number | null
        }
        Insert: {
          achievements_preferences?: Json | null
          achievements_unlocked?: number | null
          average_cost_per_wear?: number | null
          created_at?: string | null
          last_notification_at?: string | null
          most_worn_count?: number | null
          most_worn_item_id?: string | null
          owned_items?: number | null
          total_achievements?: number | null
          total_items?: number | null
          total_outfits?: number | null
          total_savings_from_alerts?: number | null
          total_spent?: number | null
          unread_notification_count?: number | null
          updated_at?: string | null
          user_id: string
          wishlisted_items?: number | null
        }
        Update: {
          achievements_preferences?: Json | null
          achievements_unlocked?: number | null
          average_cost_per_wear?: number | null
          created_at?: string | null
          last_notification_at?: string | null
          most_worn_count?: number | null
          most_worn_item_id?: string | null
          owned_items?: number | null
          total_achievements?: number | null
          total_items?: number | null
          total_outfits?: number | null
          total_savings_from_alerts?: number | null
          total_spent?: number | null
          unread_notification_count?: number | null
          updated_at?: string | null
          user_id?: string
          wishlisted_items?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_item: {
        Args: { item_id: string; user_id: string }
        Returns: boolean
      }
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
      get_public_wishlist: {
        Args: { target_user_id: string }
        Returns: {
          brand: string
          category: string
          color: string
          created_at: string
          image_url: string
          is_pinned: boolean
          item_id: string
          model: string
          retail_price: number
          target_price: number
        }[]
      }
      is_following: { Args: { target_user_id: string }; Returns: boolean }
      recalculate_user_stats: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      sync_total_achievements: { Args: never; Returns: undefined }
    }
    Enums: {
      avatar_type: "custom" | "preset"
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
      avatar_type: ["custom", "preset"],
      item_status: ["owned", "wishlisted", "journaled"],
    },
  },
} as const
