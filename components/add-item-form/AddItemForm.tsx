'use client'

import { useState, useEffect, useRef } from 'react'
import { useFormLogic } from './useFormLogic'
import { BasicInfoSection } from './BasicInfoSection'
import { PricingSection } from './PricingSection'
import { PhotoSection } from './PhotoSection'
import { SizingSection } from './SizingSection'
import { ProductURLSection } from './ProductURLSection'
import { FormActions } from './FormActions'
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
import { Loader2, Search, Sparkles, Shirt, Star } from 'lucide-react'
import { type PhotoItem } from '@/components/types/photo-item'
import { type ItemCategory } from '@/components/types/item-category'

interface MagicSearchResult {
	title: string
	price: number
	imageUrl: string
	brand: string
}

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
	const [intent, setIntent] = useState<'own' | 'wishlist'>('own')

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

	// Magic Search state
	const [magicSearchQuery, setMagicSearchQuery] = useState('')
	const [isMagicSearching, setIsMagicSearching] = useState(false)
	const [magicSearchResults, setMagicSearchResults] = useState<MagicSearchResult[]>([])
	const [hasSearched, setHasSearched] = useState(false)

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
	 * Search eBay for products matching the query
	 */
	const handleMagicSearch = async () => {
		if (!magicSearchQuery.trim()) return
		setIsMagicSearching(true)
		setMagicSearchResults([])
		try {
			const response = await fetch('/api/magic-search', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ query: magicSearchQuery }),
			})
			if (!response.ok) throw new Error('Search failed')
			const data = await response.json()
			if (data.success) {
				setMagicSearchResults(data.results)
			}
		} catch (error) {
			console.error('Magic search error:', error)
		} finally {
			setIsMagicSearching(false)
			setHasSearched(true)
		}
	}

	/**
	 * Instantly fill the form from a Magic Search result card.
	 * Shows the form immediately; proxies the image in the background.
	 */
	const handleMagicResultSelect = (result: MagicSearchResult) => {
		// Sync: populate form fields instantly
		form.setValue('model', result.title, { shouldValidate: true, shouldDirty: true })
		form.setValue('retailPrice', result.price.toString(), {
			shouldValidate: true,
			shouldDirty: true,
		})
		form.setValue('category', 'shoes', { shouldValidate: true, shouldDirty: true })
		if (result.brand) {
			form.setValue('brand', result.brand, { shouldValidate: true, shouldDirty: true })
		}

		// Show the full form immediately — don't wait for the image
		setIsFormVisible(true)

		// Async: proxy the eBay image in the background (fire-and-forget)
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
					const file = new File([blob], 'magic-search-import.jpg', {
						type: blob.type || 'image/jpeg',
					})
					const photoItem: PhotoItem = {
						id: `new-${Date.now()}-0`,
						file,
						preview: URL.createObjectURL(file),
						isMain: true,
						order: 0,
					}
					handlePhotosChange([photoItem])
				})
				.catch((err) => {
					console.warn('Background image proxy failed:', err)
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
						<div className="space-y-6">
							{/* Intent Toggle */}
							<div className="grid grid-cols-2 gap-2">
								<Button
									type="button"
									variant={intent === 'own' ? 'default' : 'outline'}
									onClick={() => setIntent('own')}
									className="w-full flex items-center justify-center gap-2 h-12"
								>
									<Shirt className="h-4 w-4" />
									I Own This
								</Button>
								<Button
									type="button"
									variant={intent === 'wishlist' ? 'default' : 'outline'}
									onClick={() => setIntent('wishlist')}
									className="w-full flex items-center justify-center gap-2 h-12"
								>
									<Star className="h-4 w-4" />
									Wishlist
								</Button>
							</div>

							{/* === MAGIC SEARCH SECTION === */}
							<div className="bg-muted/40 rounded-xl p-6 border border-border">
								<h3 className="text-base font-semibold text-foreground mb-1 font-heading flex items-center gap-2">
									<Sparkles className="h-4 w-4 text-primary" />
									Magic Search
								</h3>
								<p className="text-xs text-muted-foreground mb-4">
									Search eBay to instantly fill in product details.
								</p>
								<div className="flex flex-col sm:flex-row gap-2">
									<Input
										placeholder="e.g. Nike Air Max 90, Jordan 1 Bred..."
										value={magicSearchQuery}
										onChange={(e) => setMagicSearchQuery(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault()
												handleMagicSearch()
											}
										}}
										disabled={isMagicSearching}
										className="flex-1"
									/>
									<Button
										type="button"
										onClick={handleMagicSearch}
										disabled={isMagicSearching || !magicSearchQuery.trim()}
									>
										{isMagicSearching ? (
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										) : (
											<Search className="h-4 w-4 mr-2" />
										)}
										Search
									</Button>
								</div>

								{/* Results grid — shown after a successful search */}
								{magicSearchResults.length > 0 && (
									<div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
										{magicSearchResults.map((result, index) => (
											<button
												key={index}
												type="button"
												onClick={() => handleMagicResultSelect(result)}
												className="group text-left rounded-lg border border-border bg-background overflow-hidden hover:border-primary hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
											>
												<div className="aspect-square w-full overflow-hidden bg-muted">
													{/* Plain img tag — eBay images load directly, no remotePatterns needed */}
													<img
														src={result.imageUrl}
														alt={result.title}
														className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
														loading="lazy"
													/>
												</div>
												<div className="p-2">
													<p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
														{result.title}
													</p>
													<p className="text-xs text-primary font-semibold mt-1">
														${result.price.toFixed(2)}
													</p>
												</div>
											</button>
										))}
									</div>
								)}

								{/* Empty state — only shown after a search returns nothing */}
								{hasSearched && !isMagicSearching && magicSearchResults.length === 0 && (
									<p className="mt-3 text-xs text-muted-foreground">
										No results found. Try a different search term.
									</p>
								)}
							</div>

							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground font-bold">Or</span>
							</div>

							{/* === EXISTING URL IMPORT SECTION (unchanged) === */}
							<div className="bg-muted/40 rounded-xl p-6 border border-border">
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

							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground font-bold">Or</span>
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

							{/* Intent Toggle - Create Mode Only */}
							{(mode === 'create' || mode === 'add') && (
								<div className="grid grid-cols-2 gap-2">
									<Button
										type="button"
										variant={intent === 'own' ? 'default' : 'outline'}
										onClick={() => setIntent('own')}
										className="w-full flex items-center justify-center gap-2 h-12"
									>
										<Shirt className="h-4 w-4" />
										I Own This
									</Button>
									<Button
										type="button"
										variant={intent === 'wishlist' ? 'default' : 'outline'}
										onClick={() => setIntent('wishlist')}
										className="w-full flex items-center justify-center gap-2 h-12"
									>
										<Star className="h-4 w-4" />
										Wishlist
									</Button>
								</div>
							)}

							{/* Basic Info Section */}
							<BasicInfoSection form={form} />

							{/* Pricing Section */}
							<PricingSection form={form} intent={intent} />

							{/* Photos Section */}
							<PhotoSection
								photos={photos}
								onPhotosChange={handlePhotosChange}
								errors={form.formState.errors}
							/>

							{/* Product URL & Price Tracking — Wishlist only in create mode */}
							{(mode === 'edit' || intent === 'wishlist') && (
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
							)}

							{/* Sizing & Additional Details — Own intent shows flat; Wishlist hides entirely */}
							{(mode === 'edit' || intent === 'own') && (
								<SizingSection
									form={form}
									mode={mode === 'create' || mode === 'add' ? 'create' : 'edit'}
									initialData={initialData}
									formMode={formMode}
									intent={intent}
								/>
							)}

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
