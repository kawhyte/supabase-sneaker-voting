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

export type CardProps = {
	title: string;
	icon: LucideIcon;
	amount: number | undefined;
	description: string;
	images: Array<any> | null;
};



export default function DashboardImageDataCard(props: CardProps) {
	console.log(props.images)
	return (
		<Card className=' '>
			<CardHeader>
			<h1 className='text-sm  font-mono'>{props.title}</h1>
				<CardDescription>{props.description}</CardDescription>
			</CardHeader>
		


			<CardContent>
				<div className='grid grid-cols-2 gap-4  max-w-xl'>
					{props.images?.slice(0, 4).map((item: any) => (
						<div key={item.id}>
							<Image
								src={item.collection_image}
								width={0}
								height={0}
								style={{ width: "120px", height: "auto" }}
								alt='sneaker'
							/>

							<p className='text-[0.63rem] line-clamp-1  w-52 '>{item.name}</p>
							<p className='text-[0.6rem] line-clamp-1  w-52 '>
								{item.created_at}
							</p>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
