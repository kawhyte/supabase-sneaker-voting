// SoleTracker Database Queries
// Pre-built type-safe queries for common operations

import { createClient } from '@/utils/supabase/client'
import type {
  Product,
  Store,
  WatchlistItem,
  PriceHistory,
  UserWatchlistWithPrices,
  CurrentLowestPrice,
  Database
} from '@/types/database.types'

// Get typed Supabase client
export const getSupabaseClient = () => createClient()

// ============================================================================
// PRODUCT QUERIES
// ============================================================================

export const productQueries = {
  // Get all products with optional filtering
  getAll: async (filters?: {
    brand?: string
    category?: string
    search?: string
  }) => {
    const supabase = getSupabaseClient()
    let query = supabase.from('products').select('*').order('brand', { ascending: true })

    if (filters?.brand) {
      query = query.eq('brand', filters.brand)
    }
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.search) {
      query = query.or(`brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%,colorway.ilike.%${filters.search}%`)
    }

    return query
  },

  // Get product by SKU
  getBySku: async (sku: string) => {
    const supabase = getSupabaseClient()
    return supabase.from('products').select('*').eq('sku', sku).single()
  },

  // Get product with current lowest prices
  getWithPrices: async (productId: string) => {
    const supabase = getSupabaseClient()
    return supabase
      .from('current_lowest_prices')
      .select('*')
      .eq('product_id', productId)
      .order('current_price', { ascending: true })
  },

  // Add new product
  create: async (product: Database['public']['Tables']['products']['Insert']) => {
    const supabase = getSupabaseClient()
    return supabase.from('products').insert(product).select().single()
  }
}

// ============================================================================
// STORE QUERIES
// ============================================================================

export const storeQueries = {
  // Get all active stores
  getActive: async () => {
    const supabase = getSupabaseClient()
    return supabase.from('stores').select('*').eq('active', true).order('name')
  },

  // Get store by domain
  getByDomain: async (domain: string) => {
    const supabase = getSupabaseClient()
    return supabase.from('stores').select('*').eq('domain', domain).single()
  }
}

// ============================================================================
// WATCHLIST QUERIES
// ============================================================================

