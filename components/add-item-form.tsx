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
import { Textarea } from "@/components/ui/textarea";
import {
	CheckCircle,
	Loader2,
	Upload,
	Link,
	User,
	Eye,
	Footprints,
	Sparkles,
	ChevronUp,
	ChevronDown,
	Zap,
	UserCircle,
	AlertTriangle,
	Camera,
	Rocket,
	Lightbulb,
	Star,
	RefreshCw,
	X,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import {
	calculateSizeRecommendations,
	type FitData,
} from "@/lib/size-analytics";
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

// Enhanced form schema with SKU and sale price
const itemSchema = z
	.object({
		userName: z.enum(["Kenny", "Rene"], {
			required_error: "Please select who is tracking this item",
		}),
		interactionType: z.enum(["seen", "tried"], {
			required_error: "Please select whether you saw or tried on this item",
		}),
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
		// Smart Import fields
		productUrl: z
			.string()
			.url("Please enter a valid URL (e.g., https://www.nike.com/...)")
			.max(500, "URL must be less than 500 characters")
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
			}, "Target price must be between $0 and $10,000")
			.optional()
			.or(z.literal("")),
		enableNotifications: z.boolean().default(false),
		// Product fields
		brand: z
			.string()
			.min(1, "Please select or enter a brand name")
			.max(50, "Brand name must be less than 50 characters")
			.trim(),
		model: z
			.string()
			.min(2, "Please enter the item model (e.g., Air Jordan 1, Yeezy 350)")
			.max(100, "Model name must be less than 100 characters")
			.trim(),
		sku: z
			.string()
			.max(50, "SKU must be less than 50 characters")
			.regex(
				/^[A-Za-z0-9-]*$/,
				"SKU can only contain letters, numbers, and hyphens"
			)
			.optional()
			.or(z.literal("")),
		color: z
			.string()
			.max(100, "Color must be less than 100 characters")
			.trim()
			.optional()
			.or(z.literal("")),
		// Try-on specific (conditional)
		sizeTried: z.string().optional(),
		comfortRating: z.coerce.number().min(1).max(5).optional(),
		// General fields
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
			}, "Price must be between $0 and $10,000")
			.optional()
			.or(z.literal("")),
		salePrice: z
			.string()
			.regex(
				/^\d+(\.\d{1,2})?$/,
				"Please enter a valid price (e.g., 120 or 120.00)"
			)
			.refine((val) => {
				if (val === "") return true;
				const price = parseFloat(val);
				return price >= 0 && price <= 10000;
			}, "Price must be between $0 and $10,000")
			.optional()
			.or(z.literal("")),
		idealPrice: z
			.string()
			.regex(
				/^\d+(\.\d{1,2})?$/,
				"Please enter a valid price (e.g., 100 or 100.00)"
			)
			.refine((val) => {
				if (val === "") return true;
				const price = parseFloat(val);
				return price >= 0 && price <= 10000;
			}, "Price must be between $0 and $10,000")
			.optional()
			.or(z.literal("")),
		notes: z
			.string()
			.max(120, "Notes must be less than 120 characters")
			.trim()
			.optional()
			.or(z.literal("")),
	})
	.refine(
		(data) => {
			// Size is required for categories that require it AND when tried on
			const categoryConfig = CATEGORY_CONFIGS[data.category];
			if (categoryConfig?.requiresSize && data.interactionType === "tried") {
				return data.sizeTried && data.sizeTried.length > 0;
			}
			return true;
		},
		{
			message:
				"Please select the size you tried on - this helps track your perfect fit",
			path: ["sizeTried"],
		}
	)
	.refine(
		(data) => {
			// Comfort rating is required for shoes when tried on
			const categoryConfig = CATEGORY_CONFIGS[data.category];
			if (categoryConfig?.requiresComfort && data.interactionType === "tried") {
				return (
					data.comfortRating !== undefined &&
					data.comfortRating >= 1 &&
					data.comfortRating <= 5
				);
			}
			return true;
		},
		{
			message: "Please rate the comfort - how did they feel?",
			path: ["comfortRating"],
		}
	)
	.refine(
		(data) => {
			// Sale price cannot be higher than retail price
			if (data.retailPrice && data.salePrice) {
				const retail = parseFloat(data.retailPrice);
				const sale = parseFloat(data.salePrice);
				return sale <= retail;
			}
			return true;
		},
		{
			message: "Sale price cannot be higher than retail price",
			path: ["salePrice"],
		}
	);

type ItemFormData = z.infer<typeof itemSchema>;

// Fit rating descriptions
const FIT_RATINGS = [
	{
		value: 1,
		label: "Too Small",
		icon: "🔴",
		description: "Cramped, uncomfortable",
	},
	{ value: 2, label: "Snug", icon: "🟠", description: "Tight but wearable" },
	{ value: 3, label: "Perfect", icon: "🟢", description: "Just right!" },
	{ value: 4, label: "Loose", icon: "🟡", description: "A bit roomy" },
	{ value: 5, label: "Too Big", icon: "🔴", description: "Swimming in them" },
];

interface AddItemFormProps {
	onItemAdded?: () => void;
	initialData?: any; // The existing item data for edit mode
	mode?: "create" | "edit";
}

