"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import SneakerCard from "@/components/SneakerCard";
import SectionHeader from "@/components/SectionHeader";
import DeployButton from "@/components/Logo";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";
import { redirect } from "next/navigation";
import addBlurredDataUrls from "@/lib/getLocalBase64";

export default function Voted() {
	const [sneakers, setSneakers] = useState<any[] | null>(null);
	const [filteredsneakers, setFilteredSneakers] = useState<any[] | null>(null);
	const [sneakersVotes, setSneakersVotes] = useState<number | undefined>(
		undefined
	);

	const [orderBy, setOrderBy] = useState("created_at");
	const [fetchError, setFetchError] = useState(null);

	const supabase = createClient();


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
				.filter(`rating_id.in_collection`,'eq', false )

				.not("rating_id", "is", null)
				.order("created_at", { ascending: false });

			setSneakers(data);
			setSneakersVotes(data?.length);

		
		};
		getData();
	}, []);

	return (
		<>
	
		<div className='animate-in flex-1 w-full flex flex-col gap-20 items-center  justify-center align-middle '>
				<SectionHeader
					name={"Recent Votes"}
					total={-1}
					sectiontext={"Sneaker Vote Count"}
				/>

				{/* <div className='flex flex-col text-center w-full'>
					<h2 className='text-xs text-indigo-500 pb-5 tracking-widest font-medium title-font mb-1 uppercase'>
						Filter
					</h2>

					<div className='sm:text-sm flex items-center justify-center gap-x-3 text-xl font-medium title-font mb-4 text-gray-200'>
					
						<button className='px-6 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80'>
							Love
						</button>
						<button className='px-6 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80'>
							buy on Sale
						</button>
						<button className='px-6 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80'>
							Not for me
						</button>
					</div>
				</div> */}

				{/* <div className='flex flex-col text-center w-full'>
					<h2 className='text-xs text-indigo-500 tracking-widest font-medium title-font mb-1 uppercase'>
						Most Wanted Sneakers
					</h2>
					<h1 className='sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-200'>
						{" "}
						We would love to have these in our collection ❤️
					</h1>
				</div> */}
				<div className='flex flex-col gap-10 mx-4 items-center '>
				<div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3  gap-x-6 gap-y-6'>
						{sneakers?.map((sneaker) => (
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
				{/* <div className='container mx-auto flex flex-col gap-9 items-center '>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5  gap-x-4 gap-y-5'>
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
				</div> */}

				{/* <div className='flex flex-col text-center w-full'>
					<h2 className='text-xs text-indigo-500 tracking-widest font-medium title-font mb-1 uppercase'>
						These are Good
					</h2>
					<h1 className='sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-200'>
						{" "}
						Would only purchase on these sale 👌
					</h1>
				</div> */}
				{/* <div className='container mx-auto flex flex-col gap-9 items-center '>
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
				</div> */}

				{/* <div className='flex flex-col text-center w-full'>
					<h2 className='text-xs text-indigo-500 tracking-widest font-medium title-font mb-1 uppercase'>
						These are not for us
					</h2>
					<h1 className='sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-200'>
						{" "}
						Meh! Not for me 🫤
					</h1>
				</div> */}
				{/* <div className='container mx-auto flex flex-col gap-9 items-center '>
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
				</div> */}
			</div>
		</>
	);
}