export const watchlistQueries = {
  // Get user's watchlist with current prices
  getUserWatchlist: async (userId: string) => {
    const supabase = getSupabaseClient()
    return supabase
      .from('user_watchlist_with_prices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },

  // Add item to watchlist
  addItem: async (item: Database['public']['Tables']['watchlist']['Insert']) => {
    const supabase = getSupabaseClient()
    return supabase.from('watchlist').insert(item).select().single()
  },

  // Update watchlist item
  updateItem: async (
    id: string,
    updates: Database['public']['Tables']['watchlist']['Update']
  ) => {
    const supabase = getSupabaseClient()
    return supabase.from('watchlist').update(updates).eq('id', id).select().single()
  },

  // Remove item from watchlist
  removeItem: async (id: string) => {
    const supabase = getSupabaseClient()
    return supabase.from('watchlist').delete().eq('id', id)
  },

  // Check if item is in user's watchlist
  checkExists: async (userId: string, productId: string, size: string) => {
    const supabase = getSupabaseClient()
    const { data } = await supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('ideal_size', size)
      .single()

    return !!data
  }
}

// ============================================================================
// PRICE QUERIES
// ============================================================================

export const priceQueries = {
  // Get current lowest prices for all products
  getCurrentLowestPrices: async (limit?: number) => {
    const supabase = getSupabaseClient()
    let query = supabase
      .from('current_lowest_prices')
      .select('*')
      .order('current_price', { ascending: true })

    if (limit) {
      query = query.limit(limit)
    }

    return query
  },

  // Get price history for a product
  getPriceHistory: async (productId: string, size?: string, days: number = 30) => {
    const supabase = getSupabaseClient()
    return supabase.rpc('get_price_trend', {
      product_uuid: productId,
      size_param: size || null,
      days
    })
  },

  // Get lowest price for specific product/size
  getLowestPrice: async (productId: string, size?: string) => {
    const supabase = getSupabaseClient()
    return supabase.rpc('get_lowest_price', {
      product_uuid: productId,
      size_param: size || null
    })
  },

  // Add price history entry
  addPriceEntry: async (entry: Database['public']['Tables']['price_history']['Insert']) => {
    const supabase = getSupabaseClient()
    return supabase.from('price_history').insert(entry).select().single()
  },

  // Get trending products (most price checks recently)
  getTrendingProducts: async (days: number = 7, limit: number = 10) => {
    const supabase = getSupabaseClient()
    return supabase
      .from('price_history')
      .select(`
        product_id,
        products!inner(sku, brand, model, colorway, image_url),
        price,
        sale_price,
        in_stock
      `)
      .gte('checked_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .eq('in_stock', true)
      .limit(limit)
  }
}

// ============================================================================
// USER QUERIES
// ============================================================================

export const userQueries = {
  // Get or create user profile
  getProfile: async (userId: string) => {
    const supabase = getSupabaseClient()
    return supabase.from('users_extended').select('*').eq('id', userId).single()
  },

  // Create user profile
  createProfile: async (profile: Database['public']['Tables']['users_extended']['Insert']) => {
    const supabase = getSupabaseClient()
    return supabase.from('users_extended').insert(profile).select().single()
  },

  // Update user profile
  updateProfile: async (
    userId: string,
    updates: Database['public']['Tables']['users_extended']['Update']
  ) => {
    const supabase = getSupabaseClient()
    return supabase.from('users_extended').update(updates).eq('id', userId).select().single()
  }
}

// ============================================================================
// ALERT QUERIES
// ============================================================================

export const alertQueries = {
  // Get user's price alerts
  getUserAlerts: async (userId: string, unreadOnly: boolean = false) => {
    const supabase = getSupabaseClient()
    let query = supabase
      .from('price_alerts')
      .select(`
        *,
        stores!inner(name, domain),
        watchlist!inner(
          ideal_size,
          target_price,
          products!inner(sku, brand, model, colorway, image_url)
        )
      `)
      .eq('watchlist.user_id', userId)
      .order('triggered_at', { ascending: false })

    if (unreadOnly) {
      query = query.eq('notified', false)
    }

    return query
  },

  // Mark alert as notified
  markAsNotified: async (alertId: string) => {
    const supabase = getSupabaseClient()
    return supabase
      .from('price_alerts')
      .update({ notified: true })
      .eq('id', alertId)
  },

  // Run price alert check (admin function)
  checkPriceAlerts: async () => {
    const supabase = getSupabaseClient()
    return supabase.rpc('check_price_alerts')
  }
}

// ============================================================================
// DASHBOARD QUERIES
// ============================================================================

export const dashboardQueries = {
  // Get dashboard summary data
  getSummary: async (userId: string) => {
    const supabase = getSupabaseClient()

    // Get counts and stats
    const [watchlistResult, alertsResult, targetsMet] = await Promise.all([
      // Watchlist count
      supabase.from('watchlist').select('id').eq('user_id', userId),

      // Unread alerts count
      supabase
        .from('price_alerts')
        .select('id')
        .eq('watchlist.user_id', userId)
        .eq('notified', false),

      // Targets met count
      supabase
        .from('user_watchlist_with_prices')
        .select('watchlist_id')
        .eq('user_id', userId)
        .eq('target_met', true)
    ])

    return {
      watchlistCount: watchlistResult.data?.length || 0,
      alertsCount: alertsResult.data?.length || 0,
      targetsMetCount: targetsMet.data?.length || 0
    }
  },

  // Get best deals (biggest discounts from retail)
  getBestDeals: async (limit: number = 10) => {
    const supabase = getSupabaseClient()

    // This would need a custom view or complex query
    // For now, get products with current prices below retail
    return supabase
      .from('current_lowest_prices')
      .select(`
        *,
        discount_percent:computed_discount
      `)
      .lt('current_price', 'retail_price')  // This might need adjustment based on actual schema
      .eq('in_stock', true)
      .order('current_price', { ascending: true })
      .limit(limit)
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const utils = {
  // Calculate discount percentage
  calculateDiscount: (retailPrice: number, currentPrice: number): number => {
    return Math.round(((retailPrice - currentPrice) / retailPrice) * 100)
  },

  // Format price for display
  formatPrice: (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  },

  // Check if price meets target
  meetsTarget: (currentPrice: number, targetPrice: number | null): boolean => {
    return targetPrice !== null && currentPrice <= targetPrice
  }
}