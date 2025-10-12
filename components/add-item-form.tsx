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
        productUrl: z
            .string()
            .url("Please enter a valid URL")
            .max(500)
            .optional()
            .or(z.literal("")),
        targetPrice: z
            .string()
            .regex(/^\d+(\.\d{1,2})?$/)
            .refine((val) => {
                if (val === "") return true;
                const price = parseFloat(val);
                return price >= 0 && price <= 10000;
            })
            .optional()
            .or(z.literal("")),
        enableNotifications: z.boolean().default(false),
        brand: z.string().min(1, "Brand is required").max(50).trim(),
        model: z.string().min(2, "Item name is required").max(100).trim(),
        sku: z.string().max(50).optional().or(z.literal("")),
        color: z.string().max(100).trim().optional().or(z.literal("")),
        sizeTried: z.string().optional(),
        comfortRating: z.coerce.number().min(1).max(5).optional(),
        retailPrice: z
            .string()
            .regex(/^\d+(\.\d{1,2})?$/)
            .refine((val) => {
                if (val === "") return true;
                const price = parseFloat(val);
                return price >= 0 && price <= 10000;
            })
            .optional()
            .or(z.literal("")),
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
        idealPrice: z
            .string()
            .regex(/^\d+(\.\d{1,2})?$/)
            .refine((val) => {
                if (val === "") return true;
                const price = parseFloat(val);
                return price >= 0 && price <= 10000;
            })
            .optional()
            .or(z.literal("")),
        notes: z.string().max(120).trim().optional().or(z.literal("")),
    })
    .refine(
        (data) => {
            if (isSizeRequired(data.category) && data.interactionType === "tried") {
                return data.sizeTried && data.sizeTried.length > 0;
            }
            return true;
        },
        { message: "Please select the size you tried on", path: ["sizeTried"] }
    )
    .refine(
        (data) => {
            if (isComfortRequired(data.category) && data.interactionType === "tried") {
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
        { message: "Sale price cannot be higher than retail price", path: ["salePrice"] }
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
        defaultValues: mode === 'edit' && initialData ? {
            interactionType: initialData.has_been_tried ? "tried" : "seen",
            category: initialData.category || undefined,
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
        } : {
            interactionType: "seen",
        },
    });

    const watchedInteractionType = watch("interactionType");
    const watchedCategory = watch("category");
    const watchedRetailPrice = watch("retailPrice");
    const watchedSalePrice = watch("salePrice");
    const watchedBrand = watch("brand");

    useEffect(() => {
        if (mode === "edit" && initialData) {
            reset({
                interactionType: initialData.has_been_tried ? "tried" : "seen",
                category: initialData.category || undefined,
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
            });

            if (initialData.item_photos && initialData.item_photos.length > 0) {
                const existingPhotos: PhotoItem[] = initialData.item_photos.map((p: any, i: number) => ({
                    id: p.id,
                    file: new File([], ""),
                    preview: p.image_url,
                    isMain: p.is_main_image,
                    order: p.image_order,
                    isExisting: true,
                }));
                setPhotos(existingPhotos);
            }
        }
    }, [mode, initialData, reset]);

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
                setValue("brand", data.brand || "", { shouldValidate: true, shouldDirty: true });
                setValue("model", data.model || "", { shouldValidate: true, shouldDirty: true });
                setValue("retailPrice", data.retailPrice?.toString() || "", { shouldValidate: true, shouldDirty: true });
                setValue("salePrice", data.salePrice?.toString() || "", { shouldValidate: true, shouldDirty: true });
                setValue("color", data.color || "", { shouldValidate: true, shouldDirty: true });
                const detectedCategory = detectCategoryFromUrl(url);
                if(detectedCategory) setValue("category", detectedCategory, { shouldValidate: true, shouldDirty: true });
                
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

    const handleImageConfirm = async (selectedImages: string[], mainImageIndex: number) => {
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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated.");

            const newPhotos = photos.filter(p => !p.isExisting);
            const uploadedPhotoData: { url: string; cloudinaryId: string; order: number; isMain: boolean }[] = [];
            for (let i = 0; i < newPhotos.length; i++) {
                const photo = newPhotos[i];
                const formData = new FormData();
                formData.append("file", photo.file);
                const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
                if (!res.ok) throw new Error(`Failed to upload image ${i+1}`);
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
                size_tried: data.interactionType === "tried" ? data.sizeTried : null,
                comfort_rating: data.interactionType === "tried" ? data.comfortRating : null,
                retail_price: data.retailPrice ? parseFloat(data.retailPrice) : null,
                sale_price: data.salePrice ? parseFloat(data.salePrice) : null,
                ideal_price: data.idealPrice ? parseFloat(data.idealPrice) : null,
                notes: data.notes || null,
                status: (mode === 'create' ? 'wishlisted' : initialData?.status) as 'wishlisted' | 'owned' | 'journaled',
                has_been_tried: data.interactionType === "tried",
                target_price: data.targetPrice ? parseFloat(data.targetPrice) : null,
            };

            let resultItem;
            if (mode === 'edit' && initialData?.id) {
                const { data: updatedItem, error } = await supabase.from('items').update(experienceData).eq('id', initialData.id).select().single();
                if (error) throw error;
                resultItem = updatedItem;

                const initialPhotoIds = initialData.item_photos?.map((p: any) => p.id) || [];
                const currentPhotoIds = photos.filter(p => p.isExisting).map(p => p.id);
                const deletedPhotoIds = initialPhotoIds.filter((id: string) => !currentPhotoIds.includes(id));
                if (deletedPhotoIds.length > 0) {
                    await supabase.from('item_photos').delete().in('id', deletedPhotoIds);
                }
            } else {
                const { data: insertedItem, error } = await supabase.from('items').insert(experienceData).select().single();
                if (error) throw error;
                resultItem = insertedItem;
            }

            if (uploadedPhotoData.length > 0) {
                const photoRecords = uploadedPhotoData.map(p => ({
                    item_id: resultItem.id,
                    image_url: p.url,
                    cloudinary_id: p.cloudinaryId,
                    image_order: p.order,
                    is_main_image: p.isMain,
                }));
                const { error: photoError } = await supabase.from('item_photos').insert(photoRecords);
                if (photoError) throw photoError;
            }
            
            toast.success(`Item ${mode === 'edit' ? 'updated' : 'added'} successfully!`);
            if (mode === 'create') {
                router.push('/dashboard?tab=wishlist');
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
        setHasUnsavedChanges(isDirty || photos.some(p => p.file.size > 0));
    }, [isDirty, photos]);
    
    const loadFitData = async () => {}; // Dummy function, as original was removed
    const restoreDraft = () => {}; // Dummy function
    const saveDraft = () => {}; // Dummy function

    // --- END ---
    
    return (
        <div className='max-w-6xl mx-auto'>
            <Card className='card-interactive shadow-lg'>
                {!isFormVisible && mode === 'create' && (
                     <CardHeader className='text-left pb-6'>
                        <CardTitle className='text-3xl flex flex-col justify-start'>
                            <p className='-mb-2'>Add a New Item</p>
                            <p className='text-sm text-muted-foreground'>
                                Start by entering a URL or adding details manually.
                            </p>
                        </CardTitle>
                    </CardHeader>
                )}
                
                <CardContent className="pt-6">
                    {!isFormVisible && mode === 'create' ? (
                        <div className="space-y-6">
                            <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border-2 border-blue-200'>
                                <h3 className='text-base font-semibold text-blue-800 mb-4'>Auto-fill from URL</h3>
                                <div className='space-y-2'>
                                    <Label htmlFor="productUrl" className='text-xs text-blue-700'>Paste product URL from a supported retailer.</Label>
                                    <div className='flex flex-col sm:flex-row gap-2'>
                                        <Input id="productUrl" {...register("productUrl")} placeholder='https://...' className='flex-1' disabled={isScrapingUrl} />
                                        <Button type='button' onClick={() => handleUrlScrape(watch("productUrl") || "")} disabled={isScrapingUrl || !watch("productUrl")}>
                                            {isScrapingUrl && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
                                            Import
                                        </Button>
                                    </div>
                                    {uploadProgress && <p className="text-sm text-muted-foreground mt-2">{uploadProgress}</p>}
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
                            </div>
                            <Button variant="outline" onClick={() => setIsFormVisible(true)} className="w-full">
                                Enter Details Manually
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <Label>Experience *</Label>
                                    <RadioGroup value={watchedInteractionType} onValueChange={(v) => setValue("interactionType", v as "seen"|"tried", {shouldValidate: true})} className="flex gap-4 mt-2">
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="seen" id="seen" /><Label htmlFor="seen">Seen</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="tried" id="tried" /><Label htmlFor="tried">Tried On</Label></div>
                                    </RadioGroup>
                                </div>
                                <div>
                                    <Label>Item Category *</Label>
                                    <Select onValueChange={(v) => setValue("category", v as ItemCategory, {shouldValidate: true})} value={watchedCategory}>
                                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                        <SelectContent>
                                            {Object.values(CATEGORY_CONFIGS).map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <h3 className='font-semibold border-b pb-2'>Product Details</h3>

                            <div className="space-y-6">
                                <div>
                                    <Label>Item Name *</Label>
                                    <Input {...register("model")} />
                                    {errors.model && <p className="text-sm text-red-600 mt-1">{errors.model.message}</p>}
                                </div>
                                <div>
                                    <Label>Brand *</Label>
                                    <BrandCombobox value={watchedBrand} onChange={(v) => setValue("brand", v, {shouldValidate: true})} />
                                    {errors.brand && <p className="text-sm text-red-600 mt-1">{errors.brand.message}</p>}
                                </div>
                                <div>
                                    <Label>Photos * <span className="text-xs text-muted-foreground">(Min 1)</span></Label>
                                    <MultiPhotoUpload photos={photos} onPhotosChange={setPhotos} maxPhotos={5} />
                                    {photos.length === 0 && errors.root && <p className="text-sm text-red-600 mt-1">At least one photo is required</p>}
                                </div>
                            </div>
                            
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger><h3 className="font-semibold">Add More Details (Optional)</h3></AccordionTrigger>
                                    <AccordionContent className="space-y-6 pt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div><Label>SKU / Style Code</Label><Input {...register("sku")} /></div>
                                            <div><Label>Color</Label><Input {...register("color")} /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div><Label>Retail Price</Label><Input {...register("retailPrice")} type="number" step="0.01" /></div>
                                            <div><Label>Sale Price</Label><Input {...register("salePrice")} type="number" step="0.01" /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div><Label>Ideal Price</Label><Input {...register("idealPrice")} type="number" step="0.01" /></div>
                                            <div><Label>Target Price</Label><Input {...register("targetPrice")} type="number" step="0.01" /></div>
                                        </div>
                                        <div>
                                            <Label>Notes ({watch("notes")?.length || 0} / 120)</Label>
                                            <Textarea {...register("notes")} maxLength={120} />
                                        </div>

                                        {watchedInteractionType === "tried" && (
                                            <div className='border-t pt-6 space-y-6'>
                                                <h4 className='font-semibold'>Try-On Details</h4>
                                                {isSizeRequired(watchedCategory) && (
                                                    <div>
                                                        <Label>Size Tried *</Label>
                                                        {watchedCategory === 'shoes' ? 
                                                            <SizeCombobox value={watch("sizeTried")} onChange={(v) => setValue("sizeTried", v, {shouldValidate: true})} /> : 
                                                            <ClothingSizeCombobox value={watch("sizeTried")} onChange={(v) => setValue("sizeTried", v, {shouldValidate: true})} />
                                                        }
                                                        {errors.sizeTried && <p className="text-sm text-red-600 mt-1">{errors.sizeTried.message}</p>}
                                                    </div>
                                                )}
                                                {isComfortRequired(watchedCategory) && (
                                                    <div>
                                                        <Label>Comfort Rating *</Label>
                                                        <RadioGroup value={watch("comfortRating")?.toString()} onValueChange={(v) => setValue("comfortRating", parseInt(v), {shouldValidate: true})} className="flex gap-2 mt-2">
                                                            {[1,2,3,4,5].map(r => <div key={r} className="flex items-center space-x-2"><RadioGroupItem value={r.toString()} id={`r${r}`} /><Label htmlFor={`r${r}`}>{r}</Label></div>)}
                                                        </RadioGroup>
                                                        {errors.comfortRating && <p className="text-sm text-red-600 mt-1">{errors.comfortRating.message}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <div className='flex items-center justify-end gap-3 mt-6'>
                                <Button type="submit" disabled={isLoading || !isValid && isDirty || photos.length === 0}>
                                    {isLoading && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
                                    {mode === 'edit' ? 'Update Item' : 'Save Item'}
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