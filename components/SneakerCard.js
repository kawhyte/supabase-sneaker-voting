import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import PendingIcon from "./PendingIcon";

const SneakerCard = ({ smoothie: sneaker, onDelete, onVote }) => {
	//console.log("Name:", sneaker.name, "smoothie Vote:", sneaker.vote);

	const [vote, setVote] = useState(sneaker.vote);
	//const [sneakers, setUpdatedData] = useState(smoothie);
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

		const { data, error } = await supabase
			.from("sneakers")
			.update({ vote: value })
			.select()
			.eq("id", sneaker.id)
			.order("name", { ascending: true });

		if (error) {
			console.log(error);
		}
		if (data) {
			console.log("Vote data ID **", sneaker.id);
			setVote(null);
			onDelete(sneaker.id);
			//onVote(sneaker);
		}
	};

	return (
		<div>
			<div className='w-full max-w-2xl  container bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700'>
				<div className='relative'>
				
					<div className=''>
				<Link href={`/sneakers/detail/${sneaker.id}`}> 
						<img
							className='rounded-t-lg'
							src={sneaker.main_image}
							alt='product image'
						/>	
					</Link>
					</div>
				
					<p className='absolute top-2 right-2 rounded border py-1 px-2 bg-blue-200 text-black font-mono uppercase leading-[1.2] text-xs'>
						${sneaker.price <10? "TBD": sneaker.price}
					</p>

					<p className='absolute top-2 left-2 rounded border py-1 px-2 bg-blue-200 text-black font-mono uppercase leading-[1.2] text-xs'>
						{sneaker.brand_id?.name}
					</p>
				</div>
				{sneaker.vote === null ? <PendingIcon /> : ""}

				<div className='px-5 pb-3'>
					<h5 className='font-serif flex flex-col normal-case text-center  drop-shadow-xl  text-[1.2rem] sm:text-[1.1rem] tracking-[-0.02em] leading-[1.33] my-8 font-semibold'>
						{sneaker.name}
					</h5>

					<div className='flex justify-center align-middle items-center max-w-sm mx-auto mb-7'>
						<div className='relative group flex justify-center'>
							<button
								onClick={(e) => {
									handleRating("Drip", e);
								}}
								type='button'
								className={`flex items-center w-full px-3 py-2 text-xs   text-white transition ease-in duration-200 font-mono uppercase leading-[1.2]  border-t border-b border-l rounded-l-md hover:bg-green-500 ${
									sneaker.vote === "Drip" ? " bg-green-500 " : " "
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
									sneaker.vote === "Drip" ? "scale-100" : ""
								}`}>
								I love it ❤️
							</span>
						</div>

						<div className='relative group flex justify-center'>
							<button
								onClick={(e) => {
									handleRating("Flip", e);
								}}
								type='button'
								className={`flex items-center w-full px-3 py-2 text-xs  text-white  transition ease-in duration-200 font-mono uppercase leading-[1.2]  border-t border-b  border-l  hover:bg-yellow-500 ${
									sneaker.vote === "Flip" ? "bg-yellow-500" : ""
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
									sneaker.vote === "Flip" ? "scale-100" : ""
								}`}>
								I like it 😇
							</span>
						</div>

						<div className='relative group flex justify-center '>
							<button
								onClick={(e) => {
									handleRating("Skip", e);
								}}
								type='button'
								className={`flex items-center w-full px-3 py-2 text-xs text-white transition ease-in duration-200 font-mono uppercase leading-[1.2] border-t border-b border-l  border-r rounded-r-md hover:bg-red-500  ${
									sneaker.vote === "Skip" ? "bg-red-500" : ""
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
									sneaker.vote === "Skip" ? "scale-100" : ""
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
