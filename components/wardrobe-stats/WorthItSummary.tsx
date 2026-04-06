/**
 * WorthItSummary - Dashboard analytics for cost per wear tracking
 *
 * Displays portfolio-wide insights:
 * - Total owned items and "worth it" count/percentage
 * - Best value item (lowest cost per wear)
 * - Items close to "worth it" status
 * - Items needing attention (highest cost per wear)
 *
 * Helps users make smart purchasing decisions and motivates wearing items
 */

"use client";

import { WardrobeItem } from '@/components/types/WardrobeItem';
import { calculateWorthItMetrics } from "@/lib/wardrobe-item-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingDown, AlertCircle, Trophy, TrendingUp } from "lucide-react";

interface WorthItSummaryProps {
	items: WardrobeItem[];
}

export function WorthItSummary({ items }: WorthItSummaryProps) {
	// Filter only owned items
	const ownedItems = items.filter((item) => item.status === "owned");

	if (ownedItems.length === 0) {
		return null;
	}

	// Calculate metrics for all owned items
	const itemMetrics = ownedItems.map((item) => ({
		item,
		metrics: calculateWorthItMetrics(item),
	}));

	// Calculate statistics
	const worthItItems = itemMetrics.filter((m) => m.metrics.isWorthIt);
	const almostWorthIt = itemMetrics.filter(
		(m) =>
			!m.metrics.isWorthIt &&
			m.metrics.progress >= 80 &&
			m.metrics.progress < 100
	);

	// Find best value (lowest current CPW)
	const itemsWithCPW = itemMetrics.filter(
		(m) => m.metrics.currentCPW !== null && m.metrics.currentCPW > 0
	);
	const bestValue =
		itemsWithCPW.length > 0
			? itemsWithCPW.reduce((prev, current) =>
					(prev.metrics.currentCPW ?? Infinity) <
					(current.metrics.currentCPW ?? Infinity)
						? prev
						: current
			  )
			: null;

	// Find highest CPW (needs attention)
	const highestCPW =
		itemsWithCPW.length > 0
			? itemsWithCPW.reduce((prev, current) =>
					(prev.metrics.currentCPW ?? 0) >
					(current.metrics.currentCPW ?? 0)
						? prev
						: current
			  )
			: null;

	const worthItPercentage =
		ownedItems.length > 0
			? Math.round((worthItItems.length / ownedItems.length) * 100)
			: 0;

	return (
		<Card className='border-slate-300 bg-gradient-to-br from-slate-50 to-white'>
			<CardHeader className='pb-4'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Sparkles className='h-5 w-5 text-primary' />
						<CardTitle className='text-lg font-heading'>
							Value Tracker
						</CardTitle>
					</div>
					<Badge className='bg-primary text-primary border-primary'>
						Portfolio Analytics
					</Badge>
				</div>
			</CardHeader>

			<CardContent className='space-y-4'>
				{/* Overall Stats */}
				<div className='grid grid-cols-2 gap-3 sm:grid-cols-3 mb-4'>
					<div className='p-3 rounded-lg bg-white border border-slate-300'>
						<div className='text-xs text-muted-foreground mb-1'>
							Owned Items
						</div>
						<div className='text-2xl font-bold text-slate-900'>
							{ownedItems.length}
						</div>
					</div>

					<div className='p-3 rounded-lg bg-emerald-500 border border-emerald-500'>
						<div className='text-xs text-emerald-500 font-semibold mb-1'>
							Worth It
						</div>
						<div className='text-2xl font-bold text-emerald-500'>
							{worthItItems.length}
							<span className='text-xs text-emerald-500 ml-1'>
								({worthItPercentage}%)
							</span>
						</div>
					</div>

					<div className='p-3 rounded-lg bg-primary border border-primary'>
						<div className='text-xs text-primary font-semibold mb-1'>
							Almost There
						</div>
						<div className='text-2xl font-bold text-primary'>
							{almostWorthIt.length}
						</div>
					</div>
				</div>

				{/* Best Value Item */}
				{bestValue && bestValue.metrics.currentCPW !== null && (
					<div className='p-4 rounded-lg bg-emerald-500 border border-emerald-500'>
						<div className='flex items-start justify-between mb-2'>
							<div className='flex items-center gap-2'>
								<Trophy className='h-4 w-4 text-emerald-500' />
								<span className='text-sm font-semibold text-emerald-500'>
									Best Value
								</span>
							</div>
						</div>
						<div className='text-sm font-medium text-emerald-500 truncate'>
							{bestValue.item.brand} {bestValue.item.model}
						</div>
						<div className='text-xs text-emerald-500 mt-1'>
							${bestValue.metrics.currentCPW?.toFixed(2)}/wear (worn{" "}
							{bestValue.item.wears || 0} times)
						</div>
					</div>
				)}

				{/* Almost Worth It Items */}
				{almostWorthIt.length > 0 && (
					<div className='p-4 rounded-lg bg-primary border border-primary'>
						<div className='flex items-start justify-between mb-2'>
							<div className='flex items-center gap-2'>
								<TrendingUp className='h-4 w-4 text-primary' />
								<span className='text-sm font-semibold text-primary'>
									Almost Worth It
								</span>
							</div>
						</div>
						<div className='space-y-1.5'>
							{almostWorthIt.slice(0, 2).map((m) => (
								<div key={m.item.id} className='text-xs'>
									<div className='font-medium text-primary truncate'>
										{m.item.brand} {m.item.model}
									</div>
									<div className='text-primary'>
										Wear {m.metrics.wearsRemaining}{" "}
										{m.metrics.wearsRemaining === 1 ? "time" : "times"} more!
									</div>
								</div>
							))}
							{almostWorthIt.length > 2 && (
								<div className='text-xs text-primary font-medium pt-1 border-t border-primary'>
									+{almostWorthIt.length - 2} more items
								</div>
							)}
						</div>
					</div>
				)}

				{/* Highest Cost Per Wear */}
				{highestCPW &&
					highestCPW.metrics.currentCPW !== null &&
					highestCPW.metrics.currentCPW > 0 && (
						<div className='p-4 rounded-lg bg-destructive/10 border border-destructive'>
							<div className='flex items-start justify-between mb-2'>
								<div className='flex items-center gap-2'>
									<AlertCircle className='h-4 w-4 text-destructive' />
									<span className='text-sm font-semibold text-destructive'>
										Needs Attention
									</span>
								</div>
							</div>
							<div className='text-sm font-medium text-destructive truncate'>
								{highestCPW.item.brand} {highestCPW.item.model}
							</div>
							<div className='text-xs text-destructive mt-1'>
								${highestCPW.metrics.currentCPW?.toFixed(2)}/wear (worn{" "}
								{highestCPW.item.wears || 0} times)
							</div>
						</div>
					)}

				{/* Empty State */}
				{itemsWithCPW.length === 0 && (
					<div className='p-4 rounded-lg bg-slate-100 border border-slate-300 text-center'>
						<p className='text-sm text-muted-foreground'>
							Start tracking wears to see cost per wear analytics
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
