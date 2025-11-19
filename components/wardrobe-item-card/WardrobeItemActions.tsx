/**
 * ItemCardActions - Kebab menu with context-aware actions
 *
 * Displays different actions based on:
 * - Archive page vs normal view
 * - Item status (owned, wishlisted)
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
	Users,
	Lock,
} from "lucide-react";
import { WardrobeItem } from '@/components/types/WardrobeItem';
import { ItemStatus } from '@/types/ItemStatus';

interface ItemCardActionsProps {
	item: WardrobeItem;
	isArchivePage: boolean;
	isReadOnly?: boolean; // NEW: If true, hide destructive/edit actions
	onEdit: (item: WardrobeItem) => void;
	onDelete: (item: WardrobeItem) => void;
	onUnarchive?: (item: WardrobeItem) => void;
	onMarkAsPurchased?: (item: WardrobeItem) => void;
	onMoveToWatchlist?: (item: WardrobeItem) => void;
	onArchive?: (item: WardrobeItem) => void;
	onToggleSharing?: (item: WardrobeItem) => void; // NEW: Toggle is_shared status
}

export function ItemCardActions({
	item,
	isArchivePage,
	isReadOnly = false,
	onEdit,
	onDelete,
	onUnarchive,
	onMarkAsPurchased,
	onMoveToWatchlist,
	onArchive,
	onToggleSharing,
}: ItemCardActionsProps) {
	const isWishlisted = item.status === ItemStatus.WISHLISTED;
	const isOwned = item.status === ItemStatus.OWNED;

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
							{!isReadOnly && onUnarchive && (
								<DropdownMenuItem
									onSelect={() => onUnarchive(item)}
									className='cursor-pointer'>
									<ArchiveRestore className='h-3 w-3 mr-2' />
									Unarchive
								</DropdownMenuItem>
							)}

							{!isReadOnly && (
								<DropdownMenuItem
									onSelect={() => onDelete(item)}
									className='cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50'>
									<Trash2 className='h-3 w-3 mr-2' />
									Delete Permanently
								</DropdownMenuItem>
							)}
						</>
					) : (
						// Normal actions
						<>
							{/* Sharing Controls - Only show if not read-only and callback exists */}
							{!isReadOnly && onToggleSharing && (
								<DropdownMenuItem
									onSelect={() => onToggleSharing(item)}
									className='cursor-pointer'>
									{item.is_shared ? (
										<>
											<Lock className='h-3 w-3 mr-2' />
											Make Private
										</>
									) : (
										<>
											<Users className='h-3 w-3 mr-2' />
											Share with Partner
										</>
									)}
								</DropdownMenuItem>
							)}

							{!isReadOnly && isWishlisted && onMarkAsPurchased && (
								<DropdownMenuItem
									onSelect={() => onMarkAsPurchased(item)}
									className='cursor-pointer'>
									<ShoppingBag className='h-3 w-3 mr-2' />
									Purchased...
								</DropdownMenuItem>
							)}

							{!isReadOnly && isOwned && onMoveToWatchlist && (
								<DropdownMenuItem
									onSelect={() => onMoveToWatchlist(item)}
									className='cursor-pointer'>
									<Bookmark className='h-3 w-3 mr-2' />
									Move to Wishlist
								</DropdownMenuItem>
							)}

							{!isReadOnly && (
								<DropdownMenuItem
									onSelect={() => onEdit(item)}
									className='cursor-pointer'>
									<Edit className='h-3 w-3 mr-2' />
									Edit
								</DropdownMenuItem>
							)}

							{!isReadOnly && onArchive && (
								<DropdownMenuItem
									onSelect={() => onArchive(item)}
									className='cursor-pointer'>
									<Archive className='h-3 w-3 mr-2' />
									Archive...
								</DropdownMenuItem>
							)}

							{!isReadOnly && (
								<DropdownMenuItem
									onSelect={() => onDelete(item)}
									className='cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50'>
									<Trash2 className='h-3 w-3 mr-2' />
									Delete...
								</DropdownMenuItem>
							)}
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
