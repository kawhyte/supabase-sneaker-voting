/**
 * Pricing Section - Retail Price, Sale Price, Target Price
 *
 * Contains all pricing-related fields:
 * - Retail price (required)
 * - Sale price (optional, with validation)
 * - Target price (required for wishlist items)
 * - Sale detection alert when sale price < retail price
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
 * PricingSection Component
 *
 * Handles all pricing inputs with automatic sale detection and savings calculation.
 * Shows a visual alert when a sale price is detected (sale price < retail price).
 */
export function PricingSection({ form }: PricingSectionProps) {
	const {
		register,
		watch,
		formState: { errors },
	} = form;

	const watchedRetailPrice = watch("retailPrice");
	const watchedSalePrice = watch("salePrice");

	return (
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

				{/* Sale Alert - Inline after Retail Price */}
				{watchedSalePrice &&
					watchedRetailPrice &&
					parseFloat(watchedSalePrice) < parseFloat(watchedRetailPrice) && (
						<div
							className="mt-3 p-2.5 rounded-lg border flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300 bg-meadow-50 border-meadow-300"
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
			</div>
			<div>
				<Label className="text-sm font-medium text-slate-900">
					Target Price <span className="text-red-500">*</span>
				</Label>
				<div className="relative mt-2">
					<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
						$
					</span>
					<Input
						{...register("targetPrice")}
						type="number"
						step="0.01"
						placeholder="0.00"
						className="mt-2 pl-8"
					/>
				</div>
				{errors.targetPrice && (
					<p className="text-sm text-red-600 mt-1">
						{String(errors.targetPrice.message || "Target price is required")}
					</p>
				)}
			</div>
		</div>
	);
}
