-- Migration 015: Create outfit_items junction table
-- Purpose: Track which items are in an outfit and their visual positioning

CREATE TABLE IF NOT EXISTS outfit_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outfit_id UUID REFERENCES outfits(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,

  -- Visual positioning (for phone mockup canvas)
  position_x NUMERIC DEFAULT 0.5, -- 0.0 to 1.0 (percentage of width)
  position_y NUMERIC DEFAULT 0.5, -- 0.0 to 1.0 (percentage of height)
  z_index INT DEFAULT 0, -- Layer order (0=shoes, 1=bottoms, 2=tops, 3=outerwear, 4=accessories)

  -- Photo crop data (for outfit-specific cropping)
  crop_x NUMERIC, -- Crop origin X (0-1)
  crop_y NUMERIC, -- Crop origin Y (0-1)
  crop_width NUMERIC, -- Crop width (0-1)
  crop_height NUMERIC, -- Crop height (0-1)
  cropped_image_url TEXT, -- URL of cropped version (stored in Cloudinary)

  -- Display size on canvas
  display_width NUMERIC DEFAULT 0.3, -- Width as % of canvas (0.1 to 1.0)
  display_height NUMERIC DEFAULT 0.3, -- Height as % of canvas (0.1 to 1.0)

  -- Order in the outfit
  item_order INT DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (inherit from outfit through outfit_id)
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view outfit items for their outfits
CREATE POLICY "Users can view outfit items" ON outfit_items FOR SELECT
  USING (
    outfit_id IN (
      SELECT id FROM outfits WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can create outfit items for their outfits
CREATE POLICY "Users can create outfit items" ON outfit_items FOR INSERT
  WITH CHECK (
    outfit_id IN (
      SELECT id FROM outfits WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update outfit items for their outfits
CREATE POLICY "Users can update outfit items" ON outfit_items FOR UPDATE
  USING (
    outfit_id IN (
      SELECT id FROM outfits WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    outfit_id IN (
      SELECT id FROM outfits WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete outfit items from their outfits
CREATE POLICY "Users can delete outfit items" ON outfit_items FOR DELETE
  USING (
    outfit_id IN (
      SELECT id FROM outfits WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_outfit_items_outfit_id ON outfit_items(outfit_id);
CREATE INDEX idx_outfit_items_item_id ON outfit_items(item_id);
CREATE UNIQUE INDEX idx_outfit_items_unique ON outfit_items(outfit_id, item_id);
