/**
 * Basic Info Section - Brand, Model, Color, Category, Tried On toggle
 *
 * Contains the essential product identification fields:
 * - Brand selection (combobox with logos)
 * - Item name/model (required)
 * - Category selection (shoes, tops, bottoms, etc.)
 * - "Tried On" toggle switch with visual feedback
 */

"use client";

import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	CheckCircle,
	Eye,
	Package,
} from "lucide-react";
import { BrandCombobox } from "@/components/BrandCombobox";
import { useBrands } from "@/hooks/useBrands";
import {
	CATEGORY_CONFIGS,
	type ItemCategory,
} from "@/components/types/item-category";

interface BasicInfoSectionProps {
	form: UseFormReturn<any>;
}

/**
 * BasicInfoSection Component
 *
 * Renders the core product information fields including brand, model, category,
 * and tried-on status. This section appears first in the form and contains
 * all required fields for basic item identification.
 */
export function BasicInfoSection({ form }: BasicInfoSectionProps) {
	const {
		register,
		setValue,
		watch,
		formState: { errors },
	} = form;

	const { brands } = useBrands();
	const watchedTriedOn = watch("triedOn");
	const watchedCategory = watch("category");
	const watchedBrandId = watch("brandId");

	return (
		<div className="space-y-6">
			<div className="dense flex items-center gap-2 pb-2 border-b border-stone-300">
				<Package className="relative -top-[8px] h-5 w-5 text-slate-600 flex-shrink-0" />
				<h3 className="font-semibold font-heading text-base text-slate-900 leading-5">
					Product Details
				</h3>
			</div>

			{/* Row 1: Experience & Item Category */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="dense flex items-center gap-3 p-4 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 transition-colors h-fit">
					<div className="w-full">
						<div className="flex items-center gap-2 mb-2">
							<Eye className="h-4 w-4 text-slate-600 flex-shrink-0" />
							<Label className="block text-sm font-semibold text-slate-900">
								Did you try on this item?
							</Label>
						</div>
						<div className="flex items-center gap-3">
							<Switch
								checked={watchedTriedOn}
								onCheckedChange={(checked) =>
									setValue("triedOn", checked, {
										shouldValidate: true,
									})
								}
								id="triedOn"
							/>
							<Label
								htmlFor="triedOn"
								className="cursor-pointer text-sm font-medium text-slate-900"
							>
								{watchedTriedOn ? (
									<>
										Yes{" "}
										<CheckCircle className="inline h-4 w-4 text-meadow-600 ml-1" />
									</>
								) : (
									"No"
								)}
							</Label>
						</div>
						{watchedTriedOn && (
							<p className="text-xs text-meadow-600 mt-2">
								Great! Your feedback will help track the fit.
							</p>
						)}
					</div>
				</div>
				<div>
					<Label className="text-sm font-medium text-slate-900">
						Item Category <span className="text-red-500">*</span>
					</Label>
					<Select
						onValueChange={(v) =>
							setValue("category", v as ItemCategory, {
								shouldValidate: true,
							})
						}
						value={watchedCategory}
					>
						<SelectTrigger className="mt-2">
							<SelectValue placeholder="Select a category" />
						</SelectTrigger>
						<SelectContent>
							{Object.values(CATEGORY_CONFIGS).map((c) => (
								<SelectItem key={c.id} value={c.id}>
									{c.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{errors.category && (
						<p className="text-sm text-red-600 mt-1">
							{String(errors.category.message || "Category is required")}
						</p>
					)}
				</div>
			</div>

			{/* Row 2: Brand & Item Name */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<Label className="text-sm font-medium text-slate-900">
						Brand <span className="text-red-500">*</span>
					</Label>
					<BrandCombobox
						value={watchedBrandId}
						onChange={(brandId) => {
							setValue("brandId", brandId, { shouldValidate: true });
							// Also set the brand name for display/scraping purposes
							const selectedBrand = brands.find((b) => b.id === brandId);
							if (selectedBrand?.name) {
								setValue("brand", selectedBrand.name, { shouldValidate: true });
							}
						}}
					/>
					{errors.brandId && (
						<p className="text-sm text-red-600 mt-1">
							{String(errors.brandId.message || "Brand is required")}
						</p>
					)}
				</div>
				<div>
					<Label className="text-sm font-medium text-slate-900">
						Item Name <span className="text-red-500">*</span>
					</Label>
					<Input {...register("model")} className="mt-2" />
					{errors.model && (
						<p className="text-sm text-red-600 mt-1">
							{String(errors.model.message || "Item name is required")}
						</p>
					)}
				</div>
			</div>

			{/* Row 3: Color (Required for duplicate detection) */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<Label className="text-sm font-medium text-slate-900">
						Color <span className="text-red-500">*</span>
					</Label>
					<Input
						{...register("color")}
						className="mt-2"
						placeholder="e.g., Black, Navy Blue, Red"
					/>
					{errors.color && (
						<p className="text-sm text-red-600 mt-1">
							{String(errors.color.message || "Color is required")}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
