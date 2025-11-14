/**
 * Sizing Section - Size Tried, Comfort Rating, Additional Details
 *
 * Contains try-on related fields and optional metadata:
 * - Size tried (shoe sizes or clothing sizes based on category)
 * - Comfort rating (1-5 stars for applicable categories)
 * - SKU/Style code (optional)
 * - Notes (120 character limit)
 * - Wears counter (edit mode only, for owned items)
 *
 * Note: Color field moved to BasicInfoSection (required field)
 */

"use client";

import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, FileText } from "lucide-react";
import { SizeCombobox } from "@/components/SizeCombobox";
import { ClothingSizeCombobox } from "@/components/ClothingSizeCombobox";
import { ComfortRating } from "@/components/ComfortRating";
import {
	isSizeRequired,
	isComfortRequired,
} from "@/components/types/item-category";

interface SizingSectionProps {
	form: UseFormReturn<any>;
	mode: "create" | "edit" | "add";
	initialData?: any;
	formMode: "quick" | "advanced";
}

/**
 * SizingSection Component
 *
 * Shows additional optional fields in Advanced mode only.
 * Contains size selection, comfort rating, and metadata fields.
 * Fields are shown directly without accordion nesting.
 */
export function SizingSection({
	form,
	mode,
	initialData,
	formMode,
}: SizingSectionProps) {
	const {
		register,
		watch,
		setValue,
		formState: { errors },
	} = form;

	const watchedTriedOn = watch("triedOn");
	const watchedCategory = watch("category");

	// Only render in advanced mode
	if (formMode !== "advanced") return null;

	return (
		<div className="space-y-6">
			{/* Section Header */}
			<div className="dense flex items-center gap-2 pb-2 border-b border-stone-300">
				<FileText className="relative -top-[8px] h-5 w-5 text-slate-600 flex-shrink-0" />
				<h3 className="font-semibold font-heading text-base text-slate-900 leading-5">
					{watchedTriedOn ? (
						<>
							<CheckCircle className="inline h-4 w-4 text-meadow-600 mr-2" />
							Try-On Details
						</>
					) : (
						"Additional Details (Optional)"
					)}
				</h3>
			</div>

			{/* Row 1: SKU and Size Tried (if applicable) */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<Label className="text-sm font-medium text-slate-900">
						SKU / Style Code
					</Label>
					<Input {...register("sku")} className="mt-2" placeholder="e.g., DQ4478-001" />
				</div>

				{isSizeRequired(watchedCategory) && watchedTriedOn && (
					<div>
						<Label className="text-sm font-medium text-slate-900">
							Size Tried
						</Label>
						{watchedCategory === "shoes" ? (
							<SizeCombobox
								value={watch("sizeTried")}
								onChange={(v) =>
									setValue("sizeTried", v, {
										shouldValidate: true,
									})
								}
							/>
						) : (
							<ClothingSizeCombobox
								value={watch("sizeTried")}
								onChange={(v) =>
									setValue("sizeTried", v, {
										shouldValidate: true,
									})
								}
							/>
						)}
						{errors.sizeTried && (
							<p className="text-sm text-red-600 mt-1">
								{String(errors.sizeTried.message || "Size is required")}
							</p>
						)}
					</div>
				)}
			</div>

			{/* Notes Field */}
			<div>
				<Label className="text-sm font-medium text-slate-900">
					Notes ({watch("notes")?.length || 0} / 120)
				</Label>
				<Textarea
					{...register("notes")}
					maxLength={120}
					className="mt-2"
					placeholder="E.g., Great comfort, runs large, perfect for running"
				/>
			</div>

			{/* Wears Counter - For tracking item usage (Edit mode only, owned items) */}
			{mode === "edit" && initialData?.status === "owned" && (
				<div>
					<Label className="text-sm font-medium text-slate-900">
						Times Worn{" "}
						<span className="text-xs text-muted-foreground font-normal">
							(Optional)
						</span>
					</Label>
					<div className="relative mt-2">
						<Input
							{...register("wears", { valueAsNumber: true })}
							type="number"
							min="0"
							max="10000"
							placeholder="0"
							className="mt-1"
						/>
						<span className="text-xs text-muted-foreground mt-1 block">
							Track wears to calculate cost per wear value
						</span>
					</div>
					{errors.wears && (
						<p className="text-sm text-red-600 mt-1">
							{String(errors.wears.message || "Invalid wear count")}
						</p>
					)}
				</div>
			)}

			{/* Comfort Rating - Shows when tried on and category requires it */}
			{watchedTriedOn && isComfortRequired(watchedCategory) && (
				<div className="pt-4">
					<ComfortRating
						value={watch("comfortRating")}
						onChange={(value) =>
							setValue("comfortRating", value, {
								shouldValidate: false,
								shouldDirty: true,
							})
						}
						error={errors.comfortRating?.message ? String(errors.comfortRating.message) : undefined}
					/>
				</div>
			)}
		</div>
	);
}
