/**
 * PriceStatusBadge - Compact price tracking status indicator
 *
 * Displays a color-coded badge showing price check status:
 * - 🟢 Green: Price is fresh (checked within 7 days)
 * - 🟡 Yellow: Price needs checking (7-14 days old or never checked)
 * - 🔴 Red: Tracking disabled or price very stale (14+ days)
 */

'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { isPriceStale, getDaysSincePriceCheck } from '@/lib/price-tracking-utils';

interface PriceStatusBadgeProps {
  lastPriceCheckAt: string | null;
  isAutoTrackingEnabled?: boolean;
  priceCheckFailures?: number;
}

export function PriceStatusBadge({
  lastPriceCheckAt,
  isAutoTrackingEnabled = true,
  priceCheckFailures = 0,
}: PriceStatusBadgeProps) {
  // Don't render anything if tracking is working fine and price is fresh
  const daysSince = getDaysSincePriceCheck(lastPriceCheckAt);
  const isStale = isPriceStale(lastPriceCheckAt);

  // Determine status
  const getStatusInfo = () => {
    if (!isAutoTrackingEnabled) {
      return {
        icon: '🔴',
        text: 'Tracking disabled',
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        tooltip: 'Price tracking has been disabled due to repeated check failures.',
      };
    }
    if (!lastPriceCheckAt) {
      return {
        icon: '🟡',
        text: 'Price not checked',
        color: 'text-amber-700',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        tooltip: 'Price has never been checked. Click "View Details" to check now.',
      };
    }
    if (isStale) {
      return {
        icon: '🟡',
        text: `Checked ${daysSince}d ago`,
        color: 'text-amber-700',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        tooltip: `Price data is ${daysSince} days old. Click "View Details" to refresh.`,
      };
    }
    // Fresh price
    return {
      icon: '🟢',
      text: `Checked ${daysSince === 0 ? 'today' : daysSince === 1 ? 'yesterday' : `${daysSince}d ago`}`,
      color: 'text-meadow-700',
      bgColor: 'bg-meadow-50',
      borderColor: 'border-meadow-200',
      tooltip: `Price is up to date. Last checked ${daysSince === 0 ? 'today' : daysSince === 1 ? 'yesterday' : `${daysSince} days ago`}.`,
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <div
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${statusInfo.bgColor} ${statusInfo.borderColor} border cursor-help transition-colors hover:opacity-80`}
        >
          <span className="text-sm">{statusInfo.icon}</span>
          <span className={statusInfo.color}>{statusInfo.text}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs">{statusInfo.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
