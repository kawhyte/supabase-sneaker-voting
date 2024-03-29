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

const SneakerCard = ({ sneaker, onDelete, onVote }) => {
	//console.log("Cards Sneakers", sneaker);

	const todayDate = new Date();
	const databaseDate = Date.parse(sneaker.release_date);

	const { toast } = useToast();

	const [vote, setVote] = useState(
		sneaker?.rating_id?.vote?.vote_id?.toString()
	);

	const supabase = createClient();

	const handleDelete = async () => {
		const { data, error } = await supabase
			.from("sneakers")
			.delete()
			.eq("id", sneaker.id)
			.select();

		if (error) {
			console.log(error);
		}
		if (data) {
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
		//setVote(value);

		// console.log("Value",value);

		// console.log("sneaker DDDDAAT", sneaker)

		// const { data, error } = await supabase
		// .from("sneakers")
		// .insert([
		// 	{
		// 		name: name,
		// 		brand_id: parseInt(brand, 10),
		// 		release_date: date,
		// 		price: price,
		// 		style: style,
		// 		main_image: main_image,
		// 	},
		// ])
		// .select();

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
		// console.log("SetID", sneakerID)

		// console.log("rating updated ", rating_data);
		//setSneakerId(data[0].id)

		// const { data, error } = await supabase
		// .from('rating')
		// .update({ vote: parseInt(value,10) })
		// .eq("sneaker_details.id", sneaker.sneaker_details.id)
		// .select()

		// const { data, error } = await supabase
		// 	.from("sneakers")
		// 	.update({ vote: parseInt(value, 10) , voted_at })
		// 	.select(`sneaker_details(*)`)
		// 	.eq("sneaker_details", sneaker.sneaker_details.id)
		// 	.order("name", { ascending: true });

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
				description: "Horray! You successfully voted ⚡️",
			});

			console.log("New data sneaker_data", data);

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
				<div className='relative bg-white'>
					<div className=''>
						<Carousel className='w-full max-w-lg '>
							<CarouselContent>
								{sneaker.images
									.sort((a, b) => b.main_image - a.main_image)
									.map((item) => (
										<CarouselItem key={item.id}>
											<div className='w-full'>
												<img
													className=' w-full  h-72  object-cover'
													src={item?.image_link}
													alt='product image'
													loading='lazy'
												/>
											</div>
										</CarouselItem>
									))}
							</CarouselContent>
							<CarouselPrevious className=' mx-16 my-28' />
							<CarouselNext className='mx-16 my-28 ' />
						</Carousel>
					</div>

					<p className='absolute top-3 right-3 rounded-xl border py-1 px-2 text-blue-600  bg-blue-200 font-mono leading-[1.2] text-xs'>
						{databaseDate > todayDate ? "Upcoming" : "Released"}
					</p>

					{sneaker.rating_id === null ? (
						<p className='absolute top-3 left-3 rounded  text-black font-mono leading-[1.2]'>
							<PendingIcon classname='' />
						</p>
					) : (
						""
					)}
				</div>

				<div className='px-5 pb-3'>
					<h5 className=' font-mono flex flex-col normal-case text-start  drop-shadow-xl  text-[1.2rem] sm:text-[1.1rem] tracking-[-0.01em] leading-[1.33] mt-8 font-semibold'>
						{sneaker.name}
						{sneaker.id}
					</h5>
					<p className='tracking-wide text-[0.9rem] title-font font-medium text-gray-400 mb-1 mt-3 font-mono'>
						Brand: {sneaker.brand_id?.name}
					</p>

					<p className='tracking-wide text-[0.9rem] title-font font-medium text-gray-400 my-1 font-mono'>
						Release Date: {sneaker.release_date}
					</p>
					<p className='tracking-wide text-[0.9rem] title-font font-medium text-gray-400 my-1 font-mono'>
						Retail: {sneaker.price < 10 ? "TBD" : `$${sneaker.price}`}
					</p>

					<div className='flex justify-center align-middle items-center max-w-sm mx-auto my-7 '>
						<h2 className='tracking-wide text-[0.9rem] title-font font-medium text-gray-400 my-1 mr-1 font-mono'>
							Select one:
						</h2>
						<div className='relative group flex justify-center'>
							<button
								onClick={(e) => {
									handleRating("1", e);
								}}
								type='button'
								className={`flex items-center w-full px-3 py-2 text-xs  text-white  transition ease-in duration-200 font-mono uppercase leading-[1.2]  border-t border-b  border-l  hover:bg-yellow-500 ${
									vote === "1" ? " bg-green-500" : " "
								} `}>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 20 20'
									fill='currentColor'
									className='w-4 h-4 mr-2  '>
									<path d='M1 8.25a1.25 1.25 0 1 1 2.5 0v7.5a1.25 1.25 0 1 1-2.5 0v-7.5ZM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0 1 14 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 0 1-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 0 1-1.341-.317l-2.734-1.366A3 3 0 0 0 6.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 0 1 2.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388Z' />
								</svg>
								Drip
							</button>
							<span
								className={`absolute top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 ${
									vote === "1" ? "scale-100" : ""
								}`}>
								I like it 😇
							</span>
						</div>
						<div className='relative group flex justify-center'>
							<button
								onClick={(e) => {
									handleRating("2", e);
								}}
								type='button'
								className={`flex items-center w-full px-3 py-2 text-xs  text-white  transition ease-in duration-200 font-mono uppercase leading-[1.2]  border-t border-b  border-l  hover:bg-yellow-500 ${
									vote === "2" ? " bg-yellow-500" : " "
								} `}>
								<svg
									viewBox='0 0 24 24'
									fill='currentColor'
									className='w-4 h-4 mr-2 '>
									<path d='M22.5,10H15.75C15.13,10 14.6,10.38 14.37,10.91L12.11,16.2C12.04,16.37 12,16.56 12,16.75V18A1,1 0 0,0 13,19H18.18L17.5,22.18V22.42C17.5,22.73 17.63,23 17.83,23.22L18.62,24L23.56,19.06C23.83,18.79 24,18.41 24,18V11.5A1.5,1.5 0 0,0 22.5,10M12,6A1,1 0 0,0 11,5H5.82L6.5,1.82V1.59C6.5,1.28 6.37,1 6.17,0.79L5.38,0L0.44,4.94C0.17,5.21 0,5.59 0,6V12.5A1.5,1.5 0 0,0 1.5,14H8.25C8.87,14 9.4,13.62 9.63,13.09L11.89,7.8C11.96,7.63 12,7.44 12,7.25V6Z' />
								</svg>
								Flip
							</button>
							<span
								className={`absolute top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 ${
									vote === "2" ? "scale-100" : ""
								}`}>
								I like it 😇
							</span>
						</div>

						<div className='relative group flex justify-center '>
							<button
								onClick={(e) => {
									handleRating("3", e);
								}}
								type='button'
								className={`flex items-center w-full px-3 py-2 text-xs text-white transition ease-in duration-200 font-mono uppercase leading-[1.2] border-t border-b border-l  border-r rounded-r-md hover:bg-red-500  ${
									vote === "3" ? "bg-red-500" : ""
								} `}>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 20 20'
									fill='currentColor'
									className='w-4 h-4 mr-2 '>
									<path d='M18.905 12.75a1.25 1.25 0 1 1-2.5 0v-7.5a1.25 1.25 0 0 1 2.5 0v7.5ZM8.905 17v1.3c0 .268-.14.526-.395.607A2 2 0 0 1 5.905 17c0-.995.182-1.948.514-2.826.204-.54-.166-1.174-.744-1.174h-2.52c-1.243 0-2.261-1.01-2.146-2.247.193-2.08.651-4.082 1.341-5.974C2.752 3.678 3.833 3 5.005 3h3.192a3 3 0 0 1 1.341.317l2.734 1.366A3 3 0 0 0 13.613 5h1.292v7h-.963c-.685 0-1.258.482-1.612 1.068a4.01 4.01 0 0 1-2.166 1.73c-.432.143-.853.386-1.011.814-.16.432-.248.9-.248 1.388Z' />
								</svg>
								Skip
							</button>

							<span
								className={`absolute top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 ${
									vote === "3" ? "scale-100" : ""
								}`}>
								Hell No 🤡
							</span>
						</div>
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
				{/*
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
				</svg>*/}

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
							</svg>*/}
			</div>
		</div>
	);
};

export default SneakerCard;

// <Link href={`/sneakers/detail/${sneaker?.id}`}>
// <img
// 	className='rounded-t-lg w-full  h-60 object-cover'
// 	src={sneaker?.main_image}
// 	alt='product image'
// 	loading='lazy'
// />
// </Link>
