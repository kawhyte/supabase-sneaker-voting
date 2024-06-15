"use client";

import React from "react";
import Image from "next/image";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

import { format } from "date-fns";

export type CardProps = {
	title: string;
	icon: LucideIcon;

	description: string;
	images: Array<any> | null;
};

export default function DashboardImageDataCard(props: CardProps) {
 


	return (
		<Card className=' '>
			<CardHeader>
				<h1 className='text-sm  font-mono'>{props.title}</h1>
				<CardDescription>{props.description}</CardDescription>
			</CardHeader>

			<CardContent>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4  max-w-xl'>
					{  props.images?.slice(0, 6).map((item: any) => (
						<div key={item.id}>
							<Image
								src={item?.collection_image}
								width={0}
								height={0}
								style={{ width: "120px", height: "auto" }}
								alt='sneaker'
							/>

							<p className='text-[0.9rem] text-ellipsis  line-clamp-1  '>
								{item.name}
							</p>
							<p className=' text-[0.8rem] text-gray-400 '>
							
								{item?.purchase_date !== null ? "Purchased on " + format(new Date(item?.purchase_date), "MMM dd,yyyy"):""}
							</p>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
