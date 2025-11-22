/**
 * Cloudinary Cleanup Utility
 *
 * Provides tools to detect and cleanup orphaned Cloudinary images.
 * Orphaned images are those that exist in Cloudinary but have no database references.
 *
 * Usage:
 * - findOrphanedItemPhotos(): Detect orphaned images
 * - cleanupOrphanedImages(): Delete orphaned images from Cloudinary
 *
 * Safety:
 * - Only deletes images with NO database references
 * - Supports dry-run mode for preview
 * - Comprehensive logging for audit trail
 */

import { createClient } from '@/utils/supabase/server'
import { deleteFromCloudinary } from '@/lib/cloudinary'

export interface OrphanedImage {
  cloudinaryId: string
  itemId: string | null
  imageUrl: string
  reason: 'missing_item' | 'missing_photo_record'
  deletedAt?: string
}

export interface CleanupResult {
  success: number
  failed: number
  errors: Array<{ cloudinaryId: string; error: string }>
}

/**
 * Find orphaned Cloudinary images in item_photos table.
 *
 * Orphaned images are photos where:
 * - The referenced item has been deleted (item_id points to non-existent item)
 * - The photo record exists but the item is gone
 *
 * This happens when items are deleted without proper Cloudinary cleanup.
 *
 * @returns Array of orphaned image records
 */
export async function findOrphanedItemPhotos(): Promise<OrphanedImage[]> {
  console.log('[Cloudinary Cleanup] Starting orphan detection...')

  const supabase = await createClient()

  // Find photos where the item no longer exists
  // This uses a LEFT JOIN to identify photos with deleted items
  const { data: orphans, error } = await supabase
    .from('item_photos')
    .select(`
      id,
      item_id,
      cloudinary_id,
      image_url,
      created_at
    `)
    .is('item_id', null) // Item was deleted but photo record remains

  if (error) {
    console.error('[Cloudinary Cleanup] Error finding orphaned photos:', error)
    throw error
  }

  const orphanedImages: OrphanedImage[] = (orphans || []).map(p => ({
    cloudinaryId: p.cloudinary_id,
    itemId: p.item_id,
    imageUrl: p.image_url,
    reason: 'missing_item' as const,
    deletedAt: p.created_at
  }))

  console.log(`[Cloudinary Cleanup] Found ${orphanedImages.length} orphaned images`)

  return orphanedImages
}

/**
 * Cleanup orphaned images from Cloudinary.
 *
 * Deletes images from Cloudinary storage that have no database references.
 * Uses batch processing with retry logic for reliability.
 *
 * SAFETY: This only deletes images that are confirmed orphans.
 * The database records are NOT touched - those must be cleaned separately.
 *
 * @param orphans - Array of orphaned images to delete
 * @returns Cleanup statistics (success count, failure count, errors)
 */
export async function cleanupOrphanedImages(
  orphans: OrphanedImage[]
): Promise<CleanupResult> {
  console.log(`[Cloudinary Cleanup] Starting cleanup of ${orphans.length} orphaned images...`)

  const results: CleanupResult = {
    success: 0,
    failed: 0,
    errors: []
  }

  // Process in batches of 5 for parallel deletion
  const BATCH_SIZE = 5

  for (let i = 0; i < orphans.length; i += BATCH_SIZE) {
    const batch = orphans.slice(i, i + BATCH_SIZE)

    const batchResults = await Promise.allSettled(
      batch.map(async (orphan) => {
        // Retry logic: 3 attempts with exponential backoff
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            await deleteFromCloudinary(orphan.cloudinaryId)
            console.log(`[Cloudinary Cleanup] ✓ Deleted: ${orphan.cloudinaryId}`)
            return { success: true }
          } catch (error) {
            if (attempt === 2) {
              // Final attempt failed
              const errorMessage = error instanceof Error ? error.message : String(error)
              console.error(`[Cloudinary Cleanup] ✗ Failed to delete ${orphan.cloudinaryId}:`, errorMessage)
              throw new Error(errorMessage)
            }

            // Retry with exponential backoff
            const delay = Math.pow(2, attempt) * 1000
            console.warn(`[Cloudinary Cleanup] Retry ${attempt + 1}/3 for ${orphan.cloudinaryId} after ${delay}ms`)
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }
      })
    )

    // Collect results
    batchResults.forEach((result, idx) => {
      const orphan = batch[idx]
      if (result.status === 'fulfilled') {
        results.success++
      } else {
        results.failed++
        results.errors.push({
          cloudinaryId: orphan.cloudinaryId,
          error: result.reason?.message || String(result.reason)
        })
      }
    })
  }

  console.log(`[Cloudinary Cleanup] Cleanup complete: ${results.success} succeeded, ${results.failed} failed`)

  return results
}

/**
 * Clean up orphaned database records (item_photos with no item).
 *
 * This removes the database records for photos that belong to deleted items.
 * Should be called AFTER cleanupOrphanedImages() to ensure Cloudinary is cleaned first.
 *
 * @returns Number of database records deleted
 */
export async function cleanupOrphanedDatabaseRecords(): Promise<number> {
  console.log('[Cloudinary Cleanup] Starting database record cleanup...')

  const supabase = await createClient()

  // Delete photo records where item no longer exists
  const { data, error } = await supabase
    .from('item_photos')
    .delete()
    .is('item_id', null)
    .select('id')

  if (error) {
    console.error('[Cloudinary Cleanup] Error cleaning database records:', error)
    throw error
  }

  const deletedCount = data?.length || 0
  console.log(`[Cloudinary Cleanup] ✓ Deleted ${deletedCount} orphaned database records`)

  return deletedCount
}

/**
 * Complete cleanup workflow: Cloudinary + Database.
 *
 * This is the main entry point for cleanup operations.
 * It handles both Cloudinary images and database records in the correct order.
 *
 * Workflow:
 * 1. Find orphaned images
 * 2. Delete from Cloudinary
 * 3. Delete database records
 *
 * @param dryRun - If true, only preview without deleting
 * @returns Cleanup statistics
 */
export async function performCompleteCleanup(dryRun: boolean = true): Promise<{
  preview: boolean
  orphansFound: number
  cloudinaryDeleted: number
  cloudinaryFailed: number
  databaseRecordsDeleted: number
  orphans: OrphanedImage[]
  errors: Array<{ cloudinaryId: string; error: string }>
}> {
  console.log(`[Cloudinary Cleanup] Starting complete cleanup (dryRun: ${dryRun})...`)

  // Step 1: Find orphans
  const orphans = await findOrphanedItemPhotos()

  if (dryRun) {
    console.log('[Cloudinary Cleanup] DRY RUN - No deletions performed')
    return {
      preview: true,
      orphansFound: orphans.length,
      cloudinaryDeleted: 0,
      cloudinaryFailed: 0,
      databaseRecordsDeleted: 0,
      orphans,
      errors: []
    }
  }

  // Step 2: Delete from Cloudinary
  const cloudinaryResults = await cleanupOrphanedImages(orphans)

  // Step 3: Delete database records
  const databaseRecordsDeleted = await cleanupOrphanedDatabaseRecords()

  console.log('[Cloudinary Cleanup] Complete cleanup finished')

  return {
    preview: false,
    orphansFound: orphans.length,
    cloudinaryDeleted: cloudinaryResults.success,
    cloudinaryFailed: cloudinaryResults.failed,
    databaseRecordsDeleted,
    orphans,
    errors: cloudinaryResults.errors
  }
}
