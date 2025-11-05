export interface AchievementDefinition {
  id: string
  name: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  category: 'wardrobe' | 'outfits' | 'efficiency' | 'discovery'
  points: number
  criteria: {
    type: 'count' | 'streak' | 'percentage' | 'custom'
    threshold: number
    metric: string
  }
}

/**
 * ACHIEVEMENT CATALOG
 *
 * Philosophy: Celebrate discovery, not grind
 * - Focus on meaningful milestones
 * - No daily obligations
 * - Optional engagement
 * - Positive framing only
 */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Wardrobe Size Milestones (Natural Growth)
  {
    id: 'wardrobe_starter',
    name: 'Collection Starter',
    description: 'Add your first 10 items to PurrView',
    icon: '📦',
    tier: 'bronze',
    category: 'wardrobe',
    points: 10,
    criteria: { type: 'count', threshold: 10, metric: 'total_items' },
  },
  {
    id: 'wardrobe_curator',
    name: 'Wardrobe Curator',
    description: 'Catalog 25 items in your collection',
    icon: '👔',
    tier: 'silver',
    category: 'wardrobe',
    points: 25,
    criteria: { type: 'count', threshold: 25, metric: 'total_items' },
  },
  {
    id: 'style_connoisseur',
    name: 'Style Connoisseur',
    description: 'Build a collection of 50 curated items',
    icon: '✨',
    tier: 'gold',
    category: 'wardrobe',
    points: 50,
    criteria: { type: 'count', threshold: 50, metric: 'total_items' },
  },

  // Outfit Creation (Creative Expression)
  {
    id: 'outfit_creator',
    name: 'Outfit Creator',
    description: 'Create your first outfit composition',
    icon: '🎨',
    tier: 'bronze',
    category: 'outfits',
    points: 15,
    criteria: { type: 'count', threshold: 1, metric: 'outfits_created' },
  },
  {
    id: 'fashion_architect',
    name: 'Fashion Architect',
    description: 'Design 10 unique outfit combinations',
    icon: '🏗️',
    tier: 'silver',
    category: 'outfits',
    points: 30,
    criteria: { type: 'count', threshold: 10, metric: 'outfits_created' },
  },

  // Cost-Per-Wear (Value Focus)
  {
    id: 'value_seeker',
    name: 'Value Seeker',
    description: 'Get 5 items to their target cost-per-wear',
    icon: '💎',
    tier: 'bronze',
    category: 'efficiency',
    points: 20,
    criteria: { type: 'count', threshold: 5, metric: 'items_hit_cpw_target' },
  },
  {
    id: 'roi_champion',
    name: 'ROI Champion',
    description: 'Achieve target CPW on 10 items',
    icon: '📈',
    tier: 'silver',
    category: 'efficiency',
    points: 40,
    criteria: { type: 'count', threshold: 10, metric: 'items_hit_cpw_target' },
  },

  // Wardrobe Utilization (Sustainable Behavior)
  {
    id: 'wardrobe_maximizer',
    name: 'Wardrobe Maximizer',
    description: 'Wear 80% of your items at least once this month',
    icon: '🔄',
    tier: 'gold',
    category: 'efficiency',
    points: 50,
    criteria: { type: 'percentage', threshold: 80, metric: 'items_worn_this_month' },
  },

  // Discovery (Exploration)
  {
    id: 'category_explorer',
    name: 'Category Explorer',
    description: 'Have items in 5 different categories',
    icon: '🧭',
    tier: 'bronze',
    category: 'discovery',
    points: 15,
    criteria: { type: 'count', threshold: 5, metric: 'unique_categories' },
  },
  {
    id: 'brand_adventurer',
    name: 'Brand Adventurer',
    description: 'Explore 10 different brands',
    icon: '🌍',
    tier: 'silver',
    category: 'discovery',
    points: 25,
    criteria: { type: 'count', threshold: 10, metric: 'unique_brands' },
  },

  // Price Monitoring (Smart Shopping)
  {
    id: 'deal_hunter',
    name: 'Deal Hunter',
    description: 'Save $50 total from price monitoring',
    icon: '🎯',
    tier: 'silver',
    category: 'efficiency',
    points: 30,
    criteria: { type: 'count', threshold: 50, metric: 'total_saved_dollars' },
  },
]

/**
 * IMPORTANT: No streak-based achievements in this list!
 * Philosophy: We want engagement, not anxiety about breaking streaks.
 */
