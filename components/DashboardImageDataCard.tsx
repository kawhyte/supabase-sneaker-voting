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

export default function DashboardImageDataCard({
	cardTitle,
	cardDescription,
	cardContent,
}: {
	cardTitle: any;
	cardDescription: any;
	cardContent: any;
}) {
	return (
		<Card className=' '>
						<CardHeader>
							<CardTitle>{cardTitle}</CardTitle>
							<CardDescription>
							{cardDescription}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-2 gap-4  max-w-xl'>
								{cardContent?.slice(0, 4).map((item:any) => (
									<div key={item.id}>
								
										<Image
											src={item.collection_image}
											width={0}
											height={0}
											style={{width:'120px', height: "auto" }}
											alt='sneaker'
										/>

										<p className='text-[0.63rem] line-clamp-1  w-52 '>{item.name}</p>
										<p className='text-[0.6rem] line-clamp-1  w-52 '>{item.created_at}</p>
										
										
									</div>
								))}
							</div>
						</CardContent>
					</Card>
	);
}
