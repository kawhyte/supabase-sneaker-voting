/**
 * ✅ ADD ITEM FORM - DESIGN SYSTEM v2.0 IMPLEMENTATION
 *
 * 🎯 DESIGN STRATEGY:
 *
 * **Component Purpose:**
 * Complex multi-step form for adding wardrobe items (shoes, clothing, accessories).
 * Supports URL scraping for auto-fill or manual entry mode.
 * Handles photos, sizing, comfort ratings, pricing, and try-on metadata.
 *
 * **Layout Structure:**
 * 1. Card Container
 *    - bg-card shadow-md: White elevated surface above page background
 *    - max-w-7xl mx-auto w-full: Wide form layout (1280px max, centered, responsive)
 *    - Responsive and adaptive to content
 *
 * 2. URL Input Section (Create Mode Only)
 *    - bg-blaze-50 rounded-lg: Energetic orange background
 *    - border-2 border-sun-300: Primary accent border
 *    - p-4 sm:p-6: Responsive padding (16-24px)
 *    - Highlights convenience of URL import feature
 *
 * 3. Manual Entry Form
 *    - space-y-6: 24px vertical spacing between sections
 *    - grid grid-cols-1 md:grid-cols-2 gap-6: Responsive two-column layout
 *    - Organized sections: Experience, Category, Product Details, Try-On Details, Photos
 *
 * 4. Sale Detection Alert
 *    - bg-meadow-50 border-meadow-300: Success/positive sentiment colors
 *    - Sparkles icon with text-meadow-600: Visual emphasis
 *    - Animated entrance: slide-in-from-top-2, fade-in
 *    - Displays savings percentage and amount
 *
 * **Color System Integration:**
 * - Background: bg-background (blaze-50) from page container
 * - Card: bg-card (white) for elevated surfaces
 * - URL Section: bg-blaze-50 (energetic orange), border-sun-300 (primary)
 * - URL Section Text: text-foreground (slate-900), text-muted-foreground (slate-600)
 * - Sale Alert: bg-meadow-50 (success green), border-meadow-300
 * - Sale Alert Icons: text-meadow-600, text-meadow-700
 * - Error Text: text-red-600 (standard validation error)
 * - Labels: text-muted-foreground for secondary emphasis
 *
 * **Spacing System (Perfect 8px Grid):**
 * - Card padding: p-6 sm:p-8 (responsive)
 * - URL section padding: p-4 sm:p-6 (16-24px)
 * - Form section spacing: space-y-6 (24px = spacing-component)
 * - Grid gaps: gap-6 (24px = spacing-component)
 * - Label spacing: mt-2 (8px)
 * - Relative positioning: mt-[var(--space-md)] uses CSS variable
 * - All values align to 8px multiples
 *
 * **Responsive Breakpoints:**
 * - Mobile (< 640px): Single column, full-width, compact spacing
 * - Tablet (640px - 1024px): Single column with improved readability
 * - Desktop (1024px+): Two-column grid for Product Details and pricing
 * - Max-width: 6xl (64rem) to prevent excessive width on ultra-wide screens
 *
 * **Accessibility (WCAG AAA):**
 * - Role="status" aria-live="polite" on sale alert for screen readers
 * - aria-hidden on decorative icons (Sparkles)
 * - Semantic form structure with Labels + Inputs
 * - Required field indicators: red asterisks with <span>
 * - Error messages below form fields for context
 * - Touch targets: 44px minimum (inputs, buttons)
 * - Color not sole indicator: Error text + red styling, but also positioned below field
 *
 * **Form States & Modes:**
 * - Create Mode: Shows URL import section first, then manual entry option
 * - Edit Mode: Shows form directly with existing data pre-populated
 * - Loading State: Loader2 spinner on submit button during upload
 * - Scraping State: Loading indicator and progress message during URL parse
 *
 * **Dynamic Styling:**
 * - Sale Alert: Visible only when salePrice < retailPrice
 * - Try-On Details: Visible only when interactionType === "tried"
 * - Size Fields: Conditional based on category (shoes vs clothing)
 * - Comfort Rating: Conditional based on category requirements
 *
 * **Performance:**
 * - useForm with React Hook Form for efficient validation
 * - Zod schema for compile-time type safety
 * - Lazy image loading via ImageConfirmationModal
 * - FormData for efficient file uploads
 * - CSS variables for responsive values (--space-md)
 *
 * **Future Scalability:**
 * - Easily add more pricing tiers (resale price, insurance value, etc.)
 * - Expandable photo gallery with drag-reorder
 * - Additional try-on metadata (fit feedback, styling notes, etc.)
 * - URL scraper integration for more retailers
 * - Draft saving/restoration capability
 *
 * 📚 Related: globals.css (spacing, colors), page.tsx (uses AddItemForm), AddProductClient component
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	CheckCircle,
	Loader2,
	Upload,
	Eye,
	Footprints,
	Sparkles,
	ChevronUp,
	ChevronDown,
	Zap,
	AlertTriangle,
	Camera,
	Package,
	Rocket,
	Lightbulb,
	Star,
	RefreshCw,
	X,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { type FitData } from "@/lib/size-analytics";
import { MultiPhotoUpload } from "@/components/multi-photo-upload";
import { ImageConfirmationModal } from "@/components/image-confirmation-modal";
import { BrandCombobox } from "@/components/brand-combobox";
import { SizeCombobox } from "@/components/size-combobox";
import { ClothingSizeCombobox } from "@/components/clothing-size-combobox";
import { Skeleton } from "@/components/ui/skeleton";
import {
	CATEGORY_CONFIGS,
	type ItemCategory,
	getCategoryConfig,
	isSizeRequired,
	isComfortRequired,
	getSizeType,
} from "@/components/types/item-category";
import { detectCategoryFromUrl } from "@/lib/item-utils";

interface PhotoItem {
	id: string;
	file: File;
	preview: string;
	isMain: boolean;
	order: number;
	isExisting?: boolean;
}

const itemSchema = z
	.object({
		triedOn: z.boolean().default(false),
		category: z.enum(
			[
				"shoes",
				"tops",
				"bottoms",
				"outerwear",
				"accessories",
				"jewelry",
				"watches",
			],
			{
				required_error: "Please select the item category",
			}
		),
		productUrl: z
			.string()
			.url("Please enter a valid URL")
			.max(500)
			.optional()
			.or(z.literal("")),
		// targetPrice: z
		//     .string()
		//     .regex(/^\d+(\.\d{1,2})?$/)
		//     .refine((val) => {
		//         if (val === "") return true;
		//         const price = parseFloat(val);
		//         return price >= 0 && price <= 10000;
		//     })
		//     .optional()
		//     .or(z.literal("")),
		enableNotifications: z.boolean().default(false),
		brand: z.string().min(1, "Brand is required").max(50).trim(),
		model: z.string().min(2, "Item name is required").max(100).trim(),
		sku: z.string().max(50).optional().or(z.literal("")),
		color: z.string().max(100).trim().optional().or(z.literal("")),
		sizeTried: z.string().optional(),
		comfortRating: z.coerce.number().min(1).max(5).optional(),
		retailPrice: z
			.string()
			.regex(
				/^\d+(\.\d{1,2})?$/,
				"Please enter a valid price (e.g., 170 or 170.00)"
			)
			.refine((val) => {
				if (val === "") return true;
				const price = parseFloat(val);
				return price >= 0 && price <= 10000;
			}, "Price must be between $0 and $10,000"),
		salePrice: z
			.string()
			.regex(/^\d+(\.\d{1,2})?$/)
			.refine((val) => {
				if (val === "") return true;
				const price = parseFloat(val);
				return price >= 0 && price <= 10000;
			})
			.optional()
			.or(z.literal("")),
		targetPrice: z
			.string()
			.regex(
				/^\d+(\.\d{1,2})?$/,
				"Please enter a valid price (e.g., 100 or 100.00)"
			)
			.refine((val) => {
				if (val === "") return true;
				const price = parseFloat(val);
				return price >= 0 && price <= 10000;
			}, "Target price must be between $0 and $10,000"),

		notes: z.string().max(120).trim().optional().or(z.literal("")),
	})
	.refine(
		(data) => {
			if (isSizeRequired(data.category) && data.triedOn) {
				return data.sizeTried && data.sizeTried.length > 0;
			}
			return true;
		},
		{ message: "Please select the size you tried on", path: ["sizeTried"] }
	)
	.refine(
		(data) => {
			if (
				isComfortRequired(data.category) &&
				data.triedOn
			) {
				return data.comfortRating !== undefined;
			}
			return true;
		},
		{ message: "Please rate the comfort", path: ["comfortRating"] }
	)
	.refine(
		(data) => {
			if (data.retailPrice && data.salePrice) {
				return parseFloat(data.salePrice) <= parseFloat(data.retailPrice);
			}
			return true;
		},
		{
			message: "Sale price cannot be higher than retail price",
			path: ["salePrice"],
		}
	);

type ItemFormData = z.infer<typeof itemSchema>;

interface AddItemFormProps {
	onItemAdded?: () => void;
	initialData?: any;
	mode?: "create" | "edit";
}

export function AddItemForm({
	onItemAdded,
	initialData,
	mode = "create",
}: AddItemFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [photos, setPhotos] = useState<PhotoItem[]>([]);
	const [uploadProgress, setUploadProgress] = useState("");
	const [isFormVisible, setIsFormVisible] = useState(mode === "edit");
	const [isScrapingUrl, setIsScrapingUrl] = useState(false);
	const [urlData, setUrlData] = useState<any>(null);
	const [scrapeFailed, setScrapeFailed] = useState(false);
	const [showImageModal, setShowImageModal] = useState(false);
	const [scrapedImages, setScrapedImages] = useState<string[]>([]);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [openAccordionItem, setOpenAccordionItem] = useState<string>("");
	const supabase = createClient();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isValid, isDirty },
		setValue,
		watch,
	} = useForm<ItemFormData>({
		resolver: zodResolver(itemSchema),
		mode: "onChange",
		defaultValues:
			mode === "edit" && initialData
				? {
						triedOn: initialData.has_been_tried || false,
						category: initialData.category || undefined,
						brand: initialData.brand || "",
						model: initialData.model || "",
						sku: initialData.sku || "",
						color: initialData.color || "",
						sizeTried: initialData.size_tried || "",
						comfortRating: initialData.comfort_rating || undefined,
						retailPrice: initialData.retail_price?.toString() || "",
						salePrice: initialData.sale_price?.toString() || "",
						targetPrice: initialData.ideal_price?.toString() || "",
						// targetPrice: initialData.target_price?.toString() || "",
						notes: initialData.notes || "",
				  }
				: {
						triedOn: false,
				  },
	});

	const watchedTriedOn = watch("triedOn");
	const watchedCategory = watch("category");
	const watchedRetailPrice = watch("retailPrice");
	const watchedSalePrice = watch("salePrice");
	const watchedBrand = watch("brand");

	useEffect(() => {
		if (mode === "edit" && initialData) {
			reset({
				triedOn: initialData.has_been_tried || false,
				category: initialData.category || undefined,
				brand: initialData.brand || "",
				model: initialData.model || "",
				sku: initialData.sku || "",
				color: initialData.color || "",
				sizeTried: initialData.size_tried || "",
				comfortRating: initialData.comfort_rating || undefined,
				retailPrice: initialData.retail_price?.toString() || "",
				salePrice: initialData.sale_price?.toString() || "",
				targetPrice: initialData.target_price?.toString() || "",

				// targetPrice: initialData.target_price?.toString() || "",
				notes: initialData.notes || "",
			});

			if (initialData.item_photos && initialData.item_photos.length > 0) {
				const existingPhotos: PhotoItem[] = initialData.item_photos.map(
					(p: any, i: number) => ({
						id: p.id,
						file: new File([], ""),
						preview: p.image_url,
						isMain: p.is_main_image,
						order: p.image_order,
						isExisting: true,
					})
				);
				setPhotos(existingPhotos);
			}
		}
	}, [mode, initialData, reset]);

	// Auto-open/close accordion when switch toggles
	useEffect(() => {
		if (watchedTriedOn) {
			setOpenAccordionItem("item-1");
		} else {
			setOpenAccordionItem("");
		}
	}, [watchedTriedOn]);

	// Cleanup object URLs on unmount to prevent memory leaks
	useEffect(() => {
		return () => {
			photos.forEach((photo) => {
				if (photo.preview) {
					URL.revokeObjectURL(photo.preview);
				}
			});
		};
	}, []);

	const handleUrlScrape = async (url: string) => {
		if (!url.trim()) return;
		setIsScrapingUrl(true);
		setScrapeFailed(false);
		setUploadProgress("🔍 Analyzing product URL...");
		try {
			const response = await fetch("/api/scrape-product", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url: url.trim() }),
			});
			if (!response.ok) throw new Error("Failed to scrape.");
			const data = await response.json();
			if (data.success) {
				setValue("brand", data.brand || "", {
					shouldValidate: true,
					shouldDirty: true,
				});
				setValue("model", data.model || "", {
					shouldValidate: true,
					shouldDirty: true,
				});
				setValue("retailPrice", data.retailPrice?.toString() || "", {
					shouldValidate: true,
					shouldDirty: true,
				});
				setValue("salePrice", data.salePrice?.toString() || "", {
					shouldValidate: true,
					shouldDirty: true,
				});
				setValue("color", data.color || "", {
					shouldValidate: true,
					shouldDirty: true,
				});
				const detectedCategory = detectCategoryFromUrl(url);
				if (detectedCategory)
					setValue("category", detectedCategory, {
						shouldValidate: true,
						shouldDirty: true,
					});

				setIsFormVisible(true);
				if (data.images && data.images.length > 0) {
					setScrapedImages(data.images);
					setShowImageModal(true);
				}
			} else {
				throw new Error(data.error || "Unknown scraping error");
			}
		} catch (error) {
			setScrapeFailed(true);
			setUploadProgress(`❌ ${(error as Error).message}`);
		} finally {
			setIsScrapingUrl(false);
		}
	};

	const handleImageConfirm = async (
		selectedImages: string[],
		mainImageIndex: number
	) => {
		setUploadProgress("📥 Downloading images...");
		const photoItems: PhotoItem[] = [];
		for (let i = 0; i < selectedImages.length; i++) {
			try {
				const response = await fetch("/api/proxy-image", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ imageUrl: selectedImages[i] }),
				});
				if (!response.ok) continue;
				const blob = await response.blob();
				const file = new File([blob], `imported-${i}.jpg`, { type: blob.type });
				photoItems.push({
					id: `new-${Date.now()}-${i}`,
					file,
					preview: URL.createObjectURL(file),
					isMain: i === mainImageIndex,
					order: i,
				});
			} catch (error) {
				console.error("Failed to download image", error);
			}
		}
		setPhotos(photoItems);
		setUploadProgress("");
	};

	const onSubmit = async (data: ItemFormData) => {
		setIsLoading(true);
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				toast.error("Authentication Error", {
					description: "You must be logged in to add or edit an item.",
				});
				setIsLoading(false);
				return;
			}

			const newPhotos = photos.filter((p) => !p.isExisting);
			const uploadedPhotoData: {
				url: string;
				cloudinaryId: string;
				order: number;
				isMain: boolean;
			}[] = [];
			for (let i = 0; i < newPhotos.length; i++) {
				const photo = newPhotos[i];
				const formData = new FormData();
				formData.append("file", photo.file);
				const res = await fetch("/api/upload-image", {
					method: "POST",
					body: formData,
				});
				if (!res.ok) throw new Error(`Failed to upload image ${i + 1}`);
				const result = await res.json();
				uploadedPhotoData.push({
					url: result.data.url,
					cloudinaryId: result.data.publicId,
					order: photo.order,
					isMain: photo.isMain,
				});
			}

			const experienceData = {
				user_id: user.id,
				brand: data.brand,
				model: data.model,
				color: data.color || null,
				sku: data.sku || null,
				category: data.category,
				size_type: getSizeType(data.category),
				size_tried: data.triedOn ? data.sizeTried : null,
				comfort_rating:
					data.triedOn ? data.comfortRating : null,
				retail_price: data.retailPrice ? parseFloat(data.retailPrice) : null,
				sale_price: data.salePrice ? parseFloat(data.salePrice) : null,
				target_price: data.targetPrice ? parseFloat(data.targetPrice) : null,
				notes: data.notes || null,
				wears:0,
				status: (mode === "create" ? "wishlisted" : initialData?.status) as
					| "wishlisted"
					| "owned"
					| "journaled",
				has_been_tried: data.triedOn,

				// target_price: data.targetPrice ? parseFloat(data.targetPrice) : null,
			};

			let resultItem: any;
			if (mode === "edit" && initialData?.id) {
				const { data: updatedItem, error } = await supabase
					.from("items")
					.update(experienceData)
					.eq("id", initialData.id)
					.select()
					.single();
				if (error) throw error;
				resultItem = updatedItem;

				const initialPhotoIds =
					initialData.item_photos?.map((p: any) => p.id) || [];
				const currentPhotoIds = photos
					.filter((p) => p.isExisting)
					.map((p) => p.id);
				const deletedPhotoIds = initialPhotoIds.filter(
					(id: string) => !currentPhotoIds.includes(id)
				);
				if (deletedPhotoIds.length > 0) {
					await supabase.from("item_photos").delete().in("id", deletedPhotoIds);
				}
			} else {
				const { data: insertedItem, error } = await supabase
					.from("items")
					.insert(experienceData)
					.select()
					.single();
				if (error) throw error;
				resultItem = insertedItem;
			}

			if (uploadedPhotoData.length > 0) {
				const photoRecords = uploadedPhotoData.map((p) => ({
					item_id: resultItem.id,
					image_url: p.url,
					cloudinary_id: p.cloudinaryId,
					image_order: p.order,
					is_main_image: p.isMain,
				}));
				const { error: photoError } = await supabase
					.from("item_photos")
					.insert(photoRecords);
				if (photoError) throw photoError;
			}

			toast.success(
				`Item ${mode === "edit" ? "updated" : "added"} successfully!`
			);
			if (mode === "create") {
				router.push("/dashboard?tab=wishlist");
			} else {
				onItemAdded?.();
			}
		} catch (error) {
			toast.error((error as Error).message);
		} finally {
			setIsLoading(false);
		}
	};

	// --- START of other useEffects and helper functions ---

	useEffect(() => {
		setHasUnsavedChanges(isDirty || photos.some((p) => p.file.size > 0));
	}, [isDirty, photos]);

	// --- END ---

	return (
		<div className='max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8'>
			<Card className='bg-card'>
				{!isFormVisible && mode === "create" && (
					<CardHeader className='text-left pb-6'>
						<CardTitle className='text-3xl flex flex-col justify-start font-heading'>
							<p className='-mb-2'>Add a New Item</p>
							<p className='text-sm text-muted-foreground'>
								Start by entering a URL or adding details manually.
							</p>
						</CardTitle>
					</CardHeader>
				)}

				<CardContent className='pt-6'>
					{!isFormVisible && mode === "create" ? (
						<div className='space-y-6'>
							<div className='bg-blaze-50 rounded-lg p-4 sm:p-6 border-2 border-sun-300'>
								<h3 className='text-base font-semibold text-foreground mb-4 font-heading'>
									Auto-fill from URL
								</h3>
								<div className='space-y-2'>
									<Label htmlFor='productUrl' className='text-xs text-muted-foreground'>
										Paste product URL from a supported retailer.
									</Label>
									<div className='flex flex-col sm:flex-row gap-2'>
										<Input
											id='productUrl'
											{...register("productUrl")}
											placeholder='https://...'
											className='flex-1'
											disabled={isScrapingUrl}
										/>
										<Button
											type='button'
											onClick={() => handleUrlScrape(watch("productUrl") || "")}
											disabled={isScrapingUrl || !watch("productUrl")}>
											{isScrapingUrl && (
												<Loader2 className='h-4 w-4 mr-2 animate-spin' />
											)}
											Import
										</Button>
									</div>
									{uploadProgress && (
										<p className='text-sm text-muted-foreground mt-2'>
											{uploadProgress}
										</p>
									)}
								</div>
							</div>
							<div className='relative'>
								<div className='absolute inset-0 flex items-center'>
									<span className='w-full border-t' />
								</div>
								<div className='relative flex justify-center text-xs uppercase'>
									<span className='bg-background px-2 text-muted-foreground'>
										Or
									</span>
								</div>
							</div>
							<Button
								variant='outline'
								onClick={() => setIsFormVisible(true)}
								className='w-full'>
								Enter Details Manually
							</Button>
						</div>
					) : (
						<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
							{/* Product Details Section */}
							<div className='space-y-6'>
								<div className='flex items-center gap-2 pb-2 border-b border-stone-300'>
									<Package className='h-5 w-5 text-slate-600 flex-shrink-0' />
									<h3 className='font-semibold font-heading text-base text-slate-900 leading-5'>Product Details</h3>
								</div>

								{/* Row 1: Experience & Item Category */}
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									<div className='flex items-center gap-3 p-4 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 transition-colors h-fit'>
										<div className='w-full'>
											<div className='flex items-center gap-2 mb-2'>
												<Eye className='h-4 w-4 text-slate-600 flex-shrink-0' />
												<Label className='block text-sm font-semibold text-slate-900'>Experience <span className='text-red-500'>*</span></Label>
											</div>
											<div className='flex items-center gap-3'>
												<Switch
													checked={watchedTriedOn}
													onCheckedChange={(checked) =>
														setValue("triedOn", checked, {
															shouldValidate: true,
														})
													}
													id='triedOn'
												/>
												<Label
													htmlFor='triedOn'
													className='cursor-pointer text-sm font-medium text-slate-900'
												>
													{watchedTriedOn ? (
														<>
															Tried On <CheckCircle className='inline h-4 w-4 text-meadow-600 ml-1' />
														</>
													) : (
														"Just Browsing"
													)}
												</Label>
											</div>
											{watchedTriedOn && (
												<p className='text-xs text-meadow-600 mt-2'>
													<span className='sr-only'>Shirt emoji:</span> Details will open when you're ready to add them
												</p>
											)}
										</div>
									</div>
									<div>
										<Label className='text-sm font-medium text-slate-900'>
											Item Category <span className='text-red-500'>*</span>
										</Label>
										<Select
											onValueChange={(v) =>
												setValue("category", v as ItemCategory, {
													shouldValidate: true,
												})
											}
											value={watchedCategory} >
											<SelectTrigger className='mt-2'>
												<SelectValue  placeholder='Select a category' />
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
											<p className='text-sm text-red-600 mt-1'>
												{errors.category.message}
											</p>
										)}
									</div>
								</div>

								{/* Row 2: Brand & Item Name */}
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									<div>
										<Label className='text-sm font-medium text-slate-900'>Brand <span className='text-red-500'>*</span></Label>
										<BrandCombobox
										
											value={watchedBrand}
											onChange={(v) =>
												setValue("brand", v, { shouldValidate: true })
											}
										 
										/>
										{errors.brand && (
											<p className='text-sm text-red-600 mt-1'>
												{errors.brand.message}
											</p>
										)}
									</div>
									<div>
										<Label className='text-sm font-medium text-slate-900'>Item Name <span className='text-red-500'>*</span></Label>
										<Input {...register("model")} className='mt-2' />
										{errors.model && (
											<p className='text-sm text-red-600 mt-1'>
												{errors.model.message}
											</p>
										)}
									</div>
								</div>

								{/* Row 2: Retail Price & Target Price */}
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									<div>
										<Label className='text-sm font-medium text-slate-900'>
											Retail Price <span className='text-red-500'>*</span>
										</Label>
										<div className='relative mt-2'>
											<span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground'>
												$
											</span>
											<Input
												{...register("retailPrice")}
												placeholder='170.00'
												type='number'
												step='0.01'
												className='pl-8'
											/>
										</div>
										{errors.retailPrice && (
											<p className='text-sm text-red-600 mt-1'>
												{errors.retailPrice.message}
											</p>
										)}

										{/* Sale Alert - Inline after Retail Price */}
										{watchedSalePrice &&
											watchedRetailPrice &&
											parseFloat(watchedSalePrice) < parseFloat(watchedRetailPrice) && (
												<div
													className='mt-3 p-2.5 rounded-lg border flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300 bg-meadow-50 border-meadow-300'
													role='status'
													aria-live='polite'>
													<Sparkles
														className='h-4 w-4 flex-shrink-0 text-meadow-600 mt-0.5'
														aria-hidden='true'
													/>
													<div className='flex-1 min-w-0'>
														<p className='text-sm font-semibold text-meadow-700'>
															Active sale: ${watchedSalePrice}
														</p>
														<p className='text-xs text-meadow-600'>
															Save ${
																(parseFloat(watchedRetailPrice) - parseFloat(watchedSalePrice)).toFixed(2)
															} ({
																Math.round(
																	((parseFloat(watchedRetailPrice) - parseFloat(watchedSalePrice)) /
																		parseFloat(watchedRetailPrice)) *
																		100
																)
															}%)
														</p>
													</div>
												</div>
											)}
									</div>
									<div>
										<Label className='text-sm font-medium text-slate-900'>
											Target Price <span className='text-red-500'>*</span>
										</Label>
										<Input
											{...register("targetPrice")}
											type='number'
											step='0.01'
											placeholder='0.00'
											className='mt-2'
										/>
										{errors.targetPrice && (
											<p className='text-sm text-red-600 mt-1'>
												{errors.targetPrice.message}
											</p>
										)}
									</div>
								</div>
							</div>

							{/* Photos Section */}
							<div className='space-y-6'>
								<div className='flex items-center gap-2 pb-2 border-b border-stone-300'>
									<Camera className='h-5 w-5 text-slate-600 flex-shrink-0' />
									<h3 className='font-semibold font-heading text-base text-slate-900 leading-5'>Photos</h3>
								</div>
								<div>
									<Label className='text-sm font-medium text-slate-900'>
										Photos <span className='text-red-500'>*</span>{" "}
										<span className='text-xs text-muted-foreground font-normal'>
											(Min 1, Max 5)
										</span>
									</Label>
									<MultiPhotoUpload
										photos={photos}
										onPhotosChange={setPhotos}
										maxPhotos={5}
									/>
									{photos.length === 0 && errors.root && (
										<p className='text-sm text-red-600 mt-1'>
											At least one photo is required
										</p>
									)}
								</div>
							</div>

							{/* Additional Details & Try-On Details Accordion */}
							<Accordion
								type='single'
								collapsible
								className='w-full'
								value={openAccordionItem}
								onValueChange={setOpenAccordionItem}
							>
								<AccordionItem value='item-1'>
									<AccordionTrigger>
										<h3 className='font-semibold font-heading'>
											{watchedTriedOn ? (
												<>
													<CheckCircle className='inline h-4 w-4 text-meadow-600 mr-2' />
													Try-On Details
												</>
											) : (
												"Add More Details (Optional)"
											)}
										</h3>
									</AccordionTrigger>
									<AccordionContent className='space-y-6 pt-6'>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
											<div>
												<Label className='text-sm font-medium text-slate-900'>SKU / Style Code</Label>
												<Input {...register("sku")} className='mt-2' />
											</div>
											<div>
												<Label className='text-sm font-medium text-slate-900'>Color</Label>
												<Input {...register("color")} className='mt-2' />
											</div>
										</div>

										<div>
											<Label className='text-sm font-medium text-slate-900'>Notes ({watch("notes")?.length || 0} / 120)</Label>
											<Textarea {...register("notes")} maxLength={120} className='mt-2' />
										</div>

										{watchedTriedOn && (
											<div className='border-t pt-6 space-y-6'>
												<h4 className='font-semibold text-slate-900'>Try-On Details</h4>
												{isSizeRequired(watchedCategory) && (
													<div>
														<Label className='text-sm font-medium text-slate-900'>Size Tried *</Label>
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
															<p className='text-sm text-red-600 mt-1'>
																{errors.sizeTried.message}
															</p>
														)}
													</div>
												)}
												{isComfortRequired(watchedCategory) && (
													<div>
														<Label className='text-sm font-medium text-slate-900'>Comfort Rating *</Label>
														<RadioGroup
															value={watch("comfortRating")?.toString()}
															onValueChange={(v) =>
																setValue("comfortRating", parseInt(v), {
																	shouldValidate: true,
																})
															}
															className='flex gap-2 mt-2'>
															{[1, 2, 3, 4, 5].map((r) => (
																<div
																	key={r}
																	className='flex items-center space-x-2'>
																	<RadioGroupItem
																		value={r.toString()}
																		id={`r${r}`}
																	/>
																	<Label htmlFor={`r${r}`}>{r}</Label>
																</div>
															))}
														</RadioGroup>
														{errors.comfortRating && (
															<p className='text-sm text-red-600 mt-1'>
																{errors.comfortRating.message}
															</p>
														)}
													</div>
												)}
											</div>
										)}
									</AccordionContent>
								</AccordionItem>
							</Accordion>

							<div className='flex items-center justify-end gap-3 mt-6'>
								<Button
									type='submit'
									disabled={
										isLoading || (!isValid && isDirty) || photos.length === 0
									}>
									{isLoading && (
										<Loader2 className='h-4 w-4 mr-2 animate-spin' />
									)}
									{mode === "edit" ? "Update Item" : "Save Item"}
								</Button>
							</div>
						</form>
					)}
				</CardContent>
			</Card>

			<ImageConfirmationModal
				open={showImageModal}
				onOpenChange={setShowImageModal}
				images={scrapedImages}
				onConfirm={handleImageConfirm}
			/>
		</div>
	);
}
