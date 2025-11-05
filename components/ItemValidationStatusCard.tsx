'use client'

import { useMemo, useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, Info, Camera, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet'
import { Progress } from '@/components/ui/progress'

/**
 * 🎨 GRID LAYOUT CONFIGURATION
 *
 * Change this number to test different grid layouts:
 * - 3 = Three columns (RECOMMENDED - best balance) ⭐
 * - 4 = Four columns (good for more horizontal space)
 * - 5 = Five columns (only for very wide screens)
 *
 * This controls the desktop grid layout for validation items.
 * Mobile always stays single column (bottom sheet).
 */
const GRID_COLUMNS = 3 // 👈 CHANGE THIS TO 3, 4, or 5

/**
 * Get the Tailwind grid class based on GRID_COLUMNS setting
 */
const getGridClass = () => {
	const gridClasses = {
		3: 'grid-cols-3',
		4: 'grid-cols-4',
		5: 'grid-cols-5',
	}
	return gridClasses[GRID_COLUMNS as keyof typeof gridClasses] || 'grid-cols-3'
}

interface ValidationStatusCardProps {
	errors: Record<string, any>
	watchedValues: {
		brand?: string
		brandId?: number
		model?: string
		category?: string
		retailPrice?: string
		triedOn?: boolean
		sizeTried?: string
		comfortRating?: number
		photos?: number
	}
	photosLength: number
	isDirty: boolean
	isValid: boolean
	mode?: 'create' | 'edit'
	initialDataStatus?: string
	shouldShowCard: boolean
	isSticky: boolean
	isMobile: boolean
	attemptedSubmit?: boolean
	onDismiss?: () => void
}

interface ValidationItem {
	id: string
	label: string
	status: 'complete' | 'pending' | 'conditional'
	hint?: string
	required?: boolean
	icon?: React.ReactNode
}

interface RequiredField extends ValidationItem {
	status: 'complete' | 'pending'
}

// Helper function to determine if a field is missing
const isMissing = (value: any): boolean => {
	if (value === undefined || value === null) return true
	if (typeof value === 'string' && value.trim() === '') return true
	if (typeof value === 'number' && value === 0) return true
	if (typeof value === 'boolean') return false
	return false
}

export function ValidationStatusCard({
	errors,
	watchedValues,
	photosLength,
	isDirty,
	isValid,
	mode = 'create',
	initialDataStatus,
	shouldShowCard,
	isSticky,
	isMobile,
	attemptedSubmit = false,
	onDismiss,
}: ValidationStatusCardProps) {
	const [isSheetOpen, setIsSheetOpen] = useState(false)
	const [isCollapsed, setIsCollapsed] = useState(false)

	// Auto-collapse after 5 seconds
	useEffect(() => {
		if (shouldShowCard && !isMobile) {
			const timer = setTimeout(() => {
				setIsCollapsed(true)
			}, 5000)

			return () => clearTimeout(timer)
		}
	}, [shouldShowCard, isMobile])

	// Sync sheet open state with shouldShowCard
	const handleSheetOpenChange = (open: boolean) => {
		setIsSheetOpen(open)
		if (!open && onDismiss) {
			onDismiss()
		}
	}

	// Calculate validation state for each required field
	const requiredFieldsStatus = useMemo(() => {
		const fields: RequiredField[] = [
			{
				id: 'category',
				label: 'Category',
				status: isMissing(watchedValues.category) ? 'pending' : 'complete',
				required: true,
			},
			{
				id: 'brand',
				label: 'Brand',
				status: isMissing(watchedValues.brand) ? 'pending' : 'complete',
				required: true,
			},
			{
				id: 'model',
				label: 'Item Name',
				status: isMissing(watchedValues.model) ? 'pending' : 'complete',
				required: true,
				hint: 'Item model, brand name, or product description',
			},
			{
				id: 'retailPrice',
				label: 'Retail Price',
				status: isMissing(watchedValues.retailPrice) ? 'pending' : 'complete',
				required: true,
				hint: 'Must be valid price format (e.g., 170 or 170.00)',
			},
		]

		return fields
	}, [watchedValues])

	// Calculate validation state for photos
	const photosStatus = useMemo(() => {
		return {
			id: 'photos',
			label: 'Item Photos',
			status: photosLength === 0 ? ('pending' as const) : ('complete' as const),
			required: true,
			hint: 'At least one photo required',
			icon: <Camera className='h-4 w-4' />,
		}
	}, [photosLength])

	// Calculate validation state for conditional fields (dynamically required when triedOn = true)
	const conditionalFieldsStatus = useMemo(() => {
		const fields: RequiredField[] = []

		// Size Tried - required if tried on AND size is required for category
		if (watchedValues.triedOn) {
			const sizeRequired = ['shoes', 'tops', 'bottoms', 'outerwear'].includes(
				watchedValues.category || ''
			)
			if (sizeRequired) {
				fields.push({
					id: 'sizeTried',
					label: 'Size Tried',
					status: isMissing(watchedValues.sizeTried) ? 'pending' : 'complete',
					hint: 'Size you tried on',
					required: true,
				})
			}
		}

		// Comfort Rating - required if tried on AND category requires comfort
		if (watchedValues.triedOn) {
			const comfortRequired = ['shoes', 'tops', 'bottoms', 'outerwear'].includes(
				watchedValues.category || ''
			)
			if (comfortRequired) {
				// Check for 0, null, and undefined
				const comfortMissing =
					watchedValues.comfortRating === undefined ||
					watchedValues.comfortRating === null ||
					watchedValues.comfortRating === 0

				fields.push({
					id: 'comfortRating',
					label: 'Comfort Rating',
					status: comfortMissing ? 'pending' : 'complete',
					hint: 'Rate how comfortable the item is (1-5)',
					required: true,
				})
			}
		}

		return fields
	}, [watchedValues.triedOn, watchedValues.category, watchedValues.sizeTried, watchedValues.comfortRating])

	// Count completion (include conditional fields when they're required)
	const totalRequired = requiredFieldsStatus.length + 1 + conditionalFieldsStatus.length // +1 for photos, + conditional required fields
	const completedConditional = conditionalFieldsStatus.filter((f) => f.status === 'complete').length
	const completed = requiredFieldsStatus.filter((f) => f.status === 'complete').length + (photosLength > 0 ? 1 : 0) + completedConditional
	const completionPercent = Math.round((completed / totalRequired) * 100)

	// Check if there are missing required fields (including conditional ones)
	const hasMissingRequired =
		requiredFieldsStatus.some((f) => f.status === 'pending') ||
		photosLength === 0 ||
		conditionalFieldsStatus.some((f) => f.status === 'pending')
	const allValid = isValid && photosLength > 0 && conditionalFieldsStatus.every((f) => f.status === 'complete')

	// Don't show card if no issues
	if (!shouldShowCard || !isDirty) {
		return null
	}

	// Mobile: Show as bottom sheet
	if (isMobile) {
		return (
			<Sheet open={shouldShowCard} onOpenChange={handleSheetOpenChange}>
				<SheetContent side='bottom' className='h-auto max-h-[80vh] rounded-t-2xl'>
					<SheetHeader className='pb-4'>
						<SheetTitle className='flex items-center gap-2'>
							{hasMissingRequired ? (
								<>
									<AlertCircle className='h-5 w-5 text-ember-600' />
									<span className='text-ember-900'>{totalRequired - completed} items to complete</span>
								</>
							) : (
								<>
									<CheckCircle2 className='h-5 w-5 text-meadow-600' />
									<span className='text-meadow-900'>Almost ready!</span>
								</>
							)}
						</SheetTitle>
					</SheetHeader>

					<div className='space-y-4'>
						{/* Progress Section */}
						<div className='space-y-2'>
							<div className='flex items-center justify-between'>
								<span className='text-sm font-semibold text-slate-900'>
									{completed} of {totalRequired} completed
								</span>
								<span className='text-sm font-bold text-sun-600'>{completionPercent}%</span>
							</div>
							<Progress value={completionPercent} className='h-2' />
						</div>

						{/* Validation Items */}
						<div className='space-y-3'>
							{requiredFieldsStatus.map((field) => (
								<ValidationItemRow key={field.id} field={field} />
							))}
							<ValidationItemRow field={photosStatus} />

							{/* Conditional Required Fields - Merged into Main List */}
							{conditionalFieldsStatus.map((field) => (
								<ValidationItemRow key={field.id} field={field} />
							))}
						</div>
					</div>
				</SheetContent>
			</Sheet>
		)
	}

	// Desktop: Show as top sticky banner (below navbar)
	return (
		<div
			className={cn(
				'sticky top-16 left-0 right-0 z-40 transition-all duration-300 ease-out',
				shouldShowCard ? 'animate-in fade-in slide-in-from-top-4' : 'hidden'
			)}>
			<div className='container mx-auto px-6 py-3'>
				<Card className='border-slate-200 bg-white/95 backdrop-blur-md shadow-lg'>
					{/* Collapsed State */}
					{isCollapsed ? (
						<button
							onClick={() => setIsCollapsed(false)}
							className='w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-lg'>
							<div className='flex items-center gap-3'>
								{hasMissingRequired ? (
									<AlertCircle className='h-5 w-5 text-ember-600' />
								) : (
									<CheckCircle2 className='h-5 w-5 text-meadow-600' />
								)}
								<span className={cn('text-sm font-semibold ', hasMissingRequired ? 'text-ember-900' : 'text-meadow-900')}>
									{completed} of {totalRequired} complete
								</span>
								<span className='text-sm font-bold text-sun-600'>{completionPercent}%</span>
								<Progress value={completionPercent} className='h-1.5 w-32 ml-2' />
							</div>
							<ChevronDown className='h-4 w-4 text-slate-600' />
						</button>
					) : (
						<>
							{/* Expanded State */}
							<CardHeader className='pb-3'>
								<CardTitle className='text-sm flex items-center justify-between'>
									<div className='flex items-center gap-3 p-4'>
										{hasMissingRequired ? (
											<AlertCircle className='h-5 w-5 text-ember-600' />
										) : (
											<CheckCircle2 className='h-5 w-5 text-meadow-600' />
										)}
										<span className={hasMissingRequired ? 'text-ember-900' : 'text-meadow-900'}>
											{completed} of {totalRequired} complete
										</span>
										<span className='text-sm font-bold text-sun-600'>{completionPercent}%</span>
									</div>
									<button
										onClick={() => setIsCollapsed(true)}
										className='hover:bg-slate-100 p-1.5 rounded-md transition-colors'>
										<ChevronUp className='h-4 w-4 text-slate-600' />
									</button>
								</CardTitle>
							</CardHeader>

							<CardContent className='space-y-3'>
								{/* Progress Bar */}
								<Progress value={completionPercent} className='h-2' />

								{/* Validation Items - Dynamic Grid (controlled by GRID_COLUMNS constant) */}
								<div className={`grid ${getGridClass()} gap-2 p-8`}>
									{requiredFieldsStatus.map((field) => (
										<ValidationItemRow key={field.id} field={field} compact showHintOnHover />
									))}
									<ValidationItemRow field={photosStatus} compact showHintOnHover />

									{/* Conditional Required Fields - Merged into Main Grid */}
									{conditionalFieldsStatus.map((field) => (
										<ValidationItemRow key={field.id} field={field} compact showHintOnHover />
									))}
								</div>

								{/* Help Text */}
								{!allValid && (
									<div className='pt-2 border-t border-slate-100'>
										<p className='text-xs text-slate-600 text-center p-4'>
											Fill in missing fields to save
										</p>
									</div>
								)}
							</CardContent>
						</>
					)}
				</Card>
			</div>
		</div>
	)
}

/**
 * Individual validation item row component
 */
function ValidationItemRow({
	field,
	compact = false,
	showHintOnHover = false,
}: {
	field: ValidationItem
	compact?: boolean
	showHintOnHover?: boolean
}) {
	const getIconClass = (status: string, isCompact: boolean) => {
		const baseClass = 'flex-shrink-0'
		const size = isCompact ? 'h-4 w-4' : 'h-5 w-5'
		const color = {
			complete: 'text-meadow-600',
			pending: 'text-ember-600',
			conditional: 'text-sun-600',
		}[status] || ''
		return cn(size, color, baseClass)
	}

	const statusConfig = {
		complete: {
			icon: <CheckCircle2 className={getIconClass('complete', compact)} />,
			textColor: 'text-meadow-900',
			bgColor: 'bg-meadow-50',
		},
		pending: {
			icon: <AlertCircle className={getIconClass('pending', compact)} />,
			textColor: 'text-ember-900',
			bgColor: 'bg-ember-50',
		},
		conditional: {
			icon: <Info className={getIconClass('conditional', compact)} />,
			textColor: 'text-sun-900',
			bgColor: 'bg-sun-50',
		},
	}

	const config = statusConfig[field.status]

	return (
		<div className={cn('flex items-start gap-2 p-2 rounded-md group relative', config.bgColor)}>
			{config.icon}
			<div className='flex-1 min-w-0'>
				<p className={cn('text-sm font-medium', config.textColor)}>{field.label}</p>
				{field.hint && !compact && !showHintOnHover && (
					<p className='text-xs text-slate-600 mt-0.5'>{field.hint}</p>
				)}
				{field.hint && showHintOnHover && (
					<div className='absolute left-0 right-0 top-full mt-1 p-2 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none'>
						{field.hint}
					</div>
				)}
			</div>
		</div>
	)
}

// Helper function for className combining
function cn(...classes: (string | undefined | boolean)[]) {
	return classes.filter(Boolean).join(' ')
}
