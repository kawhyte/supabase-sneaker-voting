'use client'

import { useState, useEffect, useRef } from 'react'
import { useFormLogic } from './useFormLogic'
import { BasicInfoSection } from './BasicInfoSection'
import { PricingSection } from './PricingSection'
import { PhotoSection } from './PhotoSection'
import { SizingSection } from './SizingSection'
import { ProductURLSection } from './ProductURLSection'
import { FormActions } from './FormActions'
import { DuplicationWarningBanner } from '@/components/DuplicationWarningBanner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageConfirmationModal } from '@/components/ImageConfirmationModal'
import { SupportedRetailersDialog } from '@/components/SupportedRetailersDialog'
import { ValidationStatusCard } from '@/components/ItemValidationStatusCard'
import { useValidationVisibility } from '@/hooks/useValidationVisibility'
import { useSmartDefaults } from '@/hooks/useSmartDefaults'
import { useFormMode } from '@/lib/form-mode-context'
import {
	validateProductUrl,
	isSupportedRetailer,
	type UrlValidationResult,
} from '@/lib/retailer-url-validator'
import { detectCategoryFromUrl } from '@/lib/item-utils'
import { Loader2, Lightbulb } from 'lucide-react'
import { type PhotoItem } from '@/components/types/photo-item'
import { type ItemCategory } from '@/components/types/item-category'

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
 * - Duplicate item detection
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
	// Form logic hook
	const {
		form,
		isSubmitting,
		photos,
		duplicationWarning,
		userId,
		onSubmit,
		handlePhotosChange,
		handleDismissWarning,
		handleAddAnyway,
	} = useFormLogic({ mode, initialData, onSuccess })

	// Normalize mode: "add" and "create" both mean creating a new item
	const normalizedMode = mode === 'add' ? 'create' : mode

	// Form mode context (Quick vs Advanced)
	const { mode: formMode, setMode: setFormMode } = useFormMode()

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

	// PHASE 1 FIX: Smart default formMode in edit mode
	// If editing an item that has advanced fields filled (SKU, notes, or wears),
	// ensure formMode is set to 'advanced' so users can see and edit those fields
	// This prevents confusion when user's localStorage has formMode='quick'
	useEffect(() => {
		if (mode === 'edit' && initialData) {
			const hasAdvancedFields = !!(
				initialData.sku ||
				initialData.notes ||
				(initialData.wears && initialData.wears > 0)
			)
			if (hasAdvancedFields && formMode === 'quick') {
				setFormMode('advanced')
			}
		}
	}, [mode, initialData, formMode, setFormMode])

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
						<div className="space-y-6">
							<div className="bg-blaze-50 rounded-lg p-4 sm:p-6 border-2 border-sun-300">
								<h3 className="text-base font-semibold text-foreground mb-4 font-heading">
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

							<div className="relative">
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-background px-2 text-muted-foreground font-bold">
										Or
									</span>
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
					) : (
						<form onSubmit={handleFormSubmit} className="space-y-8" ref={formRef}>
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
									comfortRating: watchedComfortRating,
									photos: photos.length,
								}}
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

							{/* Form Mode Toggle - Create Mode Only */}
							{(mode === 'create' || mode === 'add') && (
								<div className="flex items-center gap-3 p-4 rounded-lg bg-blaze-50 border border-sun-300">
									<Lightbulb className="h-5 w-5 text-sun-400 flex-shrink-0" />
									<div className="flex-1">
										<p className="text-sm font-medium text-slate-900">
											{formMode === 'quick' ? 'Quick Mode' : 'Advanced Mode'}
										</p>
										<p className="text-xs text-slate-600">
											{formMode === 'quick'
												? 'Add essentials in 15-30 seconds'
												: 'Full details including SKU, notes, and more'}
										</p>
									</div>
									<Button
										type="button"
										variant={formMode === 'quick' ? 'default' : 'outline'}
										size="sm"
										onClick={() => setFormMode('quick')}
										className="text-xs"
									>
										Quick
									</Button>
									<Button
										type="button"
										variant={formMode === 'advanced' ? 'default' : 'outline'}
										size="sm"
										onClick={() => setFormMode('advanced')}
										className="text-xs"
									>
										Advanced
									</Button>
								</div>
							)}

							{/* Basic Info Section */}
							<BasicInfoSection form={form} />

							{/* Duplication Warning Banner */}
							{duplicationWarning && (
								<div className="space-y-4">
									<DuplicationWarningBanner
										warning={duplicationWarning}
										onDismiss={handleDismissWarning}
										userId={userId || undefined}
										newItemName={`${form.getValues('brand')} ${form.getValues('model')}`}
									/>

									{/* Add Anyway Button */}
									<div className="flex justify-end">
										<Button
											type="button"
											onClick={handleAddAnyway}
											variant="outline"
											className="min-w-[160px]"
										>
											Add Item Anyway
										</Button>
									</div>
								</div>
							)}

							{/* Pricing Section */}
							<PricingSection form={form} />

							{/* Photos Section */}
							<PhotoSection
								photos={photos}
								onPhotosChange={handlePhotosChange}
								errors={form.formState.errors}
							/>

							{/* Product URL & Price Tracking Section */}
							<ProductURLSection
								form={form}
								isScrapingUrl={isScrapingUrl}
								uploadProgress={uploadProgress}
								urlValidation={urlValidation}
								onUrlScrape={handleUrlScrape}
								onShowRetailersDialog={() => setShowRetailersDialog(true)}
								mode={mode === 'create' || mode === 'add' ? 'create' : 'edit'}
								initialData={initialData}
							/>

							{/* Sizing & Additional Details - Advanced Mode Only */}
							<SizingSection
								form={form}
								mode={mode === 'create' || mode === 'add' ? 'create' : 'edit'}
								initialData={initialData}
								formMode={formMode}
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
