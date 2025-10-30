-- Migration: Create outfit_migration_archive table
-- Created: 2025-10-29
-- Purpose: Archive items removed during quota enforcement migration
--          (For audit trail only - not shown to users)

CREATE TABLE IF NOT EXISTS outfit_migration_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Original outfit info
  outfit_id UUID NOT NULL,
  outfit_name TEXT,

  -- Removed item info
  item_id UUID NOT NULL,
  item_brand TEXT,
  item_model TEXT,
  item_category TEXT,

  -- Why it was removed
  removal_reason TEXT NOT NULL,  -- e.g., "Exceeded quota for category: shoes (had 3, kept 1)"

  -- Original position data (in case we need to restore)
  position_x NUMERIC,
  position_y NUMERIC,
  z_index INT,
  display_width NUMERIC,
  display_height NUMERIC,

  -- Metadata
  migrated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  migrated_by_user_id UUID,

  CONSTRAINT fk_migrated_user
    FOREIGN KEY (migrated_by_user_id)
    REFERENCES auth.users(id)
    ON DELETE SET NULL
);

-- Index for lookups
CREATE INDEX idx_outfit_migration_archive_outfit_id
ON outfit_migration_archive(outfit_id);

CREATE INDEX idx_outfit_migration_archive_migrated_at
ON outfit_migration_archive(migrated_at DESC);

-- Add comments
COMMENT ON TABLE outfit_migration_archive IS 'Audit trail for items removed during quota enforcement migrations';
COMMENT ON COLUMN outfit_migration_archive.removal_reason IS 'Human-readable explanation of why item was removed';

-- RLS Policies (users can view their own archived items if we add UI later)
ALTER TABLE outfit_migration_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own migration archive"
ON outfit_migration_archive
FOR SELECT
USING (migrated_by_user_id = auth.uid());
