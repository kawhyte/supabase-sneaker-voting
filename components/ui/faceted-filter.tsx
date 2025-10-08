// Path: components/ui/faceted-filter.tsx
"use client";

import * as React from "react";
import { Check, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils"; // Assuming you have a `cn` utility from Shadcn
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface FacetedFilterProps {
	title: string;
	options: {
		label: string;
		value: string;
		icon?: React.ComponentType<{ className?: string }>;
	}[];
	selectedValues?: Set<string>; // Made prop optional to reflect default
	onValueChange: (selected: Set<string>) => void;
}

export function FacetedFilter({
	title,
	options,
	selectedValues = new Set(),
	onValueChange,
}: FacetedFilterProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					size='sm'
					className='relative h-5 border-dashed' // 1. Add 'relative'
				>
					<PlusCircle className='mr-2 h-3 w-3' />
					{title}
					{selectedValues.size > 0 && (
						<Badge
							variant='secondary'
							className='absolute -right-2 -top-2 rounded-full px-1.5 py-0.5 text-xs font-semibold bg-[var(--color-primary-500)] text-black' // 2. Use absolute positioning
						>
							{selectedValues.size}
						</Badge>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-[200px] p-0' align='start'>
				<Command>
					<CommandInput placeholder={title} />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{options.map((option) => {
								const isSelected = selectedValues.has(option.value);
								return (
									<CommandItem
										key={option.value}
										onSelect={() => {
											const newSelectedValues = new Set(selectedValues);
											if (isSelected) {
												newSelectedValues.delete(option.value);
											} else {
												newSelectedValues.add(option.value);
											}
											onValueChange(newSelectedValues);
										}}>
										<div
											className={cn(
												"mr-2 flex h-3 w-3 items-center justify-center rounded-sm border border-primary",
												isSelected
													? "bg-primary text-primary-foreground"
													: "opacity-50 [&_svg]:invisible"
											)}>
											<Check className={cn("h-3 w-3 text-black")} />
										</div>
										{option.icon && (
											<option.icon className='mr-2 h-3 w-3 text-muted-foreground' />
										)}
										<span>{option.label}</span>
									</CommandItem>
								);
							})}
						</CommandGroup>
						{selectedValues.size > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => onValueChange(new Set())}
										className='justify-center text-center'>
										Clear filters
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
