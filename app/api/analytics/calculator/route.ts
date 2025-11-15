/**
 * Calculator Analytics API Route
 *
 * Anonymous tracking for cost per wear calculator usage
 * NO PII, NO user identification - purely aggregate metrics
 */

import { NextRequest, NextResponse } from 'next/server';

interface CalculatorAnalyticsPayload {
  category: string;
  priceRange: string; // Bucketed: <$50, $50-150, $150-300, $300+
  wearFrequency: string;
  verdict: string; // EXCELLENT, GOOD, CAUTION, SKIP
  timestamp: number;
}

function getPriceRange(price: number): string {
  if (price < 50) return '<$50';
  if (price < 150) return '$50-150';
  if (price < 300) return '$150-300';
  return '$300+';
}

export async function POST(request: NextRequest) {
  try {
    const data: CalculatorAnalyticsPayload = await request.json();

    // Validate payload
    if (!data.category || !data.priceRange || !data.wearFrequency || !data.verdict) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // For now, just log to console (in production, you'd send to analytics service)
    // Options: Google Analytics, Plausible, PostHog, or custom database
    console.log('[Calculator Analytics]', {
      category: data.category,
      priceRange: data.priceRange,
      wearFrequency: data.wearFrequency,
      verdict: data.verdict,
      timestamp: new Date(data.timestamp).toISOString(),
    });

    // TODO: Implement actual analytics storage
    // Examples:
    // - Send to Google Analytics via Measurement Protocol
    // - Store in Supabase analytics table (aggregated only, no PII)
    // - Send to third-party analytics service (Plausible, PostHog, etc.)

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Calculator Analytics Error]', error);
    return NextResponse.json({ error: 'Failed to track analytics' }, { status: 500 });
  }
}
