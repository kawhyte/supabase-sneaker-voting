/**
 * Duplication Warning Banner
 *
 * Shows inline warning when adding an item similar to ones already owned
 * Helps users avoid buying duplicates
 */

'use client';

import { AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DuplicationWarning } from '@/lib/wardrobe-duplication-detector';
import { Card, CardContent } from '@/components/ui/card';

interface DuplicationWarningBannerProps {
  warning: DuplicationWarning;
  onDismiss?: () => void;
}

export function DuplicationWarningBanner({
  warning,
  onDismiss,
}: DuplicationWarningBannerProps) {
  const severityColors = {
    low: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-700',
      label: 'Info',
    },
    medium: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      text: 'text-amber-700',
      label: 'Warning',
    },
    high: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-700',
      label: 'Alert',
    },
  };

  const colors = severityColors[warning.severity];

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
                <h3 className="font-semibold text-sm mb-1">{colors.label}: {warning.message}</h3>
                <p className="text-sm opacity-90 mb-3">{warning.recommendation}</p>

                {/* Similar items list */}
                {warning.similarItems.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                    <p className="text-xs font-medium mb-2 opacity-75">
                      Similar items you own:
                    </p>
                    <ul className="space-y-1 text-xs">
                      {warning.similarItems.map((item) => (
                        <li key={item.id} className="opacity-80 flex items-start gap-2">
                          <span className="font-medium">{item.brand}</span>
                          <span>{item.model}</span>
                          <span className="opacity-60">({item.color})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Dismiss button */}
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
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
