import {
	ChevronLeft,
	ChevronRight,
	Copy,
	CreditCard,
	MoreVertical,
	Pen,
	Trash2,
	Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Separator } from "@/components/ui/separator";
import { Badge } from "./ui/badge";
import Link from "next/link";
import AdminButtons from "./AdminButtons";
import { format } from "date-fns/format";

type Props = {
	sneaker_name: string;
	owner: string;
	ideal_size: string;
	tried_on: boolean;
	cost: number;
	ideal_cost: number;
	notes: string;
	links: any;
	sneaker_id: number;
	brand: number;
	show_element: boolean;
	release_date: any;
	refeshPage: any;
};

export default function Component({
	sneaker_name,
	sneaker_id,
	owner,
	ideal_cost,
	ideal_size,
	tried_on,
	show_element,
	cost,
	release_date,
	brand,
	refeshPage,
	notes,
	links,
}: Props) {
	return (
		<Card className='overflow-hidden'>
			<CardHeader className='flex flex-row items-start bg-muted/50'>
				<div className='grid gap-0.5'>
					<CardTitle className='group flex items-center gap-2 text-lg'>
						{sneaker_name}
						<Button
							size='icon'
							variant='outline'
							className='h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100'>
							<Copy className='h-3 w-3' />
							<span className='sr-only'>{sneaker_name}</span>
						</Button>
					</CardTitle>
					{/* <CardDescription>Date: November 23, 2023</CardDescription> */}
				</div>
				<div className='ml-auto flex items-center gap-1'>
					<AdminButtons
						sneaker={undefined}
						id={sneaker_id}
						showAddToCollectionButton={false}
						showEditButton={false}
						showDeleteButton={false}
						showElement={false}
						collectionPage={false}
						refeshPage={refeshPage}
					/>

					{/* <Link className='' href={"/sneakers/edit/" + sneaker_id}>
            <Button size="sm" variant="outline" className="h-8 gap-1">
			  <Pen className="h-3.5 w-3.5" />
			  <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
				Edit
			  </span>
			</Button>
            </Link>
			<DropdownMenu>
			  <DropdownMenuTrigger asChild>
				<Button size="icon" variant="outline" className="h-8 w-8">
				  <MoreVertical className="h-3.5 w-3.5" />
				  <span className="sr-only">More</span>
				</Button>
			  </DropdownMenuTrigger>
			  <DropdownMenuContent align="end">
				 <DropdownMenuItem  ><Link href={"/sneakers/edit/" + sneaker_id}> Edit</Link></DropdownMenuItem> 
				<DropdownMenuItem>Add to Collection</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem  className="bg-red-600" >  <Trash2 className="h-3.5 w-3.5 mr-2" />Delete</DropdownMenuItem>
			  </DropdownMenuContent>
			</DropdownMenu> */}
				</div>
			</CardHeader>
			<CardContent className='p-6 text-sm'>
				<div className='grid gap-3'>
					<ul className='grid gap-3'>
						{/* <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Name</span>
                <span>{sneaker_name}</span>
              </li> */}
						{/* <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Owner</span>
                <span>Kenny</span>
              </li> */}
						{!show_element && (
							<>
								<li className='flex items-center justify-between'>
									<span className='text-muted-foreground'>Ideal Size</span>
									<span>{ideal_size}</span>
								</li>
								<li className='flex items-center justify-between'>
									<span className='text-muted-foreground'>Tried on</span>
									<Badge className='bg-green-700 text-black' variant='outline'>
										{tried_on ? "Yes" : "No"}
									</Badge>
								</li>
							</>
						)}
						<li className='flex items-center justify-between font-semibold'>
							<span className='text-muted-foreground'>Retail Cost</span>
							<span>{brand}</span>
						</li>
						<li className='flex items-center justify-between font-semibold'>
							<span className='text-muted-foreground'>Retail Cost</span>
							<span>${cost}</span>
						</li>
						<li className='flex items-center justify-between font-semibold'>
							<span className='text-muted-foreground'>Release Date</span>
							<span>{format(new Date(release_date), "MMM dd,yyyy")}</span>
						</li>
						{!show_element && (
							<li className='flex items-center justify-between font-semibold'>
								<span className='text-muted-foreground'>
									Ideal Purchase Price
								</span>
								<span>${ideal_cost}</span>
							</li>
						)}
					</ul>
				</div>

				{!show_element && (
					<>
						{" "}
						<div className=' gap-4'>
							<Separator className='my-4' />
							<div className='grid gap-3'>
								<div className='font-semibold'>Notes</div>
							</div>
						</div>
						<Separator className='my-4' />
						<div className='grid gap-3'>
							<div className='font-semibold'>Image Links</div>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
