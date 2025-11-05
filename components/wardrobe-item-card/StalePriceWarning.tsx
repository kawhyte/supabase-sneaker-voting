/**
 * Stale Price Warning
 *
 * Displays warning when price data is older than 14 days
 * Offers manual refresh option
 */

'use client';

import { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { isPriceStale, getDaysSincePriceCheck } from '@/lib/price-tracking-utils';
import { toast } from 'sonner';

interface StalePriceWarningProps {
  itemId: string;
  itemName: string;
  lastPriceCheckAt: string | null;
  onRefreshPrice?: (itemId: string) => Promise<void>;
  isAutoTrackingEnabled?: boolean;
  priceCheckFailures?: number;
}

export function StalePriceWarning({
  itemId,
  itemName,
  lastPriceCheckAt,
  onRefreshPrice,
  isAutoTrackingEnabled = true,
  priceCheckFailures = 0,
}: StalePriceWarningProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Don't show if tracking is disabled
  if (!isAutoTrackingEnabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-red-50 border border-red-200 rounded-md w-fit">
            <AlertCircle className="h-3.5 w-3.5 text-red-600" />
            <span className="text-xs font-medium text-red-700">Tracking disabled</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>Price tracking for this item has been disabled due to repeated check failures.</p>
          <p className="text-xs opacity-90 mt-1">Check the product URL and try refreshing manually.</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Don't show if price is fresh
  if (!isPriceStale(lastPriceCheckAt)) {
    return null;
  }

  const daysSince = getDaysSincePriceCheck(lastPriceCheckAt);

  const handleRefresh = async () => {
    if (!onRefreshPrice) {
      toast.info('Manual refresh coming soon');
      return;
    }

    try {
      setIsRefreshing(true);
      await onRefreshPrice(itemId);
      toast.success('Price updated');
    } catch (error) {
      console.error('Failed to refresh price:', error);
      toast.error('Failed to refresh price');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Display message based on whether we can calculate days
  const displayText = daysSince !== null
    ? `⚠️ ${daysSince} ${daysSince === 1 ? 'day' : 'days'} old`
    : '⚠️ Price not checked';

  const tooltipText = daysSince !== null
    ? `Price data is ${daysSince} days old and may not reflect current prices.`
    : 'Price has never been checked. Product may have been recently added.';

  return (
    <div className="space-y-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-md w-fit">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">
              {displayText}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{tooltipText}</p>
          <p className="text-xs opacity-90 mt-1">
            Prices are checked automatically every Sunday, or you can refresh manually.
          </p>
        </TooltipContent>
      </Tooltip>

      {onRefreshPrice && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-7 text-xs gap-1.5"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Checking...' : 'Check now'}
        </Button>
      )}
    </div>
  );
}
