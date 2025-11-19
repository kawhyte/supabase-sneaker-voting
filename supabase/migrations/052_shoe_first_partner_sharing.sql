-- ============================================================================
-- Migration 052: Shoe-First Inventory with Partner Sharing
-- ============================================================================
-- Purpose: Enable partner wardrobe sharing with granular permissions
-- Date: 2025-11-19
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Add is_shared column to items table
-- ============================================================================
-- Allows items to be marked as "shared with partner"
ALTER TABLE items
  ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE;

-- Create index for efficient filtering of shared items
CREATE INDEX IF NOT EXISTS idx_items_is_shared ON items(is_shared);

-- ============================================================================
-- STEP 2: Create user_connections table (Partner System)
-- ============================================================================
-- Tracks partner relationships between users
CREATE TABLE IF NOT EXISTS user_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connected_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Connection metadata
  connection_type TEXT DEFAULT 'partner', -- 'partner', 'family', 'friend' (for future)
  share_all_items BOOLEAN DEFAULT FALSE, -- If true, shares entire wardrobe automatically

  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'pending', 'blocked'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure bidirectional uniqueness (prevent duplicate connections)
  UNIQUE(user_id, connected_user_id)
);

-- Prevent self-connections
ALTER TABLE user_connections
  ADD CONSTRAINT no_self_connection CHECK (user_id != connected_user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_connected_user_id ON user_connections(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);

-- ============================================================================
-- STEP 3: Create item_shares table (Granular Sharing)
-- ============================================================================
-- Tracks individual item sharing permissions
CREATE TABLE IF NOT EXISTS item_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Permissions
  permission_level TEXT DEFAULT 'view', -- 'view' (can see) or 'edit' (can modify)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique sharing per item per user
  UNIQUE(item_id, shared_with_user_id)
);

-- Prevent sharing with self
ALTER TABLE item_shares
  ADD CONSTRAINT no_self_sharing CHECK (owner_id != shared_with_user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_item_shares_item_id ON item_shares(item_id);
CREATE INDEX IF NOT EXISTS idx_item_shares_owner_id ON item_shares(owner_id);
CREATE INDEX IF NOT EXISTS idx_item_shares_shared_with_user_id ON item_shares(shared_with_user_id);

-- ============================================================================
-- STEP 4: Enable RLS on new tables
-- ============================================================================

-- Enable RLS on user_connections
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

-- Enable RLS on item_shares
ALTER TABLE item_shares ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: RLS Policies for user_connections
-- ============================================================================

-- Users can view their own connections (both directions)
CREATE POLICY "Users can view their connections" ON user_connections FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.uid() = connected_user_id
  );

-- Users can create connections
CREATE POLICY "Users can create connections" ON user_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own connections
CREATE POLICY "Users can update their connections" ON user_connections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own connections
CREATE POLICY "Users can delete their connections" ON user_connections FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- ============================================================================
-- STEP 6: RLS Policies for item_shares
-- ============================================================================

-- Users can view shares they created or shares targeting them
CREATE POLICY "Users can view relevant shares" ON item_shares FOR SELECT
  USING (
    auth.uid() = owner_id OR
    auth.uid() = shared_with_user_id
  );

-- Only item owners can create shares
CREATE POLICY "Owners can create shares" ON item_shares FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (
      SELECT 1 FROM items WHERE id = item_id AND user_id = auth.uid()
    )
  );

-- Only item owners can update shares
CREATE POLICY "Owners can update shares" ON item_shares FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Only item owners can delete shares
CREATE POLICY "Owners can delete shares" ON item_shares FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================================================
-- STEP 7: Update items RLS policies to allow shared item viewing
-- ============================================================================

-- Drop existing SELECT policy (if it exists)
DROP POLICY IF EXISTS "Users can view their own items" ON items;

-- Create new SELECT policy that includes shared items
CREATE POLICY "Users can view own and shared items" ON items FOR SELECT
  USING (
    -- Own items
    auth.uid() = user_id
    OR
    -- Items shared directly with this user
    id IN (
      SELECT item_id
      FROM item_shares
      WHERE shared_with_user_id = auth.uid()
    )
    OR
    -- Items from users who share all items with this user
    user_id IN (
      SELECT user_id
      FROM user_connections
      WHERE connected_user_id = auth.uid()
        AND share_all_items = TRUE
        AND status = 'active'
    )
    OR
    -- Items from users this user shares all items with (bidirectional)
    user_id IN (
      SELECT connected_user_id
      FROM user_connections
      WHERE user_id = auth.uid()
        AND share_all_items = TRUE
        AND status = 'active'
    )
  );

-- ============================================================================
-- STEP 8: Helper function to check if user can edit an item
-- ============================================================================

CREATE OR REPLACE FUNCTION can_edit_item(item_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM items WHERE id = item_id AND user_id = user_id
  ) OR EXISTS (
    SELECT 1 FROM item_shares
    WHERE item_shares.item_id = item_id
      AND shared_with_user_id = user_id
      AND permission_level = 'edit'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 9: Update triggers for updated_at columns
-- ============================================================================

CREATE TRIGGER update_user_connections_updated_at
  BEFORE UPDATE ON user_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_shares_updated_at
  BEFORE UPDATE ON item_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 10: Add helpful comments
-- ============================================================================

COMMENT ON TABLE user_connections IS 'Partner relationships for wardrobe sharing';
COMMENT ON TABLE item_shares IS 'Granular item-level sharing permissions';
COMMENT ON COLUMN items.is_shared IS 'Indicates if item is shared with partner';
COMMENT ON FUNCTION can_edit_item IS 'Checks if user has edit permissions for an item';

COMMIT;
