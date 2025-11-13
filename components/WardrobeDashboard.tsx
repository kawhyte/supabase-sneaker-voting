"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { DashboardGrid } from "./DashboardGrid";
import { EditItemModal } from "./EditItemModal";
import { WardrobeFilters } from "./WardrobeFilters";
import { WardrobeStats } from "./WardrobeStats";
import { WardrobeSkeleton } from "./WardrobeSkeleton";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { PurchasedConfirmationModal } from "./PurchasedConfirmationModal";
import { ArchiveReasonDialog } from "./ArchiveReasonDialog";
import { OutfitStudio } from "./outfit-studio/OutfitStudio";
import { WardrobeItem } from "./types/WardrobeItem";
import {
	filterJournalEntries,
	sortJournalEntries,
} from "@/lib/wardrobe-item-utils";
import { type ItemCategory } from "@/components/types/item-category";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
	EmptyContent,
} from "@/components/ui/empty";
import {
	WardrobeEmptyState,
	WishlistEmptyState,
	ArchiveEmptyState,
} from "./EmptyStateIllustrations";
import { ItemStatus } from "@/types/ItemStatus";
import { ViewDensityToggle } from "./ViewDensityToggle";
import { DashboardHeader } from "./DashboardHeader";

interface WardrobeDashboardProps {
	onAddNew?: () => void;
	status: ItemStatus[];
	isArchivePage?: boolean;
}

