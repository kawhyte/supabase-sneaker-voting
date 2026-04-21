'use client'

import { useState, useEffect, useRef } from 'react'
import { useFormLogic } from './useFormLogic'
import { BasicInfoSection } from './BasicInfoSection'
import { PricingSection } from './PricingSection'
import { PhotoSection } from './PhotoSection'
import { SizingSection } from './SizingSection'
import { ProductURLSection } from './ProductURLSection'
import { FormActions } from './FormActions'
import { BulkImportSection } from './BulkImportSection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageConfirmationModal } from '@/components/ImageConfirmationModal'
import { SupportedRetailersDialog } from '@/components/SupportedRetailersDialog'
import { ValidationStatusCard } from '@/components/ItemValidationStatusCard'
import { useValidationVisibility } from '@/hooks/useValidationVisibility'
import { useSmartDefaults } from '@/hooks/useSmartDefaults'
import {
	validateProductUrl,
	isSupportedRetailer,
	type UrlValidationResult,
} from '@/lib/retailer-url-validator'
import { detectCategoryFromUrl } from '@/lib/item-utils'
import { Loader2, Search, Sparkles, Shirt, Star, ChevronDown, CheckCircle2 } from 'lucide-react'
import { type PhotoItem } from '@/components/types/photo-item'
import { type ItemCategory } from '@/components/types/item-category'
import { SneakerSearch, type SneakerSearchResult } from './SneakerSearch'

export interface AddItemFormProps {
	mode: 'add' | 'edit' | 'create'
	initialData?: any
	onSuccess?: () => void
	onCancel?: () => void
}

/**
 * Main form for adding/editing wardrobe items.
 *
 * Orchestrates 6 section components:
 * 1. BasicInfo - Brand, model, color, category, tried on toggle
 * 2. Pricing - Retail, sale, target prices with smart suggestions
 * 3. Photos - Image uploads (up to 5)
 * 4. ProductURL - URL import and price tracking
 * 5. Sizing - SKU, size, comfort rating, notes (Advanced mode only)
 * 6. Actions - Submit/Cancel buttons
 *
 * Features:
 * - Quick/Advanced mode toggle (create mode only)
 * - URL scraping with auto-fill
 * - Smart target price suggestions
 * - Form validation with live feedback
 * - Image confirmation modal
 *
 * Business logic extracted to useFormLogic hook for testability.
 */
