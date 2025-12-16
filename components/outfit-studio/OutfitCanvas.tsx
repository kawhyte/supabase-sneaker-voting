// DEPRECATED: Replaced by Sneaker Inspiration (Inspo) Grid
// This Canvas-based outfit composition feature has been superseded by the new
// dual-vibe color palette system in SneakerInspirationView and SneakerPaletteCard.

"use client";

import { useCallback, useRef } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OutfitItem } from "@/components/types/outfit";
import {
	CANVAS_WIDTH,
	CANVAS_HEIGHT,
	sortByZIndex,
} from "@/lib/outfit-layout-engine";
import { useDragManager } from "@/hooks/useDragManager";
import { CanvasItem } from "./CanvasItem";

interface OutfitCanvasProps {
	items: OutfitItem[];
	backgroundColor: string;
	onUpdateItemPosition: (
		itemId: string,
		positionX: number,
		positionY: number
	) => void;
	onRemoveItem: (itemId: string) => void;
	onResetAutoArrange: () => void;
	readOnly?: boolean;
}

/**
 * OutfitCanvas - Phone mockup with draggable items
 *
 * Performance Optimizations:
 * - Uses useDragManager hook for performant drag (no state updates during drag)
 * - Uses memoized CanvasItem components (only changed items re-render)
 * - Minimal parent state updates (only track dragging item ID for visual feedback)
 *
 * Success Criteria:
 * - Drag lag <30ms (60fps maintained)
 * - Only dragged item re-renders (not all items)
 * - No frame drops during drag
 */
export function OutfitCanvas({
	items,
	backgroundColor,
	onUpdateItemPosition,
	onRemoveItem,
	onResetAutoArrange,
	readOnly = false,
}: OutfitCanvasProps) {
	const canvasRef = useRef<HTMLDivElement>(null);

	// Memoize the drag end handler
	const handleDragEnd = useCallback(
		(itemId: string, x: number, y: number) => {
			onUpdateItemPosition(itemId, x, y);
		},
		[onUpdateItemPosition]
	);

	// Use optimized drag manager hook
	const { isDraggingItemId, onMouseDown } = useDragManager({
		containerRef: canvasRef,
		items,
		canvasWidth: CANVAS_WIDTH,
		canvasHeight: CANVAS_HEIGHT,
		onDragEnd: handleDragEnd,
	});

	// Sort items by z-index for proper rendering
	const sortedItems = sortByZIndex(items);

	return (
		<div className='flex flex-col gap-3 sm:gap-4'>
			{/* Canvas Container - Responsive */}
			<div
				ref={canvasRef}
				className='relative mx-auto select-none max-w-full'
				style={{
					width: `${CANVAS_WIDTH}px`,
					height: `${CANVAS_HEIGHT}px`,
					maxWidth: "100%",
					aspectRatio: "375 / 667",
					backgroundColor,
					border: "6px solid #000",
					borderRadius: "30px",
					overflow: "hidden",
					cursor: isDraggingItemId ? "grabbing" : "grab",
				}}>
				{/* iPhone notch (visual only) */}
				<div
					className='absolute top-0 left-1/2 -translate-x-1/2 bg-black'
					style={{
						width: "150px",
						height: "28px",
						borderRadius: "0 0 20px 20px",
						zIndex: 100,
					}}
				/>

				{/* Outfit Items - Memoized for performance */}
				{sortedItems.map((item) => (
					<CanvasItem
						key={item.id}
						item={item}
						isDragging={isDraggingItemId === item.id}
						onMouseDown={(e) => onMouseDown(item.id, e)}
						onRemove={() => onRemoveItem(item.id)}
						readOnly={readOnly}
					/>
				))}
			</div>

			{/* Controls */}
			{!readOnly && (
				<div className='dense flex gap-2 justify-center px-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={onResetAutoArrange}
						className='flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9'>
						<RotateCcw className='h-3.5 sm:h-4 w-3.5 sm:w-4' />
						<span className='hidden sm:inline'>Reset Auto-Arrange</span>
						<span className='sm:hidden'>Reset</span>
					</Button>
				</div>
			)}

			{/* Empty State */}
			{items.length === 0 && (
				<div className='absolute  inset-0 flex items-center justify-center pointer-events-none'>
					<p className='text-slate-400 text-sm text-center'>
						Add items to create outfit
					</p>
				</div>
			)}
		</div>
	);
}
