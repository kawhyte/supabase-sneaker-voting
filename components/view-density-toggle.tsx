/**
 * ViewDensityToggle - User control for card grid density
 *
 * Provides 3 view modes:
 * - Compact: 4-5 cards, 1:1 images, minimal metadata
 * - Comfortable: 3-4 cards (default), 3:4 images, balanced
 * - Detailed: 2-3 cards, 4:3 images, full metadata
 */

"use client";

import { LayoutGrid, LayoutList, LayoutDashboard } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDensity } from "@/lib/view-density-context";

export function ViewDensityToggle() {
	const { density, setDensity } = useDensity();

	const modes = [
		{
			id: "compact" as const,
			label: "Compact",
			description: "See more items",
			icon: LayoutGrid,
		},
		{
			id: "comfortable" as const,
			label: "Comfortable",
			description: "Balanced view",
			icon: LayoutList,
		},
		{
			id: "detailed" as const,
			label: "Detailed",
			description: "Full information",
			icon: LayoutDashboard,
		},
	];

	return (
		<div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
			{modes.map(({ id, label, description, icon: Icon }) => (
				<Tooltip key={id}>
					<TooltipTrigger asChild>
						<button
							onClick={() => setDensity(id)}
							className={`p-2 rounded-md transition-all ${
								density === id
									? "bg-white shadow-sm text-primary"
									: "text-muted-foreground hover:text-foreground hover:bg-stone-200/50"
							}`}
							aria-label={`${label} view`}
							aria-pressed={density === id}
							type="button">
							<Icon className="h-4 w-4" />
						</button>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						{/* <p className="text-xs font-medium">{label}</p> */}
						<p className="text-xs text-white">{description}</p>
					</TooltipContent>
				</Tooltip>
			))}
		</div>
	);
}
