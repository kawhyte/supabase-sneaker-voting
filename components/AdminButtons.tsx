"use client";
import React from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Minus, MoreVertical, Pen, Pencil, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "./ui/use-toast";

type Props = {
	sneaker: any;
	id: number;
	showAddToCollectionButton: boolean;
	showEditButton: boolean;
	showDeleteButton: boolean;
	showElement: boolean;
	collectionPage: boolean;
};

function AdminButtons({
	sneaker,
	id,
	collectionPage,
	showElement,
	showAddToCollectionButton,
	showDeleteButton,
	showEditButton,
}: Props) {
	const supabase = createClient();
	const handleAddToCollection = async (value: any, e: any) => {
		console.log(" handleAddToCollection value", value);

		const { data, error } = await supabase
			.from("rating")
			.update({ in_collection: value })
			.eq("sneaker_id", sneaker.id)
			.select();

		if (error) {
			console.log(error);
		}
		if (data) {
			// console.log("sneaker.id)", sneaker.id)
			// console.log("sneaker.id data)", data)
			//onDelete(sneaker.id);
		}
	};
	const handleDelete = async () => {
		console.log("Test sneaker.id", sneaker);

		const { data: sneaker_data, error } = await supabase
			.from("sneakers")
			.delete()
			.eq("id", sneaker.id)
			.select();

		console.log("Test DElete", sneaker_data);

		if (error) {
			console.log("Sneaker Delete Error - ", error);
		}

		if (sneaker_data) {
			console.log("DEleted", sneaker_data);
			toast({
				title: "Sneaker deleted",
				description: `${sneaker_data[0].name} was deleted.`,
			});

			//onDelete(sneaker.id);
		}
	};

	console.log("ADMIN BUTTON", id);
	return (
		<>
			<Link className='' href={"/sneakers/edit/" + id}>
				<Button size='sm' variant='outline' className='h-8 gap-1'>
					<Pen className='h-3.5 w-3.5' />
					<span className='lg:sr-only xl:not-sr-only xl:whitespace-nowrap'>
						Edit
					</span>
				</Button>
			</Link>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button size='icon' variant='outline' className='h-8 w-8'>
						<MoreVertical className='h-3.5 w-3.5' />
						<span className='sr-only'>More</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end'>
					{/* <DropdownMenuItem  ><Link href={"/sneakers/edit/" + sneaker_id}> Edit</Link></DropdownMenuItem> */}
					<DropdownMenuItem
						onClick={(e) => {
							handleAddToCollection(!collectionPage, e);
						}}>
							{collectionPage ? <Minus className='h-3.5 w-3.5 mr-2' /> : <Plus className='h-3.5 w-3.5 mr-2' />}
					
						<span className='lg:sr-only xl:not-sr-only xl:whitespace-nowrap'>
						Add to Collection
					</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem className='bg-red-600'>
						{" "}
						<Trash2 className='h-3.5 w-3.5 mr-2' />
						
						<span className='lg:sr-only xl:not-sr-only xl:whitespace-nowrap'>
						Delete
					</span>
						
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}

export default AdminButtons;

{
	/* <div className=' flex gap-6 justify-around align-middle mt-3 flex-wrap '>
<TooltipProvider delayDuration={50}>
	<Tooltip>
		<TooltipTrigger asChild>
			<Link className='' href={"/sneakers/edit/" + sneaker.id}>
				<Button variant={"ghost"} size={"sm"} className=''>
					<Pencil />
				</Button>
			</Link>
		</TooltipTrigger>
		<TooltipContent>
			<p>Edit Listing</p>
		</TooltipContent>
	</Tooltip>
</TooltipProvider>


{showAddToCollectionButton && <TooltipProvider delayDuration={50}>
	<Tooltip>
		<TooltipTrigger asChild>
			<Button
				className='hover:bg-gray-800'
				variant={"ghost"}
				size={"sm"}
				onClick={(e) => {
					handleAddToCollection(!collectionPage, e);
				}}>
				{collectionPage ? <Minus /> : <Plus />}
			</Button>
		</TooltipTrigger>
		<TooltipContent>
			{collectionPage ? (
				<p>Remove from Collection</p>
			) : (
				<p>Add to Collection</p>
			)}
		</TooltipContent>
	</Tooltip>
</TooltipProvider>}

<TooltipProvider delayDuration={50}>
	<Tooltip>
		<TooltipTrigger asChild>
			<Button
				size={"sm"}
				variant='destructive'
				className='hover:bg-gray-800'
				onClick={handleDelete}>
				<Trash2 />{" "}
			</Button>
		</TooltipTrigger>
		<TooltipContent>
			<p>Delete Sneaker</p>
		</TooltipContent>
	</Tooltip>
</TooltipProvider>
</div> */
}
