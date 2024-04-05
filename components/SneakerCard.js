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

const SneakerCard = ({ sneaker, onDelete, onVote, showElement }) => {
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

					{sneaker.rating_id === null ? (
						<div className='absolute top-2 left-2 rounded  text-black font-mono leading-[1.2]'>
							<PendingIcon classname='' />
						</div>
					) : (
						""
					)}
				</div>

				<div className='z-30 bg-gray-800'>
					<div className='px-5 pb-3 '>
						<h5 className=' font-mono flex flex-col normal-case text-start  drop-shadow-xl  text-[1.1rem] sm:text-[0.89rem] tracking-[-0.01em] leading-[1.33] mt-8 font-semibold'>
							{sneaker.name}
						</h5>
						<p className='tracking-wide text-[0.75rem] title-font font-medium text-gray-400 mb-1 mt-3 font-mono'>
							Brand: {sneaker.brand_id?.name}
						</p>

						<p className='tracking-wide text-[0.75rem] title-font font-medium text-gray-400 my-1 font-mono'>
							Release Date: {sneaker.release_date}
						</p>
						{/**/}
						<p className='tracking-wide text-[0.75rem] title-font font-medium text-gray-400 my-1 font-mono'>
							Retail: {sneaker.price < 10 ? "TBD" : `$${sneaker.price}`}
						</p>

						{ !showElement && <div>
							<h2 className='sm:tracking-wide  xl:hidden   text-[0.75rem] sm:text-[0.82rem] title-font font-medium text-white mb-1 mt-5  font-mono grid justify-items-center'>
								Select one:
							</h2>

							<div className='flex flex-row justify-evenly mx-12 sm:mx-3 xl:justify-between  rounded-xl  max-w-sm  mb-8 xl:mt-7 sm:mt-2 sm:mb-7 '>
								<h2 className='sm:tracking-wide hidden sm:ml-2 text-[0.75rem] sm:text-[0.83rem] title-font text-start xl:flex align-middle justify-start items-center font-medium text-white my-1  font-mono'>
								Select one:
								</h2>
								<div className=' flex justify-end  '>
									<div className='relative group flex flex-col items-center align-middle justify-center'>
										<button
											onClick={(e) => {
												handleRating("1", e);
											}}
											type='button'
											className={`flex flex-col items-center align-middle justify-center w-full px-3 py-2 text-xs  text-white  transition ease-in duration-200 font-mono uppercase leading-[1.2]   rounded-l-xl  border  hover:bg-green-500 ${
												vote === "1" ? " bg-green-500" : " "
											} `}>
											<svg
												width='800px'
												height='800px'
												viewBox='0 0 24 24'
												className='w-6 h-6 sm:w-8 sm:h-8   fill-white  '
												xmlns='http://www.w3.org/2000/svg'>
												<path d='M8.88875 14.5414C8.63822 14.0559 8.0431 13.8607 7.55301 14.1058C7.05903 14.3528 6.8588 14.9535 7.10579 15.4474C7.18825 15.6118 7.29326 15.7659 7.40334 15.9127C7.58615 16.1565 7.8621 16.4704 8.25052 16.7811C9.04005 17.4127 10.2573 18.0002 12.0002 18.0002C13.7431 18.0002 14.9604 17.4127 15.7499 16.7811C16.1383 16.4704 16.4143 16.1565 16.5971 15.9127C16.7076 15.7654 16.8081 15.6113 16.8941 15.4485C17.1387 14.961 16.9352 14.3497 16.4474 14.1058C15.9573 13.8607 15.3622 14.0559 15.1117 14.5414C15.0979 14.5663 14.9097 14.892 14.5005 15.2194C14.0401 15.5877 13.2573 16.0002 12.0002 16.0002C10.7431 16.0002 9.96038 15.5877 9.49991 15.2194C9.09071 14.892 8.90255 14.5663 8.88875 14.5414Z' />
												<path d='M6.5 7C5 7 5 8.66667 5 8.66667C5 10 7.5 12 8 12C8.5 12 11 10 11 8.66667C11 8.66667 11 7 9.5 7C8 7 8 9 8 9C8 9 8 7 6.5 7Z' />
												<path d='M13 8.66667C13 8.66667 13 7 14.5 7C16 7 16 9 16 9C16 9 16 7 17.5 7C19 7 19 8.66667 19 8.66667C19 10 16.5 12 16 12C15.5 12 13 10 13 8.66667Z' />
												<path
													fillRule='evenodd'
													clipRule='evenodd'
													d='M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM12 20.9932C7.03321 20.9932 3.00683 16.9668 3.00683 12C3.00683 7.03321 7.03321 3.00683 12 3.00683C16.9668 3.00683 20.9932 7.03321 20.9932 12C20.9932 16.9668 16.9668 20.9932 12 20.9932Z'
												/>
											</svg>
										</button>
										<span
											className={`absolute top-8 md:scale-0 transition-all mt-4 sm:mt-6 text-center rounded bg-gray-800  text-[0.67rem] sm:text-xs text-white md:group-hover:scale-100 ${
												vote === "1" ? "scale-100" : ""
											}`}>
											Love it!
										</span>
									</div>
									<div className='relative group flex justify-center flex-col items-center align-middle'>
										<button
											onClick={(e) => {
												handleRating("4", e);
											}}
											type='button'
											className={`flex flex-col items-center align-middle justify-center w-full px-3 py-2 text-xs  text-white  transition ease-in duration-200 font-mono uppercase leading-[1.2] border-b border-t border-r  hover:bg-indigo-500 ${
												vote === "4" ? " bg-indigo-500" : " "
											} `}>
											<svg
												className='w-6 h-6 sm:w-8 sm:h-8   fill-white  '
												width='800px'
												height='800px'
												viewBox='0 0 24 24'
												fill='none'
												xmlns='http://www.w3.org/2000/svg'>
												<path d='M8.5 11C9.32843 11 10 10.3284 10 9.5C10 8.67157 9.32843 8 8.5 8C7.67157 8 7 8.67157 7 9.5C7 10.3284 7.67157 11 8.5 11Z' />
												<path d='M17 9.5C17 10.3284 16.3284 11 15.5 11C14.6716 11 14 10.3284 14 9.5C14 8.67157 14.6716 8 15.5 8C16.3284 8 17 8.67157 17 9.5Z' />
												<path d='M8.88875 13.5414C8.63822 13.0559 8.0431 12.8607 7.55301 13.1058C7.05903 13.3528 6.8588 13.9535 7.10579 14.4474C7.18825 14.6118 7.29326 14.7659 7.40334 14.9127C7.58615 15.1565 7.8621 15.4704 8.25052 15.7811C9.04005 16.4127 10.2573 17.0002 12.0002 17.0002C13.7431 17.0002 14.9604 16.4127 15.7499 15.7811C16.1383 15.4704 16.4143 15.1565 16.5971 14.9127C16.7076 14.7654 16.8081 14.6113 16.8941 14.4485C17.1387 13.961 16.9352 13.3497 16.4474 13.1058C15.9573 12.8607 15.3622 13.0559 15.1117 13.5414C15.0979 13.5663 14.9097 13.892 14.5005 14.2194C14.0401 14.5877 13.2573 15.0002 12.0002 15.0002C10.7431 15.0002 9.96038 14.5877 9.49991 14.2194C9.09071 13.892 8.90255 13.5663 8.88875 13.5414Z' />
												<path
													fillRule='evenodd'
													clipRule='evenodd'
													d='M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM12 20.9932C7.03321 20.9932 3.00683 16.9668 3.00683 12C3.00683 7.03321 7.03321 3.00683 12 3.00683C16.9668 3.00683 20.9932 7.03321 20.9932 12C20.9932 16.9668 16.9668 20.9932 12 20.9932Z'
												/>
											</svg>
										</button>
										<span
											className={`absolute top-8 md:scale-0 transition-all mt-4 sm:mt-6 text-center rounded bg-gray-800  text-[0.69rem] sm:text-xs text-white md:group-hover:scale-100 ${
												vote === "4" ? "scale-100" : ""
											}`}>
											Like it
										</span>
									</div>
									<div className='relative group flex justify-center flex-col items-center align-middle'>
										<button
											onClick={(e) => {
												handleRating("2", e);
											}}
											type='button'
											className={`flex flex-col items-center align-middle justify-center w-full px-3 py-2 text-xs  text-white  transition ease-in duration-200 font-mono uppercase leading-[1.2]       border-t border-b  hover:bg-yellow-500 ${
												vote === "2" ? " bg-yellow-500" : " "
											} `}>
											<svg
												className='w-6 h-6 sm:w-8 sm:h-8   fill-white  '
												width='800px'
												height='800px'
												viewBox='0 0 24 24'
												fill='none'
												xmlns='http://www.w3.org/2000/svg'
												version='1.1'>
												<path d='M8.5 11C9.32843 11 10 10.3284 10 9.5C10 8.67157 9.32843 8 8.5 8C7.67157 8 7 8.67157 7 9.5C7 10.3284 7.67157 11 8.5 11Z'></path>
												<path d='M17 9.5C17 10.3284 16.3284 11 15.5 11C14.6716 11 14 10.3284 14 9.5C14 8.67157 14.6716 8 15.5 8C16.3284 8 17 8.67157 17 9.5Z'></path>
												<path d='M8 14C7.44772 14 7 14.4477 7 15C7 15.5523 7.44772 16 8 16H15.9991C16.5514 16 17 15.5523 17 15C17 14.4477 16.5523 14 16 14H8Z'></path>
												<path
													fillRule='evenodd'
													clipRule='evenodd'
													d='M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM12 20.9932C7.03321 20.9932 3.00683 16.9668 3.00683 12C3.00683 7.03321 7.03321 3.00683 12 3.00683C16.9668 3.00683 20.9932 7.03321 20.9932 12C20.9932 16.9668 16.9668 20.9932 12 20.9932Z'></path>
											</svg>
										</button>
										<span
											className={`absolute top-8 md:scale-0 transition-all mt-4 sm:mt-6 text-center rounded bg-gray-800  text-[0.69rem] sm:text-xs text-white md:group-hover:scale-100 ${
												vote === "2" ? "scale-100" : ""
											}`}>
											Meh...
										</span>
									</div>

									<div className='relative group flex justify-end flex-col items-center align-middle '>
										<button
											onClick={(e) => {
												handleRating("3", e);
											}}
											type='button'
											className={`flex items-center justify-end align-middle w-full px-3 py-2 text-xs text-white transition ease-in duration-200 font-mono uppercase leading-[1.2]   border  rounded-r-xl hover:bg-red-500  ${
												vote === "3" ? "bg-red-500" : ""
											} `}>
											<svg
												className='w-6 h-6 sm:w-8 sm:h-8   fill-white  '
												width='800px'
												height='800px'
												viewBox='0 0 24 24'
												fill='none'
												xmlns='http://www.w3.org/2000/svg'>
												<path d='M8.5 11C9.32843 11 10 10.3284 10 9.5C10 8.67157 9.32843 8 8.5 8C7.67157 8 7 8.67157 7 9.5C7 10.3284 7.67157 11 8.5 11Z' />
												<path d='M17 9.5C17 10.3284 16.3284 11 15.5 11C14.6716 11 14 10.3284 14 9.5C14 8.67157 14.6716 8 15.5 8C16.3284 8 17 8.67157 17 9.5Z' />
												<path d='M6.55279 15.8944C7.03804 16.1371 7.62626 15.9481 7.88102 15.4731C8.11023 15.1132 8.60518 15 9 15C9.44724 15 9.61844 15.1141 9.94058 15.3289L9.9453 15.3321C10.3701 15.6153 10.9494 16 12 16C13.0506 16 13.6299 15.6153 14.0547 15.3321L14.0594 15.3289C14.3816 15.1141 14.5528 15 15 15C15.3948 15 15.8898 15.1132 16.119 15.4731C16.3737 15.9481 16.962 16.1371 17.4472 15.8944C17.9287 15.6537 18.1343 15.0286 17.8922 14.5484C17.8451 14.4558 17.7934 14.3704 17.6984 14.2437C17.5859 14.0938 17.4194 13.9049 17.1872 13.7191C16.7102 13.3375 15.9929 13 15 13C13.9494 13 13.3701 13.3847 12.9453 13.6679L12.9406 13.6711C12.6184 13.8859 12.4472 14 12 14C11.5528 14 11.3816 13.8859 11.0594 13.6711L11.0547 13.6679C10.6299 13.3847 10.0506 13 9 13C8.00708 13 7.28983 13.3375 6.81281 13.7191C6.58063 13.9049 6.41406 14.0938 6.30156 14.2437C6.20582 14.3714 6.15379 14.4572 6.10665 14.5506C5.86386 15.0337 6.06922 15.6526 6.55279 15.8944Z' />
												<path
													fillRule='evenodd'
													clipRule='evenodd'
													d='M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM12 20.9932C7.03321 20.9932 3.00683 16.9668 3.00683 12C3.00683 7.03321 7.03321 3.00683 12 3.00683C16.9668 3.00683 20.9932 7.03321 20.9932 12C20.9932 16.9668 16.9668 20.9932 12 20.9932Z'
												/>
											</svg>
										</button>

										<span
											className={`absolute top-8 md:scale-0 transition-all mt-4 sm:mt-6 text-center rounded bg-gray-800  text-[0.69rem] sm:text-xs text-white md:group-hover:scale-100 ${
												vote === "3" ? "scale-100" : ""
											}`}>
											Hell No!
										</span>
									</div>
								</div>
							</div>
						</div>}
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
				</svg>
				{/**/}

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

export default SneakerCard;
