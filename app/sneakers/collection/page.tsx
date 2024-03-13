"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import DeployButton from "@/components/DeployButton";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";
import Collection from "@/components/CollectionCard";
import Header from "@/components/Header";

export default function Page() {

	
	const [sneakers, setSneakers] = useState<any[] | null>(null);
	const [orderBy, setOrderBy] = useState("created_at");
	const [fetchError, setFetchError] = useState(null);

	const supabase = createClient();

	// const handleDelete = (id:any) => {
	// 	setSneakers((prevSmoothies:any) => {
	// 		return prevSmoothies?.filter((sm:any) => sm.id !== id);
	// 	});
	// };
	// const handleVote = async () => {
	// 	const { data } =  await supabase.from("sneakers").select().order("name", { ascending: true })

	// 	setSneakers(data);
	// 	return sneakers
	// };

	useEffect(() => {
		const getData = async () => {
			
			const { data } = await supabase.from("sneakers").select().match({in_collection:true }).order("name", { ascending: true })

			setSneakers(data);
			console.log(data)
		};
		getData();
	}, []);

	return (
		<> 

		
		<nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <DeployButton />
    
        </div>
		
      </nav>
		<div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-7xl px-3">
        <SectionHeader name={"Sneaker Collection"} />
		






		
		
        <div className='grid grid-cols-2 sm:grid-cols-4  grid-row-2 gap-y-10  gap-x-12 mt-10'>
				{sneakers?.map((sneaker) => (
					<div className='flex flex-col justify-center align-middle text-center items-center'>
						<img src={sneaker.collection_image} alt={`${sneaker.name + "sneaker"}`} />
						<p className='text-[0.8rem] font-mono leading-[1.2] mt-1 mb-2'>{sneaker.brand}</p>
						<p className='text-[0.8rem] font-mono leading-[1.2] '>{sneaker.name}</p>
					</div>
				))}
			</div>
		</div>
		</>
	);
}
