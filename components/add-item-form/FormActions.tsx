/**
 * Form Actions - Submit and Cancel buttons
 *
 * Contains the form action buttons:
 * - Submit button (Save Item / Update Item)
 * - Loading states with spinner
 * - Disabled states based on validation
 */

"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
	isSubmitting: boolean;
	mode: "add" | "create" | "edit";
	onCancel?: () => void;
}

/**
 * FormActions Component
 *
 * Renders the form submission button with appropriate loading states.
 * Button text changes based on mode (add/create/edit).
 */
export function FormActions({
	isSubmitting,
	mode,
	onCancel,
}: FormActionsProps) {
	return (
		<div className="flex items-center justify-end gap-3 mt-6">
			{onCancel && (
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
			)}
			<Button
				type="submit"
				disabled={isSubmitting}
			>
				{isSubmitting && (
					<Loader2 className="h-4 w-4 mr-2 animate-spin" />
				)}
				{mode === "edit"
					? "Update Item"
					: "Save Item"}
			</Button>
		</div>
	);
}
