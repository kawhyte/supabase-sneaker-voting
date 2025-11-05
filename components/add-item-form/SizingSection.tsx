/**
 * Sizing Section - Size Tried, Comfort Rating
 *
 * Contains try-on related fields that appear when "Tried On" is toggled:
 * - Size tried (shoe sizes or clothing sizes based on category)
 * - Comfort rating (1-5 stars for applicable categories)
 * - SKU/Style code (optional)
 * - Color (optional)
 * - Notes (120 character limit)
 * - Wears counter (edit mode only, for owned items)
 */

"use client";

import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { SizeCombobox } from "@/components/SizeCombobox";
import { ClothingSizeCombobox } from "@/components/ClothingSizeCombobox";
import { ComfortRating } from "@/components/ComfortRating";
import {
	isSizeRequired,
	isComfortRequired,
} from "@/components/types/item-category";

interface SizingSectionProps {
	form: UseFormReturn<any>;
	openAccordionItem: string;
	setOpenAccordionItem: (value: string) => void;
	mode: "create" | "edit";
	initialData?: any;
	formMode: "quick" | "advanced";
}

/**
 * SizingSection Component
 *
 * Displays in an accordion that auto-opens when "Tried On" is toggled.
 * Contains size selection, comfort rating, and additional metadata fields.
 * Only shows fields relevant to the selected category.
 */
export function SizingSection({
	form,
	openAccordionItem,
	setOpenAccordionItem,
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
		<Accordion
			type="single"
			collapsible
			className="w-full"
			value={openAccordionItem}
			onValueChange={setOpenAccordionItem}
		>
			<AccordionItem value="item-1">
				<AccordionTrigger>
					<h3 className="font-semibold font-heading text-base text-slate-900 leading-5 mt-8">
						{watchedTriedOn ? (
							<>
								<CheckCircle className="inline h-4 w-4 text-meadow-600 mr-2" />
								Try-On Details
							</>
						) : (
							"Add More Details (Optional)"
						)}
					</h3>
				</AccordionTrigger>
				<AccordionContent className="space-y-6 pt-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div>
							<Label className="text-sm font-medium text-slate-900">
								SKU / Style Code
							</Label>
							<Input {...register("sku")} className="mt-2" />
						</div>
						<div>
							<Label className="text-sm font-medium text-slate-900">Color</Label>
							<Input {...register("color")} className="mt-2" />
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

					<div>
						<Label className="text-sm font-medium text-slate-900">
							Notes ({watch("notes")?.length || 0} / 120)
						</Label>
						<Textarea {...register("notes")} maxLength={120} className="mt-2" />
					</div>

					{/* Wears Counter - For tracking item usage */}
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

					{watchedTriedOn && (
						<div className="space-y-6 grid grid-cols-1">
							{isComfortRequired(watchedCategory) && (
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
							)}
						</div>
					)}
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
