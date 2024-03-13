"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import SmoothieCard from "../../components/SmoothieCard";
import SectionHeader from "@/components/SectionHeader";
import DeployButton from "@/components/DeployButton";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";

export default function Page() {

	
	const [sneakers, setSneakers] = useState<any[] | null>(null);
	const [orderBy, setOrderBy] = useState("created_at");
	const [fetchError, setFetchError] = useState(null);

	const supabase = createClient();

	const handleDelete = (id:any) => {
		setSneakers((prevSmoothies:any) => {
			return prevSmoothies?.filter((sm:any) => sm.id !== id);
		});
	};
	const handleVote = async () => {
		const { data } =  await supabase.from("sneakers").select().order("name", { ascending: true })

		setSneakers(data);
		return sneakers
	};

	useEffect(() => {
		const getData = async () => {
			const { data } = await supabase.from("sneakers").select().match({in_collection:false }).order("name", { ascending: true })
			setSneakers(data);
			console.log("Sneakers Ken", data)
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
        <SectionHeader name={"Sneaker Ranking"} />
		
		<div className=' flex flex-row gap-x-8 sm:gap-x-8 md:gap-x-20 justify-center items-center mx-auto'>
				

					<span
					
						className='border-2 items-center transition ease-in duration-200 py-2 px-3 rounded-full opacity translate-y-[10px] group font-mono uppercase leading-[1.2] text-xs md:text-sm'>
						Total Sneakers:
					</span>
				
				<Link href={"/sneakers"}>

					<button
						type='button'
						className=' hover:bg-blue-500/80 border-2 items-center transition ease-in duration-200 py-2 px-3 rounded-full opacity translate-y-[10px] group font-mono uppercase leading-[1.2] text-xs md:text-sm'>
						Vote Required:
					</button>
				</Link>
				<Link href={"/sneakers"}>

					<button
						type='button'
						className=' hover:bg-green-500/80 border-2 items-center transition ease-in duration-200 py-2 px-3 rounded-full opacity translate-y-[10px] group font-mono uppercase leading-[1.2] text-xs md:text-sm'>
						Rank Sneakers
					</button>
				</Link>

		
			</div>
		
			<div className='container mx-auto flex flex-col gap-16 items-center'>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-10'>
					{sneakers?.map((sneaker) => (
						<SmoothieCard
							key={sneaker.id}
							smoothie={sneaker}
							onVote={handleVote}
							onDelete={handleDelete}
						/>
					))}
				</div>
			</div>
		</div>
		</>
	);
}
