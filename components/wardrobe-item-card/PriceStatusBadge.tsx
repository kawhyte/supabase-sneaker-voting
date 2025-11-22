/**
 * PriceStatusBadge - Compact price tracking status indicator
 *
 * Displays a color-coded badge showing price check status:
 * - Green (CheckCircle2): Price is fresh (checked within 7 days)
 * - Yellow (AlertCircle): Price needs checking (7-14 days old or never checked)
 * - Red (XCircle): Tracking disabled or price very stale (14+ days)
 */

'use client';

import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
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
        Icon: XCircle,
        text: 'Tracking disabled',
        color: 'text-red-700',
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        tooltip: 'Price tracking has been disabled due to repeated check failures.',
      };
    }
    if (!lastPriceCheckAt) {
      return {
        Icon: AlertCircle,
        text: 'Price not checked',
        color: 'text-amber-700',
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        tooltip: 'Price has never been checked. Click "View Details" to check now.',
      };
    }
    if (isStale) {
      return {
        Icon: AlertCircle,
        text: `Checked ${daysSince}d ago`,
        color: 'text-amber-700',
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        tooltip: `Price data is ${daysSince} days old. Click "View Details" to refresh.`,
      };
    }
    // Fresh price
    return {
      Icon: CheckCircle2,
      text: `Checked ${daysSince === 0 ? 'today' : daysSince === 1 ? 'yesterday' : `${daysSince}d ago`}`,
      color: 'text-meadow-700',
      iconColor: 'text-meadow-600',
      bgColor: 'bg-meadow-50',
      borderColor: 'border-meadow-200',
      tooltip: `Price is up to date. Last checked ${daysSince === 0 ? 'today' : daysSince === 1 ? 'yesterday' : `${daysSince} days ago`}.`,
    };
  };

  const statusInfo = getStatusInfo();
  const { Icon } = statusInfo;

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <div
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${statusInfo.bgColor} ${statusInfo.borderColor} border cursor-help transition-colors hover:opacity-80`}
        >
          <Icon className={`h-3.5 w-3.5 ${statusInfo.iconColor}`} />
          <span className={statusInfo.color}>{statusInfo.text}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs">{statusInfo.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
