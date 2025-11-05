/**
 * Notes Section - Store Name, Purchase Date, Notes, Wears
 *
 * Contains all metadata fields:
 * - Store name (where purchased)
 * - Purchase date
 * - Notes (personal observations)
 * - Wears (only in advanced mode)
 */

'use client'

import { UseFormReturn } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface NotesSectionProps {
	form: UseFormReturn<any>
}

/**
 * NotesSection Component
 *
 * Handles additional metadata for wardrobe items.
 * Includes store name, purchase date, personal notes, and wear tracking.
 */
export function NotesSection({ form }: NotesSectionProps) {
	const {
		register,
		watch,
		formState: { errors },
	} = form

	return (
		<div className='space-y-6'>
			<div className='space-y-2'>
				<h3 className='text-lg font-semibold'>Additional Details</h3>
				<p className='text-sm text-muted-foreground'>
					Optional metadata about this item
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				{/* Store Name */}
				<div>
					<Label className='text-sm font-medium text-slate-900'>
						Store Name
					</Label>
					<Input
						{...register('storeName')}
						placeholder='e.g., Nike Store, Foot Locker'
						className='mt-2'
					/>
					{errors.storeName && (
						<p className='text-sm text-red-600 mt-1'>
							{String(errors.storeName.message)}
						</p>
					)}
				</div>

				{/* Purchase Date */}
				<div>
					<Label className='text-sm font-medium text-slate-900'>
						Purchase Date
					</Label>
					<Input
						{...register('purchaseDate')}
						type='date'
						className='mt-2'
					/>
					{errors.purchaseDate && (
						<p className='text-sm text-red-600 mt-1'>
							{String(errors.purchaseDate.message)}
						</p>
					)}
				</div>
			</div>

			{/* Notes */}
			<div>
				<Label className='text-sm font-medium text-slate-900'>
					Notes
				</Label>
				<Textarea
					{...register('notes')}
					placeholder='E.g., Great comfort, runs large, perfect for running'
					className='mt-2'
					rows={3}
				/>
				{errors.notes && (
					<p className='text-sm text-red-600 mt-1'>
						{String(errors.notes.message)}
					</p>
				)}
			</div>

			{/* Wears Count */}
			<div>
				<Label className='text-sm font-medium text-slate-900'>
					Times Worn
				</Label>
				<Input
					{...register('wears', { valueAsNumber: true })}
					type='number'
					min='0'
					placeholder='0'
					className='mt-2'
				/>
				{errors.wears && (
					<p className='text-sm text-red-600 mt-1'>
						{String(errors.wears.message)}
					</p>
				)}
			</div>
		</div>
	)
}
