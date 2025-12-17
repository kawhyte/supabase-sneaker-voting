'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import {
	isSizeRequired,
	isComfortRequired,
	getSizeType,
	type ItemCategory,
} from '@/components/types/item-category'
import { PhotoItem } from '@/components/types/photo-item'
import { ItemStatus } from '@/types/ItemStatus'

/**
 * Form validation schema.
 * Defines required fields and validation rules for wardrobe items.
 */
export const itemFormSchema = z
	.object({
		triedOn: z.boolean().default(false),
		category: z.enum(
			[
				'shoes',
				'tops',
				'bottoms',
				'outerwear',
				'accessories',
			],
			{
				required_error: 'Please select the item category',
			}
		),
		productUrl: z
			.string()
			.url('Please enter a valid URL')
			.max(500)
			.optional()
			.or(z.literal('')),
		auto_price_tracking_enabled: z.boolean().default(false),
		enableNotifications: z.boolean().default(false),
		brandId: z.number().int().positive('Brand is required'),
		brand: z.string().min(1, 'Brand is required').max(50).trim(),
		model: z.string().min(2, 'Item name is required').max(100).trim(),
		sku: z.string().max(50).optional().or(z.literal('')),
		color: z.string().min(1, 'Color is required').max(100).trim(),
		sizeTried: z.string().optional(),
		comfortRating: z.coerce.number().min(1).max(5).optional(),
		retailPrice: z
			.string()
			.regex(
				/^\d+(\.\d{1,2})?$/,
				'Please enter a valid price (e.g., 170 or 170.00)'
			)
			.refine((val) => {
				if (val === '') return true
				const price = parseFloat(val)
				return price >= 0 && price <= 10000
			}, 'Price must be between $0 and $10,000'),
		salePrice: z
			.string()
			.regex(/^\d+(\.\d{1,2})?$/, 'Please enter a valid price (e.g., 150 or 150.00)')
			.refine((val) => {
				if (val === '') return true
				const price = parseFloat(val)
				return price >= 0 && price <= 10000
			}, 'Sale price must be between $0 and $10,000')
			.optional()
			.or(z.literal('')),
		targetPrice: z
			.string()
			.regex(/^\d+(\.\d{1,2})?$/, 'Please enter a valid price (e.g., 100 or 100.00)')
			.refine((val) => {
				if (val === '') return true
				const price = parseFloat(val)
				return price >= 0 && price <= 10000
			}, 'Target price must be between $0 and $10,000')
			.optional()
			.or(z.literal('')),
		wears: z.coerce.number().min(0).max(10000).optional().default(0),
		notes: z.string().max(120).trim().optional().or(z.literal('')),

		// PHASE 2: Store & Purchase Fields (Optional)
		storeName: z.string().max(100).trim().optional().or(z.literal('')),
		storeUrl: z
			.string()
			.url('Please enter a valid store URL')
			.max(500)
			.optional()
			.or(z.literal('')),
		purchaseDate: z
			.string()
			.refine((val) => {
				if (!val) return true // Optional field
				const date = new Date(val)
				return !isNaN(date.getTime()) && date <= new Date()
			}, 'Purchase date cannot be in the future')
			.optional()
			.or(z.literal('')),
	})
	.refine(
		(data) => {
			if (isSizeRequired(data.category) && data.triedOn) {
				return data.sizeTried && data.sizeTried.length > 0
			}
			return true
		},
		{ message: 'Please select the size you tried on', path: ['sizeTried'] }
	)
	.refine(
		(data) => {
			if (
				isComfortRequired(data.category) &&
				data.triedOn
			) {
				return data.comfortRating !== undefined
			}
			return true
		},
		{ message: 'Please rate the comfort', path: ['comfortRating'] }
	)
	.refine(
		(data) => {
			if (data.retailPrice && data.salePrice) {
				return parseFloat(data.salePrice) <= parseFloat(data.retailPrice)
			}
			return true
		},
		{
			message: 'Sale price cannot be higher than retail price',
			path: ['salePrice'],
		}
	)
	.refine(
		(data) => {
			// If price tracking enabled, product URL must be provided
			if (data.auto_price_tracking_enabled) {
				return data.productUrl && data.productUrl.trim().length > 0
			}
			return true
		},
		{
			message: 'Product URL is required when price tracking is enabled',
			path: ['productUrl'],
		}
	)

