-- Migration: Enforce category quotas on existing outfits
-- Created: 2025-10-29
-- Purpose: Auto-fix outfits that violate quota rules
--          Quota Rules: Shoes (1), Tops (1), Bottoms (1), Outerwear (1), Accessories (unlimited)
--          Strategy: Keep first item in each category, archive the rest

-- Step 1: Archive items that exceed quotas
-- (We'll remove them in Step 2, but archive first for audit trail)

DO $$
DECLARE
  outfit_record RECORD;
  item_record RECORD;
  category_counts JSONB;
  current_count INT;
  quota_limit INT;
BEGIN
  -- Loop through all outfits
  FOR outfit_record IN
    SELECT id, user_id, name FROM outfits WHERE is_archived = FALSE
  LOOP
    -- Initialize category counters
    category_counts := '{}'::jsonb;

    -- Loop through items in this outfit (ordered by created_at to keep "first" items)
    FOR item_record IN
      SELECT
        oi.id as outfit_item_id,
        oi.item_id,
        oi.position_x,
        oi.position_y,
        oi.z_index,
        oi.display_width,
        oi.display_height,
        i.brand,
        i.model,
        i.category
      FROM outfit_items oi
      JOIN sneakers i ON oi.item_id = i.id
      WHERE oi.outfit_id = outfit_record.id
      ORDER BY oi.created_at ASC  -- Keep earliest items
    LOOP
      -- Determine quota for this category
      quota_limit := CASE item_record.category
        WHEN 'sneakers' THEN 1
        WHEN 'shoes' THEN 1
        WHEN 'tops' THEN 1
        WHEN 'sweaters' THEN 1
        WHEN 'bottoms' THEN 1
        WHEN 'pants' THEN 1
        WHEN 'shorts' THEN 1
        WHEN 'skirts' THEN 1
        WHEN 'outerwear' THEN 1
        WHEN 'jackets' THEN 1
        WHEN 'coats' THEN 1
        ELSE 999999  -- Accessories: unlimited
      END;

      -- Get current count for this category
      current_count := COALESCE(
        (category_counts->item_record.category)::text::int,
        0
      );

      -- If we've exceeded quota, archive this item
      IF current_count >= quota_limit THEN
        -- Archive to migration table
        INSERT INTO outfit_migration_archive (
          outfit_id,
          outfit_name,
          item_id,
          item_brand,
          item_model,
          item_category,
          removal_reason,
          position_x,
          position_y,
          z_index,
          display_width,
          display_height,
          migrated_by_user_id
        ) VALUES (
          outfit_record.id,
          outfit_record.name,
          item_record.item_id,
          item_record.brand,
          item_record.model,
          item_record.category,
          format('Exceeded quota for category: %s (had %s, kept %s)',
                 item_record.category,
                 current_count + 1,
                 quota_limit),
          item_record.position_x,
          item_record.position_y,
          item_record.z_index,
          item_record.display_width,
          item_record.display_height,
          outfit_record.user_id
        );

        -- Delete the outfit_item (will happen in Step 2)
        -- For now, just mark it
        -- We'll do actual deletion after archiving all items

      ELSE
        -- Increment counter (keep this item)
        category_counts := jsonb_set(
          category_counts,
          ARRAY[item_record.category],
          to_jsonb(current_count + 1)
        );
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Archived items that exceed quotas';
END $$;

-- Step 2: Delete archived items from outfit_items table
DELETE FROM outfit_items oi
WHERE EXISTS (
  SELECT 1 FROM outfit_migration_archive oma
  WHERE oma.outfit_id = oi.outfit_id
    AND oma.item_id = oi.item_id
);

-- Step 3: Add database comment for future reference
COMMENT ON TABLE outfit_items IS 'Links items to outfits. Quotas: Shoes/Tops/Bottoms/Outerwear (1 each), Accessories (unlimited)';

-- Report results
DO $$
DECLARE
  archive_count INT;
BEGIN
  SELECT COUNT(*) INTO archive_count FROM outfit_migration_archive;
  RAISE NOTICE 'Migration complete. Archived % items.', archive_count;
END $$;
