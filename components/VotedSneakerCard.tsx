import Image from "next/image";
import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { AspectRatio } from "./ui/aspect-ratio";

type Props = {
	sneaker: any;
};

export default function Component({ sneaker }: Props) {
	return (
		<TableRow>
			<TableCell className='hidden tab sm:table-cell'>
				<AspectRatio ratio={16 / 10}>
					<Image
						alt='Sneaker image'
						className='rounded-md object-cover'
						height={200}
						src={sneaker?.images[0]?.image_link}
						width={210}
					/>
				</AspectRatio>
			</TableCell>
			<TableCell className='font-medium truncate text-clip  overflow-hidden'>
				{sneaker.name}
			</TableCell>
			<TableCell>{sneaker}</TableCell>
			<TableCell className='hidden md:table-cell'>25</TableCell>
			<TableCell className='hidden md:table-cell'>
				2023-07-12 10:42 AM
			</TableCell>
			<TableCell>
				<Badge variant='outline'>Draft</Badge>
			</TableCell>
			<TableCell>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button aria-haspopup='true' size='icon' variant='ghost'>
							<MoreHorizontal className='h-4 w-4' />
							<span className='sr-only'>Toggle menu</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem>Edit</DropdownMenuItem>
						<DropdownMenuItem>Delete</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</TableRow>
	);
}
