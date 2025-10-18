"use client"

import { useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Archive, ShoppingBag, Heart, Footprints, Package } from 'lucide-react'
import { ArchiveReason } from './types/sizing-journal-entry'

interface ArchiveReasonDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: (reason: ArchiveReason, note?: string) => void
	itemName: string
}

const ARCHIVE_REASONS = [
	{
		value: 'sold' as ArchiveReason,
		label: 'Sold',
		description: 'Sold this pair',
		icon: ShoppingBag,
	},
	{
		value: 'donated' as ArchiveReason,
		label: 'Donated',
		description: 'Donated or gifted',
		icon: Heart,
	},
	{
		value: 'worn_out' as ArchiveReason,
		label: 'Worn Out',
		description: 'Too worn to keep',
		icon: Footprints,
	},
	{
		value: 'other' as ArchiveReason,
		label: 'Other',
		description: 'Other reason',
		icon: Package,
	},
]

export function ArchiveReasonDialog({
	open,
	onOpenChange,
	onConfirm,
	itemName,
}: ArchiveReasonDialogProps) {
	const [selectedReason, setSelectedReason] = useState<ArchiveReason | null>(null)
	const [otherNote, setOtherNote] = useState('')
	const [error, setError] = useState('')

	const handleConfirm = () => {
		if (!selectedReason) {
			setError('Please select a reason for archiving')
			return
		}

		onConfirm(selectedReason, selectedReason === 'other' ? otherNote : undefined)

		// Reset state
		setSelectedReason(null)
		setOtherNote('')
		setError('')
		onOpenChange(false)
	}

	const handleCancel = () => {
		setSelectedReason(null)
		setOtherNote('')
		setError('')
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-2 mb-2">
						<Archive
							className="h-5 w-5"
							style={{ color: 'var(--color-slate-600)' }}
						/>
						<DialogTitle style={{ color: 'var(--color-black)' }}>
							Archive Item
						</DialogTitle>
					</div>
					<DialogDescription style={{ color: 'var(--color-slate-600)' }}>
						Why are you archiving <strong>{itemName}</strong>?
					</DialogDescription>
				</DialogHeader>

				<div className="py-4">
					<RadioGroup
						value={selectedReason || ''}
						onValueChange={(value) => {
							setSelectedReason(value as ArchiveReason)
							setError('')
						}}
					>
						<div className="space-y-3">
							{ARCHIVE_REASONS.map((reason) => {
								const Icon = reason.icon
								return (
									<div
										key={reason.value}
										className={`flex items-start space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
											selectedReason === reason.value
												? 'border-primary-500 bg-primary-50'
												: 'border-slate-200 hover:border-slate-300'
										}`}
										style={{
											borderColor: selectedReason === reason.value
												? 'var(--color-primary-500)'
												: undefined,
											backgroundColor: selectedReason === reason.value
												? 'var(--color-primary-50)'
												: undefined,
										}}
										onClick={() => {
											setSelectedReason(reason.value)
											setError('')
										}}
									>
										<RadioGroupItem
											value={reason.value}
											id={reason.value}
											className="mt-0.5"
										/>
										<div className="flex-1">
											<Label
												htmlFor={reason.value}
												className="flex items-center gap-2 cursor-pointer font-medium"
												style={{ color: 'var(--color-black-soft)' }}
											>
												<Icon className="h-4 w-4" style={{ color: 'var(--color-slate-600)' }} />
												{reason.label}
											</Label>
											<p className="text-xs mt-0.5" style={{ color: 'var(--color-slate-500)' }}>
												{reason.description}
											</p>
										</div>
									</div>
								)
							})}
						</div>
					</RadioGroup>

					{/* Optional note for "Other" reason */}
					{selectedReason === 'other' && (
						<div className="mt-4">
							<Label htmlFor="other-note" className="text-sm font-medium" style={{ color: 'var(--color-black-soft)' }}>
								Additional details (optional)
							</Label>
							<Textarea
								id="other-note"
								placeholder="Enter a brief note..."
								value={otherNote}
								onChange={(e) => setOtherNote(e.target.value)}
								maxLength={200}
								className="mt-2 resize-none"
								rows={3}
							/>
							<p className="text-xs mt-1" style={{ color: 'var(--color-slate-400)' }}>
								{otherNote.length}/200 characters
							</p>
						</div>
					)}

					{/* Error message */}
					{error && (
						<p className="mt-3 text-sm" style={{ color: 'var(--color-red-600)' }}>
							{error}
						</p>
					)}
				</div>

				<DialogFooter className="sm:justify-between">
					<Button
						type="button"
						variant="outline"
						onClick={handleCancel}
						className="sm:w-auto w-full mb-2 sm:mb-0"
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleConfirm}
						className="sm:w-auto w-full font-semibold"
						style={{
							backgroundColor: 'var(--color-primary-500)',
							color: 'var(--color-black)',
						}}
					>
						<Archive className="h-4 w-4 mr-2" />
						Archive Item
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