export type ItemFormData = z.infer<typeof itemFormSchema>

export interface UseFormLogicProps {
	mode: 'add' | 'create' | 'edit'
	initialData?: any
	onSuccess?: () => void
}

/**
 * Business logic hook for AddItemForm.
 *
 * Handles:
 * - Form state management with React Hook Form
 * - Validation with Zod schema
 * - Photo uploads to Cloudinary
 * - Item creation/update in Supabase
 * - Success/error handling
 *
 * @param props - Configuration options
 * @returns Form methods, state, and handlers
 */
export function useFormLogic({ mode, initialData, onSuccess }: UseFormLogicProps) {
	const router = useRouter()
	const supabase = createClient()

	// Form state
	const form = useForm<ItemFormData>({
		resolver: zodResolver(itemFormSchema),
		mode: 'onChange',
		defaultValues:
			mode === 'edit' && initialData
				? {
						triedOn: initialData.has_been_tried || false,
						category: initialData.category || undefined,
						brandId: initialData.brand_id || undefined,
						brand: initialData.brand || '',
						model: initialData.model || '',
						sku: initialData.sku || '',
						color: initialData.color || '',
						sizeTried: initialData.size_tried || '',
						comfortRating: initialData.comfort_rating || undefined,
						retailPrice: initialData.retail_price?.toString() || '',
						salePrice: initialData.sale_price?.toString() || '',
						targetPrice: initialData.target_price?.toString() || '',
						wears: initialData.wears || 0,
						notes: initialData.notes || '',
						productUrl: initialData.product_url || '',

						// PHASE 2: Store & Purchase Fields
						storeName: initialData.store_name || '',
						storeUrl: initialData.store_url || '',
						purchaseDate: initialData.purchase_date || '',
				  }
				: {
						triedOn: false,
						wears: 0,
				  },
	})

	// Additional state
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [photos, setPhotos] = useState<PhotoItem[]>(
		initialData?.item_photos?.map((p: any) => ({
			id: p.id,
			file: new File([], ''),
			preview: p.image_url,
			isMain: p.is_main_image,
			order: p.image_order,
			isExisting: true,
		})) || []
	)

	/**
	 * Handle form submission.
	 * Creates or updates wardrobe item with photos.
	 */
	const onSubmit = async (data: ItemFormData) => {
		try {
			setIsSubmitting(true)

			// Get current user
			const {
				data: { user },
			} = await supabase.auth.getUser()
			if (!user) {
				toast.error('Authentication Error', {
					description: 'You must be logged in to add or edit an item.',
				})
				return
			}

			// Separate new and existing photos
			const newPhotos = photos.filter((p) => !p.isExisting)
			const existingPhotos = photos.filter((p) => p.isExisting)

			// Upload new photos
			const uploadedPhotoData: {
				url: string
				cloudinaryId: string
				order: number
				isMain: boolean
			}[] = []

			for (let i = 0; i < newPhotos.length; i++) {
				const photo = newPhotos[i]
				const formData = new FormData()
				formData.append('file', photo.file)

				const res = await fetch('/api/upload-image', {
					method: 'POST',
					body: formData,
				})

				if (!res.ok) throw new Error(`Failed to upload image ${i + 1}`)

				const result = await res.json()
				uploadedPhotoData.push({
					url: result.data.url,
					cloudinaryId: result.data.publicId,
					order: photo.order,
					isMain: photo.isMain,
				})
			}

			// Prepare item data
			const itemData = {
				user_id: user.id,
				brand: data.brand,
				brand_id: data.brandId || null,
				model: data.model,
				color: data.color || null,
				sku: data.sku || null,
				category: data.category,
				size_type: getSizeType(data.category as ItemCategory),
				size_tried: data.triedOn ? data.sizeTried : null,
				comfort_rating:
					data.triedOn ? data.comfortRating : null,
				retail_price: data.retailPrice ? parseFloat(data.retailPrice) : null,
				sale_price: data.salePrice ? parseFloat(data.salePrice) : null,
				target_price: data.targetPrice ? parseFloat(data.targetPrice) : null,
				product_url: data.productUrl || null,
				auto_price_tracking_enabled: data.auto_price_tracking_enabled || false,
				notes: data.notes && data.notes.trim() ? data.notes : '',

				// PHASE 2: Store & Purchase Fields
				store_name: data.storeName && data.storeName.trim() ? data.storeName : null,
				store_url: data.storeUrl && data.storeUrl.trim() ? data.storeUrl : null,
				purchase_date: data.purchaseDate || null,

				wears: data.wears || 0,
				status: (mode === 'add' || mode === 'create' ? ItemStatus.WISHLISTED : initialData?.status) as ItemStatus,
				has_been_tried: data.triedOn,
			}

			let resultItem: any

			if (mode === 'edit' && initialData?.id) {
				// Update existing item
				const { data: updatedItem, error } = await supabase
					.from('items')
					.update(itemData)
					.eq('id', initialData.id)
					.select()
					.single()

				if (error) throw error
				resultItem = updatedItem

				// Handle photo deletions
				const initialPhotoIds =
					initialData.item_photos?.map((p: any) => p.id) || []
				const currentPhotoIds = photos
					.filter((p) => p.isExisting)
					.map((p) => p.id)
				const deletedPhotoIds = initialPhotoIds.filter(
					(id: string) => !currentPhotoIds.includes(id)
				)

				if (deletedPhotoIds.length > 0) {
					console.log(`[Photo Cleanup] Found ${deletedPhotoIds.length} photos to delete during edit`)

					// CRITICAL: Fetch cloudinary_id values BEFORE deleting database records
					// This ensures we can delete from Cloudinary storage
					const { data: photosToDelete, error: fetchError } = await supabase
						.from('item_photos')
						.select('id, cloudinary_id')
						.in('id', deletedPhotoIds)

					if (fetchError) {
						console.error('[Photo Cleanup] Failed to fetch photos for deletion:', fetchError)
						throw new Error('Failed to prepare photo deletion')
					}

					// Delete from Cloudinary first (batch processing with retry logic)
					if (photosToDelete && photosToDelete.length > 0) {
						const cloudinaryIds = photosToDelete
							.map(p => p.cloudinary_id)
							.filter(Boolean)

						if (cloudinaryIds.length > 0) {
							console.log(`[Photo Cleanup] Deleting ${cloudinaryIds.length} images from Cloudinary...`)

							// Process in batches of 5 for parallel deletion
							const BATCH_SIZE = 5
							const errors: string[] = []

							for (let i = 0; i < cloudinaryIds.length; i += BATCH_SIZE) {
								const batch = cloudinaryIds.slice(i, i + BATCH_SIZE)

								const results = await Promise.allSettled(
									batch.map(async (cloudinaryId) => {
										// Retry logic: 3 attempts with exponential backoff
										for (let attempt = 0; attempt < 3; attempt++) {
											try {
												const response = await fetch('/api/delete-image', {
													method: 'POST',
													headers: { 'Content-Type': 'application/json' },
													body: JSON.stringify({ publicId: cloudinaryId }),
												})

												if (response.ok) {
													console.log(`[Photo Cleanup] ✓ Deleted from Cloudinary: ${cloudinaryId}`)
													return { success: true }
												}

												// Retry on 5xx errors
												if (response.status >= 500 && attempt < 2) {
													const delay = Math.pow(2, attempt) * 1000
													console.warn(`[Photo Cleanup] Retry ${attempt + 1}/3 for ${cloudinaryId} after ${delay}ms`)
													await new Promise(resolve => setTimeout(resolve, delay))
													continue
												}

												throw new Error(`HTTP ${response.status}`)
											} catch (error) {
												if (attempt === 2) {
													throw error
												}
											}
										}
									})
								)

								// Collect errors but continue processing
								results.forEach((result, idx) => {
									if (result.status === 'rejected') {
										const cloudinaryId = batch[idx]
										console.warn(`[Photo Cleanup] ✗ Failed to delete from Cloudinary: ${cloudinaryId}`, result.reason)
										errors.push(`${cloudinaryId}: ${result.reason}`)
									}
								})
							}

							if (errors.length > 0) {
								console.warn(`[Photo Cleanup] ${errors.length}/${cloudinaryIds.length} Cloudinary deletions failed, but continuing with database cleanup`)
								// Log errors but don't throw - database cleanup is still important
							} else {
								console.log(`[Photo Cleanup] ✓ All ${cloudinaryIds.length} images deleted from Cloudinary successfully`)
							}
						}
					}

					// Delete from database (this removes the tracking records)
					const { error: deleteError } = await supabase
						.from('item_photos')
						.delete()
						.in('id', deletedPhotoIds)

					if (deleteError) {
						console.error('[Photo Cleanup] CRITICAL: Failed to delete photos from database after Cloudinary cleanup:', deleteError)
						throw new Error(`Failed to delete photos: ${deleteError.message}`)
					}

					console.log(`[Photo Cleanup] ✓ Database records deleted successfully`)
				}

				// Update existing photo metadata (order, isMain)
				if (existingPhotos.length > 0) {
					for (const photo of existingPhotos) {
						const { error: updateError } = await supabase
							.from('item_photos')
							.update({
								image_order: photo.order,
								is_main_image: photo.isMain,
							})
							.eq('id', photo.id)

						if (updateError) {
							throw new Error(`Failed to update image order: ${updateError.message}`)
						}
					}
				}
			} else {
				// Create new item
				const { data: insertedItem, error } = await supabase
					.from('items')
					.insert(itemData)
					.select()
					.single()

				if (error) throw error
				resultItem = insertedItem
			}

			// Insert uploaded photos
			if (uploadedPhotoData.length > 0) {
				const photoRecords = uploadedPhotoData.map((p) => ({
					item_id: resultItem.id,
					image_url: p.url,
					cloudinary_id: p.cloudinaryId,
					image_order: p.order,
					is_main_image: p.isMain,
				}))

				const { error: photoError } = await supabase
					.from('item_photos')
					.insert(photoRecords)

				if (photoError) throw photoError
			}

			// Trigger color analysis for footwear items (in background, non-blocking)
			if (
				mode !== 'edit' &&
				uploadedPhotoData.length > 0 &&
				['sneakers', 'shoes', 'footwear'].includes(data.category)
			) {
				const mainPhoto = uploadedPhotoData.find((p) => p.isMain) || uploadedPhotoData[0]
				if (mainPhoto) {
					// Import dynamically to avoid circular dependencies
					import('@/app/actions/color-analysis').then(({ analyzeAndSaveColors }) => {
						analyzeAndSaveColors(resultItem.id, mainPhoto.url).catch((err) =>
							console.warn('Color analysis failed (non-critical):', err)
						)
					})
				}
			}

			toast.success('Success', {
				description: mode === 'edit' ? 'Item updated!' : 'Item added to your wardrobe!',
			})

			// Check for new achievements (stats auto-updated via DB trigger)
			if (mode !== 'edit') {
				// Only check on new items, not edits
				fetch('/api/check-achievements', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId: user.id }),
				}).catch((err) => console.warn('Achievement check failed:', err))
			}

			// Call success callback and refresh
			onSuccess?.()
			router.refresh()
		} catch (error) {
			console.error('Error saving item:', error)
			toast.error('Error', {
				description: error instanceof Error ? error.message : 'Failed to save item',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	/**
	 * Handle photo updates.
	 */
	const handlePhotosChange = (updatedPhotos: PhotoItem[]) => {
		setPhotos(updatedPhotos)
	}

	return {
		form,
		isSubmitting,
		photos,
		onSubmit: form.handleSubmit(onSubmit),
		handlePhotosChange,
	}
}
