/**
 * ItemCardActions - Kebab menu with context-aware actions
 *
 * Displays different actions based on:
 * - Archive page vs normal view
 * - Item status (owned, wishlisted, journaled)
 * - Available callbacks
 */

"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Edit,
	Trash2,
	MoreVertical,
	ArchiveRestore,
	Bookmark,
	ShoppingBag,
	Archive,
} from "lucide-react";
import { SizingJournalEntry } from "@/components/types/sizing-journal-entry";

interface ItemCardActionsProps {
	item: SizingJournalEntry;
	isArchivePage: boolean;
	onEdit: (item: SizingJournalEntry) => void;
	onDelete: (item: SizingJournalEntry) => void;
	onUnarchive?: (item: SizingJournalEntry) => void;
	onMarkAsPurchased?: (item: SizingJournalEntry) => void;
	onMoveToWatchlist?: (item: SizingJournalEntry) => void;
	onArchive?: (item: SizingJournalEntry) => void;
}

export function ItemCardActions({
	item,
	isArchivePage,
	onEdit,
	onDelete,
	onUnarchive,
	onMarkAsPurchased,
	onMoveToWatchlist,
	onArchive,
}: ItemCardActionsProps) {
	const isWishlisted = item.status === 'wishlisted' || item.status === 'journaled';
	const isOwned = item.status === 'owned';

	return (
		<div className='absolute right-3 top-3 z-40 flex items-center gap-1'>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<button
						className='h-5 w-5 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-stone-100 active:bg-stone-200 text-foreground hover:text-primary will-change-transform'
						type='button'
						aria-label='Card actions'>
						<MoreVertical className='h-5 w-5' />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end' className='w-48 z-50'>
					{isArchivePage ? (
						// Archive page actions
						<>
							{onUnarchive && (
								<DropdownMenuItem
									onSelect={() => onUnarchive(item)}
									className='cursor-pointer'>
									<ArchiveRestore className='h-3 w-3 mr-2' />
									Unarchive
								</DropdownMenuItem>
							)}

							<DropdownMenuItem
								onSelect={() => onDelete(item)}
								className='cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50'>
								<Trash2 className='h-3 w-3 mr-2' />
								Delete Permanently
							</DropdownMenuItem>
						</>
					) : (
						// Normal actions
						<>
							{isWishlisted && onMarkAsPurchased && (
								<DropdownMenuItem
									onSelect={() => onMarkAsPurchased(item)}
									className='cursor-pointer'>
									<ShoppingBag className='h-3 w-3 mr-2' />
									Purchased...
								</DropdownMenuItem>
							)}

							{isOwned && onMoveToWatchlist && (
								<DropdownMenuItem
									onSelect={() => onMoveToWatchlist(item)}
									className='cursor-pointer'>
									<Bookmark className='h-3 w-3 mr-2' />
									Move to Wishlist
								</DropdownMenuItem>
							)}

							<DropdownMenuItem
								onSelect={() => onEdit(item)}
								className='cursor-pointer'>
								<Edit className='h-3 w-3 mr-2' />
								Edit
							</DropdownMenuItem>

							{onArchive && (
								<DropdownMenuItem
									onSelect={() => onArchive(item)}
									className='cursor-pointer'>
									<Archive className='h-3 w-3 mr-2' />
									Archive...
								</DropdownMenuItem>
							)}

							<DropdownMenuItem
								onSelect={() => onDelete(item)}
								className='cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50'>
								<Trash2 className='h-3 w-3 mr-2' />
								Delete...
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
