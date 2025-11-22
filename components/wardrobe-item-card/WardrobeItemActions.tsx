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
	Pin,
	PinOff,
} from "lucide-react";
import { WardrobeItem } from '@/components/types/WardrobeItem';
import { ItemStatus } from '@/types/ItemStatus';

interface ItemCardActionsProps {
	item: WardrobeItem;
	isArchivePage: boolean;
	isReadOnly?: boolean; // If true, hide destructive/edit actions
	variant?: "card" | "list"; // Layout variant: card (absolute positioning) or list (static positioning)
	onEdit: (item: WardrobeItem) => void;
	onDelete: (item: WardrobeItem) => void;
	onUnarchive?: (item: WardrobeItem) => void;
	onMarkAsPurchased?: (item: WardrobeItem) => void;
	onMoveToWatchlist?: (item: WardrobeItem) => void;
	onArchive?: (item: WardrobeItem) => void;
	onTogglePinned?: (item: WardrobeItem) => void; // Toggle is_pinned status (featured items)
}

export function ItemCardActions({
	item,
	isArchivePage,
	isReadOnly = false,
	variant = "card",
	onEdit,
	onDelete,
	onUnarchive,
	onMarkAsPurchased,
	onMoveToWatchlist,
	onArchive,
	onTogglePinned,
}: ItemCardActionsProps) {
	const isWishlisted = item.status === ItemStatus.WISHLISTED;
	const isOwned = item.status === ItemStatus.OWNED;

	// Conditional wrapper class: absolute for cards, static for list view
	const wrapperClass = variant === "card"
		? 'absolute right-3 top-3 z-40 flex items-center gap-1'
		: 'flex items-center gap-1';

	return (
		<div className={wrapperClass}>
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
							{/* Pin Controls - Only show for wishlist items if not read-only */}
							{!isReadOnly && isWishlisted && onTogglePinned && (
								<DropdownMenuItem
									onSelect={() => onTogglePinned(item)}
									className='cursor-pointer'>
									{item.is_pinned ? (
										<>
											<PinOff className='h-3 w-3 mr-2' />
											Unpin from Profile
										</>
									) : (
										<>
											<Pin className='h-3 w-3 mr-2' />
											Pin to Profile
										</>
									)}
								</DropdownMenuItem>
							)}

							{/* {!isReadOnly && isWishlisted && onMarkAsPurchased && (
								<DropdownMenuItem
									onSelect={() => onMarkAsPurchased(item)}
									className='cursor-pointer'>
									<ShoppingBag className='h-3 w-3 mr-2' />
									Purchased...
								</DropdownMenuItem>
							)} */}

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

							{/* {!isReadOnly && onArchive && (
								<DropdownMenuItem
									onSelect={() => onArchive(item)}
									className='cursor-pointer'>
									<Archive className='h-3 w-3 mr-2' />
									Archive...
								</DropdownMenuItem>
							)} */}

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
