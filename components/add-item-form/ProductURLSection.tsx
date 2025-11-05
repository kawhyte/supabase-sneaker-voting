/**
 * Product URL Section - URL input with auto-fill and price tracking
 *
 * Contains:
 * - Product URL input field
 * - "Import" button to trigger auto-fill from URL
 * - Price tracking toggle switch
 * - URL validation feedback
 * - Supported retailers dialog link
 * - Failure warnings for edit mode
 */

"use client";

import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
	Loader2,
	TrendingDown,
	AlertTriangle,
	CheckCircle2,
	XCircle,
	Info,
} from "lucide-react";
import { getSupportedRetailers } from "@/lib/retailer-url-validator";
import type { UrlValidationResult } from "@/lib/retailer-url-validator";

interface ProductURLSectionProps {
	form: UseFormReturn<any>;
	isScrapingUrl: boolean;
	uploadProgress: string;
	urlValidation: UrlValidationResult;
	onUrlScrape: (url: string) => void;
	onShowRetailersDialog: () => void;
	mode: "create" | "edit";
	initialData?: any;
}

/**
 * ProductURLSection Component
 *
 * Handles product URL input, auto-import, and price tracking toggle.
 * Shows validation feedback and retailer support information.
 * Displays warnings in edit mode when price tracking has failed.
 */
export function ProductURLSection({
	form,
	isScrapingUrl,
	uploadProgress,
	urlValidation,
	onUrlScrape,
	onShowRetailersDialog,
	mode,
	initialData,
}: ProductURLSectionProps) {
	const {
		register,
		watch,
		setValue,
	} = form;

	return (
		<>
			{/* Product URL Field */}
			<div>
				<Label htmlFor="productUrl" className="text-xs text-muted-foreground">
					Product URL (Optional - for price tracking)
				</Label>
				<div className="flex flex-col sm:flex-row gap-2 mt-2">
					<Input
						id="productUrl"
						{...register("productUrl")}
						placeholder="https://nike.com/..."
						className="flex-1"
						disabled={isScrapingUrl}
					/>
					<Button
						type="button"
						onClick={() => onUrlScrape(watch("productUrl") || "")}
						disabled={isScrapingUrl || !watch("productUrl")}
						variant="outline"
					>
						{isScrapingUrl && (
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						)}
						{isScrapingUrl ? "Importing..." : "Import"}
					</Button>
				</div>
				{uploadProgress && (
					<p className="text-sm text-muted-foreground mt-2">{uploadProgress}</p>
				)}
			</div>

			{/* Price Tracking Section - Wishlisted Items or Edit Mode */}
			{(mode === "create" ||
				initialData?.status === "wishlisted" ||
				mode === "edit") && (
				<div className="space-y-6 mt-12">
					<div className="flex items-center gap-2 pb-2 border-b border-stone-300">
						<TrendingDown className="relative -top-[8px] h-5 w-5 text-slate-600 flex-shrink-0" />
						<h3 className="font-semibold font-heading text-base text-slate-900 leading-5">
							Price Tracking
						</h3>
					</div>

					<div className="space-y-4">
						{/* Toggle Switch */}
						<div className="dense flex items-start justify-between gap-4">
							<div className="flex-1">
								<Label className="text-sm font-medium text-slate-900">
									Track price changes automatically
								</Label>
								<p className="text-xs text-muted-foreground mt-1">
									We'll check prices weekly and notify you when prices drop
								</p>
							</div>
							<Switch
								checked={watch("auto_price_tracking_enabled")}
								onCheckedChange={(checked) =>
									setValue("auto_price_tracking_enabled", checked, {
										shouldValidate: true,
									})
								}
								id="auto_price_tracking_enabled"
							/>
						</div>

						{/* Failure Warning for Edit Mode */}
						{mode === "edit" &&
							initialData?.auto_price_tracking_enabled &&
							(initialData?.price_check_failures ?? 0) >= 2 && (
								<div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
									<AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
									<div className="flex-1">
										<p className="text-sm font-semibold text-red-800">
											Price tracking has failed {initialData.price_check_failures}{" "}
											times
										</p>
										<p className="text-xs text-red-700 mt-1">
											The product URL may be invalid or the retailer's website has
											changed. Consider updating the URL or disabling tracking.
										</p>
									</div>
								</div>
							)}

						{/* Conditional feedback and help when toggle is ON */}
						{watch("auto_price_tracking_enabled") && (
							<div className="space-y-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
								{/* Validation Feedback */}
								{urlValidation.status !== "idle" && (
									<div>
										{urlValidation.status === "success" && (
											<div className="flex items-center gap-2 text-sm text-green-700">
												<CheckCircle2 className="h-4 w-4" />
												<span>{urlValidation.message}</span>
											</div>
										)}
										{urlValidation.status === "warning" && (
											<div className="flex items-center gap-2 text-sm text-orange-700">
												<AlertTriangle className="h-4 w-4" />
												<span>{urlValidation.message}</span>
											</div>
										)}
										{urlValidation.status === "error" && (
											<div className="flex items-center gap-2 text-sm text-red-700">
												<XCircle className="h-4 w-4" />
												<span>{urlValidation.message}</span>
											</div>
										)}
									</div>
								)}

								{/* Reminder to add URL if empty */}
								{!watch("productUrl") && (
									<div className="flex items-start gap-2 text-sm text-blue-700">
										<Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
										<div>
											<p className="font-medium">
												Add a product URL above to enable tracking
											</p>
											<button
												type="button"
												onClick={onShowRetailersDialog}
												className="text-xs text-primary hover:underline mt-1 block"
											>
												See supported retailers ({getSupportedRetailers().length})
											</button>
										</div>
									</div>
								)}

								{/* See supported retailers link (if URL is present) */}
								{watch("productUrl") && (
									<button
										type="button"
										onClick={onShowRetailersDialog}
										className="text-xs text-primary hover:underline block"
									>
										See all supported retailers ({getSupportedRetailers().length})
									</button>
								)}
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
}
