import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Test endpoint for seasonal tip notifications
 * Creates a sample seasonal suggestion notification
 *
 * Usage: GET /api/test/seasonal-tips
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Determine current season
    const month = new Date().getMonth() + 1
    let season = 'spring'
    let emoji = '🌸'
    let tips: string[] = []
    let categories: string[] = []

    if (month >= 3 && month <= 5) {
      season = 'spring'
      emoji = '🌸'
      tips = [
        'Refresh your wardrobe with lighter fabrics and pastel colors',
        'Layer lightweight pieces for unpredictable spring weather',
        'Incorporate floral patterns and botanical prints',
        'Invest in versatile outerwear like denim jackets and blazers'
      ]
      categories = ['tops', 'outerwear', 'accessories']
    } else if (month >= 6 && month <= 8) {
      season = 'summer'
      emoji = '☀️'
      tips = [
        'Embrace breathable fabrics like cotton and linen',
        'Go bold with bright colors and fun patterns',
        'Mix and match basics for travel-friendly capsules',
        'Add protection with lightweight scarves and hats'
      ]
      categories = ['tops', 'bottoms', 'accessories']
    } else if (month >= 9 && month <= 11) {
      season = 'fall'
      emoji = '🍂'
      tips = [
        'Layer up with sweaters, cardigans, and light jackets',
        'Transition to warmer color palettes: browns, oranges, burgundy',
        'Invest in quality boots and sturdy footwear',
        'Mix textures: corduroy, wool, and suede'
      ]
      categories = ['outerwear', 'bottoms', 'bags']
    } else {
      season = 'winter'
      emoji = '❄️'
      tips = [
        'Layer strategically for warmth without bulk',
        'Invest in quality winter coats and thermal layers',
        'Add jewel tones and metallic accents',
        'Don\'t forget gloves, scarves, and winter accessories'
      ]
      categories = ['outerwear', 'accessories', 'bags']
    }

    // Create test notification
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        notification_type: 'seasonal_tip',
        title: `${emoji} ${season.charAt(0).toUpperCase() + season.slice(1)} Styling Guide`,
        message: `Time to refresh your wardrobe for ${season}! Check out these tips and recommendations.`,
        severity: 'low',
        link_url: '/dashboard?tab=owned',
        action_label: 'Organize Wardrobe',
        metadata: {
          season,
          tips,
          suggested_categories: categories,
          suggested_colors: season === 'spring'
            ? ['pastels', 'whites', 'pinks']
            : season === 'summer'
            ? ['brights', 'whites', 'neons']
            : season === 'fall'
            ? ['browns', 'oranges', 'burgundy']
            : ['jewel tones', 'grays', 'blacks'],
          year: new Date().getFullYear()
        }
      })
      .select()
      .single()

    if (notifError) {
      console.error('Error creating seasonal notification:', notifError)
      return NextResponse.json(
        { error: 'Failed to create seasonal notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Created ${season} seasonal tip notification`,
      notification,
      season,
      tipsCount: tips.length,
      categories,
      preview: {
        season,
        tipsCount: tips.length,
        categoriesCount: categories.length
      }
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