export function WardrobeDashboard({
	onAddNew,
	status = [ItemStatus.WISHLISTED],
	isArchivePage = false,
}: WardrobeDashboardProps) {
	// State - Data
	const [journalEntries, setJournalEntries] = useState<WardrobeItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// State - Filters
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedBrands, setSelectedBrands] = useState(new Set<string>());
	const [sortBy, setSortBy] = useState<string>("date-desc");
	const [selectedCategories, setSelectedCategories] = useState<ItemCategory[]>(
		[]
	);

	// State - Modals
	const [editingEntry, setEditingEntry] = useState<WardrobeItem | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [deletingEntry, setDeletingEntry] = useState<WardrobeItem | null>(null);
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [selectedItemForAction, setSelectedItemForAction] =
		useState<WardrobeItem | null>(null);
	const [isPurchasedModalOpen, setIsPurchasedModalOpen] = useState(false);
	const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
	const [isOutfitStudioOpen, setIsOutfitStudioOpen] = useState(false);

	// State - Bulk Price Checking
	const [isBulkChecking, setIsBulkChecking] = useState(false);
	const [bulkCheckProgress, setBulkCheckProgress] = useState({ current: 0, total: 0 });

	const supabase = createClient();

	useEffect(() => {
		loadJournalEntries();
	}, [status, isArchivePage]);

	const loadJournalEntries = async () => {
		try {
			setIsLoading(true);
			let query = supabase
				.from("items")
				.select(
					`*, item_photos (id, image_url, image_order, is_main_image), brands (id, name, brand_logo)`
				)
				.eq("is_archived", isArchivePage)
				.in("status", status)
				.order("image_order", { foreignTable: "item_photos", ascending: true });

			let { data, error } = await query.order("created_at", {
				ascending: false,
			});

			if (error && error.message?.includes("item_photos")) {
				let basicQuery = supabase
					.from("items")
					.select(`*, brands (id, name, brand_logo)`)
					.eq("is_archived", isArchivePage)
					.in("status", status);
				const basicResult = await basicQuery.order("created_at", {
					ascending: false,
				});
				data = basicResult.data;
				error = basicResult.error;
			}

			if (error) {
				console.error("Error loading journal entries:", error);
				toast.error("Failed to load items");
				return;
			}
			setJournalEntries(data || []);
		} catch (error) {
			console.error("Error:", error);
			toast.error("An error occurred while loading items");
		} finally {
			setIsLoading(false);
		}
	};
	// ... (handleEditEntry, handleDeleteEntry, handleToggleCollection, etc. are unchanged)
	const handleEditEntry = (entry: WardrobeItem) => {
		setEditingEntry(entry);
		setIsEditModalOpen(true);
	};

	const handleCloseEditModal = () => {
		setIsEditModalOpen(false);
		setEditingEntry(null);
	};

	const handleSaveEdit = () => {
		loadJournalEntries();
	};

	const handleDeleteEntry = (entry: WardrobeItem) => {
		setDeletingEntry(entry);
		setIsDeleteConfirmOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!deletingEntry) return;

		setIsDeleting(true);
		try {
			const { data: photos, error: photosError } = await supabase
				.from("item_photos")
				.select("cloudinary_id")
				.eq("item_id", deletingEntry.id);

			if (photosError) {
				console.warn("Error fetching item photos:", photosError);
			}

			if (photos && photos.length > 0) {
				for (const photo of photos) {
					if (photo.cloudinary_id) {
						try {
							await fetch("/api/delete-image", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({ publicId: photo.cloudinary_id }),
							});
						} catch (imageError) {
							console.warn(
								"Error deleting carousel image from Cloudinary:",
								imageError
							);
						}
					}
				}
			}

			if (deletingEntry.cloudinary_id) {
				try {
					await fetch("/api/delete-image", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ publicId: deletingEntry.cloudinary_id }),
					});
				} catch (imageError) {
					console.warn(
						"Error deleting main image from Cloudinary:",
						imageError
					);
				}
			}

			const { error } = await supabase
				.from("items")
				.delete()
				.eq("id", deletingEntry.id);

			if (error) {
				console.error("Error deleting journal entry:", error);
				alert("Failed to delete journal entry. Please try again.");
				return;
			}

			loadJournalEntries();
		} catch (error) {
			console.error("Error:", error);
			alert("Failed to delete journal entry. Please try again.");
		} finally {
			setIsDeleting(false);
			setIsDeleteConfirmOpen(false);
			setDeletingEntry(null);
		}
	};

	const handleCancelDelete = () => {
		setIsDeleteConfirmOpen(false);
		setDeletingEntry(null);
	};

	const handleToggleCollection = async (entry: WardrobeItem) => {
		const newStatus =
			entry.status === ItemStatus.OWNED
				? ItemStatus.WISHLISTED
				: ItemStatus.OWNED;

		if (
			newStatus === ItemStatus.OWNED &&
			entry.category === "shoes" &&
			!entry.purchase_price &&
			!entry.retail_price
		) {
			toast.error("Please set a price before adding to collection", {
				description: "A price is required to track cost per wear",
				action: {
					label: "Edit",
					onClick: () => handleEditEntry(entry),
				},
			});
			return;
		}

		setJournalEntries((prev) =>
			prev.map((e) => (e.id === entry.id ? { ...e, status: newStatus } : e))
		);

		try {
			const { error } = await supabase
				.from("items")
				.update({ status: newStatus })
				.eq("id", entry.id);

			if (error) {
				console.error("Error toggling collection status:", error);
				setJournalEntries((prev) =>
					prev.map((e) =>
						e.id === entry.id ? { ...e, status: entry.status } : e
					)
				);
				toast.error("Failed to update collection");
				return;
			}

			toast.success(
				newStatus === ItemStatus.OWNED
					? "Added to collection"
					: "Removed from collection",
				{
					description: `${entry.brand} ${entry.model}`,
					duration: 3000,
				}
			);
			loadJournalEntries();
		} catch (error) {
			console.error("Error:", error);
			setJournalEntries((prev) =>
				prev.map((e) =>
					e.id === entry.id ? { ...e, status: entry.status } : e
				)
			);
			toast.error("Failed to update collection");
		}
	};

	// New Action Handlers
	const handleOpenPurchasedModal = (item: WardrobeItem) => {
		setSelectedItemForAction(item);
		setIsPurchasedModalOpen(true);
	};

	const handleOpenArchiveDialog = (item: WardrobeItem) => {
		setSelectedItemForAction(item);
		setIsArchiveDialogOpen(true);
	};

	// Manual Price Check Handler
	const handleRefreshPrice = async (itemId: string) => {
		try {
			const response = await fetch('/api/check-price-now', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ itemId })
			});

			const data = await response.json();

			// Log debug info to browser console for troubleshooting
			if (data.debug) {
				console.group('🔍 Price Check Debug');
				console.log('URL:', data.storeName || 'Unknown');
				console.log('Success:', data.success);
				console.log('Details:', data.debug.join('\n'));
				console.groupEnd();
			}

			if (!data.success) {
				toast.error(data.message || 'Failed to check price', {
					description: data.storeName ? `${data.storeName} - ${data.supportLevel || 'unknown'} support` : undefined,
					duration: 5000
				});
				// Reload to show updated failure count
				loadJournalEntries();
				return;
			}

			// Success! Update local state immediately for instant UI feedback
			setJournalEntries((prev) =>
				prev.map((item) =>
					item.id === itemId
						? {
								...item,
								sale_price: data.price,
								last_price_check_at: data.lastChecked,
								price_check_failures: 0,
						  }
						: item
				)
			);

			toast.success(data.message || `Price updated: $${data.price}`, {
				description: `${data.storeName} - Last checked just now`,
				duration: 4000
			});

		} catch (error) {
			console.error('Price check error:', error);
			toast.error('Network error - failed to check price');
		}
	};

	/**
	 * Bulk Price Check - Check all wishlist items sequentially
	 * Features:
	 * - Sequential checking (2s delay between each)
	 * - Real-time UI updates
	 * - Progress tracking
	 * - Skip items already checked today
	 * - Max 30 items per batch
	 */
	const handleBulkPriceCheck = async () => {
		// Filter items that need price checking
		const today = new Date().toISOString().split('T')[0];
		const itemsToCheck = journalEntries.filter(item => {
			// Only check wishlist items
			if (item.status !== ItemStatus.WISHLISTED) return false;

			// Must have product URL
			if (!item.product_url) return false;

			// Must have tracking enabled
			if (item.auto_price_tracking_enabled === false) return false;

			// Skip items already checked today
			if (item.last_price_check_at) {
				const lastCheckDate = new Date(item.last_price_check_at).toISOString().split('T')[0];
				if (lastCheckDate === today) return false;
			}

			return true;
		});

		if (itemsToCheck.length === 0) {
			toast.info('All prices are up to date! ✅', {
				description: 'No items need checking. All wishlist items were checked today or have no product URL.',
				duration: 5000
			});
			return;
		}

		// Limit to 30 items to avoid timeouts
		const itemsBatch = itemsToCheck.slice(0, 30);

		if (itemsToCheck.length > 30) {
			toast.info(`Checking first 30 of ${itemsToCheck.length} items`, {
				description: 'Run again to check remaining items',
				duration: 5000
			});
		}

		setIsBulkChecking(true);
		setBulkCheckProgress({ current: 0, total: itemsBatch.length });

		const results: Array<{
			item: WardrobeItem;
			success: boolean;
			price?: number;
			storeName?: string;
			error?: string;
		}> = [];

		// Show initial progress toast
		const progressToastId = toast.loading(`Checking prices... 0/${itemsBatch.length}`, {
			description: 'This may take a few minutes'
		});

		for (let i = 0; i < itemsBatch.length; i++) {
			const item = itemsBatch[i];

			try {
				// Update progress
				setBulkCheckProgress({ current: i + 1, total: itemsBatch.length });
				toast.loading(`Checking prices... ${i + 1}/${itemsBatch.length}`, {
					id: progressToastId,
					description: `Checking ${item.brand} ${item.model}...`
				});

				const response = await fetch('/api/check-price-now', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ itemId: item.id })
				});

				const data = await response.json();

				if (data.success) {
					results.push({
						item,
						success: true,
						price: data.price,
						storeName: data.storeName
					});

					// Update local state immediately
					setJournalEntries((prev) =>
						prev.map((entry) =>
							entry.id === item.id
								? {
										...entry,
										sale_price: data.price,
										last_price_check_at: data.lastChecked,
										price_check_failures: 0,
								  }
								: entry
						)
					);
				} else {
					results.push({
						item,
						success: false,
						storeName: data.storeName,
						error: data.message
					});

					// Reload to show updated failure count
					await loadJournalEntries();
				}

				// 2-second delay between requests to avoid rate limits
				if (i < itemsBatch.length - 1) {
					await new Promise(resolve => setTimeout(resolve, 2000));
				}

			} catch (error) {
				console.error(`Failed to check price for ${item.brand} ${item.model}:`, error);
				results.push({
					item,
					success: false,
					error: 'Network error'
				});
			}
		}

		// Dismiss progress toast
		toast.dismiss(progressToastId);

		// Show detailed summary
		const successResults = results.filter(r => r.success);
		const failResults = results.filter(r => !r.success);

		// Build detailed description
		let description = '';

		if (successResults.length > 0) {
			description += '✅ Updated:\n';
			successResults.forEach(r => {
				description += `• ${r.item.brand} ${r.item.model}: $${r.price}\n`;
			});
		}

		if (failResults.length > 0) {
			if (description) description += '\n';
			description += '❌ Failed:\n';
			failResults.forEach(r => {
				const reason = r.error?.includes('403') ? 'Bot blocked' :
				               r.error?.includes('Could not find') ? 'Price not found' :
				               r.error || 'Unknown error';
				description += `• ${r.item.brand} ${r.item.model}: ${reason}\n`;
			});
		}

		toast.success(`Bulk price check complete!`, {
			description: description.trim(),
			duration: 10000, // Longer duration for detailed results
			style: { whiteSpace: 'pre-line' } // Preserve line breaks
		});

		setIsBulkChecking(false);
		setBulkCheckProgress({ current: 0, total: 0 });
	};

	// Database Functions
	const markItemAsPurchased = async (
		purchasePrice: number,
		purchaseDate: Date
	) => {
		if (!selectedItemForAction) return;

		try {
			const { error } = await supabase
				.from("items")
				.update({
					status: ItemStatus.OWNED,
					purchase_price: purchasePrice,
					purchase_date: purchaseDate.toISOString().split("T")[0],
				})
				.eq("id", selectedItemForAction.id);

			if (error) {
				console.error("Error marking item as purchased:", error);
				toast.error("Failed to mark item as purchased", {
					description: error.message || "Database update failed",
				});
				return;
			}

			toast.success("Item marked as purchased!", {
				description: `${selectedItemForAction.brand} ${selectedItemForAction.model} - $${purchasePrice}`,
				duration: 3000,
			});

			setIsPurchasedModalOpen(false);
			setSelectedItemForAction(null);
			loadJournalEntries();
		} catch (error) {
			console.error("Error:", error);
			toast.error("Failed to mark item as purchased");
		}
	};

	const handleIncrementWear = async (entry: WardrobeItem) => {
		const newWearCount = (entry.wears || 0) + 1;
		const now = new Date().toISOString();

		// Optimistic update
		setJournalEntries((prev) =>
			prev.map((item) =>
				item.id === entry.id
					? { ...item, wears: newWearCount, last_worn_date: now }
					: item
			)
		);

		// Update in database
		const { error } = await supabase
			.from("items")
			.update({ wears: newWearCount, last_worn_date: now })
			.eq("id", entry.id);

		if (error) {
			console.error("Error updating wears:", error);
			toast.error("Failed to update wears");
			// Revert on error
			loadJournalEntries();
		} else {
			// Check for new achievements (stats auto-updated via DB trigger)
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				fetch('/api/check-achievements', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId: user.id }),
				}).catch((err) => console.warn('Achievement check failed:', err));
			}
		}
	};

	const handleDecrementWear = async (entry: WardrobeItem) => {
		const currentWears = entry.wears || 0;
		if (currentWears === 0) return; // Prevent negative values

		const newWearCount = currentWears - 1;
		const lastWornDate = newWearCount === 0 ? null : entry.last_worn_date;

		// Optimistic update
		setJournalEntries((prev) =>
			prev.map((item) =>
				item.id === entry.id
					? { ...item, wears: newWearCount, last_worn_date: lastWornDate }
					: item
			)
		);

		// Update in database
		const { error } = await supabase
			.from("items")
			.update({
				wears: newWearCount,
				last_worn_date: lastWornDate,
			})
			.eq("id", entry.id);

		if (error) {
			console.error("Error updating wears:", error);
			toast.error("Failed to update wears");
			// Revert on error
			loadJournalEntries();
		}
	};

	const moveItemToWishlist = async (item: WardrobeItem) => {
		try {
			const { error } = await supabase
				.from("items")
				.update({ status: ItemStatus.WISHLISTED })
				.eq("id", item.id);

			if (error) {
				console.error("Error moving item to wishlist:", error);
				toast.error("Failed to move item to wishlist");
				return;
			}

			toast.success("Moved to wishlist", {
				description: `${item.brand} ${item.model}`,
				duration: 3000,
			});
			loadJournalEntries();
		} catch (error) {
			console.error("Error:", error);
			toast.error("Failed to move item to wishlist");
		}
	};

	const archiveItem = async (reason: string) => {
		if (!selectedItemForAction) return;

		try {
			const { error } = await supabase
				.from("items")
				.update({
					is_archived: true,
					archive_reason: reason,
					archived_at: new Date().toISOString(),
				})
				.eq("id", selectedItemForAction.id);

			if (error) {
				console.error("Error archiving item:", error);
				toast.error("Failed to archive item");
				return;
			}

			toast.success("Item archived", {
				description: `${selectedItemForAction.brand} ${selectedItemForAction.model}`,
				duration: 3000,
			});

			setIsArchiveDialogOpen(false);
			setSelectedItemForAction(null);
			loadJournalEntries();
		} catch (error) {
			console.error("Error:", error);
			toast.error("Failed to archive item");
		}
	};

	const unarchiveItem = async (item: WardrobeItem) => {
		try {
			const { error } = await supabase
				.from("items")
				.update({
					is_archived: false,
					archive_reason: null,
					archived_at: null,
				})
				.eq("id", item.id);

			if (error) {
				console.error("Error unarchiving item:", error);
				toast.error("Failed to unarchive item");
				return;
			}

			toast.success("Item restored", {
				description: `${item.brand} ${item.model} has been restored`,
				duration: 3000,
			});
			loadJournalEntries();
		} catch (error) {
			console.error("Error:", error);
			toast.error("Failed to unarchive item");
		}
	};

	// Computed values
	const filteredAndSortedEntries = sortJournalEntries(
		filterJournalEntries(
			journalEntries,
			searchTerm,
			new Set<string>(),
			selectedBrands,
			selectedCategories
		),
		sortBy
	);

	const displayStatus = status.includes(ItemStatus.WISHLISTED)
		? ItemStatus.WISHLISTED
		: status[0];

	// Map status to viewMode for cards
	const getViewMode = (): "collection" | "archive" | "wishlist" => {
		if (isArchivePage) return "archive";
		if (status.includes(ItemStatus.OWNED)) return "collection";
		if (status.includes(ItemStatus.WISHLISTED)) return "wishlist";
		return "wishlist";
	};

	const viewMode = getViewMode();

	if (isLoading) {
		return (
			<div
				className='max-w-[1920px] mx-auto px-xl py-xl'
				role='status'
				aria-busy='true'
				aria-label='Loading items'>
				<DashboardHeader status={displayStatus} />
				<WardrobeSkeleton />
			</div>
		);
	}

	return (
		<div className='max-w-[1920px] mx-auto px-xl py-xl'>
			<DashboardHeader status={displayStatus} />
			<div className='flex flex-col lg:flex-row justify-between md:gap-x-4 gap-y-4 lg:gap-y-0  mb-8'>
				<WardrobeFilters
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					selectedBrands={selectedBrands}
					onBrandChange={setSelectedBrands}
					sortBy={sortBy}
					onSortChange={setSortBy}
					selectedCategories={selectedCategories}
					onCategoriesChange={setSelectedCategories}
				/>


				{/* Bulk Actions & View Controls */}
				<div className='flex items-center gap-3'>
					{/* Bulk Price Check - Only show for wishlist items */}
					{displayStatus === ItemStatus.WISHLISTED && (
						<Button
							onClick={handleBulkPriceCheck}
							disabled={isBulkChecking}
							variant="outline"
							size="sm"
							className="gap-2"
						>
							<RefreshCw className={`h-4 w-4 ${isBulkChecking ? 'animate-spin' : ''}`} />
							{isBulkChecking
								? `Checking ${bulkCheckProgress.current}/${bulkCheckProgress.total}...`
								: 'Check All Prices'
							}
						</Button>
					)}

					{/* Density Toggle */}
					<ViewDensityToggle />
				</div>
			</div>

			{/* <WardrobeStats journalEntries={journalEntries} /> */}

			<DashboardGrid
				entries={filteredAndSortedEntries}
				viewMode={viewMode}
				isArchivePage={isArchivePage}
				onEdit={handleEditEntry}
				onDelete={handleDeleteEntry}
				onIncrementWear={handleIncrementWear}
				onDecrementWear={handleDecrementWear}
				onMoveToWatchlist={moveItemToWishlist}
				onMarkAsPurchased={handleOpenPurchasedModal}
				onArchive={handleOpenArchiveDialog}
				onCreateOutfit={() => setIsOutfitStudioOpen(true)}
				onRefreshPrice={handleRefreshPrice}
				onManualEntrySuccess={loadJournalEntries}
				userWardrobe={journalEntries.filter(
					(e) => e.status === ItemStatus.OWNED
				)}
				emptyState={
					<EmptyState
						hasEntries={journalEntries.length > 0}
						displayStatus={displayStatus}
						isArchivePage={isArchivePage}
						onAddNew={onAddNew}
					/>
				}
			/>

			{editingEntry && (
				<EditItemModal
					experience={editingEntry}
					isOpen={isEditModalOpen}
					onClose={handleCloseEditModal}
					onSave={handleSaveEdit}
				/>
			)}

			<DeleteConfirmDialog
				experience={deletingEntry}
				isOpen={isDeleteConfirmOpen}
				isDeleting={isDeleting}
				onConfirm={handleConfirmDelete}
				onCancel={handleCancelDelete}
			/>

			<PurchasedConfirmationModal
				isOpen={isPurchasedModalOpen}
				onClose={() => {
					setIsPurchasedModalOpen(false);
					setSelectedItemForAction(null);
				}}
				onConfirm={markItemAsPurchased}
				itemName={
					selectedItemForAction
						? `${selectedItemForAction.brand} ${selectedItemForAction.model}`
						: undefined
				}
			/>

			<ArchiveReasonDialog
				open={isArchiveDialogOpen}
				onOpenChange={(open) => {
					setIsArchiveDialogOpen(open);
					if (!open) setSelectedItemForAction(null);
				}}
				onConfirm={archiveItem}
				itemName={
					selectedItemForAction
						? `${selectedItemForAction.brand} ${selectedItemForAction.model}`
						: ""
				}
			/>

			{/* Outfit Studio Modal */}
			<OutfitStudio
				isOpen={isOutfitStudioOpen}
				onClose={() => setIsOutfitStudioOpen(false)}
				userWardrobe={journalEntries.filter(
					(e) => e.status === ItemStatus.OWNED
				)}
			/>
		</div>
	);
}

