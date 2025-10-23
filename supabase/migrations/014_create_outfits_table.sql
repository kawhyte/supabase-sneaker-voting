-- Migration 014: Create outfits table
-- Purpose: Store user-created outfit combinations with visual layout data

CREATE TABLE IF NOT EXISTS outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Outfit metadata
  name TEXT NOT NULL DEFAULT 'Untitled Outfit',
  description TEXT,
  occasion TEXT, -- 'casual', 'work', 'date', 'gym', 'formal', 'travel', etc.

  -- Visual composition
  background_color TEXT DEFAULT '#FFFFFF', -- Background within phone mockup

  -- Wear tracking
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_worn TIMESTAMP WITH TIME ZONE, -- When user marked this outfit as worn
  times_worn INT DEFAULT 0, -- How many times this outfit has been worn
  last_worn TIMESTAMP WITH TIME ZONE,

  -- Status
  is_archived BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own outfits
CREATE POLICY "Users can view own outfits" ON outfits FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can create outfits
CREATE POLICY "Users can create outfits" ON outfits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own outfits
CREATE POLICY "Users can update own outfits" ON outfits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own outfits
CREATE POLICY "Users can delete own outfits" ON outfits FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_outfits_user_id ON outfits(user_id);
CREATE INDEX idx_outfits_created_at ON outfits(created_at DESC);
CREATE INDEX idx_outfits_occasion ON outfits(occasion);
