"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import SneakerCard from "@/components/SneakerCard";
import SneakerCardUi from "@/components/SneakerCardUI";
import SectionHeader from "@/components/SectionHeader";

export default function PendingVote() {
	const [sneakers, setSneakers] = useState<any[] | null>(null);
	const [sneakersPending, setSneakersPending] = useState<number | undefined>(
		undefined
	);

	const [orderBy, setOrderBy] = useState("created_at");
	const [fetchError, setFetchError] = useState(null);

	const supabase = createClient();

	const handleDelete = (id: any) => {
		setSneakers((prevSmoothies: any) => {
			const updatedSneakers = prevSmoothies?.filter((sm: any) => sm.id !== id);
			setSneakersPending(updatedSneakers?.length);

			return updatedSneakers;
		});
	};
	const handleVote = async () => {
		const { data } = await supabase
			.from("sneakers")
			.select()
			.order("name", { ascending: true });

		return sneakers;
	};

	useEffect(() => {
		const getData = async () => {
			const { data } = await supabase
				.from("sneakers")
				.select(`*, rating_id(*), images(*),brand_id(*)`)

				.match({ in_collection: false })
				.is("rating_id", null)
				.order("created_at", { ascending: false });

			setSneakers(data);

			setSneakersPending(data?.length);
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
			<div className='animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-8xl px-3'>
				<SectionHeader
					name={"Sneakers Voting"}
					total={sneakersPending}
					sectiontext={"Sneakers Pending Vote:"}
				/>

				<div className='container mx-auto flex flex-col gap-16 items-center '>
					<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-8 mx-10 md:mx-0  md:gap-5'>
						{sneakers?.map((sneaker) => (
							<div key={sneaker.id}>
								<SneakerCard
									key={sneaker.id}
									sneaker={sneaker}
									onVote={handleVote}
									onDelete={handleDelete}
								/>
								{/* <SneakerCardUi 	sneaker={sneaker}/> */}
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
}
