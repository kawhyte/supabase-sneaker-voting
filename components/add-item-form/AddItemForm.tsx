'use client'

import { useFormLogic } from './useFormLogic'
import { BasicInfoSection } from './BasicInfoSection'
import { PricingSection } from './PricingSection'
import { PhotoSection } from './PhotoSection'
import { NotesSection } from './NotesSection'
import { FormActions } from './FormActions'

export interface AddItemFormProps {
	mode: 'add' | 'edit'
	initialData?: any
	onSuccess?: () => void
	onCancel?: () => void
}

/**
 * Main form for adding/editing wardrobe items.
 *
 * Orchestrates 7 section components:
 * 1. BasicInfo - Brand, model, color, category
 * 2. Pricing - Retail, sale, purchase, target prices
 * 3. Sizing - Size type, size tried, comfort rating
 * 4. Photos - Image uploads (up to 5)
 * 5. ProductURL - Auto-fill from product URLs
 * 6. Notes - Store name, purchase date, notes
 * 7. Actions - Submit/Cancel buttons
 *
 * Business logic extracted to useFormLogic hook for testability.
 */
export default function AddItemForm({
	mode,
	initialData,
	onSuccess,
	onCancel,
}: AddItemFormProps) {
	const {
		form,
		isSubmitting,
		photos,
		onSubmit,
		handlePhotosChange,
	} = useFormLogic({ mode, initialData, onSuccess })

	return (
		<form onSubmit={onSubmit} className='space-y-8'>
			{/* Basic Info */}
			<BasicInfoSection form={form} />

			{/* Pricing */}
			<PricingSection form={form} />

			{/* Photos */}
			<PhotoSection
				photos={photos}
				onPhotosChange={handlePhotosChange}
				errors={form.formState.errors}
			/>

			{/* Notes */}
			<NotesSection form={form} />

			{/* Actions */}
			<FormActions
				isSubmitting={isSubmitting}
				mode={mode}
				onCancel={onCancel}
			/>
		</form>
	)
}
