/**
 * Sizing Section - Intent-aware sizing, comfort, and details fields.
 *
 * Scenario A (intent === 'own' or edit):
 *   - No triedOn toggle (handled in BasicInfoSection)
 *   - Size always visible (Required for size-relevant categories)
 *   - Comfort Rating always visible (Optional)
 *   - Sizing Notes always visible (Optional)
 *   - SKU, Store & Purchase, Wears Counter
 *
 * Scenario B (intent === 'wishlist', create mode):
 *   - "Have you tried these on in-store?" toggle
 *   - Target Size always visible (Optional) + hint text
 *   - If triedOn: Comfort Rating (Optional) + Sizing Notes (Optional)
 */

"use client";

import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Store, Ruler } from "lucide-react";
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
	intent?: "own" | "wishlist";
}

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

	// Wishlist create mode gets a streamlined, frictionless layout
	const isWishlistCreate = intent === "wishlist" && mode !== "edit";

	// ── Scenario B: Wishlist (create) ─────────────────────────────────────────
	if (isWishlistCreate) {
		return (
			<div className="space-y-6">
				{/* Section Header */}
				<div className="dense flex items-center gap-2 pb-2 border-b border-border">
					<Ruler className="relative -top-[8px] h-5 w-5 text-slate-600 flex-shrink-0" />
					<h3 className="font-semibold font-heading text-base text-slate-900 leading-5">
						Sizing{" "}
						<span className="font-normal text-muted-foreground">(Optional)</span>
					</h3>
				</div>

				{/* Target Size — always shown for size-relevant categories */}
				{isSizeRequired(watchedCategory) && (
					<div>
						<Label className="text-sm font-medium text-slate-900">
							Target Size{" "}
							<span className="font-normal text-muted-foreground">(Optional)</span>
						</Label>
						{watchedCategory === "shoes" ? (
							<SizeCombobox
								value={watch("sizeTried")}
								onChange={(v) =>
									setValue("sizeTried", v, { shouldValidate: true })
								}
							/>
						) : (
							<ClothingSizeCombobox
								value={watch("sizeTried")}
								onChange={(v) =>
									setValue("sizeTried", v, { shouldValidate: true })
								}
							/>
						)}
						<p className="text-xs text-muted-foreground mt-1">
							Selecting a size helps us find better price matches later.
						</p>
					</div>
				)}

				{/* Comfort Rating & Sizing Notes — only when tried on */}
				{watchedTriedOn && (
					<>
						{isComfortRequired(watchedCategory) && (
							<div>
								<Label className="text-sm font-medium text-slate-900 mb-2 block">
									Comfort Rating{" "}
									<span className="font-normal text-muted-foreground">(Optional)</span>
								</Label>
								<ComfortRating
									value={watch("comfortRating")}
									onChange={(value) =>
										setValue("comfortRating", value, {
											shouldValidate: false,
											shouldDirty: true,
										})
									}
									error={
										errors.comfortRating?.message
											? String(errors.comfortRating.message)
											: undefined
									}
								/>
								<p className="text-xs text-muted-foreground mt-1">
									e.g., Great arch support
								</p>
							</div>
						)}

						<div>
							<Label className="text-sm font-medium text-slate-900">
								Sizing Notes{" "}
								<span className="font-normal text-muted-foreground">(Optional)</span>{" "}
								({watch("notes")?.length || 0} / 120)
							</Label>
							<Textarea
								{...register("notes")}
								maxLength={120}
								className="mt-2"
								placeholder="e.g., Runs a bit narrow, go up half a size"
							/>
						</div>
					</>
				)}
			</div>
		);
	}

	// ── Scenario A: Own / Edit ─────────────────────────────────────────────────
	return (
		<div className="space-y-6">
			{/* Section Header */}
			<div className="dense flex items-center gap-2 pb-2 border-b border-border">
				<FileText className="relative -top-[8px] h-5 w-5 text-slate-600 flex-shrink-0" />
				<h3 className="font-semibold font-heading text-base text-slate-900 leading-5">
					Additional Details{" "}
					<span className="font-normal text-muted-foreground">(Optional)</span>
				</h3>
			</div>

			{/* Row 1: SKU and Size */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<Label className="text-sm font-medium text-slate-900">
						SKU / Style Code
					</Label>
					<Input
						{...register("sku")}
						className="mt-2"
						placeholder="e.g., DQ4478-001"
					/>
				</div>

				{isSizeRequired(watchedCategory) && (
					<div>
						<Label className="text-sm font-medium text-slate-900">
							Size <span className="text-red-500">*</span>
						</Label>
						{watchedCategory === "shoes" ? (
							<SizeCombobox
								value={watch("sizeTried")}
								onChange={(v) =>
									setValue("sizeTried", v, { shouldValidate: true })
								}
							/>
						) : (
							<ClothingSizeCombobox
								value={watch("sizeTried")}
								onChange={(v) =>
									setValue("sizeTried", v, { shouldValidate: true })
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

			{/* Sizing Notes */}
			<div>
				<Label className="text-sm font-medium text-slate-900">
					Sizing Notes{" "}
					<span className="font-normal text-muted-foreground">(Optional)</span>{" "}
					({watch("notes")?.length || 0} / 120)
				</Label>
				<Textarea
					{...register("notes")}
					maxLength={120}
					className="mt-2"
					placeholder="e.g., Runs a bit narrow, go up half a size"
				/>
			</div>

			{/* Store & Purchase Details */}
			<div className="pt-6 space-y-6">
				<div className="dense flex items-center gap-2 pb-2 border-b border-border">
					<Store className="relative -top-[8px] h-5 w-5 text-slate-600 flex-shrink-0" />
					<h3 className="font-semibold font-heading text-base text-slate-900 leading-5">
						Store & Purchase{" "}
						<span className="font-normal text-muted-foreground">(Optional)</span>
					</h3>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

					<div>
						<Label className="text-sm font-medium text-slate-900">
							Purchase Date
						</Label>
						<Input
							{...register("purchaseDate")}
							type="date"
							className="mt-2"
							max={new Date().toISOString().split("T")[0]}
						/>
						{errors.purchaseDate && (
							<p className="text-sm text-red-600 mt-1">
								{String(errors.purchaseDate.message)}
							</p>
						)}
					</div>
				</div>

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

			{/* Wears Counter — Edit mode, owned items only */}
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

			{/* Comfort Rating — Optional, no triedOn gate */}
			{isComfortRequired(watchedCategory) && (
				<div className="pt-4">
					<Label className="text-sm font-medium text-slate-900 mb-2 block">
						Comfort Rating{" "}
						<span className="font-normal text-muted-foreground">(Optional)</span>
					</Label>
					<ComfortRating
						value={watch("comfortRating")}
						onChange={(value) =>
							setValue("comfortRating", value, {
								shouldValidate: false,
								shouldDirty: true,
							})
						}
						error={
							errors.comfortRating?.message
								? String(errors.comfortRating.message)
								: undefined
						}
					/>
					<p className="text-xs text-muted-foreground mt-1">
						e.g., Great arch support
					</p>
				</div>
			)}
		</div>
	);
}
