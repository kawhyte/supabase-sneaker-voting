"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import SneakerCard from "@/components/SneakerCard1";
import SectionHeader from "@/components/SectionHeader";
import DeployButton from "@/components/Logo";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";
import { redirect } from "next/navigation";
import addBlurredDataUrls from "@/lib/getLocalBase64";
import { UpdateData } from "@/lib/sneakerUtils";

export default function Voted() {
	const [sneakers, setSneakers] = useState<any[] | null>(null);
	const [filteredsneakers, setFilteredSneakers] = useState<any[] | null>(null);

	const [sneakerCount, setSneakerCount] = useState<number | undefined>(
		undefined
	);

	const [orderBy, setOrderBy] = useState("created_at");
	const [fetchError, setFetchError] = useState(null);

	const supabase = createClient();

	const handleDataUpdate = UpdateData(setSneakers, setSneakerCount);

	// const handleDataUpdate = (id: any) => {
	// 	setSneakers((prevSmoothies: any) => {
	// 		const updatedSneakers = prevSmoothies?.filter((sm: any) => sm.id !== id);
	// 		setSneakerCount(updatedSneakers?.length);

	// 		return updatedSneakers;
	// 	});
	// };
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
				.neq(`rating_id.vote`, 3)

				.not("rating_id", "is", null)
				.order("created_at", { ascending: false });

			setSneakers(data);
			setSneakerCount(data?.length);

		
		};
		getData();
	}, []);

	return (
		<>
	
		<div className='animate-in flex-1 w-full flex flex-col gap-20 items-center  justify-center align-middle '>
				<SectionHeader
					name={"Potential Sneaker Purchases"}
					total={sneakerCount}
					sectiontext={"Sneaker Vote Count"}
				/>

				
				<div className='flex flex-col gap-10 mx-4 items-center '>
				<div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3  gap-x-6 gap-y-6'>
						{sneakers?.map((sneaker) => (
							<SneakerCard
								key={sneaker.id}
								sneaker={sneaker}
								//onVote={handleVote}
								refeshPage={handleDataUpdate}
								showElement={false} 
								showtxt={false}							/>
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
