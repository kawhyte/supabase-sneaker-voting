"use client";
import React from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Minus, Pencil, Plus, Trash2 } from "lucide-react";
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
		//  Edit listing button
		<div className=' flex gap-6 justify-around align-middle mt-3 flex-wrap '>
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

			{/* Add to Collection button  */}
			<TooltipProvider delayDuration={50}>
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
			</TooltipProvider>
			{/* Delete listing button*/}
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
		</div>
	);
}

export default AdminButtons;
