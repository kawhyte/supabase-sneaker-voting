import { migrateLegacyPalettes } from '@/app/actions/color-analysis'
import { NextResponse } from 'next/server'

/**
 * Temporary API endpoint to migrate legacy palettes
 * DELETE THIS FILE after migration is complete
 */
export async function POST() {
  try {
    const result = await migrateLegacyPalettes()

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: []
      },
      { status: 500 }
    )
  }
}
