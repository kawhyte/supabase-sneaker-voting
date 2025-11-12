-- Migration 043: Cleanup Sample/Test Cloudinary Images
-- Description: Remove demo/sample Cloudinary images that don't exist in the actual account
-- Issue: Sample images like "samples/upscaling/desk" cause 404 errors
-- Date: 2025-11-12

-- ============================================================================
-- STEP 1: Log affected records before cleanup (for reference)
-- ============================================================================

-- Create temporary table to log cleanup operations
CREATE TEMP TABLE IF NOT EXISTS cleanup_log (
    table_name TEXT,
    record_id UUID,
    image_url TEXT,
    action TEXT,
    cleaned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log item_photos that will be deleted
INSERT INTO cleanup_log (table_name, record_id, image_url, action)
SELECT
    'item_photos' as table_name,
    id as record_id,
    image_url,
    'DELETE' as action
FROM item_photos
WHERE image_url LIKE '%samples/%'
   OR image_url LIKE '%demo/%'
   OR image_url LIKE '%test/%'
   OR image_url LIKE '%v1/samples/%'
   OR image_url LIKE '%upscaling/%';

-- Log items with sample images in cloudinary_id or image_url
INSERT INTO cleanup_log (table_name, record_id, image_url, action)
SELECT
    'items' as table_name,
    id as record_id,
    COALESCE(cloudinary_id, image_url) as image_url,
    'SET NULL' as action
FROM items
WHERE cloudinary_id LIKE '%samples/%'
   OR cloudinary_id LIKE '%demo/%'
   OR cloudinary_id LIKE '%test/%'
   OR cloudinary_id LIKE '%v1/samples/%'
   OR cloudinary_id LIKE '%upscaling/%'
   OR image_url LIKE '%samples/%'
   OR image_url LIKE '%demo/%'
   OR image_url LIKE '%test/%'
   OR image_url LIKE '%v1/samples/%'
   OR image_url LIKE '%upscaling/%';

-- ============================================================================
-- STEP 2: Delete item_photos with sample/test images
-- ============================================================================

DELETE FROM item_photos
WHERE image_url LIKE '%samples/%'
   OR image_url LIKE '%demo/%'
   OR image_url LIKE '%test/%'
   OR image_url LIKE '%v1/samples/%'
   OR image_url LIKE '%upscaling/%';

-- ============================================================================
-- STEP 3: Clear sample image references from items table
-- ============================================================================

UPDATE items
SET
    cloudinary_id = NULL,
    image_url = NULL
WHERE cloudinary_id LIKE '%samples/%'
   OR cloudinary_id LIKE '%demo/%'
   OR cloudinary_id LIKE '%test/%'
   OR cloudinary_id LIKE '%v1/samples/%'
   OR cloudinary_id LIKE '%upscaling/%'
   OR image_url LIKE '%samples/%'
   OR image_url LIKE '%demo/%'
   OR image_url LIKE '%test/%'
   OR image_url LIKE '%v1/samples/%'
   OR image_url LIKE '%upscaling/%';

-- ============================================================================
-- STEP 4: Log summary of cleanup operations
-- ============================================================================

DO $$
DECLARE
    item_photos_deleted INTEGER;
    items_updated INTEGER;
BEGIN
    -- Count deletions and updates
    SELECT COUNT(*) INTO item_photos_deleted
    FROM cleanup_log
    WHERE table_name = 'item_photos' AND action = 'DELETE';

    SELECT COUNT(*) INTO items_updated
    FROM cleanup_log
    WHERE table_name = 'items' AND action = 'SET NULL';

    -- Log summary
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Migration 043: Cleanup Sample Images - COMPLETE';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Item photos deleted: %', item_photos_deleted;
    RAISE NOTICE 'Items updated (image fields set to NULL): %', items_updated;
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Items with NULL images will display placeholder images in the UI';
    RAISE NOTICE 'You can upload new photos for these items via the dashboard';
    RAISE NOTICE '================================================';
END $$;

-- ============================================================================
-- VERIFICATION: Check that no sample images remain
-- ============================================================================

DO $$
DECLARE
    remaining_sample_photos INTEGER;
    remaining_sample_items INTEGER;
BEGIN
    -- Check item_photos
    SELECT COUNT(*) INTO remaining_sample_photos
    FROM item_photos
    WHERE image_url LIKE '%samples/%'
       OR image_url LIKE '%demo/%'
       OR image_url LIKE '%test/%'
       OR image_url LIKE '%v1/samples/%'
       OR image_url LIKE '%upscaling/%';

    -- Check items
    SELECT COUNT(*) INTO remaining_sample_items
    FROM items
    WHERE cloudinary_id LIKE '%samples/%'
       OR cloudinary_id LIKE '%demo/%'
       OR cloudinary_id LIKE '%test/%'
       OR cloudinary_id LIKE '%v1/samples/%'
       OR cloudinary_id LIKE '%upscaling/%'
       OR image_url LIKE '%samples/%'
       OR image_url LIKE '%demo/%'
       OR image_url LIKE '%test/%'
       OR image_url LIKE '%v1/samples/%'
       OR image_url LIKE '%upscaling/%';

    -- Verify cleanup
    IF remaining_sample_photos > 0 OR remaining_sample_items > 0 THEN
        RAISE EXCEPTION 'Cleanup verification failed! Remaining sample images: item_photos=%, items=%',
            remaining_sample_photos, remaining_sample_items;
    ELSE
        RAISE NOTICE '✓ Verification passed: No sample images remaining';
    END IF;
END $$;

-- ============================================================================
-- NOTES FOR FUTURE REFERENCE
-- ============================================================================

-- This migration resolves Cloudinary 404 errors caused by:
-- 1. Demo images (e.g., "samples/upscaling/desk") that don't exist in the user's account
-- 2. Test images added during development
-- 3. Placeholder images from Cloudinary's sample library

-- After this migration:
-- - Items will display placeholder images where sample images were removed
-- - Users can upload new photos via the dashboard
-- - No more 404 errors in browser console for missing Cloudinary images

-- To manually add photos back:
-- 1. Go to Dashboard
-- 2. Click on an item with missing images
-- 3. Click "Edit Item"
-- 4. Upload new photos via the photo uploader

COMMENT ON TABLE items IS 'Wardrobe items table - migration 043 cleaned up sample Cloudinary images';
