/**
 * Cooling-Off Badge
 *
 * Displays cooling-off period progress for wishlist items
 * Shows countdown and lock status
 */

'use client';

import { Clock, Lock } from 'lucide-react';
import {
  canPurchaseNow,
  formatTimeRemaining,
  getCoolingOffProgress,
} from '@/lib/cooling-off-period';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CoolingOffBadgeProps {
  createdAt: string;
  canPurchaseAfter: string | null;
  coolingOffDays?: number;
}

export function CoolingOffBadge({
  createdAt,
  canPurchaseAfter,
  coolingOffDays = 7,
}: CoolingOffBadgeProps) {
  // Don't show if no cooling-off period
  if (!canPurchaseAfter) {
    return null;
  }

  const canBuyNow = canPurchaseNow(canPurchaseAfter);
  const timeRemaining = formatTimeRemaining(canPurchaseAfter);
  const progress = getCoolingOffProgress(createdAt, canPurchaseAfter);

  if (canBuyNow) {
    // Ready to purchase - show success state
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 border border-green-200 rounded-md">
            <Clock className="h-3.5 w-3.5 text-green-600" />
            <span className="text-xs font-medium text-green-700">Ready to buy</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>The cooling-off period is complete. You can purchase this item whenever you're ready.</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Cooling-off in progress
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="space-y-2 w-full">
          {/* Status badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-md w-fit">
            <Lock className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">{timeRemaining}</span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-muted-foreground">{progress}% of cooling-off complete</p>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="mb-2">
          This item is in a {coolingOffDays}-day cooling-off period to help you make intentional
          purchases.
        </p>
        <p className="text-xs opacity-90">{timeRemaining}. After this period, you can purchase it.</p>
      </TooltipContent>
    </Tooltip>
  );
}
