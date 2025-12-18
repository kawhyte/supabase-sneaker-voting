import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import * as cron from 'node-cron'

// Service role client for cron jobs (bypasses RLS)
const supabaseAdmin = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

interface PriceData {
  price?: number
  originalPrice?: number
  inStock: boolean
  storeName: string
  success: boolean
  error?: string
}

let isMonitoringActive = false
let scheduledTasks: cron.ScheduledTask[] = []

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'start') {
      return await startPriceMonitoring()
    } else if (action === 'stop') {
      return await stopPriceMonitoring()
    } else if (action === 'check-now') {
      return await checkAllPricesNow()
    } else if (action === 'status') {
      return NextResponse.json({
        success: true,
        isActive: isMonitoringActive,
        activeTasks: scheduledTasks.length
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use: start, stop, check-now, or status' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Price monitoring error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to manage price monitoring' },
      { status: 500 }
    )
  }
}

async function startPriceMonitoring() {
  if (isMonitoringActive) {
    return NextResponse.json({
      success: true,
      message: 'Price monitoring is already active'
    })
  }

  try {
    // Schedule price checks every hour
    const hourlyTask = cron.schedule('0 * * * *', async () => {
      console.log('Running hourly price check:', new Date().toISOString())
      await checkAllPricesNow()
    })

    // Schedule daily summary at 9 AM
    const dailyTask = cron.schedule('0 9 * * *', async () => {
      console.log('Running daily price summary:', new Date().toISOString())
      await generateDailySummary()
    })

    // Start the scheduled tasks
    hourlyTask.start()
    dailyTask.start()

    scheduledTasks = [hourlyTask, dailyTask]
    isMonitoringActive = true

    return NextResponse.json({
      success: true,
      message: 'Price monitoring started successfully',
      schedule: {
        priceChecks: 'Every hour',
        dailySummary: 'Daily at 9 AM'
      }
    })
  } catch (error) {
    console.error('Failed to start price monitoring:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to start price monitoring' },
      { status: 500 }
    )
  }
}

async function stopPriceMonitoring() {
  if (!isMonitoringActive) {
    return NextResponse.json({
      success: true,
      message: 'Price monitoring is already stopped'
    })
  }

  try {
    // Stop all scheduled tasks
    scheduledTasks.forEach(task => {
      task.stop()
      task.destroy()
    })

    scheduledTasks = []
    isMonitoringActive = false

    return NextResponse.json({
      success: true,
      message: 'Price monitoring stopped successfully'
    })
  } catch (error) {
    console.error('Failed to stop price monitoring:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to stop price monitoring' },
      { status: 500 }
    )
  }
}

async function checkAllPricesNow() {
  try {
    // Get all active price monitors (using service role to bypass RLS)
    const { data: monitors, error: monitorsError } = await supabaseAdmin
      .from('price_monitors')
      .select('*')
      .eq('is_active', true)

    if (monitorsError) {
      throw new Error(`Failed to fetch monitors: ${monitorsError.message}`)
    }

    if (!monitors || monitors.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active price monitors found',
        checked: 0
      })
    }

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const monitor of monitors) {
      try {
        // Call our price scraping API
        const priceResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/scrape-price`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: monitor.product_url })
          }
        )

        const priceData: PriceData = await priceResponse.json()

        if (priceData.success && priceData.price) {
          // Save price history (using service role)
          const { error: historyError } = await supabaseAdmin
            .from('price_history')
            .insert({
              monitor_id: monitor.id,
              price: priceData.price,
              in_stock: priceData.inStock,
              checked_at: new Date().toISOString()
            })

          if (historyError) {
            console.error(`Failed to save price history for ${monitor.id}:`, historyError)
          }

          // Update monitor with latest info
          const updateData: any = {
            last_checked_at: new Date().toISOString(),
            last_price: priceData.price
          }

          // Check for price drops
          if (monitor.target_price && priceData.price <= monitor.target_price) {
            updateData.notification_sent = false // Reset to send new notification
          }

          const { error: updateError } = await supabaseAdmin
            .from('price_monitors')
            .update(updateData)
            .eq('id', monitor.id)

          if (updateError) {
            console.error(`Failed to update monitor ${monitor.id}:`, updateError)
          }

          results.push({
            monitor_id: monitor.id,
            product_url: monitor.product_url,
            current_price: priceData.price,
            in_stock: priceData.inStock,
            target_price: monitor.target_price,
            price_alert: monitor.target_price && priceData.price <= monitor.target_price
          })

          successCount++
        } else {
          console.error(`Price check failed for ${monitor.product_url}:`, priceData.error)
          errorCount++

          results.push({
            monitor_id: monitor.id,
            product_url: monitor.product_url,
            error: priceData.error || 'Failed to get price'
          })
        }
      } catch (error) {
        console.error(`Error checking price for ${monitor.product_url}:`, error)
        errorCount++

        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.push({
          monitor_id: monitor.id,
          product_url: monitor.product_url,
          error: errorMessage
        })
      }

      // Add delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    return NextResponse.json({
      success: true,
      message: `Price check completed: ${successCount} successful, ${errorCount} errors`,
      checked: monitors.length,
      results
    })

  } catch (error) {
    console.error('Failed to check prices:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check prices' },
      { status: 500 }
    )
  }
}

async function generateDailySummary() {
  try {
    // Get price changes from the last 24 hours
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const { data: recentHistory, error } = await supabaseAdmin
      .from('price_history')
      .select(`
        *,
        price_monitors!inner (
          user_id,
          store_name,
          product_url,
          target_price
        )
      `)
      .gte('checked_at', twentyFourHoursAgo.toISOString())
      .order('checked_at', { ascending: false })

    if (error) {
      console.error('Failed to get daily summary:', error)
      return
    }

    console.log(`Daily Summary (${new Date().toDateString()}):`)
    console.log(`- Total price checks: ${recentHistory?.length || 0}`)

    if (recentHistory && recentHistory.length > 0) {
      const priceDrops = recentHistory.filter(h =>
        h.price_monitors?.target_price && h.price <= h.price_monitors.target_price
      )
      console.log(`- Price drops detected: ${priceDrops.length}`)

      priceDrops.forEach(drop => {
        console.log(`  * ${drop.price_monitors?.store_name}: $${drop.price} (target: $${drop.price_monitors?.target_price})`)
      })
    }

  } catch (error) {
    console.error('Failed to generate daily summary:', error)
  }
}