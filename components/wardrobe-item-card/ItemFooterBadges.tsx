/**
 * ItemFooterBadges - Footer section with status badges
 *
 * Displays:
 * - Tried On / Didn't Try badge (journal mode)
 * - Category badge
 * - Archive metadata (archive mode)
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Archive } from "lucide-react";
import { SizingJournalEntry } from "@/components/types/sizing-journal-entry";
import { CategoryConfig } from "@/components/types/item-category";
import { formatArchiveReason, formatDate } from "@/lib/wardrobe-item-utils";

interface ItemFooterBadgesProps {
	item: SizingJournalEntry;
	hasBeenTriedOn: boolean;
	viewMode: 'journal' | 'collection' | 'archive' | 'wishlist';
	categoryConfig: CategoryConfig | null;
	isArchivePage: boolean;
}

/**
 * Sub-component for archive metadata badge
 */
function ArchiveMetadataBadge({
	archiveReason,
	archivedAt,
}: {
	archiveReason: string;
	archivedAt?: string | null;
}) {
	return (
		<>
			<Badge
				variant='outline'
				className='text-sm rounded-lg px-3 py-2 border border-slate-200 bg-slate-50 text-slate-700'
			>
				{formatArchiveReason(archiveReason)}
			</Badge>
			{archivedAt && (
				<span className='text-xs text-muted-foreground'>
					{formatDate(archivedAt)}
				</span>
			)}
		</>
	);
}

export function ItemFooterBadges({
	item,
	hasBeenTriedOn,
	viewMode,
	categoryConfig,
	isArchivePage,
}: ItemFooterBadgesProps) {
	return (
		<div className='flex items-center gap-2 flex-wrap'>
			{/* Tried On / Didn't Try Badge - Journal View Only */}
			{viewMode === 'journal' && (
				<Badge
					variant='outline'
					className='text-sm rounded-2xl px-3 py-1.5 border border-slate-200 bg-slate-50 text-slate-700'>
					{hasBeenTriedOn ? "Tried On" : "Didn't Try"}
				</Badge>
			)}

			{/* Category Badge */}
			{categoryConfig && (
				<Badge
					variant='outline'
					className='text-sm rounded-2xl px-3 py-1.5 border border-slate-200 bg-slate-50 text-slate-700'>
					<categoryConfig.icon className='h-4 w-4 mr-1' />
					<span>{categoryConfig.label}</span>
				</Badge>
			)}

			{/* Archive Metadata - Archive View Only */}
			{viewMode === 'archive' && item.archive_reason && (
				<ArchiveMetadataBadge
					archiveReason={item.archive_reason}
					archivedAt={item.archived_at}
				/>
			)}
		</div>
	);
}
