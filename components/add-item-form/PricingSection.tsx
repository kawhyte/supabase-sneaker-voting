/**
 * Pricing Section - Retail Price, Sale Price, Target Price
 *
 * Contains all pricing-related fields:
 * - Retail price (required)
 * - Sale price (optional, with validation)
 * - Target price (optional with smart suggestions based on retail price)
 * - Sale detection alert when sale price < retail price
 * - Tiered target price suggestions (80%/70%/60% based on price ranges)
 */

"use client";

import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

interface PricingSectionProps {
	form: UseFormReturn<any>;
}

/**
 * Calculate suggested target price based on retail price.
 * Uses tiered percentage discounts:
 * - Under $100: 80% of retail (20% off)
 * - $100-$300: 70% of retail (30% off)
 * - Over $300: 60% of retail (40% off)
 */
function calculateSuggestedTargetPrice(retailPrice: string): number | null {
	if (!retailPrice || retailPrice === '') return null;

	const retail = parseFloat(retailPrice);
	if (isNaN(retail) || retail <= 0) return null;

	if (retail < 100) return Math.round(retail * 0.8);
	if (retail < 300) return Math.round(retail * 0.7);
	return Math.round(retail * 0.6);
}

/**
 * PricingSection Component
 *
 * Handles all pricing inputs with automatic sale detection and savings calculation.
 * Shows a visual alert when a sale price is detected (sale price < retail price).
 * Provides smart target price suggestions based on typical discount expectations.
 */
export function PricingSection({ form }: PricingSectionProps) {
	const {
		register,
		watch,
		formState: { errors },
	} = form;

	const watchedRetailPrice = watch("retailPrice");
	const watchedSalePrice = watch("salePrice");
	const watchedTargetPrice = watch("targetPrice");

	// Calculate suggested target price
	const suggestedTarget = calculateSuggestedTargetPrice(watchedRetailPrice);

	return (
		<div className="space-y-6">
			{/* Row 1: Retail Price & Sale Price */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<Label className="text-sm font-medium text-slate-900">
						Retail Price <span className="text-red-500">*</span>
					</Label>
					<div className="relative mt-2">
						<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
							$
						</span>
						<Input
							{...register("retailPrice")}
							placeholder="170.00"
							type="number"
							step="0.01"
							className="pl-8"
						/>
					</div>
					{errors.retailPrice && (
						<p className="text-sm text-red-600 mt-1">
							{String(errors.retailPrice.message || "Retail price is required")}
						</p>
					)}
				</div>

				<div>
					<Label className="text-sm font-medium text-slate-900">
						Sale Price{" "}
						<span className="text-xs text-muted-foreground font-normal">
							(Optional)
						</span>
					</Label>
					<div className="relative mt-2">
						<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
							$
						</span>
						<Input
							{...register("salePrice")}
							placeholder="150.00"
							type="number"
							step="0.01"
							className="pl-8"
						/>
					</div>
					{errors.salePrice && (
						<p className="text-sm text-red-600 mt-1">
							{String(errors.salePrice.message)}
						</p>
					)}
				</div>
			</div>

			{/* Sale Alert - Shows when sale price is lower than retail */}
			{watchedSalePrice &&
				watchedRetailPrice &&
				parseFloat(watchedSalePrice) < parseFloat(watchedRetailPrice) && (
					<div
						className="p-2.5 rounded-lg border flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300 bg-meadow-50 border-meadow-300"
						role="status"
						aria-live="polite"
					>
						<Sparkles
							className="h-4 w-4 flex-shrink-0 text-meadow-600 mt-0.5"
							aria-hidden="true"
						/>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-semibold text-meadow-700">
								Active sale: ${watchedSalePrice}
							</p>
							<p className="text-xs text-meadow-600">
								Save $
								{(
									parseFloat(watchedRetailPrice) - parseFloat(watchedSalePrice)
								).toFixed(2)}{" "}
								(
								{Math.round(
									((parseFloat(watchedRetailPrice) -
										parseFloat(watchedSalePrice)) /
										parseFloat(watchedRetailPrice)) *
										100
								)}
								%)
							</p>
						</div>
					</div>
				)}

			{/* Row 2: Target Price with Smart Suggestion */}
			<div>
				<Label className="text-sm font-medium text-slate-900">
					Target Price{" "}
					<span className="text-xs text-muted-foreground font-normal">
						(Optional - What's the most you'd pay?)
					</span>
				</Label>
				{suggestedTarget && (
					<p className="text-xs text-blue-600 mt-1">
						Suggested: ${suggestedTarget} (based on typical discounts)
					</p>
				)}
				<div className="relative mt-2">
					<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
						$
					</span>
					<Input
						{...register("targetPrice")}
						type="number"
						step="0.01"
						placeholder={suggestedTarget ? `${suggestedTarget}` : "0.00"}
						className="pl-8"
					/>
				</div>
				{errors.targetPrice && (
					<p className="text-sm text-red-600 mt-1">
						{String(errors.targetPrice.message)}
					</p>
				)}
			</div>
		</div>
	);
}