export function AddItemForm({
	onItemAdded,
	initialData,
	mode = "create" as "create" | "edit",
}: AddItemFormProps = {}) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");
	const [sizePreferences, setSizePreferences] = useState<
		Record<string, string>
	>({});
	const [photos, setPhotos] = useState<PhotoItem[]>([]);
	const [uploadProgress, setUploadProgress] = useState("");
	const [fitData, setFitData] = useState<FitData[]>([]);

	// Smart Import states
	const [isScrapingUrl, setIsScrapingUrl] = useState(false);
	const [urlData, setUrlData] = useState<any>(null);
	const [smartImportExpanded, setSmartImportExpanded] = useState(true); // Expanded by default
	const [scrapeFailed, setScrapeFailed] = useState(false);
	const [showImageModal, setShowImageModal] = useState(false);
	const [scrapedImages, setScrapedImages] = useState<string[]>([]);

	// Phase 5: Form State Management
	const [isDraftRestored, setIsDraftRestored] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
	const [showDraftNotification, setShowDraftNotification] = useState(false);

	const supabase = createClient();

	// Prepare default values - either from initialData or defaults
	const getDefaultValues = () => {
		if (mode === "edit" && initialData) {
			return {
				userName: initialData.user_name || "Kenny",
				interactionType: initialData.has_been_tried ? "tried" : "seen",
				category: initialData.category || "shoes",
				brand: initialData.brand || "",
				model: initialData.model || "",
				sku: initialData.sku || "",
				color: initialData.color || "",
				sizeTried: initialData.size_tried || "",
				comfortRating: initialData.comfort_rating || undefined,
				retailPrice: initialData.retail_price?.toString() || "",
				salePrice: initialData.sale_price?.toString() || "",
				idealPrice: initialData.ideal_price?.toString() || "",
				targetPrice: initialData.target_price?.toString() || "",
				notes: initialData.notes || "",
				productUrl: "",
				enableNotifications: false,
			};
		}

		return {
			userName: "Kenny" as const,
			interactionType: "seen" as const,
			category: undefined,
			brand: "",
			model: "",
			sku: "",
			color: "",
			sizeTried: "",
			comfortRating: undefined,
			retailPrice: "",
			salePrice: "",
			idealPrice: "",
			targetPrice: "",
			notes: "",
			productUrl: "",
			enableNotifications: false,
		};
	};

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
		defaultValues: getDefaultValues(),
	});

	const watchedUser = watch("userName");
	const watchedBrand = watch("brand");
	const watchedInteractionType = watch("interactionType");
	const watchedCategory = watch("category");
	const watchedRetailPrice = watch("retailPrice");
	const watchedSalePrice = watch("salePrice");

	// Calculate discount percentage
	const discountPercentage =
		watchedRetailPrice && watchedSalePrice
			? Math.round(
					((parseFloat(watchedRetailPrice) - parseFloat(watchedSalePrice)) /
						parseFloat(watchedRetailPrice)) *
						100
			  )
			: 0;

	// CRITICAL FIX: Reset form when initialData changes in edit mode
	useEffect(() => {
		if (mode === "edit" && initialData) {
			console.log(
				"🔄 Edit mode detected - resetting form with initialData:",
				initialData
			);

			const formData = {
				userName: initialData.user_name || "Kenny",
				interactionType: initialData.has_been_tried ? "tried" : "seen",
				category: initialData.category || "shoes",
				brand: initialData.brand || "",
				model: initialData.model || "",
				sku: initialData.sku || "",
				color: initialData.color || "",
				sizeTried: initialData.size_tried || "",
				comfortRating: initialData.comfort_rating || undefined,
				retailPrice: initialData.retail_price?.toString() || "",
				salePrice: initialData.sale_price?.toString() || "",
				idealPrice: initialData.ideal_price?.toString() || "",
				targetPrice: initialData.target_price?.toString() || "",
				notes: initialData.notes || "",
				productUrl: "",
				enableNotifications: false,
			};

			console.log("📝 Resetting form with data:", formData);
			reset(formData);

			// Load existing photos in edit mode
			if (initialData.item_photos && initialData.item_photos.length > 0) {
				console.log("📸 Loading existing photos:", initialData.item_photos);
				const existingPhotoItems: PhotoItem[] = initialData.item_photos.map(
					(photo: any, index: number) => ({
						id: photo.id || `existing-${index}`,
						file: new File([], ""), // Empty file object since photo is already uploaded
						preview: photo.image_url,
						isMain: photo.is_main_image || false,
						order: photo.image_order || index,
						isExisting: true, // Mark as existing photo
					})
				);
				setPhotos(existingPhotoItems);
			}
		}
	}, [mode, initialData, reset]);

	// Load fit data on component mount and restore draft in create mode
	useEffect(() => {
		loadFitData();

		// Skip draft restoration in edit mode
		if (mode === "create") {
			restoreDraft();
		}
	}, [mode]);

	// Track unsaved changes
	useEffect(() => {
		setHasUnsavedChanges(isDirty || photos.length > 0);
	}, [isDirty, photos]);

	// Auto-save draft every 30 seconds (only in create mode)
	useEffect(() => {
		if (mode === "create" && hasUnsavedChanges) {
			const autoSaveInterval = setInterval(() => {
				saveDraft();
			}, 30000); // 30 seconds

			return () => clearInterval(autoSaveInterval);
		}
	}, [mode, hasUnsavedChanges, watch, photos, urlData]);

	// Unsaved changes warning before page unload
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (hasUnsavedChanges && !isLoading) {
				e.preventDefault();
				e.returnValue = "";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [hasUnsavedChanges, isLoading]);

	// Load size preferences when user/brand changes
	useEffect(() => {
		if (watchedUser && watchedBrand) {
			loadSizePreference(watchedUser, watchedBrand);
		}
	}, [watchedUser, watchedBrand]);

	// Phase 5: Draft Management Functions
	const saveDraft = () => {
		try {
			const formData = watch();
			const draft = {
				formData,
				urlData,
				timestamp: new Date().toISOString(),
				photoCount: photos.length,
			};
			localStorage.setItem("item-form-draft", JSON.stringify(draft));
			setLastSavedTime(new Date());
			console.log("📝 Draft auto-saved at", new Date().toLocaleTimeString());
		} catch (error) {
			console.error("Failed to save draft:", error);
		}
	};

	const restoreDraft = () => {
		try {
			const savedDraft = localStorage.getItem("item-form-draft");
			if (!savedDraft) return;

			const draft = JSON.parse(savedDraft);
			const draftAge = Date.now() - new Date(draft.timestamp).getTime();
			const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

			// Only restore drafts less than 7 days old
			if (draftAge > maxAge) {
				localStorage.removeItem("item-form-draft");
				return;
			}

			// Restore form data
			Object.keys(draft.formData).forEach((key) => {
				const value = draft.formData[key];
				if (value !== undefined && value !== null && value !== "") {
					setValue(key as any, value, { shouldDirty: false });
				}
			});

			// Restore URL data
			if (draft.urlData) {
				setUrlData(draft.urlData);
			}

			setIsDraftRestored(true);
			setShowDraftNotification(true);

			// Hide notification after 5 seconds
			setTimeout(() => setShowDraftNotification(false), 5000);

			console.log(
				"✅ Draft restored from",
				new Date(draft.timestamp).toLocaleString()
			);
		} catch (error) {
			console.error("Failed to restore draft:", error);
			localStorage.removeItem("item-form-draft");
		}
	};

	const clearDraft = () => {
		try {
			localStorage.removeItem("item-form-draft");
			setIsDraftRestored(false);
			setShowDraftNotification(false);
			setLastSavedTime(null);
			console.log("🗑️ Draft cleared");
		} catch (error) {
			console.error("Failed to clear draft:", error);
		}
	};

	const loadFitData = async () => {
		try {
			const { data, error } = await supabase
				.from("items")
				.select("user_name, brand, size_tried, comfort_rating")
				.eq("category", "shoes") // Only load fit data for shoes
				.eq("has_been_tried", true)
				.not("size_tried", "is", null)
				.not("comfort_rating", "is", null);

			if (error) {
				// Silently handle error - fit recommendations are optional feature
				console.warn(
					"Could not load fit data for recommendations:",
					error.message || "Unknown error"
				);
				return;
			}

			if (!data || data.length === 0) {
				// No fit data available yet - this is normal for new installations
				return;
			}

			// Transform to FitData format with frequency calculation
			const transformedData: FitData[] = [];
			const groupedData = data.reduce((acc, item) => {
				const key = `${item.user_name}-${item.brand}-${item.size_tried}-${item.comfort_rating}`;
				if (!acc[key]) {
					acc[key] = { ...item, frequency: 0 };
				}
				acc[key].frequency += 1;
				return acc;
			}, {} as Record<string, any>);

			Object.values(groupedData).forEach((item: any) => {
				transformedData.push({
					user_name: item.user_name,
					brand: item.brand,
					size_tried: item.size_tried,
					fit_rating: item.comfort_rating, // Map comfort_rating to fit_rating for compatibility
					frequency: item.frequency,
				});
			});

			setFitData(transformedData);
		} catch (error) {
			// Gracefully handle any unexpected errors
			console.warn("Unexpected error loading fit data:", error);
		}
	};

	const loadSizePreference = async (userName: string, brand: string) => {
		try {
			const { data } = await supabase
				.from("size_preferences")
				.select("preferred_size")
				.eq("user_name", userName)
				.eq("brand", brand)
				.limit(1)
				.single();

			if (data?.preferred_size) {
				setValue("sizeTried", data.preferred_size);
				setSizePreferences({ [brand]: data.preferred_size });
			}
		} catch (error) {
			// No preference found, that's okay
		}
	};

	// URL scraping function with retry logic
	const handleUrlScrape = async (
		url: string,
		retryCount: number = 0
	): Promise<void> => {
		if (!url.trim()) return;

		const maxRetries = 2;
		const isRetrying = retryCount > 0;

		setIsScrapingUrl(true);
		setScrapeFailed(false);

		if (isRetrying) {
			setUploadProgress(`🔄 Retry attempt ${retryCount}/${maxRetries}...`);
		} else {
			setUploadProgress("🔍 Analyzing product URL...");
		}

		try {
			const response = await fetch("/api/scrape-product", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url: url.trim() }),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || `HTTP ${response.status}`);
			}

			const data = await response.json();

			console.log("🔍 Scraped data received:", data);

			if (data.success) {
				// Clean and trim all text data
				const cleanBrand = data.brand
					? data.brand
							.replace(/[\n\t\r]/g, " ")
							.replace(/\s+/g, " ")
							.trim()
					: "";
				const cleanModel = data.model
					? data.model
							.replace(/[\n\t\r]/g, " ")
							.replace(/\s+/g, " ")
							.trim()
					: "";
				const cleanColor = data.color
					? data.color
							.replace(/[\n\t\r]/g, " ")
							.replace(/\s+/g, " ")
							.trim()
					: "";

				// Auto-detect category from URL (only if user hasn't selected one yet)
				if (!watchedCategory) {
					const detectedCategory = detectCategoryFromUrl(url);
					if (detectedCategory) {
						console.log("✅ Auto-detected category:", detectedCategory);
						setValue("category", detectedCategory, {
							shouldValidate: true,
							shouldDirty: true,
							shouldTouch: true,
						});
					}
				} else {
					console.log(
						"ℹ️ User already selected category:",
						watchedCategory,
						"- skipping auto-detection"
					);
				}

				// Extract store name from URL
				const storeName = new URL(url).hostname
					.replace("www.", "")
					.split(".")[0];
				const capitalizedStoreName =
					storeName.charAt(0).toUpperCase() + storeName.slice(1);

				// Store the scraped data for display
				setUrlData({
					title: `${cleanBrand} ${cleanModel}`.trim(),
					price: data.retailPrice,
					image: data.images?.[0],
					storeName: capitalizedStoreName,
					images: data.images || [],
				});

				// Auto-fill form with scraped data
				setTimeout(() => {
					if (cleanBrand) {
						console.log("✅ Setting brand:", cleanBrand);
						setValue("brand", cleanBrand, {
							shouldValidate: true,
							shouldDirty: true,
							shouldTouch: true,
						});
					}

					if (cleanModel) {
						console.log("✅ Setting model:", cleanModel);
						setValue("model", cleanModel, {
							shouldValidate: true,
							shouldDirty: true,
							shouldTouch: true,
						});
					}

					if (data.sku) {
						const cleanSku = data.sku
							.replace(/[\n\t\r]/g, " ")
							.replace(/\s+/g, " ")
							.trim();
						console.log("✅ Setting SKU:", cleanSku);
						setValue("sku", cleanSku, {
							shouldValidate: true,
							shouldDirty: true,
							shouldTouch: true,
						});
					}

					if (cleanColor && cleanColor !== "Standard") {
						console.log("✅ Setting color:", cleanColor);
						setValue("color", cleanColor, {
							shouldValidate: true,
							shouldDirty: true,
							shouldTouch: true,
						});
					}

					if (data.retailPrice) {
						console.log("✅ Setting retail price:", data.retailPrice);
						setValue("retailPrice", data.retailPrice.toString(), {
							shouldValidate: true,
							shouldDirty: true,
							shouldTouch: true,
						});
					}

					if (data.salePrice) {
						console.log("✅ Setting sale price:", data.salePrice);
						setValue("salePrice", data.salePrice.toString(), {
							shouldValidate: true,
							shouldDirty: true,
							shouldTouch: true,
						});
					}
				}, 100);

				// Show image confirmation modal if images were found
				if (data.images && data.images.length > 0) {
					console.log("🖼️ Scraped images:", data.images);
					setScrapedImages(data.images);
					setShowImageModal(true);
					setUploadProgress(
						"📸 Found " + data.images.length + " images - review and import"
					);
				} else {
					console.log("⚠️ No images found in scraped data");
					setUploadProgress("✅ Product data imported!");
					setTimeout(() => setUploadProgress(""), 2000);
				}
			} else {
				// Scraping failed, attempt retry if under max attempts
				if (retryCount < maxRetries) {
					console.warn(
						`⚠️ Scraping failed (attempt ${retryCount + 1}), retrying...`
					);
					await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
					return handleUrlScrape(url, retryCount + 1);
				}

				// Max retries exceeded
				console.error(
					"❌ Scraping failed after",
					maxRetries,
					"attempts:",
					data.error
				);
				setScrapeFailed(true);

				// Provide specific error message based on error type
				let errorMessage = "❌ Could not extract product data. ";
				if (data.error?.includes("HTTP 404")) {
					errorMessage += "Product page not found. Please check the URL.";
				} else if (
					data.error?.includes("HTTP 403") ||
					data.error?.includes("HTTP 401")
				) {
					errorMessage +=
						"Website blocked auto-import. Please enter details manually below.";
				} else if (data.error?.includes("timeout")) {
					errorMessage += "Request timed out. Try again or enter manually.";
				} else {
					errorMessage += "Please enter details manually below.";
				}

				setUploadProgress(errorMessage);
				setTimeout(() => setUploadProgress(""), 10000);
			}
		} catch (error) {
			// Network or fetch error, attempt retry if under max attempts
			if (retryCount < maxRetries) {
				console.warn(
					`⚠️ Network error (attempt ${retryCount + 1}), retrying...`
				);
				await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
				return handleUrlScrape(url, retryCount + 1);
			}

			// Max retries exceeded
			console.error(
				"❌ URL scraping error after",
				maxRetries,
				"attempts:",
				error
			);
			setScrapeFailed(true);

			// Provide specific error message
			let errorMessage = "❌ ";
			const errorMsg = (error as Error).message?.toLowerCase() || "";

			if (
				errorMsg.includes("failed to fetch") ||
				errorMsg.includes("network")
			) {
				errorMessage += "Network error. Check your connection.";
			} else if (errorMsg.includes("invalid url")) {
				errorMessage += "Invalid URL format.";
			} else if (errorMsg.includes("cors")) {
				errorMessage += "Website blocked request.";
			} else {
				errorMessage += "Could not analyze URL. Please fill manually.";
			}

			setUploadProgress(errorMessage);
			setTimeout(() => setUploadProgress(""), 7000);
		} finally {
			setIsScrapingUrl(false);
		}
	};

	// Handle image confirmation from modal
	const handleImageConfirm = async (
		selectedImages: string[],
		mainImageIndex: number
	) => {
		console.log(
			"📸 User selected",
			selectedImages.length,
			"images, main index:",
			mainImageIndex
		);

		setUploadProgress("📥 Downloading images...");

		try {
			const photoItems: PhotoItem[] = [];

			// Convert each URL to a File object via proxy
			for (let i = 0; i < selectedImages.length; i++) {
				const imageUrl = selectedImages[i];

				try {
					// Fetch the image via proxy API to avoid CORS issues
					const response = await fetch("/api/proxy-image", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ imageUrl }),
					});

					if (!response.ok) throw new Error(`Failed to fetch image ${i + 1}`);

					// Get the blob
					const blob = await response.blob();

					// Determine filename and type
					const urlObj = new URL(imageUrl);
					const pathname = urlObj.pathname;
					const extension = pathname.split(".").pop() || "jpg";
					const filename = `imported-image-${i + 1}.${extension}`;

					// Create File from blob
					const file = new File([blob], filename, {
						type: blob.type || "image/jpeg",
					});

					// Create preview URL
					const preview = URL.createObjectURL(file);

					// Add to photos array
					photoItems.push({
						id: `imported-${Date.now()}-${i}`,
						file,
						preview,
						isMain: i === mainImageIndex,
						order: i,
					});

					setUploadProgress(
						`📥 Downloaded ${i + 1}/${selectedImages.length} images...`
					);
				} catch (error) {
					console.error(`Failed to download image ${i + 1}:`, error);
					// Continue with other images
				}
			}

			if (photoItems.length > 0) {
				setPhotos(photoItems);
				setUploadProgress(
					`✅ ${photoItems.length} image${
						photoItems.length > 1 ? "s" : ""
					} imported!`
				);
			} else {
				setUploadProgress(
					"❌ Failed to import images. Please upload manually."
				);
			}

			setTimeout(() => setUploadProgress(""), 3000);
		} catch (error) {
			console.error("Error importing images:", error);
			setUploadProgress("❌ Failed to import images. Please upload manually.");
			setTimeout(() => setUploadProgress(""), 3000);
		}
	};

	// Create price monitor function
	const createPriceMonitor = async (data: ItemFormData) => {
		if (!data.productUrl || !data.userName) return;

		try {
			const response = await fetch("/api/create-monitor", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					url: data.productUrl,
					userName: data.userName,
					targetPrice: data.targetPrice ? parseFloat(data.targetPrice) : null,
					enableNotifications: data.enableNotifications || false,
				}),
			});

			if (response.ok) {
				return true;
			}
		} catch (error) {
			console.error("Failed to create price monitor:", error);
		}
		return false;
	};

	const onSubmit = async (data: ItemFormData) => {
		setIsLoading(true);
		setSuccessMessage("");

		try {
			let mainImageUrl = null;
			let mainCloudinaryId = null;
			const uploadedPhotos = [];
			const existingPhotoIds: string[] = [];

			// In edit mode, track existing photo IDs to identify deletions
			if (mode === "edit" && initialData?.item_photos) {
				initialData.item_photos.forEach((photo: any) => {
					if (photo.id) existingPhotoIds.push(photo.id);
				});
			}

			// Upload all photos to Cloudinary if provided
			if (photos.length > 0) {
				setUploadProgress(
					`📤 Uploading ${photos.length} photo${
						photos.length > 1 ? "s" : ""
					}...`
				);

				for (let i = 0; i < photos.length; i++) {
					const photo = photos[i];

					// Check if this is an existing photo
					if (photo.isExisting && photo.file.size === 0) {
						console.log(
							`⏭️ Keeping existing photo ${i + 1} (ID: ${photo.id})`
						);
						// Don't upload, this photo already exists in the database
						continue;
					}

					const formData = new FormData();
					formData.append("file", photo.file);

					const uploadResponse = await fetch("/api/upload-image", {
						method: "POST",
						body: formData,
					});

					if (!uploadResponse.ok) {
						const error = await uploadResponse.json();
						throw new Error(error.error || `Failed to upload photo ${i + 1}`);
					}

					const uploadResult = await uploadResponse.json();

					// Store uploaded photo info
					uploadedPhotos.push({
						url: uploadResult.data.url,
						cloudinaryId: uploadResult.data.publicId,
						order: photo.order,
						isMain: photo.isMain,
					});

					// Keep track of main image for backward compatibility
					if (photo.isMain) {
						mainImageUrl = uploadResult.data.url;
						mainCloudinaryId = uploadResult.data.publicId;
					}

					setUploadProgress(
						`📤 Uploaded ${i + 1}/${photos.length} photo${
							photos.length > 1 ? "s" : ""
						}...`
					);
				}

				setUploadProgress(
					`✅ ${photos.length} photo${photos.length > 1 ? "s" : ""} uploaded!`
				);
			}

			const experienceData = {
				user_name: data.userName,
				brand: data.brand,
				model: data.model,
				color: data.color || "Standard",
				sku: data.sku || null,
				category: data.category,
				size_type: getSizeType(data.category),
				// Only include try-on specific fields if actually tried on
				size_tried: data.interactionType === "tried" ? data.sizeTried : null,
				comfort_rating:
					data.interactionType === "tried" ? data.comfortRating || null : null,
				// Always optional fields
				retail_price: data.retailPrice ? parseFloat(data.retailPrice) : null,
				sale_price: data.salePrice ? parseFloat(data.salePrice) : null,
				ideal_price: data.idealPrice ? parseFloat(data.idealPrice) : null,
				notes: data.notes || null,
				try_on_date: new Date().toISOString().split("T")[0],
				image_url: mainImageUrl,
				cloudinary_id: mainCloudinaryId,
				// Explicitly set wears to null (only shoes can have wears tracking)
				wears: null,

				// Current schema fields
				status: "wishlisted" as const,
				has_been_tried: data.interactionType === "tried",
				target_price: data.targetPrice ? parseFloat(data.targetPrice) : null,
			};

			let resultItem: any = null;
			let dbError: any = null;

			if (mode === "edit" && initialData?.id) {
				// UPDATE existing item
				const { data: updatedItem, error } = await supabase
					.from("items")
					.update(experienceData)
					.eq("id", initialData.id)
					.select()
					.single();

				resultItem = updatedItem;
				dbError = error;
			} else {
				// INSERT new item
				const { data: insertedItem, error } = await supabase
					.from("items")
					.insert(experienceData)
					.select()
					.single();

				resultItem = insertedItem;
				dbError = error;
			}

			if (dbError) {
				console.error("Database error:", dbError);
				throw dbError;
			}

			// Handle photo deletions in edit mode
			if (mode === "edit" && initialData?.id && existingPhotoIds.length > 0) {
				const currentPhotoIds = photos
					.filter((p) => p.isExisting)
					.map((p) => p.id)
					.filter((id) => !id.startsWith("existing-"));

				const deletedPhotoIds = existingPhotoIds.filter(
					(id) => !currentPhotoIds.includes(id)
				);

				if (deletedPhotoIds.length > 0) {
					console.log("🗑️ Deleting", deletedPhotoIds.length, "removed photos...");

					// Delete from database
					const { error: deleteError } = await supabase
						.from("item_photos")
						.delete()
						.in("id", deletedPhotoIds);

					if (deleteError) {
						console.error("❌ Failed to delete photos:", deleteError);
						toast.error("Failed to delete some photos", {
							description: deleteError.message,
							duration: 5000,
						});
					} else {
						console.log("✅ Successfully deleted photos from database");
					}
				}
			}

			// Insert all photos into item_photos table (only new photos)
			const newPhotos = uploadedPhotos.filter((photo) => photo.cloudinaryId);
			if (newPhotos.length > 0 && resultItem) {
				console.log(
					"📸 Saving",
					newPhotos.length,
					"new photos to item_photos table..."
				);
				const photoRecords = newPhotos.map((photo) => ({
					item_id: resultItem.id,
					image_url: photo.url,
					cloudinary_id: photo.cloudinaryId,
					image_order: photo.order,
					is_main_image: photo.isMain,
				}));

				console.log("📸 Photo records to insert:", photoRecords);

				const { data: insertedPhotos, error: photosError } = await supabase
					.from("item_photos")
					.insert(photoRecords)
					.select();

				if (photosError) {
					console.error("❌ Failed to save photos:", photosError);
					console.error(
						"❌ Full error details:",
						JSON.stringify(photosError, null, 2)
					);
					toast.error("Photos uploaded but failed to link to item", {
						description: photosError.message || "Unknown error - check console",
						duration: 5000,
					});
				} else {
					console.log(
						"✅ Successfully saved",
						insertedPhotos?.length,
						"photos to database"
					);
				}
			} else {
				console.log(
					"⚠️ No new photos to save. newPhotos.length:",
					newPhotos.length,
					"resultItem:",
					!!resultItem
				);
			}

			// Create price monitor if URL provided (only in create mode)
			if (mode === "create" && data.productUrl) {
				setUploadProgress("📊 Setting up price monitoring...");
				const monitorCreated = await createPriceMonitor(data);
				if (monitorCreated) {
					setUploadProgress("🎯 Price monitoring enabled!");
				}
			}

			// Show success toast with item context
			const itemName = `${data.brand} ${data.model}`;
			const categoryLabel = getCategoryConfig(data.category)?.label || "Item";

			if (mode === "edit") {
				toast.success(`${itemName} updated!`, {
					description: "Your changes have been saved",
					duration: 5000,
				});
			} else {
				toast.success(`${itemName} added!`, {
					description:
						data.interactionType === "tried"
							? `Try-on experience saved for this ${categoryLabel.toLowerCase()}`
							: data.productUrl
							? "Added with price monitoring enabled"
							: `${categoryLabel} added to your watchlist`,
					duration: 5000, // Persist during redirect and on dashboard
				});
			}

			// Clear form and redirect after 800ms (fast but readable)
			setTimeout(() => {
				reset();
				setSuccessMessage("");
				setUploadProgress("");
				setPhotos([]);
				setUrlData(null);
				setScrapeFailed(false);
				setSmartImportExpanded(true); // Reset to expanded
				if (mode === "create") {
					clearDraft(); // Clear saved draft only in create mode
					// Redirect to wishlist tab on dashboard
					router.push("/dashboard?tab=wishlist");
				} else {
					// In edit mode, call the callback instead
					onItemAdded?.();
				}
				setHasUnsavedChanges(false);
			}, 800);
		} catch (error) {
			console.error("Error saving:", error);
			setSuccessMessage("");
			setUploadProgress("");
			alert(`Failed to save: ${(error as Error).message || "Unknown error"}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='max-w-6xl mx-auto'>
			<Card
				className='card-interactive shadow-lg'
				style={{
					background:
						"linear-gradient(135deg, var(--color-surface-primary), var(--color-gray-50), var(--color-blue-50))",
				}}>
				{mode === "create" && (
					<CardHeader className='text-left pb-6'>
						<CardTitle
							className='text-3xl flex flex-col justify-start'
							style={{ color: "var(--color-black)" }}>
							<p className='-mb-2'>Track Your Items</p>

							<p
								className='text-sm'
								style={{ color: "var(--color-text-secondary)" }}>
								Shoes, clothing, accessories & more
							</p>
						</CardTitle>
					</CardHeader>
				)}

				<CardContent>
					{/* Draft Restored Notification - Only show in create mode */}
					{mode === "create" && showDraftNotification && (
						<Alert className='mb-6 border-blue-200 bg-blue-50'>
							<div className='flex items-center justify-between w-full'>
								<div className='flex items-center gap-[var(--space-md)]'>
									<RefreshCw className='h-4 w-4 text-blue-600' />
									<AlertDescription className='text-blue-800'>
										Draft restored from previous session
									</AlertDescription>
								</div>
								<div className='flex items-center gap-2'>
									<Button
										type='button'
										variant='outline'
										size='sm'
										onClick={() => {
											clearDraft();
											reset();
											setPhotos([]);
											setScrapedImages([]);
											setUrlData(null);
											setShowDraftNotification(false);
											toast.success("Draft cleared", {
												description: "Form has been reset to start fresh",
												duration: 3000,
											});
										}}
										className='h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-100'
										aria-label='Clear draft'>
										Clear Draft
									</Button>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										onClick={() => setShowDraftNotification(false)}
										className='h-6 w-6 p-0'
										aria-label='Dismiss notification'>
										<X className='h-4 w-4' />
									</Button>
								</div>
							</div>
						</Alert>
					)}

					{/* Auto-save Indicator - Only show in create mode */}
					{mode === "create" && lastSavedTime && hasUnsavedChanges && (
						<div className='mb-4 text-xs text-gray-500 flex items-center gap-[var(--space-xs)]'>
							<RefreshCw className='h-3 w-3' />
							<span>Last saved: {lastSavedTime.toLocaleTimeString()}</span>
						</div>
					)}

					<form
						onSubmit={handleSubmit(onSubmit)}
						className='space-y-[var(--space-lg)]'>
						{/* User, Experience, and Category - Required First */}
						<div className='grid grid-cols-1 md:grid-cols-3 gap-[var(--space-base)] pb-[var(--space-base)]'>
							<div>
								<Label className='text-sm font-medium text-gray-700 flex items-center gap-[var(--space-md)] mb-3'>
									<span>Who's tracking?</span>
									<span className='text-red-500 -ml-1'>*</span>
								</Label>
								<RadioGroup
									value={watchedUser}
									onValueChange={(value: "Kenny" | "Rene") =>
										setValue("userName", value, { shouldValidate: true })
									}
									className='flex gap-4'>
									<div className='flex items-center space-x-2'>
										<RadioGroupItem value='Kenny' id='user-kenny' />
										<Label
											htmlFor='user-kenny'
											className='font-normal cursor-pointer flex items-center gap-2'>
											<UserCircle className='h-4 w-4 text-blue-600' />
											Kenny
										</Label>
									</div>
									<div className='flex items-center space-x-2'>
										<RadioGroupItem value='Rene' id='user-rene' />
										<Label
											htmlFor='user-rene'
											className='font-normal cursor-pointer flex items-center gap-2'>
											<UserCircle className='h-4 w-4 text-purple-600' />
											Rene
										</Label>
									</div>
								</RadioGroup>
								{errors.userName && (
									<div className='mt-[var(--space-md)] p-[var(--space-md)] bg-red-50 border border-red-200 rounded flex items-start gap-[var(--space-md)]'>
										<AlertTriangle className='h-4 w-4 text-red-600 mt-0.5 flex-shrink-0' />
										<p className='text-xs font-semibold text-red-700'>
											{errors.userName.message}
										</p>
									</div>
								)}
							</div>

							<div>
								<Label className='text-sm font-medium text-gray-700 flex items-center gap-[var(--space-md)] mb-3'>
									<span>Experience</span>
									<span className='text-red-500 -ml-1'>*</span>
								</Label>
								<RadioGroup
									value={watchedInteractionType}
									onValueChange={(value: "seen" | "tried") =>
										setValue("interactionType", value, { shouldValidate: true })
									}
									className='flex gap-4'>
									<div className='flex items-center space-x-2'>
										<RadioGroupItem value='seen' id='exp-seen' />
										<Label
											htmlFor='exp-seen'
											className='font-normal cursor-pointer flex items-center gap-2'>
											<Eye className='h-4 w-4 text-teal-600' />
											Seen
										</Label>
									</div>
									<div className='flex items-center space-x-2'>
										<RadioGroupItem value='tried' id='exp-tried' />
										<Label
											htmlFor='exp-tried'
											className='font-normal cursor-pointer flex items-center gap-2'>
											<Footprints className='h-4 w-4 text-orange-600' />
											Tried On
										</Label>
									</div>
								</RadioGroup>
								{errors.interactionType && (
									<div className='mt-[var(--space-md)] p-[var(--space-md)] bg-red-50 border border-red-200 rounded flex items-start gap-[var(--space-md)]'>
										<AlertTriangle className='h-4 w-4 text-red-600 mt-0.5 flex-shrink-0' />
										<p className='text-xs font-semibold text-red-700'>
											{errors.interactionType.message}
										</p>
									</div>
								)}
							</div>

							{/* Category Selector */}
							<div>
								<Label className='text-sm font-medium text-gray-700 flex items-center gap-[var(--space-md)]'>
									<span>Item Category</span>
									<span className='text-red-500 -ml-1'>*</span>
								</Label>
								<Select
									onValueChange={(value: ItemCategory) =>
										setValue("category", value)
									}
									value={watchedCategory}>
									<SelectTrigger className='h-4 mt-[var(--space-md)] max-w-sm'>
										<SelectValue placeholder='Select category' />
									</SelectTrigger>
									<SelectContent>
										{Object.values(CATEGORY_CONFIGS).map((config) => {
											const IconComponent = config.icon;
											return (
												<SelectItem key={config.id} value={config.id}>
													<div className='flex items-center gap-[var(--space-md)]'>
														<IconComponent className='h-2 w-2' />
														<span>{config.label}</span>
													</div>
												</SelectItem>
											);
										})}
									</SelectContent>
								</Select>
								{errors.category && (
									<div className='mt-[var(--space-md)] p-[var(--space-md)] bg-red-50 border border-red-200 rounded flex items-start gap-[var(--space-md)]'>
										<AlertTriangle className='h-4 w-4 text-red-600 mt-0.5 flex-shrink-0' />
										<div>
											<p className='text-xs font-semibold text-red-700'>
												{errors.category.message}
											</p>
											<p className='text-xs text-red-600 mt-0.5'>
												Select the type of item you're tracking
											</p>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Smart Import Section - Only show in create mode */}
						{mode === "create" &&
							watchedUser &&
							watchedInteractionType &&
							watchedCategory && (
								<>
									<div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border-2 border-blue-200'>
										<button
											type='button'
											onClick={() =>
												setSmartImportExpanded(!smartImportExpanded)
											}
											className='w-full flex items-center justify-between mb-4'>
											<div className='flex items-center gap-3'>
												<Rocket className='hidden  md:block h-5 w-5 text-blue-600' />
												<span className='text-base font-semibold text-blue-800 cursor-pointer'>
													Auto-fill from URL
												</span>
											</div>
											{smartImportExpanded ? (
												<ChevronUp className='h-3 w-3 text-blue-600' />
											) : (
												<ChevronDown className='h-3 w-3 text-blue-600' />
											)}
										</button>

										{smartImportExpanded && (
											<div className='space-y-4'>
												{/* URL Input */}
												<div>
													<Label className='text-xs text-blue-700 mb-2 block'>
														Paste product URL from Nike, Adidas, Foot Locker,
														StockX, etc.
													</Label>
													<div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
														<Input
															{...register("productUrl")}
															placeholder='https://www.nike.com/t/...'
															className='flex-1 h-4'
															disabled={isScrapingUrl}
															aria-label='Product URL'
															aria-describedby='url-help-text'
														/>
														<Button
															type='button'
															onClick={() =>
																handleUrlScrape(watch("productUrl") || "")
															}
															disabled={isScrapingUrl || !watch("productUrl")}
															size='sm'
															className='btn-primary rounded-lg px-4 py-2 font-semibold cursor-pointer h-4'
															aria-label={
																isScrapingUrl
																	? "Scraping product data"
																	: "Scrape product URL"
															}
															aria-busy={isScrapingUrl}>
															{isScrapingUrl ? (
																<Loader2
																	className='h-3 w-3 animate-spin'
																	aria-hidden='true'
																/>
															) : (
																""
															)}
															<span className='ml-2'>
																{isScrapingUrl ? "Loading..." : "Import"}
															</span>
														</Button>
													</div>
													<p id='url-help-text' className='sr-only'>
														Paste a product URL from Nike, Adidas, Foot Locker,
														StockX, or other retailers
													</p>
												</div>

												{/* Scraping Skeleton Loader */}
												{isScrapingUrl && (
													<div className='bg-white rounded-lg p-4 border-2 border-blue-300'>
														<div className='flex items-start gap-3'>
															<Skeleton className='w-16 h-16 rounded-lg' />
															<div className='flex-1 space-y-2'>
																<Skeleton className='h-4 w-3/4' />
																<Skeleton className='h-6 w-1/2' />
																<Skeleton className='h-3 w-1/3' />
															</div>
														</div>
													</div>
												)}

												{/* URL Data Preview */}
												{!isScrapingUrl && urlData && (
													<div className='bg-white rounded-lg p-4 border-2 border-green-300 animate-in fade-in slide-in-from-top-4 duration-300'>
														<div className='flex flex-col sm:flex-row sm:items-start gap-3'>
															{urlData.image && (
																<img
																	src={urlData.image}
																	alt='Product'
																	className='w-16 h-16 object-cover rounded-lg flex-shrink-0'
																/>
															)}
															<div className='flex-1 min-w-0'>
																<div className='flex items-center gap-2'>
																	<CheckCircle className='h-4 w-4 text-green-600 flex-shrink-0' />
																	<h4 className='font-medium text-sm text-green-800 truncate'>
																		{urlData.title || "Product Found"}
																	</h4>
																</div>
																<div className='flex flex-wrap items-center gap-2 mt-1'>
																	{urlData.price && (
																		<span className='text-lg font-bold text-green-600'>
																			${urlData.price}
																		</span>
																	)}
																	{urlData.storeName && (
																		<span className='text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded'>
																			{urlData.storeName}
																		</span>
																	)}
																</div>
																{urlData.images &&
																	urlData.images.length > 1 && (
																		<div className='flex items-center gap-1 mt-1'>
																			<Camera className='h-3 w-3 text-blue-600' />
																			<p className='text-xs text-blue-600'>
																				{urlData.images.length} images found
																			</p>
																		</div>
																	)}
															</div>
														</div>
													</div>
												)}

												{/* Upload Progress */}
												{uploadProgress && (
													<Alert
														className={
															scrapeFailed
																? "border-red-200 bg-red-50"
																: "border-blue-200 bg-blue-50"
														}>
														<Upload
															className={`h-4 w-4 ${
																scrapeFailed ? "text-red-600" : "text-blue-600"
															}`}
														/>
														<AlertDescription
															className={
																scrapeFailed ? "text-red-800" : "text-blue-800"
															}>
															{uploadProgress}
														</AlertDescription>
													</Alert>
												)}

												<div className='text-xs text-blue-700 bg-blue-100 p-3 rounded flex items-start gap-2'>
													<Lightbulb className='h-4 w-4 hidden md:block flex-shrink-0 mt-0.5' />
													<span>
														Smart Import will automatically fill brand, model,
														color, store, and price
													</span>
												</div>
											</div>
										)}
									</div>
								</>
							)}

						{/* Product Details - Show when basic info is filled OR in edit mode */}
						{((watchedUser && watchedInteractionType && watchedCategory) ||
							mode === "edit") && (
							<>
								<h3 className='font-semibold text-gray-700 border-b pb-[var(--space-md)] mt-6'>
									Product Details
								</h3>
								<div className='grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-lg)]'>
									{/* LEFT COLUMN - Primary Product Info */}
									<div className='space-y-[var(--space-base)]'>
										{/* Model */}
										<div>
											<Label className='text-sm font-medium text-gray-700'>
												<span>Item Name</span>{" "}
												<span className='text-red-500'>*</span>
											</Label>
											<Input
												{...register("model")}
												placeholder='Air Jordan 1, Air Max 90, etc.'
												className='mt-[var(--space-md)] h-6'
											/>
											{errors.model && (
												<div className='mt-[var(--space-md)] p-[var(--space-md)] bg-red-50 border border-red-200 rounded flex items-start gap-[var(--space-md)]'>
													<AlertTriangle className='h-4 w-4 text-red-600 mt-0.5 flex-shrink-0' />
													<div>
														<p className='text-xs font-semibold text-red-700'>
															{errors.model.message}
														</p>
														<p className='text-xs text-red-600 mt-0.5'>
															Enter the item model (e.g., "Air Jordan 1 High",
															"990v6")
														</p>
													</div>
												</div>
											)}
										</div>
										{/* Brand */}
										<div>
											<Label className='text-sm font-medium text-gray-700'>
												<span>Brand</span>{" "}
												<span className='text-red-500'>*</span>
											</Label>
											<div className='mt-[var(--space-md)] max-w-xs'>
												<BrandCombobox
													value={watchedBrand}
													onChange={(value) =>
														setValue("brand", value, {
															shouldValidate: true,
															shouldDirty: true,
															shouldTouch: true,
														})
													}
													disabled={isLoading}
												/>
											</div>
											{errors.brand && (
												<div className='mt-[var(--space-md)] p-[var(--space-md)] bg-red-50 border border-red-200 rounded flex items-start gap-[var(--space-md)]'>
													<AlertTriangle className='h-3 w-3 text-red-600 mt-0.5 flex-shrink-0' />
													<div>
														<p className='text-xs font-semibold text-red-700'>
															{errors.brand.message}
														</p>
														<p className='text-xs text-red-600 mt-0.5'>
															Select from popular brands or type a custom brand
															name
														</p>
													</div>
												</div>
											)}
										</div>

										{/* SKU/Style Code */}
										<div>
											<Label className='text-sm font-medium text-gray-700'>
												SKU / Style Code (Optional)
											</Label>
											<Input
												{...register("sku")}
												placeholder='DM7866-140'
												className='mt-[var(--space-md)] h-6'
											/>
										</div>

										{/* Color */}

										<div>
											<Label className='text-sm text-gray-600'>
												Color (Optional)
											</Label>
											<Input
												{...register("color")}
												placeholder='Bred, Chicago, etc.'
												className='mt-[var(--space-md)] h-6'
											/>
										</div>
									</div>

									{/* RIGHT COLUMN - Metadata */}
									<div className='space-y-[var(--space-base)]'>
										{/* Pricing Section */}
										<div className='space-y-[var(--space-sm)] '>
											<div>
												<Label className='text-sm text-gray-600'>
													Retail Price (Optional)
												</Label>
												<div className='relative mt-[var(--space-md)]'>
													<span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
														$
													</span>
													<Input
														{...register("retailPrice")}
														placeholder='215.00'
														type='number'
														step='0.01'
														className='pl-8 h-6'
													/>
												</div>

												{/* Sale Price Alert */}
												{watchedSalePrice &&
													watchedRetailPrice &&
													parseFloat(watchedSalePrice) <
														parseFloat(watchedRetailPrice) && (
														<div
															className='mt-2 p-2.5 rounded-lg border flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300'
															style={{
																backgroundColor: "var(--color-green-50)",
																borderColor: "var(--color-green-200)",
															}}
															role='status'
															aria-live='polite'>
															<Sparkles
																className='h-4 w-4 flex-shrink-0'
																style={{ color: "var(--color-green-600)" }}
																aria-hidden='true'
															/>
															<div className='flex-1 min-w-0'>
																<p
																	className='text-sm font-semibold'
																	style={{ color: "var(--color-green-800)" }}>
																	Active sale detected: ${watchedSalePrice}
																</p>
																<p
																	className='text-xs'
																	style={{ color: "var(--color-green-700)" }}>
																	Save $
																	{(
																		parseFloat(watchedRetailPrice) -
																		parseFloat(watchedSalePrice)
																	).toFixed(2)}{" "}
																	• {discountPercentage}% off
																</p>
															</div>
														</div>
													)}
											</div>

											<div>
												<Label className='text-sm text-gray-600'>
													Ideal Price Im willing to Pay (Optional)
												</Label>
												<div className='relative mt-[var(--space-md)]'>
													<span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
														$
													</span>
													<Input
														{...register("idealPrice")}
														placeholder='120.00'
														type='number'
														step='0.01'
														className='pl-8 h-6'
													/>
												</div>
												<p className='text-xs text-gray-500 mt-[var(--space-xs)]'>
													Price you'd be willing to pay
												</p>
											</div>
										</div>
									</div>
								</div>

								{/* Photos */}
								<div>
									<Label className='text-sm font-medium text-gray-700 mb-[var(--space-sm)] flex items-center gap-[var(--space-md)]'>
										<Camera className='h-4 w-4' />
										<span>Photos</span> <span className='text-red-500'>*</span>{" "}
										<span className='text-xs text-gray-500'>(Min 1)</span>
									</Label>
									<MultiPhotoUpload
										photos={photos}
										onPhotosChange={setPhotos}
										maxPhotos={5}
									/>
									{photos.length === 0 && (
										<div className='flex items-center gap-[var(--space-xs)] mt-[var(--space-xs)]'>
											<AlertTriangle className='h-3 w-3 text-orange-600' />
											<p className='text-xs text-orange-600'>
												At least one photo is required
											</p>
										</div>
									)}
								</div>

								<div>
									<div className='flex items-center justify-between'>
										<Label className='text-sm text-gray-600'>
											Notes (Optional)
										</Label>
										{watch("notes") && (
											<span className='text-xs text-gray-500'>
												{watch("notes")?.length || 0} / 120
											</span>
										)}
									</div>
									<Textarea
										{...register("notes")}
										placeholder={
											watchedInteractionType === "tried"
												? "e.g., 'Tight on pinky toe', 'Great for walking', 'Runs small compared to other Nikes'"
												: "e.g., 'Love the color', 'Perfect for summer', 'Saw on Instagram'"
										}
										className='mt-[var(--space-md)] resize-none'
										rows={3}
										maxLength={120}
									/>
									<div className='mt-[var(--space-md)] text-xs text-gray-500'>
										💡 Quick tips:{" "}
										{watchedInteractionType === "tried"
											? "Mention fit issues, comfort level, or comparisons with other shoes"
											: "Note where you saw them, what caught your eye, or styling ideas"}
									</div>
								</div>

								{watchedInteractionType === "tried" && (
									<div className='border-t pt-[var(--space-base)]'>
										<h4 className='font-semibold text-gray-700 mb-[var(--space-sm)] flex items-center gap-[var(--space-md)] mt-4'>
											Try-On Details
										</h4>

										<div className='flex justify-between gap-x-12 '>
											{/* Size Selection - Conditional based on category */}
											{isSizeRequired(watchedCategory) && (
												<div className='mb-4 mt-4 w-full'>
													<Label className='text-sm font-medium text-gray-700'>
														<span>
															{getCategoryConfig(watchedCategory)?.sizeLabel ||
																"Size Tried"}
														</span>{" "}
														<span className='text-red-500'>*</span>
													</Label>
													<div className='mt-[var(--space-md)] max-w-sm'>
														{watchedCategory === "shoes" ? (
															<SizeCombobox
																value={watch("sizeTried")}
																onChange={(value) =>
																	setValue("sizeTried", value, {
																		shouldValidate: true,
																		shouldDirty: true,
																		shouldTouch: true,
																	})
																}
																disabled={isLoading}
																preferredSize={sizePreferences[watchedBrand]}
															/>
														) : (
															<ClothingSizeCombobox
																value={watch("sizeTried")}
																onChange={(value) =>
																	setValue("sizeTried", value, {
																		shouldValidate: true,
																		shouldDirty: true,
																		shouldTouch: true,
																	})
																}
																disabled={isLoading}
															/>
														)}
													</div>
													{errors.sizeTried && (
														<div className='mt-[var(--space-md)] p-[var(--space-md)] bg-red-50 border border-red-200 rounded flex items-start gap-[var(--space-md)]'>
															<AlertTriangle className='h-4 w-4 text-red-600 mt-0.5 flex-shrink-0' />
															<div>
																<p className='text-xs font-semibold text-red-700'>
																	{errors.sizeTried.message}
																</p>
																<p className='text-xs text-red-600 mt-0.5'>
																	{watchedCategory === "shoes"
																		? "Select the shoe size you tried on"
																		: "Select the clothing size you tried on"}
																</p>
															</div>
														</div>
													)}
												</div>
											)}

											{/* Comfort Rating (Required for shoes only) */}
											{isComfortRequired(watchedCategory) && (
												<div className='mt-4 '>
													<Label className='text-sm font-medium text-gray-700 '>
														<span>How comfortable were they?</span>{" "}
														<span className='text-red-500'>*</span>
													</Label>

													<div className='flex items-center gap-[var(--space-xs)] '>
														{[1, 2, 3, 4, 5].map((rating) => (
															<button
																key={rating}
																type='button'
																onClick={() =>
																	setValue("comfortRating", rating, {
																		shouldValidate: true,
																	})
																}
																className='group p-[var(--space-sm)] md:p-[var(--space-md)] hover:scale-110 transition-transform touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 rounded'
																style={{ boxShadow: "var(--color-focus-ring)" }}
																title={`${rating} star${
																	rating !== 1 ? "s" : ""
																}`}
																aria-label={`${rating} star${
																	rating !== 1 ? "s" : ""
																} comfort rating`}>
																<Star
																	className={cn(
																		"h-4 w-4 md:h-4 md:w-4 transition-colors",
																		watch("comfortRating") &&
																			watch("comfortRating")! >= rating
																			? "fill-yellow-400 text-yellow-400"
																			: "text-gray-300 group-hover:text-gray-400"
																	)}
																	aria-hidden='true'
																/>
															</button>
														))}
														{watch("comfortRating") && (
															<button
																type='button'
																onClick={() =>
																	setValue("comfortRating", undefined)
																}
																className='ml-3 text-xs text-gray-500 hover:text-gray-700 underline min-h-[44px] flex items-center focus:ring-2 focus:ring-blue-300 rounded px-2'
																aria-label='Clear comfort rating'>
																Clear
															</button>
														)}
													</div>
													{watch("comfortRating") && (
														<div
															className='mt-1 p-1 rounded'
															style={{
																backgroundColor: "var(--color-primary-50)",
																borderColor: "var(--color-primary-200)",
																border: "1px solid",
															}}>
															<p
																className='text-sm'
																style={{ color: "var(--color-primary-900)" }}>
																<span className='font-semibold'>
																	{watch("comfortRating")} / 5 stars
																</span>{" "}
																-{" "}
																{watch("comfortRating") === 1
																	? "Very uncomfortable"
																	: watch("comfortRating") === 2
																	? "Uncomfortable"
																	: watch("comfortRating") === 3
																	? "Decent comfort"
																	: watch("comfortRating") === 4
																	? "Very comfortable"
																	: "Extremely comfortable"}
															</p>
														</div>
													)}
													<p className='text-xs text-gray-500 mt-1'>
														Rate overall comfort - cushioning, support,
														breathability
													</p>
												</div>
											)}
										</div>
									</div>
								)}

								<div className='flex items-center justify-end gap-3 mt-6'>
									{/* Validation Summary - Show what's blocking submission */}
									{(!isValid || photos.length === 0) && !isLoading && (
										<Alert className='border-yellow-500 bg-yellow-50'>
											<AlertTriangle className='h-4 w-4 text-yellow-600' />
											<AlertDescription className='text-yellow-800'>
												<div className='font-semibold mb-2'>
													Please complete the following before saving:
												</div>
												<ul className='list-disc list-inside space-y-1 text-sm'>
													{photos.length === 0 && (
														<li>Upload at least one product photo</li>
													)}
													{errors.userName && (
														<li>{errors.userName.message}</li>
													)}
													{errors.interactionType && (
														<li>{errors.interactionType.message}</li>
													)}
													{errors.category && (
														<li>{errors.category.message}</li>
													)}
													{errors.brand && <li>{errors.brand.message}</li>}
													{errors.model && <li>{errors.model.message}</li>}
													{errors.sizeTried && (
														<li>{errors.sizeTried.message}</li>
													)}
													{errors.comfortRating && (
														<li>{errors.comfortRating.message}</li>
													)}
													{errors.retailPrice && (
														<li>{errors.retailPrice.message}</li>
													)}
													{errors.salePrice && (
														<li>{errors.salePrice.message}</li>
													)}
													{errors.idealPrice && (
														<li>{errors.idealPrice.message}</li>
													)}
													{errors.targetPrice && (
														<li>{errors.targetPrice.message}</li>
													)}
												</ul>
											</AlertDescription>
										</Alert>
									)}

									{/* Submit Button */}
									<Button
										type='submit'
										className=' btn-primary rounded-lg px-6 py-3 font-semibold'
										disabled={isLoading || !isValid || photos.length === 0}
										aria-label={
											isLoading
												? "Saving item data"
												: watchedInteractionType === "tried"
												? "Save try-on experience"
												: "Add item to watchlist"
										}
										aria-busy={isLoading}>
										{isLoading ? (
											<>
												<Loader2
													className='h-4 w-4 mr-2 animate-spin'
													aria-hidden='true'
												/>
												<span>Saving...</span>
											</>
										) : (
											<>
												{(mode as "create" | "edit") === "edit" ? (
													<>
														<Zap className='h-4 w-4 mr-2' aria-hidden='true' />
														Update Item
													</>
												) : watchedInteractionType === "tried" ? (
													<>
														<Zap className='h-4 w-4 mr-2' aria-hidden='true' />
														Save
													</>
												) : (
													<>Add to Watchlist</>
												)}
											</>
										)}
									</Button>
								</div>
							</>
						)}
					</form>
				</CardContent>
			</Card>

			{/* Image Confirmation Modal */}
			<ImageConfirmationModal
				open={showImageModal}
				onOpenChange={setShowImageModal}
				images={scrapedImages}
				onConfirm={handleImageConfirm}
			/>
		</div>
	);
}
