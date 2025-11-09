"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
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
			<div className='flex flex-col lg:flex-row justify-between md:gap-x-4 gap-y-4 lg:gap-y-0'>
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

        
				{/* Density Toggle */}
				<ViewDensityToggle />
			</div>

			<WardrobeStats journalEntries={journalEntries} />

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

// Sub-components
function DashboardHeader({ status }: { status: ItemStatus }) {
	const titles: Record<ItemStatus, { title: string; description: string }> = {
		[ItemStatus.OWNED]: {
			title: "Owned Items",
			description: "Items you own and have purchased",
		},
		[ItemStatus.WISHLISTED]: {
			title: "Want to Buy",
			description: "Track items you're interested in and monitor price changes",
		},
	};

	const { title, description } =
		titles[status] || titles[ItemStatus.WISHLISTED];

	return (
		<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-4'>
			<div>
				<h1 className='text-3xl font-bold font-heading -mb-2'>{title}</h1>
				<p className='text-slate-600'>{description}</p>
			</div>
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
