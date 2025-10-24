-- Add sample outfits for testing Phase 5 features
-- This migration creates sample outfits with various occasions and wear histories

-- Create 7 sample outfits with different occasions
INSERT INTO outfits (user_id, name, occasion, background_color, times_worn, last_worn, created_at, updated_at)
VALUES
  -- Casual outfits
  (
    (SELECT id FROM profiles LIMIT 1),
    'Weekend Coffee',
    'casual',
    '#FFF7CC',
    3,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '10 days',
    NOW()
  ),
  (
    (SELECT id FROM profiles LIMIT 1),
    'Casual Friday',
    'casual',
    '#FFFFFF',
    5,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '15 days',
    NOW()
  ),
  -- Work outfits
  (
    (SELECT id FROM profiles LIMIT 1),
    'Business Casual Meeting',
    'work',
    '#F5F5DC',
    8,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '5 days',
    NOW()
  ),
  (
    (SELECT id FROM profiles LIMIT 1),
    'Office Day',
    'work',
    '#FFFACD',
    12,
    NOW(),
    NOW() - INTERVAL '20 days',
    NOW()
  ),
  -- Workout outfit
  (
    (SELECT id FROM profiles LIMIT 1),
    'Gym Session',
    'workout',
    '#E0FFFF',
    15,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '8 days',
    NOW()
  ),
  -- Night out
  (
    (SELECT id FROM profiles LIMIT 1),
    'Dinner Date',
    'night_out',
    '#FFE4E1',
    2,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '12 days',
    NOW()
  ),
  -- Party
  (
    (SELECT id FROM profiles LIMIT 1),
    'Weekend Party',
    'party',
    '#DDA0DD',
    1,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '35 days',
    NOW()
  );

-- Add some sample outfit items (linking to existing items from wardrobe)
INSERT INTO outfit_items (outfit_id, item_id, position_x, position_y, z_index, display_width, display_height)
SELECT
  o.id,
  s.id,
  RANDOM() * 0.5 + 0.25,  -- Random X position (0.25-0.75)
  RANDOM() * 0.3 + 0.2,   -- Random Y position (0.2-0.5)
  ROW_NUMBER() OVER (PARTITION BY o.id ORDER BY s.id),
  0.2,
  0.3
FROM outfits o
CROSS JOIN (
  SELECT id FROM items WHERE user_id = (SELECT id FROM profiles LIMIT 1) AND status = 'owned'
  LIMIT 3  -- Only take first 3 items per outfit
) s
WHERE o.user_id = (SELECT id FROM profiles LIMIT 1)
AND o.name IN ('Weekend Coffee', 'Casual Friday', 'Business Casual Meeting', 'Office Day', 'Gym Session', 'Dinner Date', 'Weekend Party');

-- Verify the inserts
SELECT
  'Outfits created:' as info,
  COUNT(*) as count
FROM outfits
WHERE user_id = (SELECT id FROM profiles LIMIT 1)
AND created_at >= NOW() - INTERVAL '1 minute';

SELECT
  'Outfit items created:' as info,
  COUNT(*) as count
FROM outfit_items
WHERE outfit_id IN (
  SELECT id FROM outfits
  WHERE user_id = (SELECT id FROM profiles LIMIT 1)
  AND created_at >= NOW() - INTERVAL '1 minute'
);
