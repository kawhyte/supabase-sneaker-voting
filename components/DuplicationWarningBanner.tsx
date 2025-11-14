/**
 * Smart Duplication Warning Banner
 *
 * Shows inline warning when adding an item similar to ones already owned
 * Displays similarity scores and match details
 * Non-blocking - user can still submit the form
 */

'use client';

import { AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SmartDuplicationWarning } from '@/lib/smart-duplicate-detector';
import { Card, CardContent } from '@/components/ui/card';

interface DuplicationWarningBannerProps {
  warning: SmartDuplicationWarning;
  onDismiss?: () => void;
  userId?: string;
  newItemName?: string;
}

export function DuplicationWarningBanner({
  warning,
  onDismiss,
  userId,
  newItemName,
}: DuplicationWarningBannerProps) {
  const severityColors = {
    exact: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-700',
      label: 'Exact Duplicate',
    },
    similar: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      text: 'text-amber-700',
      label: 'Similar Item',
    },
  };

  const colors = severityColors[warning.severity];

  // Show top 2 matches
  const displayMatches = warning.matches.slice(0, 2);
  const remainingCount = warning.totalMatches - displayMatches.length;

  const handleDismiss = async () => {
    // If exact duplicate, create follow-up notification
    if (warning.severity === 'exact' && userId && newItemName) {
      try {
        const { triggerDuplicationFollowUp } = await import('@/lib/notification-server-actions');

        await triggerDuplicationFollowUp(userId, {
          item_name: newItemName,
          similar_items: warning.matches.map((match) => ({
            brand: match.item.brand,
            model: match.item.model,
          })),
          severity: 'high',
        });
      } catch (error) {
        console.error('Error creating duplication follow-up notification:', error);
      }
    }

    onDismiss?.();
  };

  return (
    <Card className={`${colors.bg} border-2 ${colors.border} ${colors.text}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex gap-3">
          {/* Icon */}
          <AlertTriangle className={`h-5 w-5 ${colors.icon} flex-shrink-0 mt-0.5`} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">
                  {colors.label}: {warning.message}
                </h3>
                <p className="text-sm opacity-90 mb-3">{warning.recommendation}</p>

                {/* Similar items list - show top 2 */}
                {displayMatches.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                    <p className="text-xs font-medium mb-2 opacity-75">
                      {warning.severity === 'exact' ? 'Nearly identical items you own:' : 'Similar items you own:'}
                    </p>
                    <ul className="space-y-2 text-xs">
                      {displayMatches.map((match) => (
                        <li key={match.item.id} className="opacity-90 flex items-start gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="font-semibold">{match.item.brand}</span>
                            <span>{match.item.model}</span>
                            <span className="opacity-60">({match.item.color})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold px-2 py-0.5 rounded bg-current bg-opacity-10">
                              {match.similarityScore}% match
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Show "and X more" if there are additional matches */}
                    {remainingCount > 0 && (
                      <p className="text-xs font-medium opacity-75 mt-2">
                        and {remainingCount} more similar {remainingCount === 1 ? 'item' : 'items'}
                      </p>
                    )}
                  </div>
                )}

                {/* Show highest match score if not already shown */}
                {displayMatches.length === 0 && warning.matches.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-current bg-opacity-10">
                      {warning.matches[0].similarityScore}% match
                    </span>
                  </div>
                )}
              </div>

              {/* Dismiss button */}
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0 flex-shrink-0 hover:bg-current hover:bg-opacity-20"
                  aria-label="Dismiss warning"
                >
                  <XCircle className={`h-4 w-4 ${colors.icon}`} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
