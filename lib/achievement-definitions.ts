import { LucideIcon, Package, Footprints, Sparkles, Gem, TrendingUp, RefreshCw, Compass, Globe, Target, Flame, Star, Repeat2 } from 'lucide-react'

export interface AchievementDefinition {
  id: string
  name: string
  description: string
  icon: LucideIcon
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  category: 'wardrobe' | 'efficiency' | 'discovery'
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
    icon: Package,
    tier: 'Bronze',
    category: 'wardrobe',
    points: 10,
    criteria: { type: 'count', threshold: 10, metric: 'total_items' },
  },
  {
    id: 'wardrobe_curator',
    name: 'Collection Architect',
    description: 'Catalog 25 items in your collection',
    icon: Footprints,
    tier: 'Silver',
    category: 'wardrobe',
    points: 25,
    criteria: { type: 'count', threshold: 25, metric: 'total_items' },
  },
  {
    id: 'style_connoisseur',
    name: 'Style Connoisseur',
    description: 'Build a collection of 50 curated items',
    icon: Sparkles,
    tier: 'Gold',
    category: 'wardrobe',
    points: 50,
    criteria: { type: 'count', threshold: 50, metric: 'total_items' },
  },

  // Cost-Per-Wear (Value Focus)
  {
    id: 'value_seeker',
    name: 'Value Seeker',
    description: 'Get 5 items to their target cost-per-wear',
    icon: Gem,
    tier: 'Bronze',
    category: 'efficiency',
    points: 20,
    criteria: { type: 'count', threshold: 5, metric: 'items_hit_cpw_target' },
  },
  {
    id: 'roi_champion',
    name: 'ROI Champion',
    description: 'Achieve target CPW on 10 items',
    icon: TrendingUp,
    tier: 'Silver',
    category: 'efficiency',
    points: 40,
    criteria: { type: 'count', threshold: 10, metric: 'items_hit_cpw_target' },
  },

  // Wardrobe Utilization (Sustainable Behavior)
  {
    id: 'wardrobe_maximizer',
    name: 'Heavy Rotation',
    description: 'Rock 80% of your rotation at least once this month',
    icon: RefreshCw,
    tier: 'Gold',
    category: 'efficiency',
    points: 50,
    criteria: { type: 'percentage', threshold: 80, metric: 'items_worn_this_month' },
  },

  // Discovery (Exploration)
  {
    id: 'category_explorer',
    name: 'Silhouette Explorer',
    description: 'Have shoes across 5 different silhouettes',
    icon: Compass,
    tier: 'Bronze',
    category: 'discovery',
    points: 15,
    criteria: { type: 'count', threshold: 5, metric: 'unique_categories' },
  },
  {
    id: 'brand_adventurer',
    name: 'Brand Adventurer',
    description: 'Explore 10 different brands',
    icon: Globe,
    tier: 'Silver',
    category: 'discovery',
    points: 25,
    criteria: { type: 'count', threshold: 10, metric: 'unique_brands' },
  },

  // Price Monitoring (Smart Shopping)
  {
    id: 'deal_hunter',
    name: 'Deal Hunter',
    description: 'Save $50 total from price monitoring',
    icon: Target,
    tier: 'Silver',
    category: 'efficiency',
    points: 30,
    criteria: { type: 'count', threshold: 50, metric: 'total_saved_dollars' },
  },

  // Sneaker Culture Achievements
  {
    id: 'the_beater',
    name: 'The Beater',
    description: 'Get a pair past 50 wears with under $1.00 CPW',
    icon: Flame,
    tier: 'Gold',
    category: 'efficiency',
    points: 75,
    criteria: { type: 'custom', threshold: 1, metric: 'beater_pair' },
  },
  {
    id: 'brand_loyalist',
    name: 'Brand Loyalist',
    description: 'Own 5 or more pairs from the same brand',
    icon: Star,
    tier: 'Silver',
    category: 'discovery',
    points: 30,
    criteria: { type: 'count', threshold: 5, metric: 'pairs_from_top_brand' },
  },
  {
    id: 'rotation_architect',
    name: 'Rotation Architect',
    description: 'Log wears for 5 different pairs in a single week',
    icon: Repeat2,
    tier: 'Gold',
    category: 'efficiency',
    points: 60,
    criteria: { type: 'custom', threshold: 5, metric: 'unique_pairs_worn_this_week' },
  },
]

/**
 * IMPORTANT: No streak-based achievements in this list!
 * Philosophy: We want engagement, not anxiety about breaking streaks.
 */
