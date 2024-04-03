import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import PendingIcon from "./PendingIcon";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";

import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

const SneakerRecentVoteCard = ({ sneaker, onDelete, onVote }) => {
	console.log("Cards Sneakers Voted", sneaker);

	const todayDate = new Date();
	const databaseDate = Date.parse(sneaker.release_date);

	const { toast } = useToast();

	const [vote, setVote] = useState(
		sneaker?.rating_id?.vote?.vote_id?.toString()
	);

	const supabase = createClient();

	const handleDelete = async () => {
		const { data: sneaker_data, error } = await supabase
			.from("sneakers")
			.delete()
			.eq("id", sneaker.id)
			.select();

		if (error) {
			console.log(error);
		}

		if (sneaker_data) {
			console.log("DEleted", sneaker_data);
			toast({
				title: "Sneaker deleted",
				description: `${sneaker_data[0].name} was deleted.`,
			});

			onDelete(sneaker.id);
		}
	};
	const handleAddToCollection = async (value, e) => {
		//console.log(" handleAddToCollection value", value);

		const { data, error } = await supabase
			.from("sneakers")
			.update({ in_collection: value })
			.eq("id", sneaker.id)
			.select();

		if (error) {
			console.log(error);
		}
		if (data) {
			onDelete(sneaker.id);
		}
	};

	const handleRating = async (value, e) => {
		const { data: rating_data, error } = await supabase
			.from("rating")
			.insert([
				{
					vote: value,
					user_id: "2b7ed0de-da19-441f-acdd-5fc0814f3cb9",
					sneaker_id: sneaker.id,
				},
			])
			.select();

		const sneakerID = rating_data[0].id;

		if (error) {
			console.log(error);
		}
		if (rating_data) {
			const { data, error } = await supabase
				.from("sneakers")
				.update({ rating_id: sneakerID })
				.select()
				.eq("id", sneaker.id);
			//.order("name", { ascending: true });

			toast({
				description: "Horray! You successfully voted  ⚡️",
			});

			//console.log("New data sneaker_data", data);

			setVote(value);
			//setVote(null);
			//refreshData()
			onDelete(sneaker.id);
			//onVote(sneaker);
		}
	};

	return (
		<div>
			<div className='w-full max-w-5xl flex flex-col  container  border  rounded-lg shadow bg-gray-800 border-gray-700 '>
				<div className='relative bg-white h-96'>
					<div className=''>
						<Carousel className=' '>
							<CarouselContent>
								{sneaker.images
									.sort((a, b) => b.main_image - a.main_image)
									.map((item) => (
										<CarouselItem key={item.id}>
											<div className='w-full h-1/3 sm:h-96 md:h-80 lg:h-96 flex justify-center items-center align-middle container mx-auto  '>
												<img
													className=' w-full   h-1\3 pt-6 mt-36 sm:mt-0 sm:h-96 md:h-80 lg:h-auto items-center  object-cover mx-auto'
													src={item?.image_link}
													alt='product image'
													loading='lazy'
												/>
											</div>
										</CarouselItem>
									))}
							</CarouselContent>
							{sneaker.images.length > 2 && (
								<CarouselPrevious className=' mx-16   sm:my-32' />
							)}
							{sneaker.images.length > 2 && (
								<CarouselNext className='mx-16  sm:my-32' />
							)}
						</Carousel>
					</div>

					<p className='absolute top-2 right-2 rounded-xl border py-1 px-2 text-blue-600  bg-blue-200 font-mono leading-[1.2] text-[.66em]'>
						{databaseDate > todayDate ? "Upcoming" : "Released"}
					</p>

					<div className=' absolute top-2 left-2 flex flex-row justify-end items-center'>
						{vote === "1" && (
							<div className='relative flex flex-row items-center justify-center'>
						

								<span
									className={` ml-1 scale-100   py-1 px-2 w-20 bg-gray-200 rounded-xl    text-xs text-gray-800`}>
									I love it! ❤️
								</span>
							</div>
						)}

						{vote === "4" && (
							<div className='relative flex flex-row items-center justify-center'>
						

								<span
									className={` ml-1 scale-100  py-1 px-2  bg-gray-200 rounded-xl    text-xs text-gray-800`}>
									I like it 👌
								</span>
							</div>
						)}

						{vote === "2" && (
							<div className='relative flex flex-row items-center justify-center'>
						
								<span
									className={` ml-1 scale-100  py-1 px-2  bg-gray-200 rounded-xl    text-xs text-gray-800`}>
									Meh... 🫤
								</span>
							</div>
						)}

						{vote === "3" && (
							<div className='relative flex flex-row items-center justify-center'>
							

								<span
									className={` ml-1 scale-100 py-1 px-2  bg-gray-200 rounded-xl  text-xs text-gray-900`}>
									Hell No! 🤮
								</span>
							</div>
						)}
						</div>
				</div>

				<div className=""> 

				<div className='px-5 pb-3 '>
					<h5 className=' font-mono flex flex-col normal-case text-start  drop-shadow-xl  text-[1.1rem] sm:text-[0.89rem] tracking-[-0.01em] leading-[1.33] mt-8 font-semibold'>
						{sneaker.name}
					</h5>
					{/*<p className='tracking-wide text-[0.75rem] title-font font-medium text-gray-400 mb-1 mt-3 font-mono'>
						Brand: {sneaker.brand_id?.name}
					</p>

					<p className='tracking-wide text-[0.75rem] title-font font-medium text-gray-400 my-1 font-mono'>
						Release Date: {sneaker.release_date}
					</p>*/}
					<p className='tracking-wide text-[0.75rem] title-font font-medium text-gray-400 my-1 font-mono'>
						Retail: {sneaker.price < 10 ? "TBD" : `$${sneaker.price}`}
						</p>
				</div>
			</div>
			</div>
			<div className='flex justify-end mt-3'>
				<Link className='mr-5' href={"/sneakers/edit/" + sneaker.id}>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 24 24'
						fill='currentColor'
						className='w-6 h-6 hover:fill-indigo-400'>
						<path d='M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z' />
						<path d='M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z' />
					</svg>
				</Link>
				<Link className='mr-5' href={"/sneakers/create/"}>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 24 24'
						fill='currentColor'
						className='w-6 h-6 hover:fill-indigo-400'>
						<path
							fillRule='evenodd'
							d='M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z'
							clipRule='evenodd'
						/>
					</svg>
				</Link>
				
				<svg
					onClick={(e) => {
						handleAddToCollection("true", e);
					}}
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 24 24'
					fill='currentColor'
					className='w-6 h-6 hover:fill-yellow-400'>
					<path
						fillRule='evenodd'
						d='M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z'
						clipRule='evenodd'
					/>
				</svg>{/**/}

				{/*<svg
					onClick={handleDelete}
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 24 24'
					fill='currentColor'
					className='w-6 h-6 hover:fill-red-400'>
					<path
						fillRule='evenodd'
						d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z'
						clipRule='evenodd'
					/>
				</svg>
				*/}
			</div>
		</div>
	);
};

export default SneakerRecentVoteCard;
