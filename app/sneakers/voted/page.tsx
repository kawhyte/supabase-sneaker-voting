"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import SmoothieCard from "@/components/SneakerCard";
import SectionHeader from "@/components/SectionHeader";
import DeployButton from "@/components/DeployButton";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";

export default function Voted() {
	const [sneakers, setSneakers] = useState<any[] | null>(null);
    const [sneakersVotes, setSneakersVotes] = useState<number | undefined>(undefined);;

	
	const [orderBy, setOrderBy] = useState("created_at");
	const [fetchError, setFetchError] = useState(null);

	const supabase = createClient();

	const handleDelete = (id: any) => {
		setSneakers((prevSmoothies: any) => {
            const updatedSneakers = prevSmoothies?.filter((sm: any) => sm.id !== id);
            setSneakersVotes(updatedSneakers?.length)

            return updatedSneakers
		});
	};
	const handleVote = async () => {
		const { data } = await supabase
			.from("sneakers")
			.select()
			.order("name", { ascending: true });

	
		;
		return sneakers;
	};

	useEffect(() => {
		const getData = async () => {
			const { data } = await supabase
				.from("sneakers")
				.select(`*, images(*),brand_id(*)`)
				.match({ in_collection: false  }).not("vote","is", null)
				.order("created_at", { ascending: false });
			setSneakers(data);
            setSneakersVotes(data?.length)
			// setSneakersPendingVote(data?.filter((test) => test?.vote === null));
			// setSneakersDrip(data?.filter((test) => test?.vote === "Drip"));
			// setSneakersSkip(data?.filter((test) => test?.vote === "Skip"))
			console.log(
				"Sneakers Ken",data);
		};
		getData();
	}, []);

	return (
		<>
			{/* <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <DeployButton />
    
        </div>
		
      </nav> */}
			<div className='animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-7xl px-3'>
				<SectionHeader name={"Recent Votes"} total={sneakersVotes} sectiontext={"Sneaker Vote Count"} />

				<div className='container mx-auto flex flex-col gap-16 items-center '>
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
