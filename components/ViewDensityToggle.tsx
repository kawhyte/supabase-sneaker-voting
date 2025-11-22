/**
 * ViewDensityToggle - User control for card grid and list density
 *
 * Provides 3 view modes:
 * - Comfortable: 3-4 cards (default), 3:4 images, balanced
 * - Detailed: 2-3 cards, 4:3 images, full metadata
 * - List: Horizontal rows, inline expansion, high density
 */

"use client";

import { LayoutList, LayoutDashboard, List } from "lucide-react";
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
			id: "comfortable" as const,
			label: "Comfortable",
			description: "Balanced card view",
			icon: LayoutList,
		},
		{
			id: "detailed" as const,
			label: "Detailed",
			description: "Large cards with full info",
			icon: LayoutDashboard,
		},
		{
			id: "list" as const,
			label: "List",
			description: "Compact rows with expansion",
			icon: List,
		},
	];

	return (
		<div className="flex items-center gap-1 bg-stone-100 rounded-lg">
			{modes.map(({ id, label, description, icon: Icon }) => (
				<Tooltip key={id}>
					<TooltipTrigger asChild>
						<button
							onClick={() => setDensity(id)}
							className={`p-2 rounded-md flex items-center gap-x-2 transition-all ${
								density === id
									? "bg-white shadow-sm text-primary"
									: "text-muted-foreground hover:text-foreground hover:bg-stone-200/50"
							}`}
							aria-label={`${label} view`}
							aria-pressed={density === id}
							type="button">
							<Icon className="h-4 w-4" />
							<span className="text-sm font-medium">{label}</span>
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
