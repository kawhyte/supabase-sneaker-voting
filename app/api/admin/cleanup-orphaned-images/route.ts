/**
 * Admin Cleanup API - Orphaned Cloudinary Images
 *
 * This endpoint allows authenticated users to cleanup orphaned images from Cloudinary.
 * Orphaned images are those that exist in Cloudinary but have no database references.
 *
 * SAFETY FEATURES:
 * - Dry-run mode by default (preview without deleting)
 * - Authentication required (must be logged in)
 * - Comprehensive logging for audit trail
 * - Returns detailed preview before any deletions
 *
 * ENDPOINTS:
 * - POST /api/admin/cleanup-orphaned-images
 *   Body: { dryRun: true }  - Preview mode (default)
 *   Body: { dryRun: false } - Actual cleanup (requires explicit opt-in)
 *
 * USAGE:
 * 1. First, call with dryRun: true to preview what would be deleted
 * 2. Review the preview results carefully
 * 3. If safe, call again with dryRun: false to perform cleanup
 */

import { NextRequest, NextResponse } from 'next/server'
import { performCompleteCleanup } from '@/lib/cloudinary-cleanup'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('[Admin API] Cleanup request received')

  try {
    // SECURITY: Verify user is authenticated
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.warn('[Admin API] Unauthorized cleanup attempt')
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to access this endpoint'
        },
        { status: 401 }
      )
    }

    console.log(`[Admin API] Authenticated user: ${user.id}`)

    // Parse request body
    const body = await request.json()
    const { dryRun = true } = body

    console.log(`[Admin API] Mode: ${dryRun ? 'DRY RUN (preview)' : 'ACTUAL CLEANUP'}`)

    // Perform cleanup (or preview)
    const results = await performCompleteCleanup(dryRun)

    const duration = Date.now() - startTime
    console.log(`[Admin API] Cleanup completed in ${duration}ms`)

    // Build response
    if (dryRun) {
      // PREVIEW MODE - Show what would be deleted
      return NextResponse.json({
        mode: 'preview',
        message: 'Preview mode - no images deleted',
        summary: {
          orphansFound: results.orphansFound,
          estimatedCloudinaryDeletions: results.orphansFound,
          estimatedDatabaseRecordDeletions: results.orphansFound
        },
        orphans: results.orphans.map(o => ({
          cloudinaryId: o.cloudinaryId,
          imageUrl: o.imageUrl,
          reason: o.reason,
          deletedAt: o.deletedAt
        })),
        warning: 'Review these images carefully before running actual cleanup',
        nextSteps: [
          'Review the orphaned images list above',
          'Verify these images are safe to delete',
          'Run again with { dryRun: false } to perform actual cleanup'
        ],
        duration: `${duration}ms`
      })
    } else {
      // ACTUAL CLEANUP - Report results
      return NextResponse.json({
        mode: 'cleanup',
        message: 'Cleanup completed successfully',
        summary: {
          orphansFound: results.orphansFound,
          cloudinaryDeleted: results.cloudinaryDeleted,
          cloudinaryFailed: results.cloudinaryFailed,
          databaseRecordsDeleted: results.databaseRecordsDeleted
        },
        errors: results.errors.length > 0 ? results.errors : undefined,
        successRate: results.orphansFound > 0
          ? `${Math.round((results.cloudinaryDeleted / results.orphansFound) * 100)}%`
          : '100%',
        duration: `${duration}ms`
      })
    }

  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[Admin API] Cleanup error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        error: 'Cleanup failed',
        message: errorMessage,
        duration: `${duration}ms`
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint - Show API documentation
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/admin/cleanup-orphaned-images',
    description: 'Cleanup orphaned Cloudinary images that have no database references',
    authentication: 'Required - must be logged in',
    methods: {
      POST: {
        description: 'Perform cleanup (or preview)',
        body: {
          dryRun: {
            type: 'boolean',
            default: true,
            description: 'Preview mode (true) or actual cleanup (false)'
          }
        },
        examples: {
          preview: {
            method: 'POST',
            body: { dryRun: true },
            description: 'Preview what would be deleted (safe)'
          },
          cleanup: {
            method: 'POST',
            body: { dryRun: false },
            description: 'Actually delete orphaned images (requires explicit opt-in)'
          }
        }
      },
      GET: {
        description: 'Show this documentation'
      }
    },
    workflow: [
      '1. Call POST with { dryRun: true } to preview',
      '2. Review the orphaned images carefully',
      '3. If safe, call POST with { dryRun: false } to cleanup'
    ],
    safety: [
      'Only deletes images with NO database references',
      'Dry-run mode by default',
      'Comprehensive logging for audit trail',
      'Requires authentication'
    ]
  })
}
