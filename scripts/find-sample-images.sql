-- Find items with Cloudinary sample/test images
-- These are demo images that don't exist in your Cloudinary account

-- Check items table for sample images in cloudinary_id
SELECT
    id,
    brand,
    model,
    cloudinary_id,
    image_url,
    created_at
FROM items
WHERE cloudinary_id LIKE '%samples%'
   OR cloudinary_id LIKE '%demo%'
   OR cloudinary_id LIKE '%test%'
   OR image_url LIKE '%samples%'
   OR image_url LIKE '%demo%'
   OR image_url LIKE '%test%'
ORDER BY created_at DESC;

-- Check item_photos table for sample images
SELECT
    ip.id,
    ip.item_id,
    ip.image_url,
    i.brand,
    i.model,
    ip.created_at
FROM item_photos ip
JOIN items i ON ip.item_id = i.id
WHERE ip.image_url LIKE '%samples%'
   OR ip.image_url LIKE '%demo%'
   OR ip.image_url LIKE '%test%'
ORDER BY ip.created_at DESC;

-- Get count of affected items
SELECT
    COUNT(DISTINCT i.id) as affected_items_count
FROM items i
LEFT JOIN item_photos ip ON i.id = ip.item_id
WHERE i.cloudinary_id LIKE '%samples%'
   OR i.cloudinary_id LIKE '%demo%'
   OR i.cloudinary_id LIKE '%test%'
   OR i.image_url LIKE '%samples%'
   OR i.image_url LIKE '%demo%'
   OR i.image_url LIKE '%test%'
   OR ip.image_url LIKE '%samples%'
   OR ip.image_url LIKE '%demo%'
   OR ip.image_url LIKE '%test%';
