-- Cleanup script for Cloudinary sample/test images
-- Run this AFTER reviewing the results from find-sample-images.sql

-- OPTION 1: Delete item_photos with sample images
-- (Recommended if items have other valid photos)
DELETE FROM item_photos
WHERE image_url LIKE '%samples%'
   OR image_url LIKE '%demo%'
   OR image_url LIKE '%test%';

-- OPTION 2: Delete entire items with sample images
-- (Use with caution - this will delete the entire item)
-- Uncomment below if you want to delete the items entirely

-- DELETE FROM items
-- WHERE cloudinary_id LIKE '%samples%'
--    OR cloudinary_id LIKE '%demo%'
--    OR cloudinary_id LIKE '%test%'
--    OR image_url LIKE '%samples%'
--    OR image_url LIKE '%demo%'
--    OR image_url LIKE '%test%';

-- OPTION 3: Clear sample image references (set to NULL)
-- (Recommended if you want to keep the items but remove bad images)
UPDATE items
SET
    cloudinary_id = NULL,
    image_url = NULL
WHERE cloudinary_id LIKE '%samples%'
   OR cloudinary_id LIKE '%demo%'
   OR cloudinary_id LIKE '%test%'
   OR image_url LIKE '%samples%'
   OR image_url LIKE '%demo%'
   OR image_url LIKE '%test%';

-- Verify cleanup
SELECT COUNT(*) as remaining_sample_images
FROM item_photos
WHERE image_url LIKE '%samples%'
   OR image_url LIKE '%demo%'
   OR image_url LIKE '%test%';
