'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'
import { ItemStatus } from '@/types/ItemStatus'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, ScanLine, ArrowLeft, PackagePlus } from 'lucide-react'
import { toast } from 'sonner'

interface ScannedItem {
	title: string
	price: number
	imageUrl: string
	brand: string
	// editable before save
	purchasePrice: string
	color: string
	sizeTried: string
}

interface BulkImportSectionProps {
	onBack: () => void
}

export function BulkImportSection({ onBack }: BulkImportSectionProps) {
	const router = useRouter()
	const supabase = createClient()

	const [inputText, setInputText] = useState('')
	const [isScanning, setIsScanning] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [scannedItems, setScannedItems] = useState<ScannedItem[]>([])
	const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
	const [hasScanned, setHasScanned] = useState(false)

	const handleScan = async () => {
		const lines = inputText
			.split('\n')
			.map((l) => l.trim())
			.filter(Boolean)

		if (lines.length === 0) return

		setIsScanning(true)
		setScannedItems([])
		setHasScanned(false)

		const results = await Promise.allSettled(
			lines.map((query) =>
				fetch('/api/magic-search', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ query }),
				})
					.then((res) => {
						if (!res.ok) throw new Error('Search failed')
						return res.json()
					})
					.then((data) => {
						if (data.success && data.results.length > 0) {
							const r = data.results[0]
							return {
								title: r.title,
								price: r.price,
								imageUrl: r.imageUrl,
								brand: r.brand,
								purchasePrice: r.price ? r.price.toFixed(2) : '',
								color: '',
								sizeTried: '',
							} as ScannedItem
						}
						return null
					})
			)
		)

		const found: ScannedItem[] = results
			.filter(
				(r): r is PromiseFulfilledResult<ScannedItem | null> =>
					r.status === 'fulfilled' && r.value !== null
			)
			.map((r) => r.value as ScannedItem)

		setScannedItems(found)
		setSelectedIndices(new Set(found.map((_, i) => i)))
		setIsScanning(false)
		setHasScanned(true)
	}

	const toggleSelected = (index: number) => {
		setSelectedIndices((prev) => {
			const next = new Set(prev)
			if (next.has(index)) next.delete(index)
			else next.add(index)
			return next
		})
	}

	const updateItem = (index: number, field: keyof ScannedItem, value: string) => {
		setScannedItems((prev) =>
			prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
		)
	}

	const handleSaveAll = async () => {
		const itemsToSave = scannedItems.filter((_, i) => selectedIndices.has(i))
		if (itemsToSave.length === 0) return

		setIsSaving(true)
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser()

			if (!user) {
				toast.error('You must be logged in to save items.')
				return
			}

			// Phase 1: Upload all images in parallel (failures are non-blocking)
			const imageResults = await Promise.allSettled(
				itemsToSave.map((item) =>
					item.imageUrl
						? fetch('/api/upload-from-url', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ url: item.imageUrl }),
							})
								.then((res) => res.json())
								.then((data) =>
									data.success
										? { url: data.data.url as string, publicId: data.data.publicId as string }
										: null
								)
						: Promise.resolve(null)
				)
			)

			const uploadedImages = imageResults.map((r) =>
				r.status === 'fulfilled' ? r.value : null
			)

			// Phase 2: Batch insert items
			const records = itemsToSave.map((item) => ({
				user_id: user.id,
				brand: item.brand || 'Unknown',
				brand_id: null,
				model: item.title,
				color: item.color.trim() || null,
				sku: null,
				category: 'shoes',
				size_type: 'shoe',
				size_tried: item.sizeTried.trim() || null,
				comfort_rating: null,
				retail_price: item.price || null,
				purchase_price: item.purchasePrice ? parseFloat(item.purchasePrice) || null : null,
				sale_price: null,
				target_price: null,
				product_url: null,
				auto_price_tracking_enabled: false,
				notes: '',
				store_name: null,
				store_url: null,
				purchase_date: null,
				wears: 0,
				status: ItemStatus.OWNED,
				has_been_tried: false,
			}))

			const { data: insertedItems, error: itemsError } = await supabase
				.from('items')
				.insert(records)
				.select('id')

			if (itemsError) throw itemsError

			// Phase 3: Batch insert photos for items where upload succeeded
			if (insertedItems && insertedItems.length > 0) {
				const photoRecords = insertedItems
					.map((item, i) => {
						const img = uploadedImages[i]
						if (!img) return null
						return {
							item_id: item.id,
							image_url: img.url,
							cloudinary_id: img.publicId,
							image_order: 0,
							is_main_image: true,
						}
					})
					.filter((r): r is NonNullable<typeof r> => r !== null)

				if (photoRecords.length > 0) {
					const { error: photosError } = await supabase.from('item_photos').insert(photoRecords)
					if (photosError) console.error('Photo insert error:', photosError)
				}
			}

			toast.success(
				`${itemsToSave.length} item${itemsToSave.length > 1 ? 's' : ''} added to your collection!`
			)
			router.push('/dashboard?tab=rotation')
			router.refresh()
		} catch (error) {
			console.error('Bulk Save Error:', JSON.stringify(error, null, 2), error)
			const pgError = error as { message?: string; details?: string; hint?: string }
			toast.error('Failed to save items', {
				description: pgError.message || pgError.details || 'Unknown database error',
			})
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={onBack}
					className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					Back
				</button>
				<div>
					<h3 className="text-base font-semibold text-foreground font-heading flex items-center gap-2">
						<ScanLine className="h-4 w-4 text-primary" />
						Bulk Import
					</h3>
					<p className="text-xs text-muted-foreground">
						Paste item names below — one per line. We'll search eBay for each.
					</p>
				</div>
			</div>

			{/* Textarea */}
			<Textarea
				placeholder={`Nike Air Max 90\nJordan 1 Bred\nAdidas Ultraboost 22`}
				value={inputText}
				onChange={(e) => setInputText(e.target.value)}
				rows={6}
				disabled={isScanning}
				className="resize-none font-mono text-sm"
			/>

			{/* Scan Button */}
			<Button
				type="button"
				onClick={handleScan}
				disabled={isScanning || !inputText.trim()}
				className="w-full"
			>
				{isScanning ? (
					<>
						<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						Scanning...
					</>
				) : (
					<>
						<ScanLine className="h-4 w-4 mr-2" />
						Scan Collection
					</>
				)}
			</Button>

			{/* Review Grid */}
			{hasScanned && (
				<div className="space-y-4">
					{scannedItems.length > 0 ? (
						<>
							<p className="text-xs text-muted-foreground">
								{scannedItems.length} result{scannedItems.length !== 1 ? 's' : ''} found. Uncheck
								any items you don't want to save.
							</p>
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
								{scannedItems.map((item, index) => (
									<div
										key={index}
										className={`relative rounded-lg border bg-background overflow-hidden transition-opacity ${
											selectedIndices.has(index)
												? 'border-border'
												: 'border-border opacity-40'
										}`}
									>
										{/* Selection checkbox */}
										<div className="absolute top-2 left-2 z-10 dense">
											<Checkbox
												checked={selectedIndices.has(index)}
												onCheckedChange={() => toggleSelected(index)}
												className="h-6 w-6 rounded-full border-2"
												aria-label={selectedIndices.has(index) ? 'Deselect item' : 'Select item'}
											/>
										</div>

										{/* Image */}
										<div className="aspect-square w-full overflow-hidden bg-muted">
											{item.imageUrl ? (
												<img
													src={item.imageUrl}
													alt={item.title}
													className="w-full h-full object-cover"
													loading="lazy"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
													No image
												</div>
											)}
										</div>

										{/* Info + editable fields */}
										<div className="p-2 space-y-2">
											<p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
												{item.title}
											</p>

											<div className="dense space-y-1.5">
												{/* Purchase Price */}
												<div className="flex items-center gap-1">
													<span className="text-xs text-muted-foreground w-10 shrink-0">Price</span>
													<div className="relative flex-1">
														<span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
															$
														</span>
														<Input
															type="number"
															min="0"
															step="0.01"
															value={item.purchasePrice}
															onChange={(e) => updateItem(index, 'purchasePrice', e.target.value)}
															className="pl-5 h-7 text-xs"
															placeholder="0.00"
														/>
													</div>
												</div>

												{/* Color */}
												<div className="flex items-center gap-1">
													<span className="text-xs text-muted-foreground w-10 shrink-0">Color</span>
													<Input
														type="text"
														value={item.color}
														onChange={(e) => updateItem(index, 'color', e.target.value)}
														className="h-7 text-xs flex-1"
														placeholder="e.g. Black"
													/>
												</div>

												{/* Size */}
												<div className="flex items-center gap-1">
													<span className="text-xs text-muted-foreground w-10 shrink-0">Size</span>
													<Input
														type="text"
														value={item.sizeTried}
														onChange={(e) => updateItem(index, 'sizeTried', e.target.value)}
														className="h-7 text-xs flex-1"
														placeholder="e.g. 10.5"
													/>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Save All Button */}
							{(() => {
								const saveCount = selectedIndices.size
								return (
									<Button
										type="button"
										onClick={handleSaveAll}
										disabled={isSaving || saveCount === 0}
										className="w-full"
									>
										{isSaving ? (
											<>
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
												Saving...
											</>
										) : (
											<>
												<PackagePlus className="h-4 w-4 mr-2" />
												Save {saveCount} Item{saveCount !== 1 ? 's' : ''} to Wardrobe
											</>
										)}
									</Button>
								)
							})()}
						</>
					) : (
						<p className="text-sm text-muted-foreground text-center py-4">
							No results found. Try different item names.
						</p>
					)}
				</div>
			)}
		</div>
	)
}
