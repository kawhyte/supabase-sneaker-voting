# Migration 043: Cleanup Sample Cloudinary Images

## Overview
This migration removes sample/test Cloudinary images that cause 404 errors in the browser console.

## Problem Being Solved
- **404 Errors**: Sample images like `samples/upscaling/desk` don't exist in your Cloudinary account
- **Console Spam**: Browser shows repeated 404 errors for missing images
- **User Experience**: Items display broken image indicators

## What This Migration Does

### 1. **Logs Affected Records** (Before Cleanup)
Creates a temporary table to track:
- Which item_photos will be deleted
- Which items will have image fields set to NULL
- Timestamp of cleanup operations

### 2. **Deletes Sample Photos**
Removes records from `item_photos` table where `image_url` contains:
- `samples/`
- `demo/`
- `test/`
- `v1/samples/`
- `upscaling/`

### 3. **Clears Sample Image References**
Sets `cloudinary_id` and `image_url` to NULL for items with sample images

### 4. **Verifies Cleanup**
- Counts deleted/updated records
- Checks that no sample images remain
- Raises exception if verification fails

## How to Run This Migration

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `043_cleanup_sample_cloudinary_images.sql`
5. Paste into the editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Check the **Messages** tab for the cleanup summary

### Option 2: Supabase CLI (If You Have Local Setup)
```bash
# Make sure you're in the project root
cd /path/to/supabase-sneaker-voting

# Run the migration
npx supabase migration up

# Or run this specific migration
npx supabase db push

# Verify with local database
npx supabase db diff
```

### Option 3: Direct SQL (Advanced)
```bash
# Connect to your database
psql postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Run the migration
\i supabase/migrations/043_cleanup_sample_cloudinary_images.sql
```

## Expected Output

After running, you should see output like:

```
================================================
Migration 043: Cleanup Sample Images - COMPLETE
================================================
Item photos deleted: 3
Items updated (image fields set to NULL): 2
================================================
Items with NULL images will display placeholder images in the UI
You can upload new photos for these items via the dashboard
================================================
✓ Verification passed: No sample images remaining
```

## What Happens After Migration?

### Items Will Show Placeholders
- Items with removed images display a 📸 placeholder icon
- Items are still searchable, filterable, and editable
- All metadata (brand, model, price, etc.) remains intact

### 404 Errors Resolved
- Browser console should be clean (no Cloudinary 404s)
- Manifest error also fixed (via symlink in separate commit)
- Page load performance may improve slightly

### Adding Photos Back
Users can upload new photos for these items:
1. Go to **Dashboard**
2. Click on item with placeholder image
3. Click **Edit Item** (three-dot menu)
4. Use **Photo Upload** section to add 1-5 new photos
5. Save changes

## Rollback (If Needed)

**⚠️ WARNING**: This migration does NOT include an automatic rollback because:
1. Sample images don't exist in your Cloudinary account anyway
2. No actual user data is lost (item metadata preserved)
3. The cleanup log is temporary and doesn't persist

If you need to restore image URLs manually:
```sql
-- You would need to know the original image URLs
-- This is why the migration logs them first

UPDATE items
SET image_url = 'YOUR_ORIGINAL_URL'
WHERE id = 'ITEM_ID';
```

## Safety Features

### Pre-Cleanup Logging
- Records all affected items before deletion
- Provides audit trail of what was cleaned up
- Logs are visible in migration output

### Verification Step
- Automatically checks cleanup success
- Raises exception if sample images remain
- Prevents partial cleanup from going unnoticed

### Data Preservation
- Only removes image references, NOT items
- Brand, model, price, wears, etc. remain intact
- Items stay in your collection/wishlist

## Testing After Migration

1. **Check Console**: Open browser DevTools → Console
   - Should see NO 404 errors for Cloudinary images
   - Manifest error should also be gone

2. **Check Dashboard**: Navigate to dashboard
   - Items with removed photos show placeholder 📸 icon
   - All other item data displays correctly

3. **Test Image Upload**: Try uploading new photo
   - Click item → Edit → Upload Photo
   - Save and verify photo displays

4. **Verify Database**: Run this query in SQL Editor
   ```sql
   SELECT COUNT(*) as items_with_null_images
   FROM items
   WHERE image_url IS NULL AND cloudinary_id IS NULL;
   ```

## Troubleshooting

### Migration Fails with "Permission Denied"
- Make sure you're running as a superuser or database owner
- Try running in Supabase Dashboard SQL Editor (has proper permissions)

### Still Seeing 404 Errors After Migration
1. Clear browser cache (Cmd/Ctrl + Shift + R)
2. Check if there are other sources of sample images
3. Run this verification query:
   ```sql
   SELECT id, brand, model, image_url, cloudinary_id
   FROM items
   WHERE image_url LIKE '%samples%'
      OR cloudinary_id LIKE '%samples%';
   ```

### Items Disappeared from Dashboard
- Items are NOT deleted, only image references removed
- Check that you're on the right tab (Owned / Want to Buy)
- Verify items exist: `SELECT COUNT(*) FROM items WHERE user_id = auth.uid();`

## Related Files
- **Migration File**: `supabase/migrations/043_cleanup_sample_cloudinary_images.sql`
- **Diagnostic Script**: `scripts/find-sample-images.sql` (now obsolete, migration does this)
- **Manual Cleanup**: `scripts/cleanup-sample-images.sql` (now obsolete)
- **Manifest Fix**: `public/manifest.webmanifest` (symlink)

## Questions?
If you encounter issues:
1. Check the Messages tab in Supabase SQL Editor for detailed error output
2. Verify you're running the latest version of the migration
3. Create an issue in the repo with the error message

---

**Migration Status**: Ready to run ✅
**Database Impact**: Low (only removes non-existent image references)
**Rollback Risk**: Low (no user data loss)
**Estimated Runtime**: < 1 second for most databases
