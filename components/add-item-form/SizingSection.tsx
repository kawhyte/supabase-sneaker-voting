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
import { CheckCircle, FileText, Store } from "lucide-react";
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
	intent?: 'own' | 'wishlist';
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
	intent,
}: SizingSectionProps) {
	const {
		register,
		watch,
		setValue,
		formState: { errors },
	} = form;

	const watchedTriedOn = watch("triedOn");
	const watchedCategory = watch("category");

	// Show in edit mode always; in create mode only for 'own' intent (flat layout)
	// Wishlist intent hides this section entirely (handled at parent level too)
	if (mode !== 'edit' && intent !== 'own') return null;

	return (
		<div className="space-y-6">
			{/* Section Header */}
			<div className="dense flex items-center gap-2 pb-2 border-b border-border">
				<FileText className="relative -top-[8px] h-5 w-5 text-slate-600 flex-shrink-0" />
				<h3 className="font-semibold font-heading text-base text-slate-900 leading-5">
					{watchedTriedOn ? (
						<>
							<CheckCircle className="inline h-4 w-4 text-emerald-500 mr-2" />
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

			{/* PHASE 2: Store & Purchase Details (Optional) */}
			<div className="pt-6 space-y-6">
				<div className="dense flex items-center gap-2 pb-2 border-b border-border">
					<Store className="relative -top-[8px] h-5 w-5 text-slate-600 flex-shrink-0" />
					<h3 className="font-semibold font-heading text-base text-slate-900 leading-5">
						Store & Purchase (Optional)
					</h3>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Store Name */}
					<div>
						<Label className="text-sm font-medium text-slate-900">
							Store Name
						</Label>
						<Input
							{...register("storeName")}
							className="mt-2"
							placeholder="e.g., Nike Store, Foot Locker, Shoe Palace"
						/>
						{errors.storeName && (
							<p className="text-sm text-red-600 mt-1">
								{String(errors.storeName.message)}
							</p>
						)}
					</div>

					{/* Purchase Date */}
					<div>
						<Label className="text-sm font-medium text-slate-900">
							Purchase Date
						</Label>
						<Input
							{...register("purchaseDate")}
							type="date"
							className="mt-2"
							max={new Date().toISOString().split('T')[0]}
						/>
						{errors.purchaseDate && (
							<p className="text-sm text-red-600 mt-1">
								{String(errors.purchaseDate.message)}
							</p>
						)}
					</div>
				</div>

				{/* Store URL */}
				<div>
					<Label className="text-sm font-medium text-slate-900">
						Store / Product URL
					</Label>
					<Input
						{...register("storeUrl")}
						type="url"
						className="mt-2"
						placeholder="https://www.shoepalace.com/products/..."
					/>
					{errors.storeUrl && (
						<p className="text-sm text-red-600 mt-1">
							{String(errors.storeUrl.message)}
						</p>
					)}
					<p className="text-xs text-muted-foreground mt-1">
						Link to the store page where you purchased this item
					</p>
				</div>
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
