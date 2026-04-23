"use client";

import { UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
	CheckCircle,
	Eye,
	Package,
	RefreshCw,
	Lightbulb,
} from "lucide-react";
import { BrandCombobox } from "@/components/BrandCombobox";
import { useBrands } from "@/hooks/useBrands";

interface BasicInfoSectionProps {
	form: UseFormReturn<any>;
	intent?: "own" | "wishlist";
	mode?: "create" | "edit" | "add";
	catalogSuggestion?: string;
	onCatalogSuggestionUsed?: () => void;
	onSyncWithEbay?: () => Promise<void>;
}

export function BasicInfoSection({
	form,
	intent,
	mode,
	catalogSuggestion,
	onCatalogSuggestionUsed,
	onSyncWithEbay,
}: BasicInfoSectionProps) {
	const {
		register,
		setValue,
		watch,
		formState: { errors },
	} = form;

	const { brands } = useBrands();
	const watchedTriedOn = watch("triedOn");
	const watchedBrandId = watch("brandId");
	const watchedBrandName = watch("brand");
	const watchedModel = watch("model");
	const watchedSku = watch("sku");

	const [isSyncing, setIsSyncing] = useState(false);

	// When editing an item whose brand_id is null (legacy data), resolve it from
	// the stored brand name once the brands list has loaded.
	useEffect(() => {
		if (!watchedBrandId && watchedBrandName && brands.length > 0) {
			const match = brands.find(
				(b) => b.name?.toLowerCase() === watchedBrandName.toLowerCase()
			);
			if (match) {
				setValue("brandId", match.id, { shouldValidate: true });
			}
		}
	}, [brands, watchedBrandName, watchedBrandId, setValue]);

	// Clear catalog suggestion once user manually edits the model field away from it
	const showSuggestion =
		catalogSuggestion &&
		catalogSuggestion !== watchedModel &&
		catalogSuggestion.length > 0;

	const handleSync = async () => {
		if (!onSyncWithEbay) return;
		setIsSyncing(true);
		try {
			await onSyncWithEbay();
		} finally {
			setIsSyncing(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="dense flex items-center gap-2 pb-2 border-b border-border">
				<Package className="h-5 w-5 text-slate-600 flex-shrink-0" />
				<h3 className="font-semibold font-heading text-base text-slate-900 leading-5">
					Product Details
				</h3>
			</div>

			{/* Tried-On Toggle — Wishlist only */}
			{intent === "wishlist" && (
				<div className="dense flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
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
										<CheckCircle className="inline h-4 w-4 text-emerald-500 ml-1" />
									</>
								) : (
									"No"
								)}
							</Label>
						</div>
						{watchedTriedOn && (
							<p className="text-xs text-emerald-500 mt-2">
								Great! Your feedback will help track the fit.
							</p>
						)}
					</div>
				</div>
			)}

			{/* Row: Brand & Item Name */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<Label className="text-sm font-medium text-slate-900">
						Brand <span className="text-red-500">*</span>
					</Label>
					<BrandCombobox
						value={watchedBrandId}
						onChange={(brandId) => {
							setValue("brandId", brandId, { shouldValidate: true });
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
					{/* Catalog suggestion hint */}
					{showSuggestion && (
						<div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
							<Lightbulb className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
							<span>Catalog: &ldquo;{catalogSuggestion}&rdquo;</span>
							<button
								type="button"
								onClick={() => {
									setValue("model", catalogSuggestion, { shouldValidate: true, shouldDirty: true });
									onCatalogSuggestionUsed?.();
								}}
								className="ml-1 text-primary hover:underline font-medium"
							>
								Use this
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Row: Color + SKU */}
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

				<div>
					<div className="flex items-center justify-between">
						<Label className="text-sm font-medium text-slate-900">
							SKU{" "}
							<span className="text-xs text-muted-foreground font-normal">(Optional)</span>
						</Label>
						{/* Sync with eBay — edit mode only, shown when SKU is present */}
						{mode === "edit" && watchedSku && onSyncWithEbay && (
							<button
								type="button"
								onClick={handleSync}
								disabled={isSyncing}
								className="dense flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
							>
								<RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
								{isSyncing ? "Syncing…" : "Sync eBay"}
							</button>
						)}
					</div>
					<Input
						{...register("sku")}
						className="mt-2"
						placeholder="e.g., DZ5485-010"
					/>
					{errors.sku && (
						<p className="text-sm text-red-600 mt-1">
							{String(errors.sku.message || "Invalid SKU")}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
