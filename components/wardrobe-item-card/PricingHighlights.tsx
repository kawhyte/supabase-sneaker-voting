"use client";

import { Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PriceCheckLogRow {
  id: string;
  item_id: string;
  price: number | null;
  checked_at: string;
  retailer: string | null;
  source: string;
  success: boolean;
}

interface PricingHighlightsProps {
  priceHistory: PriceCheckLogRow[];
  currentPrice: number | null;
  targetPrice: number | null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PricingHighlights({
  priceHistory,
  currentPrice,
  targetPrice,
}: PricingHighlightsProps) {
  const validRecords = priceHistory.filter((r) => r.price !== null);
  if (currentPrice === null && validRecords.length === 0) return null;

  const lowestRecord = validRecords.length > 0
    ? validRecords.reduce((min, r) => r.price! < min.price! ? r : min)
    : null;

  const isTargetReached =
    currentPrice !== null && targetPrice !== null && currentPrice <= targetPrice;

  const isAllTimeLow =
    currentPrice !== null &&
    lowestRecord !== null &&
    currentPrice <= lowestRecord.price!;

  return (
    <div className="flex flex-col gap-3">
      {/* 2-column price grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Current Market */}
        <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Current Market
          </span>
          {currentPrice !== null ? (
            <>
              <span className="text-xl font-bold text-foreground">
                ${currentPrice.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">
                Latest check
              </span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>

        {/* All-Time Low */}
        <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            All-Time Low
          </span>
          {lowestRecord !== null ? (
            <>
              <span className="text-xl font-bold text-foreground">
                ${lowestRecord.price!.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(lowestRecord.checked_at)}
              </span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
      </div>

      {/* Status badges */}
      {isTargetReached && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 border-green-200 bg-green-50 text-green-700"
          >
            <Target className="h-3 w-3" />
            Target Reached
          </Badge>
        </div>
      )}
    </div>
  );
}
