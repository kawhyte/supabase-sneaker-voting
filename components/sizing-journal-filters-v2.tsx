'use client'

import { useEffect, useMemo, useState } from 'react'
import { X, Sliders } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { CATEGORY_CONFIGS, type ItemCategory } from '@/components/types/item-category'

interface SizingJournalFiltersV2Props {
	searchTerm: string
	onSearchChange: (value: string) => void
	selectedBrands?: Set<string>
	onBrandChange: (brands: Set<string>) => void
	sortBy: string
	onSortChange: (value: string) => void
	availableBrands: string[]
	selectedCategories: ItemCategory[]
	onCategoriesChange: (categories: ItemCategory[]) => void
}

const FILTERS_STORAGE_KEY = 'sizing-journal-filters'

interface FilterState {
	categories: ItemCategory[]
	brands: string[]
	searchTerm: string
	sortBy: string
}

export function SizingJournalFiltersV2({
	searchTerm,
	onSearchChange,
	selectedBrands = new Set(),
	onBrandChange,
	sortBy,
	onSortChange,
	availableBrands,
	selectedCategories,
	onCategoriesChange,
}: SizingJournalFiltersV2Props) {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const [selectedBrandsList, setSelectedBrandsList] = useState<string[]>(
		Array.from(selectedBrands)
	)
	const [isMounted, setIsMounted] = useState(false)

	// Load filters from localStorage on mount
	useEffect(() => {
		setIsMounted(true)
		const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY)
		if (savedFilters) {
			try {
				const parsed = JSON.parse(savedFilters) as FilterState
				if (parsed.categories) onCategoriesChange(parsed.categories)
				if (parsed.brands) onBrandChange(new Set(parsed.brands))
				if (parsed.searchTerm) onSearchChange(parsed.searchTerm)
				if (parsed.sortBy) onSortChange(parsed.sortBy)
			} catch (error) {
				console.error('Failed to load filters from localStorage:', error)
			}
		}
	}, [])

	// Save filters to localStorage whenever they change
	useEffect(() => {
		if (!isMounted) return

		const filterState: FilterState = {
			categories: selectedCategories,
			brands: selectedBrandsList,
			searchTerm,
			sortBy,
		}
		localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filterState))
	}, [selectedCategories, selectedBrandsList, searchTerm, sortBy, isMounted])

	// Get all category IDs
	const allCategoryIds = useMemo(
		() => Object.keys(CATEGORY_CONFIGS) as ItemCategory[],
		[]
	)

	// Calculate active filter count
	const activeFilterCount = useMemo(() => {
		let count = 0
		if (selectedCategories.length > 0 && selectedCategories.length < allCategoryIds.length)
			count++
		if (selectedBrandsList.length > 0) count++
		if (searchTerm) count++
		return count
	}, [selectedCategories, selectedBrandsList, searchTerm, allCategoryIds.length])

	// Handle category toggle
	const handleCategoryToggle = (categoryId: ItemCategory) => {
		if (selectedCategories.includes(categoryId)) {
			onCategoriesChange(selectedCategories.filter((c) => c !== categoryId))
		} else {
			onCategoriesChange([...selectedCategories, categoryId])
		}
	}

	// Handle "Select All" categories
	const handleSelectAllCategories = () => {
		if (selectedCategories.length === allCategoryIds.length) {
			onCategoriesChange([])
		} else {
			onCategoriesChange(allCategoryIds)
		}
	}

	// Handle brand toggle
	const handleBrandToggle = (brand: string) => {
		const updatedBrands = selectedBrandsList.includes(brand)
			? selectedBrandsList.filter((b) => b !== brand)
			: [...selectedBrandsList, brand]

		setSelectedBrandsList(updatedBrands)
		onBrandChange(new Set(updatedBrands))
	}

	// Handle clear all filters
	const handleClearFilters = () => {
		onCategoriesChange([])
		setSelectedBrandsList([])
		onBrandChange(new Set())
		onSearchChange('')
		localStorage.removeItem(FILTERS_STORAGE_KEY)
		setIsDrawerOpen(false)
	}

	// Handle apply filters (close drawer)
	const handleApplyFilters = () => {
		setIsDrawerOpen(false)
	}

	return (
		<div className="w-full">
			{/* Main Filter Bar */}
			<div className="flex flex-col md:flex-row gap-2 md:gap-4 items-stretch md:items-center animate-in fade-in duration-300">
				{/* Search Input - Full width on mobile, flex-1 on desktop */}
				<div className="relative flex-1 min-w-0">
					<Input
						placeholder="Search items..."
						value={searchTerm}
						onChange={(e) => onSearchChange(e.target.value)}
						className="pl-10 h-10 text-sm border-stone-300 focus:ring-sun-400 focus:ring-2 bg-white hover:bg-stone-50 focus:bg-stone-50 transition-all duration-200"
					/>
					<svg
						className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 transition-colors duration-200 group-focus-within:text-sun-500"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="11" cy="11" r="8"></circle>
						<path d="m21 21-4.35-4.35"></path>
					</svg>
				</div>

				{/* Filter Button - Opens Drawer */}
				<Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
					<DrawerTrigger asChild>
						<Button
							variant="outline"
							className="h-10 gap-2 border-stone-300 text-slate-900 hover:bg-stone-100 relative whitespace-nowrap shadow-sm transition-all duration-200 hover:scale-105 active:scale-95"
						>
							<Sliders className="h-4 w-4" />
							Filters
							{activeFilterCount > 0 && (
								<span className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-semibold bg-sun-400 text-slate-900 animate-pulse">
									{activeFilterCount}
								</span>
							)}
						</Button>
					</DrawerTrigger>

					{/* Filter Drawer Content */}
					<DrawerContent className="bg-white border-t border-stone-300 shadow-lg animate-in slide-in-from-bottom duration-300">
						<div className="w-full h-full flex flex-col px-4 sm:px-6 md:px-8">
							<DrawerHeader className="border-b border-stone-200 bg-stone-50 shrink-0">
								<DrawerTitle className="text-lg font-semibold text-slate-900">
									Filters
								</DrawerTitle>
							</DrawerHeader>

							{/* Filter Sections */}
							<div className="flex-1 overflow-y-auto py-6 space-y-6 min-w-0">
								{/* Category Filter */}
								<div className="space-y-3">
									<div className="flex items-center justify-between gap-4 w-full min-w-0">
										<h3 className="text-sm font-semibold text-slate-900">
											Category
										</h3>
										<button
											onClick={handleSelectAllCategories}
											className="text-xs font-semibold text-sun-600 hover:text-sun-700 px-2 py-1 rounded-md hover:bg-sun-50 transition-all duration-200 hover:scale-105 active:scale-95"
										>
											{selectedCategories.length === allCategoryIds.length
												? 'Clear All'
												: 'Select All'}
										</button>
									</div>
									<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
										{Object.values(CATEGORY_CONFIGS).map((config) => {
											const isSelected = selectedCategories.includes(config.id)
											return (
												<div
													key={config.id}
													className="flex items-center space-x-2"
												>
													<Checkbox
														id={`category-${config.id}`}
														checked={isSelected}
														onCheckedChange={() => handleCategoryToggle(config.id)}
														className="border-stone-300 data-[state=checked]:bg-sun-400 data-[state=checked]:border-sun-400"
													/>
													<Label
														htmlFor={`category-${config.id}`}
														className="text-sm font-normal text-slate-700 cursor-pointer hover:text-slate-900 transition-colors duration-150"
													>
														{config.label}
													</Label>
												</div>
											)
										})}
									</div>
								</div>

								{/* Brand Filter - Multi-Select Dropdown */}
								<div className="space-y-3">
									<h3 className="text-sm font-semibold text-slate-900">
										Brand
									</h3>
									<Select
										value={selectedBrandsList[0] || ''}
										onValueChange={(value) => {
											handleBrandToggle(value)
										}}
									>
										<SelectTrigger className="h-10 border-stone-300 text-slate-900 bg-white hover:bg-stone-50 focus:ring-sun-400 transition-all duration-200 hover:border-sun-200">
											<SelectValue
												placeholder={
													selectedBrandsList.length > 0
														? `${selectedBrandsList.length} brand${selectedBrandsList.length > 1 ? 's' : ''} selected`
														: 'Select brands...'
												}
											/>
										</SelectTrigger>
										<SelectContent className="bg-white border-stone-300">
											{availableBrands.map((brand) => {
												const isSelected = selectedBrandsList.includes(brand)
												return (
													<SelectItem
														key={brand}
														value={brand}
														className="cursor-pointer"
													>
														<div className="flex items-center gap-2">
															<Checkbox
																checked={isSelected}
																onClick={(e) => {
																	e.stopPropagation()
																	handleBrandToggle(brand)
																}}
																className="border-stone-300 data-[state=checked]:bg-sun-400 data-[state=checked]:border-sun-400"
																onChange={() => {}}
															/>
															<span>{brand}</span>
														</div>
													</SelectItem>
												)
											})}
										</SelectContent>
									</Select>

									{/* Show selected brands */}
									{selectedBrandsList.length > 0 && (
										<div className="flex flex-wrap gap-2 mt-2">
											{selectedBrandsList.map((brand) => (
												<div
													key={brand}
													className="inline-flex items-center gap-2 bg-sun-50 text-sun-700 px-3 py-2 rounded-lg text-xs font-medium border border-sun-200 hover:bg-sun-100 hover:border-sun-300 transition-all duration-200 animate-in fade-in zoom-in-50"
												>
													{brand}
													<button
														onClick={() => handleBrandToggle(brand)}
														className="hover:text-sun-900 ml-1 -mr-1 flex items-center justify-center hover:scale-125 active:scale-95 transition-transform duration-150"
														aria-label={`Remove ${brand} filter`}
													>
														<X className="h-3 w-3" />
													</button>
												</div>
											))}
										</div>
									)}
								</div>
							</div>

							{/* Filter Actions */}
							<DrawerFooter className="border-t border-stone-200 bg-stone-50 flex-row gap-3 justify-end p-4 shrink-0">
								<Button
									variant="outline"
									onClick={handleClearFilters}
									className="border-stone-300 text-slate-900 hover:bg-stone-100 hover:border-stone-400 transition-all duration-200 hover:scale-105 active:scale-95"
								>
									Clear All
								</Button>
								<Button
									onClick={handleApplyFilters}
									className="bg-sun-400 hover:bg-sun-500 text-slate-900 font-semibold shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 hover:brightness-110"
								>
									Apply Filters
								</Button>
							</DrawerFooter>
						</div>
					</DrawerContent>
				</Drawer>

				{/* Sort Dropdown - Full width on mobile, fixed width on desktop */}
				<Select value={sortBy} onValueChange={onSortChange}>
					<SelectTrigger className="h-10 border-stone-300 text-slate-900 bg-white hover:bg-stone-50 focus:ring-sun-400 w-full md:w-[180px] transition-all duration-200 hover:border-sun-200">
						<SelectValue placeholder="Sort by" />
					</SelectTrigger>
					<SelectContent className="bg-white border-stone-300">
						<SelectItem value="date-desc">Newest First</SelectItem>
						<SelectItem value="date-asc">Oldest First</SelectItem>
						<SelectItem value="fit-rating">By Fit Rating</SelectItem>
						<SelectItem value="brand">By Brand</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Active Filters Summary (Optional - shows on mobile below filters) */}
			{activeFilterCount > 0 && (
				<div className="mt-3 md:hidden text-xs text-slate-600 animate-in fade-in slide-in-from-top-2 duration-300">
					{activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
					{searchTerm && ` • Search: "${searchTerm}"`}
				</div>
			)}
		</div>
	)
}
