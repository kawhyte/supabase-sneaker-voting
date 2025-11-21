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
		<Card className='border-stone-300 bg-gradient-to-br from-stone-50 to-white'>
			<CardHeader className='pb-4'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Sparkles className='h-5 w-5 text-sun-600' />
						<CardTitle className='text-lg font-heading'>
							Value Tracker
						</CardTitle>
					</div>
					<Badge className='bg-sun-100 text-sun-700 border-sun-300'>
						Portfolio Analytics
					</Badge>
				</div>
			</CardHeader>

			<CardContent className='space-y-4'>
				{/* Overall Stats */}
				<div className='grid grid-cols-2 gap-3 sm:grid-cols-3 mb-4'>
					<div className='p-3 rounded-lg bg-white border border-stone-300'>
						<div className='text-xs text-muted-foreground mb-1'>
							Owned Items
						</div>
						<div className='text-2xl font-bold text-slate-900'>
							{ownedItems.length}
						</div>
					</div>

					<div className='p-3 rounded-lg bg-meadow-50 border border-meadow-300'>
						<div className='text-xs text-meadow-700 font-semibold mb-1'>
							Worth It
						</div>
						<div className='text-2xl font-bold text-meadow-700'>
							{worthItItems.length}
							<span className='text-xs text-meadow-600 ml-1'>
								({worthItPercentage}%)
							</span>
						</div>
					</div>

					<div className='p-3 rounded-lg bg-sun-50 border border-sun-300'>
						<div className='text-xs text-sun-700 font-semibold mb-1'>
							Almost There
						</div>
						<div className='text-2xl font-bold text-sun-700'>
							{almostWorthIt.length}
						</div>
					</div>
				</div>

				{/* Best Value Item */}
				{bestValue && bestValue.metrics.currentCPW !== null && (
					<div className='p-4 rounded-lg bg-meadow-50 border border-meadow-300'>
						<div className='flex items-start justify-between mb-2'>
							<div className='flex items-center gap-2'>
								<Trophy className='h-4 w-4 text-meadow-700' />
								<span className='text-sm font-semibold text-meadow-900'>
									Best Value
								</span>
							</div>
						</div>
						<div className='text-sm font-medium text-meadow-900 truncate'>
							{bestValue.item.brand} {bestValue.item.model}
						</div>
						<div className='text-xs text-meadow-700 mt-1'>
							${bestValue.metrics.currentCPW?.toFixed(2)}/wear (worn{" "}
							{bestValue.item.wears || 0} times)
						</div>
					</div>
				)}

				{/* Almost Worth It Items */}
				{almostWorthIt.length > 0 && (
					<div className='p-4 rounded-lg bg-sun-50 border border-sun-300'>
						<div className='flex items-start justify-between mb-2'>
							<div className='flex items-center gap-2'>
								<TrendingUp className='h-4 w-4 text-sun-700' />
								<span className='text-sm font-semibold text-sun-900'>
									Almost Worth It
								</span>
							</div>
						</div>
						<div className='space-y-1.5'>
							{almostWorthIt.slice(0, 2).map((m) => (
								<div key={m.item.id} className='text-xs'>
									<div className='font-medium text-sun-900 truncate'>
										{m.item.brand} {m.item.model}
									</div>
									<div className='text-sun-700'>
										Wear {m.metrics.wearsRemaining}{" "}
										{m.metrics.wearsRemaining === 1 ? "time" : "times"} more!
									</div>
								</div>
							))}
							{almostWorthIt.length > 2 && (
								<div className='text-xs text-sun-600 font-medium pt-1 border-t border-sun-200'>
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
						<div className='p-4 rounded-lg bg-ember-50 border border-ember-300'>
							<div className='flex items-start justify-between mb-2'>
								<div className='flex items-center gap-2'>
									<AlertCircle className='h-4 w-4 text-ember-700' />
									<span className='text-sm font-semibold text-ember-900'>
										Needs Attention
									</span>
								</div>
							</div>
							<div className='text-sm font-medium text-ember-900 truncate'>
								{highestCPW.item.brand} {highestCPW.item.model}
							</div>
							<div className='text-xs text-ember-700 mt-1'>
								${highestCPW.metrics.currentCPW?.toFixed(2)}/wear (worn{" "}
								{highestCPW.item.wears || 0} times)
							</div>
						</div>
					)}

				{/* Empty State */}
				{itemsWithCPW.length === 0 && (
					<div className='p-4 rounded-lg bg-stone-100 border border-stone-300 text-center'>
						<p className='text-sm text-muted-foreground'>
							Start tracking wears to see cost per wear analytics
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