interface EmptyStateProps {
	hasEntries: boolean;
	displayStatus: ItemStatus;
	isArchivePage: boolean;
	onAddNew?: () => void;
}

function EmptyState({
	hasEntries,
	displayStatus,
	isArchivePage,
	onAddNew,
}: EmptyStateProps) {
	// If there are entries but filters hide them, show search icon
	if (hasEntries) {
		return (
			<div className='col-span-full flex justify-center'>
				<Empty className='max-w-md border'>
					<EmptyHeader>
						<EmptyMedia variant='icon'>
							<Search />
						</EmptyMedia>
						<EmptyTitle>No matching entries</EmptyTitle>
						<EmptyDescription>
							Try adjusting your search or filters.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>
		);
	}

	// Show different empty states based on the section
	if (isArchivePage) {
		return (
			<div className='col-span-full flex justify-center py-12'>
				<ArchiveEmptyState />
			</div>
		);
	}

	if (displayStatus === ItemStatus.WISHLISTED) {
		return (
			<div className='col-span-full flex justify-center py-12'>
				<WishlistEmptyState />
			</div>
		);
	}

	if (displayStatus === ItemStatus.OWNED) {
		return (
			<div className='col-span-full flex justify-center py-12'>
				<WardrobeEmptyState />
			</div>
		);
	}

	// Default fallback
	return (
		<div className='col-span-full flex justify-center'>
			<Empty className='max-w-md border'>
				<EmptyHeader>
					<EmptyMedia variant='icon'>
						<Search />
					</EmptyMedia>
					<EmptyTitle>No entries yet</EmptyTitle>
					<EmptyDescription>Start tracking your items!</EmptyDescription>
				</EmptyHeader>
				{onAddNew && (
					<EmptyContent>
						<Button
							onClick={onAddNew}
							className='bg-blue-600 hover:bg-blue-700'>
							Add Your First Entry
						</Button>
					</EmptyContent>
				)}
			</Empty>
		</div>
	);
}