export default function AddItemForm({
	mode,
	initialData,
	onSuccess,
	onCancel,
}: AddItemFormProps) {
	// Intent: 'own' (item is already owned) vs 'wishlist' (want to buy)
	// In edit mode, derive from the item's stored status
	const [intent, setIntent] = useState<'own' | 'wishlist'>(
		mode === 'edit' && initialData?.status === 'wishlisted' ? 'wishlist' : 'own'
	)

	// Form logic hook
	const {
		form,
		isSubmitting,
		photos,
		onSubmit,
		handlePhotosChange,
	} = useFormLogic({ mode, initialData, onSuccess, intent })

	// Normalize mode: "add" and "create" both mean creating a new item
	const normalizedMode = mode === 'add' ? 'create' : mode

	// Smart defaults from user preferences
	const smartDefaults = useSmartDefaults()

	// Local state
	const [isFormVisible, setIsFormVisible] = useState(mode === 'edit')
	const [isScrapingUrl, setIsScrapingUrl] = useState(false)
	const [uploadProgress, setUploadProgress] = useState('')
	const [showImageModal, setShowImageModal] = useState(false)
	const [scrapedImages, setScrapedImages] = useState<string[]>([])
	const [urlValidation, setUrlValidation] = useState<UrlValidationResult>({
		status: 'idle',
		message: '',
		canSave: true,
	})
	const [showRetailersDialog, setShowRetailersDialog] = useState(false)
	const [attemptedSubmit, setAttemptedSubmit] = useState(false)

	// Bulk Import mode
	const [isBulkMode, setIsBulkMode] = useState(false)

	// URL section toggle — hidden by default; revealed via "Add manually or via URL"
	const [showUrlSection, setShowUrlSection] = useState(false)

	// Auto-fill badge — shown briefly after a search result populates the form
	const [autoFillActive, setAutoFillActive] = useState(false)

	const formRef = useRef<HTMLFormElement>(null)

	// Validation card visibility hook
	const { shouldShowCard, isSticky, isMobile } = useValidationVisibility({
		formRef,
		isDirty: form.formState.isDirty,
		attemptedSubmit,
	})

	// Apply smart defaults on initial load (create mode only)
	useEffect(() => {
		if (
			(mode === 'create' || mode === 'add') &&
			!smartDefaults.isLoading &&
			!form.formState.isDirty
		) {
			form.reset({
				triedOn: false,
				wears: 0,
				category: smartDefaults.lastCategory,
				brandId: smartDefaults.lastBrandId,
				brand: smartDefaults.lastBrand || '',
				color: smartDefaults.lastColor || '',
				sizeTried: smartDefaults.lastSize || '',
			})
		}
	}, [smartDefaults, mode, form])

	// Real-time URL validation when price tracking is enabled
	useEffect(() => {
		const productUrl = form.watch('productUrl')
		const trackingEnabled = form.watch('auto_price_tracking_enabled')

		if (trackingEnabled && productUrl) {
			const validationResult = validateProductUrl(productUrl)
			setUrlValidation(validationResult)
		} else if (!productUrl) {
			setUrlValidation({
				status: 'idle',
				message: '',
				canSave: true,
			})
		}
	}, [form.watch('productUrl'), form.watch('auto_price_tracking_enabled'), form])

	/**
	 * Handle URL scraping for auto-fill
	 */
	const handleUrlScrape = async (url: string) => {
		if (!url.trim()) return

		setIsScrapingUrl(true)
		setUploadProgress('Analyzing product URL...')

		try {
			const response = await fetch('/api/scrape-product', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: url.trim() }),
			})

			if (!response.ok) throw new Error('Failed to scrape.')

			const data = await response.json()

			if (data.success) {
				// Populate form fields with scraped data
				if (data.brand) {
					form.setValue('brand', data.brand, { shouldValidate: true, shouldDirty: true })
				}
				if (data.model) {
					form.setValue('model', data.model, { shouldValidate: true, shouldDirty: true })
				}
				if (data.retailPrice) {
					form.setValue('retailPrice', data.retailPrice.toString(), {
						shouldValidate: true,
						shouldDirty: true,
					})
				}
				if (data.salePrice) {
					form.setValue('salePrice', data.salePrice.toString(), {
						shouldValidate: true,
						shouldDirty: true,
					})
				}
				if (data.color) {
					form.setValue('color', data.color, { shouldValidate: true, shouldDirty: true })
				}

				// Detect and set category
				const detectedCategory = detectCategoryFromUrl(url)
				if (detectedCategory) {
					form.setValue('category', detectedCategory, {
						shouldValidate: true,
						shouldDirty: true,
					})
				}

				// Auto-enable price tracking if URL is from supported retailer
				if (isSupportedRetailer(url)) {
					form.setValue('auto_price_tracking_enabled', true, {
						shouldValidate: true,
						shouldDirty: true,
					})
					const validationResult = validateProductUrl(url)
					setUrlValidation(validationResult)
				}

				setIsFormVisible(true)

				// Show image confirmation modal if images were scraped
				if (data.images && data.images.length > 0) {
					setScrapedImages(data.images)
					setShowImageModal(true)
				}

				setUploadProgress('')
			} else {
				throw new Error(data.error || 'Unknown scraping error')
			}
		} catch (error) {
			setUploadProgress(`Error: ${(error as Error).message}`)
		} finally {
			setIsScrapingUrl(false)
		}
	}

	/**
	 * Populate form fields from a SneakerSearch result, then show the full form.
	 * Image is proxied in the background so the form appears instantly.
	 */
	const handleSearchSelect = (result: SneakerSearchResult) => {
		form.setValue('model', result.title, { shouldValidate: true, shouldDirty: true })
		form.setValue('category', 'lifestyle', { shouldValidate: true, shouldDirty: true })

		if (result.brand) {
			form.setValue('brand', result.brand, { shouldValidate: true, shouldDirty: true })
		}
		if (result.sku) {
			form.setValue('sku', result.sku, { shouldValidate: true, shouldDirty: true })
		}
		if (result.price) {
			// Strip currency symbol and whitespace, keep only the numeric portion
			const numeric = result.price.replace(/[^0-9.]/g, '')
			if (numeric) {
				form.setValue('retailPrice', numeric, { shouldValidate: true, shouldDirty: true })
			}
		}

		setIsFormVisible(true)

		// Brief auto-fill badge
		setAutoFillActive(true)
		setTimeout(() => setAutoFillActive(false), 3000)

		// Proxy image in background — silently no-ops on failure
		if (result.imageUrl) {
			fetch('/api/proxy-image', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ imageUrl: result.imageUrl }),
			})
				.then((res) => {
					if (!res.ok) throw new Error('Proxy failed')
					return res.blob()
				})
				.then((blob) => {
					const file = new File([blob], 'search-import.jpg', {
						type: blob.type || 'image/jpeg',
					})
					handlePhotosChange([
						{
							id: `new-${Date.now()}-0`,
							file,
							preview: URL.createObjectURL(file),
							isMain: true,
							order: 0,
						},
					])
				})
				.catch(() => {
					// Silently fail — user can upload a photo manually
				})
		}
	}

	/**
	 * Handle image confirmation from scraping
	 */
	const handleImageConfirm = async (
		selectedImages: string[],
		mainImageIndex: number
	) => {
		setUploadProgress('Downloading images...')
		const photoItems: PhotoItem[] = []

		for (let i = 0; i < selectedImages.length; i++) {
			try {
				const response = await fetch('/api/proxy-image', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ imageUrl: selectedImages[i] }),
				})

				if (!response.ok) continue

				const blob = await response.blob()
				const file = new File([blob], `imported-${i}.jpg`, { type: blob.type })
				photoItems.push({
					id: `new-${Date.now()}-${i}`,
					file,
					preview: URL.createObjectURL(file),
					isMain: i === mainImageIndex,
					order: i,
				})
			} catch (error) {
				console.error('Failed to download image', error)
			}
		}

		handlePhotosChange(photoItems)
		setUploadProgress('')
	}

	/**
	 * Wrapper to handle form submission with validation card visibility
	 */
	const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		setAttemptedSubmit(true)
		onSubmit(e)
	}

	const watchedBrand = form.watch('brand')
	const watchedBrandId = form.watch('brandId')
	const watchedModel = form.watch('model')
	const watchedCategory = form.watch('category')
	const watchedRetailPrice = form.watch('retailPrice')
	const watchedTriedOn = form.watch('triedOn')
	const watchedSizeTried = form.watch('sizeTried')
	const watchedComfortRating = form.watch('comfortRating')

	return (
		<div className="max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8">
			<Card className="bg-card">
				{/* Header - Create Mode Only */}
				{!isFormVisible && (mode === 'create' || mode === 'add') && (
					<CardHeader className="text-left pb-6">
						<CardTitle className="text-3xl flex flex-col justify-start font-heading">
							<p className="-mb-2">Add a New Item</p>
							<p className="text-sm text-muted-foreground">
								Start by entering a URL or adding details manually.
							</p>
						</CardTitle>
					</CardHeader>
				)}

				<CardContent className="pt-6">
					{/* URL Import Section - Create Mode Only */}
					{!isFormVisible && (mode === 'create' || mode === 'add') ? (
						isBulkMode ? (
							<BulkImportSection onBack={() => setIsBulkMode(false)} />
						) : (
						<div className="space-y-5">
							{/* === SNEAKER SEARCH (primary entry point) === */}
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Sparkles className="h-4 w-4 text-primary" />
									<h3 className="text-sm font-semibold text-foreground font-heading">
										Search to auto-fill
									</h3>
								</div>
								<SneakerSearch onSelect={handleSearchSelect} />
							</div>

							{/* === SECONDARY: Manual / URL section toggle === */}
							<button
								type="button"
								onClick={() => setShowUrlSection((v) => !v)}
								className="flex w-full items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
							>
								Add manually or via URL
								<ChevronDown
									className={`h-3.5 w-3.5 transition-transform duration-200 ${showUrlSection ? 'rotate-180' : ''}`}
								/>
							</button>

							{showUrlSection && (
								<div className="space-y-4">
									<div className="bg-muted/40 rounded-xl p-5 border border-border">
										<h3 className="text-sm font-semibold text-foreground mb-3 font-heading">
											Auto-fill from URL
										</h3>
										<div className="space-y-2">
											<Label htmlFor="productUrl" className="text-xs text-muted-foreground">
												Paste product URL from a supported retailer.
											</Label>
											<div className="flex flex-col sm:flex-row gap-2">
												<Input
													id="productUrl"
													{...form.register('productUrl')}
													placeholder="https://..."
													className="flex-1"
													disabled={isScrapingUrl}
												/>
												<Button
													type="button"
													onClick={() => handleUrlScrape(form.watch('productUrl') || '')}
													disabled={isScrapingUrl || !form.watch('productUrl')}
												>
													{isScrapingUrl && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
													Import
												</Button>
											</div>
											{uploadProgress && (
												<p className="text-sm text-muted-foreground mt-2">{uploadProgress}</p>
											)}
										</div>
									</div>

									<Button
										variant="outline"
										onClick={() => setIsFormVisible(true)}
										className="w-full"
									>
										Enter Details Manually
									</Button>
								</div>
							)}

							<p
								className="cursor-pointer text-center text-sm text-slate-500 underline-offset-4 transition-colors hover:text-slate-800 hover:underline"
								onClick={() => setIsBulkMode(true)}
							>
								Adding your whole collection? Try Bulk Import
							</p>
						</div>
						)
					) : (
						<form onSubmit={handleFormSubmit} className="space-y-8" ref={formRef}>
							{/* === SNEAKER SEARCH — always available at the top of the form === */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Search className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm font-medium text-foreground">
											Search to update fields
										</span>
									</div>
									{autoFillActive && (
										<span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-medium text-green-700 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
											<CheckCircle2 className="h-3 w-3" />
											Auto-filled from eBay
										</span>
									)}
								</div>
								<SneakerSearch onSelect={handleSearchSelect} />
							</div>

							{/* Validation Status Card - Smart floating sidebar */}
							<ValidationStatusCard
								errors={form.formState.errors}
								watchedValues={{
									brand: watchedBrand,
									brandId: watchedBrandId,
									model: watchedModel,
									category: watchedCategory,
									retailPrice: watchedRetailPrice,
									triedOn: watchedTriedOn,
									sizeTried: watchedSizeTried,
									comfortRating: watchedComfortRating ?? undefined,
									photos: photos.length,
								}}
								intent={intent}
								photosLength={photos.length}
								isDirty={form.formState.isDirty}
								isValid={form.formState.isValid}
								mode={normalizedMode}
								initialDataStatus={initialData?.status}
								shouldShowCard={shouldShowCard}
								isSticky={isSticky}
								isMobile={isMobile}
								attemptedSubmit={attemptedSubmit}
								onDismiss={() => setAttemptedSubmit(false)}
							/>

							{/* Intent Toggle - Create Mode Only */}
							{(mode === 'create' || mode === 'add') && (
								<div className="grid grid-cols-2 gap-3">
									<button
										type="button"
										onClick={() => {
											setIntent('own')
											// Scrub wishlist-only fields so stale state
											// doesn't bleed into validation or the progress tracker.
											form.setValue('triedOn', false, { shouldValidate: true })
											form.setValue('comfortRating', null, { shouldValidate: false })
											form.clearErrors(['triedOn', 'sizeTried', 'comfortRating'])
										}}
										className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-5 px-4 font-semibold text-sm transition-all duration-150 ${
											intent === 'own'
												? 'bg-slate-900 text-white border-slate-900 shadow-md'
												: 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
										}`}
									>
										<Shirt className="h-5 w-5" />
										I Own These
									</button>
									<button
										type="button"
										onClick={() => {
											setIntent('wishlist')
											// Scrub own-only fields so stale state
											// doesn't bleed into validation or the progress tracker.
											form.setValue('wears', 0, { shouldValidate: false })
											form.clearErrors(['wears', 'sizeTried'])
										}}
										className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-5 px-4 font-semibold text-sm transition-all duration-150 ${
											intent === 'wishlist'
												? 'bg-slate-900 text-white border-slate-900 shadow-md'
												: 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
										}`}
									>
										<Star className="h-5 w-5" />
										Add to Wishlist
									</button>
								</div>
							)}

							{/* Move to Wardrobe — Edit mode, wishlist items only */}
							{(mode === 'edit') && intent === 'wishlist' && (
								<div className="rounded-xl border-2 border-dashed border-slate-300 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
									<div>
										<p className="text-sm font-semibold text-slate-900">Ready to buy?</p>
										<p className="text-xs text-muted-foreground mt-0.5">Move this item into your collection and start tracking wears.</p>
									</div>
									<Button
										type="button"
										variant="default"
										onClick={() => {
											setIntent('own')
											form.setValue('intent', 'own')
											form.clearErrors(['triedOn', 'sizeTried', 'comfortRating'])
										}}
									>
										<Shirt className="h-4 w-4 mr-2" />
										Move to Collection
									</Button>
								</div>
							)}

							{/* Basic Info Section */}
							<BasicInfoSection form={form} intent={intent} />

							{/* Pricing Section */}
							<PricingSection form={form} intent={intent} />

							{/* Photos Section */}
							<PhotoSection
								photos={photos}
								onPhotosChange={handlePhotosChange}
								errors={form.formState.errors}
							/>

							{/* Product URL & Price Tracking — hidden by default, toggled in */}
							<div>
								<button
									type="button"
									onClick={() => setShowUrlSection((v) => !v)}
									className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
								>
									<ChevronDown
										className={`h-3.5 w-3.5 transition-transform duration-200 ${showUrlSection ? 'rotate-180' : ''}`}
									/>
									{showUrlSection ? 'Hide' : 'Add'} product URL &amp; price tracking
								</button>

								{showUrlSection && (
									<div className="mt-4">
										<ProductURLSection
											form={form}
											isScrapingUrl={isScrapingUrl}
											uploadProgress={uploadProgress}
											urlValidation={urlValidation}
											onUrlScrape={handleUrlScrape}
											onShowRetailersDialog={() => setShowRetailersDialog(true)}
											mode={mode === 'create' || mode === 'add' ? 'create' : 'edit'}
											initialData={initialData}
											intent={intent}
										/>
									</div>
								)}
							</div>

							{/* Sizing & Additional Details — morphs based on intent */}
							<SizingSection
								form={form}
								mode={mode === 'create' || mode === 'add' ? 'create' : 'edit'}
								initialData={initialData}
								intent={intent}
							/>

							{/* Form Actions */}
							<FormActions isSubmitting={isSubmitting} mode={mode} onCancel={onCancel} />
						</form>
					)}
				</CardContent>
			</Card>

			{/* Image Confirmation Modal */}
			<ImageConfirmationModal
				open={showImageModal}
				onOpenChange={setShowImageModal}
				images={scrapedImages}
				onConfirm={handleImageConfirm}
			/>

			{/* Supported Retailers Dialog */}
			<SupportedRetailersDialog
				open={showRetailersDialog}
				onOpenChange={setShowRetailersDialog}
			/>
		</div>
	)
}
