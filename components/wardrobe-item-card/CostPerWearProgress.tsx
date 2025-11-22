/**
 * CostPerWearProgress - Visual progress indicator for cost per wear tracking
 *
 * Displays:
 * - Linear progress bar showing journey to "worth it" status
 * - Current CPW → Target CPW breakdown
 * - Milestone celebrations at 25%, 50%, 75%, 100%
 * - Smart thresholds based on item price and category
 * - Responsive design: compact mobile, detailed desktop
 *
 * Only visible for owned items in Collection view
 */

"use client";

import { WardrobeItem } from '@/components/types/WardrobeItem';
import { calculateWorthItMetrics } from "@/lib/wardrobe-item-utils";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { DollarSign, Sparkles } from 'lucide-react';

interface CostPerWearProgressProps {
	item: WardrobeItem;
}

export function CostPerWearProgress({ item }: CostPerWearProgressProps) {
	const metrics = calculateWorthItMetrics(item);

	// Don't render if not applicable
	if (!metrics.currentCPW && !item.wears && !metrics.milestoneMessage) {
		return null;
	}

	const isWorthIt = metrics.isWorthIt;
	// Ensure progressPercentage is always a valid number (defensive coding)
	const progressPercentage = Number.isFinite(metrics.progress) ? metrics.progress : 0;
	const currentCPW = metrics.currentCPW;
	const targetCPW = metrics.targetCPW;

	// Determine progress bar color - returns hex color for inline styles (more reliable than dynamic classes)
	// Fixed: Use higher contrast colors that are visible against stone-300 background
	const getProgressColor = (): string => {
		if (isWorthIt) return '#62a663'; // meadow-500 - Deep green for achieved
		if (progressPercentage >= 75) return '#81b682'; // meadow-400 - Light green nearing goal
		if (progressPercentage >= 50) return '#FFC700'; // sun-400 - Bright yellow at midpoint
		if (progressPercentage >= 25) return '#FFD966'; // Brighter yellow for visibility
		return '#FFC700'; // sun-400 - Bright yellow for early progress (high contrast)
	};

	const tooltipContent = (
		<div className='space-y-2 text-xs'>
			<div className='font-semibold text-white'>
				Cost Per Wear Breakdown
			</div>
			<div className='space-y-1 text-white/90'>
				<div>Purchase Price: ${item.purchase_price?.toFixed(2)}</div>
				<div>Times Worn: {item.wears && item.wears > 0 ? item.wears : 0}</div>
				<div>Target Wears: {metrics.targetWears}</div>
				{currentCPW && (
					<div className='border-t border-white/20 pt-1 mt-1'>
						<div>Current: ${currentCPW.toFixed(2)}/wear</div>
						<div>Target: ${targetCPW.toFixed(2)}/wear</div>
						<div className='text-white/70 mt-1'>
							${item.purchase_price?.toFixed(2)} ÷ {item.wears && item.wears > 0 ? item.wears : 0} wears
						</div>
					</div>
				)}
			</div>
		</div>
	);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className='space-y-2.5 px-3 py-3 rounded-lg border border-stone-300 bg-stone-50'>
					{/* Header */}
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<DollarSign className='h-4 w-4 text-slate-900' />
							<span className='text-sm font-semibold text-slate-900'>
								Cost Per Wear
							</span>
						</div>
						{isWorthIt && (
							<span className='text-xs font-bold px-2 py-1 rounded-full bg-meadow-500 text-white flex items-center gap-1'>
								<Sparkles className='h-3 w-3' /> Worth It!
							</span>
						)}
					</div>

					{/* Current vs Target CPW */}
					<div className='text-xs sm:text-sm flex items-center justify-between gap-2'>
						<span className='text-muted-foreground'>
							{currentCPW ? (
								<>
									<span className='font-semibold text-slate-900'>
										${currentCPW.toFixed(2)}/wear
									</span>
									{' → '}
									<span className='font-medium text-slate-700'>
										Target: ${targetCPW.toFixed(2)}/wear
									</span>
								</>
							) : (
								<span className='text-slate-600'>
									Target: ${targetCPW.toFixed(2)}/wear
								</span>
							)}
						</span>
						<span className='text-xs font-medium text-slate-600 whitespace-nowrap'>
							{progressPercentage.toFixed(0)}%
						</span>
					</div>

					{/* Progress Bar */}
					<div className='w-full bg-stone-200 rounded-full h-2.5 overflow-hidden border border-stone-300'>
						<div
							className='h-full rounded-full transition-all duration-500 ease-out'
							style={{
								width: `${Math.min(Math.max(progressPercentage, 0), 100)}%`,
								backgroundColor: getProgressColor()
							}}
							role='progressbar'
							aria-valuenow={Math.round(progressPercentage)}
							aria-valuemin={0}
							aria-valuemax={100}
						/>
					</div>

					{/* Milestone Message */}
					<div className='text-xs text-slate-700 font-medium'>
						{isWorthIt ? (
							<span className='text-meadow-700 font-semibold'>
								{metrics.milestoneMessage}
							</span>
						) : metrics.wearsRemaining > 0 ? (
							<span>
								{metrics.milestoneMessage} Wear{' '}
								{metrics.wearsRemaining === 1 ? 'one' : metrics.wearsRemaining}{' '}
								more time{metrics.wearsRemaining !== 1 ? 's' : ''}!
							</span>
						) : (
							<span>{metrics.milestoneMessage}</span>
						)}
					</div>

					{/* Hidden accessibility label for screen readers */}
					<span className='sr-only'>
						Cost per wear progress: {progressPercentage.toFixed(0)}% complete.
						{currentCPW && (
							<>
								Current cost per wear is ${currentCPW.toFixed(2)}, target is $
								{targetCPW.toFixed(2)}.
							</>
						)}
						{metrics.milestoneMessage && <> {metrics.milestoneMessage}</>}
					</span>
				</div>
			</TooltipTrigger>
			<TooltipContent side='top' className='z-[9999]'>
				{tooltipContent}
			</TooltipContent>
		</Tooltip>
	);
}
