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

import { SizingJournalEntry } from "@/components/types/sizing-journal-entry";
import { calculateWorthItMetrics } from "@/lib/wardrobe-item-utils";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface CostPerWearProgressProps {
	item: SizingJournalEntry;
}

export function CostPerWearProgress({ item }: CostPerWearProgressProps) {
	const metrics = calculateWorthItMetrics(item);

	// Don't render if not applicable
	if (!metrics.currentCPW && !item.wears && !metrics.milestoneMessage) {
		return null;
	}

	const isWorthIt = metrics.isWorthIt;
	const progressPercentage = metrics.progress;
	const currentCPW = metrics.currentCPW;
	const targetCPW = metrics.targetCPW;

	// Determine progress bar color based on progress percentage
	const getProgressColor = () => {
		if (isWorthIt) return 'bg-meadow-500'; // Deep green for achieved
		if (progressPercentage >= 75) return 'bg-meadow-400'; // Light green nearing goal
		if (progressPercentage >= 50) return 'bg-sun-400'; // Yellow at midpoint
		return 'bg-sun-300'; // Light yellow at start
	};

	const tooltipContent = (
		<div className='space-y-2 text-xs'>
			<div className='font-semibold text-slate-900'>
				Cost Per Wear Breakdown
			</div>
			<div className='space-y-1 text-slate-600'>
				<div>Purchase Price: ${item.purchase_price?.toFixed(2)}</div>
				<div>Times Worn: {item.wears && item.wears > 0 ? item.wears : 0}</div>
				<div>Target Wears: {metrics.targetWears}</div>
				{currentCPW && (
					<div className='border-t border-slate-300 pt-1 mt-1'>
						<div>Current: ${currentCPW.toFixed(2)}/wear</div>
						<div>Target: ${targetCPW.toFixed(2)}/wear</div>
						<div className='text-slate-500 mt-1'>
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
							<span className='text-sm font-semibold text-slate-900'>
								💰 Cost Per Wear
							</span>
						</div>
						{isWorthIt && (
							<span className='text-xs font-bold px-2 py-1 rounded-full bg-meadow-500 text-white'>
								✨ Worth It!
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
					<div className='w-full bg-stone-300 rounded-full h-2 overflow-hidden'>
						<div
							className={`${getProgressColor()} h-full rounded-full transition-all duration-500 ease-out`}
							style={{ width: `${Math.min(progressPercentage, 100)}%` }}
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
								{metrics.milestoneEmoji} {metrics.milestoneMessage}
							</span>
						) : metrics.wearsRemaining > 0 ? (
							<span>
								{metrics.milestoneEmoji}{' '}
								{metrics.milestoneMessage} Wear{' '}
								{metrics.wearsRemaining === 1 ? 'one' : metrics.wearsRemaining}{' '}
								more time{metrics.wearsRemaining !== 1 ? 's' : ''}!
							</span>
						) : (
							<span>{metrics.milestoneEmoji} {metrics.milestoneMessage}</span>
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
