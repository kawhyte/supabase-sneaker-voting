"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import SneakerCard from "@/components/SneakerCard";
import SectionHeader from "@/components/SectionHeader";
import DeployButton from "@/components/Logo";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function Voted() {
	const [sneakers, setSneakers] = useState<any[] | null>(null);
	const [sneakersVotes, setSneakersVotes] = useState<number | undefined>(
		undefined
	);

	const [orderBy, setOrderBy] = useState("created_at");
	const [fetchError, setFetchError] = useState(null);

	const supabase = createClient();

	// const {
	// 	data: { user },
	//   } = await supabase.auth.getUser();

	//   if (!user) {
	// 	return redirect("/login");
	//   }

	const handleDelete = (id: any) => {
		setSneakers((prevSmoothies: any) => {
			const updatedSneakers = prevSmoothies?.filter((sm: any) => sm.id !== id);
			setSneakersVotes(updatedSneakers?.length);

			return updatedSneakers;
		});
	};
	const handleVote = async (sneakers: any) => {
		//console.log("handle Vote", sneakers)
		// const { data } = await supabase
		// 	.from("sneakers")
		// 	.select()
		// 	.order("name", { ascending: true });
		// const { data: sneakers, error } = await supabase.from("rating").select(`
		// 	  *,
		// 	  vote (*),sneaker_details(*, brand_id(name))
		// 	`);

		return sneakers;
	};

	useEffect(() => {
		const getData = async () => {
			const { data } = await supabase
				.from("sneakers")
				.select(`*, rating_id(*, vote(*)), images(*),brand_id(*)`)
				.match({ in_collection: false })

				.not("rating_id", "is", null)
				.order("created_at", { ascending: false });

			setSneakers(data);
			setSneakersVotes(data?.length);

			// const { data: rating, error } = await supabase.from("rating").select(`
			//   *,
			//   vote (*),sneaker_details!inner(*, brand_id(name))
			// `).eq( 'sneaker_details.in_collection', false  ).not( 'vote', 'is', null )
			// setSneakers(rating);
			// setSneakersVotes(rating?.length)

			//console.log("Sneakers  to fileter", data);
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
				<SectionHeader
					name={"Recent Votes"}
					total={-1}
					sectiontext={"Sneaker Vote Count"}
				/>

				<div className='flex flex-col text-center w-full'>
					<h2 className='text-xs text-indigo-500 tracking-widest font-medium title-font mb-1 uppercase'>
						Most Wanted Sneakers
					</h2>
					<h1 className='sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-200'>
						{" "}
						We would love to have these in our collection ❤️
					</h1>
				</div>
				<div className='container mx-auto flex flex-col gap-9 items-center '>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-x-5 gap-y-6'>
						{sneakers
							?.filter((item) => item.rating_id.vote.vote_id === 1)
							?.map((sneaker) => (
								<SneakerCard
									key={sneaker.id}
									sneaker={sneaker}
									onVote={handleVote}
									onDelete={handleDelete}
									showElement={true}
								/>
							))}
					</div>
				</div>

				<div className='flex flex-col text-center w-full'>
					<h2 className='text-xs text-indigo-500 tracking-widest font-medium title-font mb-1 uppercase'>
						These are Good
					</h2>
					<h1 className='sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-200'>
						{" "}
						Would only purchase on these sale 👌
					</h1>
				</div>
				<div className='container mx-auto flex flex-col gap-9 items-center '>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-x-5 gap-y-6'>
						{sneakers
							?.filter((item) => item.rating_id.vote.vote_id === 4)
							?.map((sneaker) => (
								<SneakerCard
									key={sneaker.id}
									sneaker={sneaker}
									onVote={handleVote}
									onDelete={handleDelete}
									showElement={true}
								/>
							))}
					</div>
				</div>

				<div className='flex flex-col text-center w-full'>
					<h2 className='text-xs text-indigo-500 tracking-widest font-medium title-font mb-1 uppercase'>
						These are not for us
					</h2>
					<h1 className='sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-200'>
						{" "}
						Meh! Not for me 🫤
					</h1>
				</div>
				<div className='container mx-auto flex flex-col gap-9 items-center '>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-x-5 gap-y-6'>
						{sneakers
							?.filter(
								(item) =>
									item.rating_id.vote.vote_id === 2 ||
									item.rating_id.vote.vote_id === 3
							)
							?.map((sneaker) => (
								<SneakerCard
									key={sneaker.id}
									sneaker={sneaker}
									onVote={handleVote}
									onDelete={handleDelete}
									showElement={true}
								/>
							))}
					</div>
				</div>
			</div>
		</>
	);
}
