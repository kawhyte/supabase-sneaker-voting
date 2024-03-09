import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import DripIcon from "./DripIcon";
import SkipIcon from "./SkipIcon";
import PendingIcon from "./PendingIcon";
import ThumbsUpIcon from "./ThumbsUpIcon";
import FlipIcon from "./FlipLogo";

const SmoothieCard = ({ smoothie: sneaker, onDelete, onVote }) => {
	console.log("Name:", sneaker.name, "smoothie Vote:", sneaker.vote);

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

	const handleRating = async (value, e) => {
		//setVote(value);
		console.log("value", value);

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
			onVote(sneaker);
		}
	};

	return (
		<div>
			<div className='w-full max-w-2xl bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700'>
				<div className='relative'>

				<div className="">
					<img
						className='rounded-t-lg'
						src={sneaker.main_image}
						alt='product image'
					/>
					</div>
					<p className='absolute top-2 right-2 rounded border py-1 px-2 bg-blue-200 text-black font-mono uppercase leading-[1.2] text-xs'>
					${sneaker.price}
					</p>
				
					<p className='absolute top-2 left-2 rounded border py-1 px-2 bg-blue-200 text-black font-mono uppercase leading-[1.2] text-xs'>
					{sneaker.brand}
					</p>
					
					</div>
					{sneaker.vote === null ? <PendingIcon /> : ""}

				<div className='px-5 pb-5'>
					<h5 className='font-serif flex flex-col normal-case  drop-shadow-xl  text-[1.25rem] sm:text-[1.3rem] tracking-[-0.03em] leading-[1.0] my-8 font-bold'>
						{sneaker.name} 
					</h5>

	
					

					<div className='flex justify-center align-middle items-center max-w-sm mx-auto mb-7'>
						<div className='relative group flex justify-center'>
							<button
								onClick={(e) => {
									handleRating("Drip", e);
								}}
								type='button'
								className={`flex items-center w-full px-4 py-2 md:text-sm  text-white transition ease-in duration-200 font-mono uppercase leading-[1.2]  border-t border-b border-l rounded-l-md hover:bg-green-500 ${sneaker.vote === "Drip" ? " bg-green-500 " : " "} `}>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 20 20'
									fill='currentColor'
									className='w-5 h-5 mr-2  '>
									<path d='M1 8.25a1.25 1.25 0 1 1 2.5 0v7.5a1.25 1.25 0 1 1-2.5 0v-7.5ZM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0 1 14 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 0 1-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 0 1-1.341-.317l-2.734-1.366A3 3 0 0 0 6.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 0 1 2.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388Z' />
								</svg>
								Drip
							</button>
							<span
								className={`absolute top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 ${sneaker.vote === "Drip" ? "scale-100" : ""}`}>
								I love it ❤️
							</span>
						</div>

						<div className='relative group flex justify-center'>
							<button
								onClick={(e) => {
									handleRating("Flip", e);
								}}
								type='button'
								className={`flex items-center w-full px-4 py-2 md:text-sm  text-white  transition ease-in duration-200 font-mono uppercase leading-[1.2]  border-t border-b  border-l  hover:bg-yellow-500 ${sneaker.vote === "Flip" ? "bg-yellow-500" : "" } `}>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 24 24'
									fill='currentColor'
									className='w-5 h-5 mr-2 '>
									<path
										fillRule='evenodd'
										d='M15.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H7.5a.75.75 0 0 1 0-1.5h11.69l-3.22-3.22a.75.75 0 0 1 0-1.06Zm-7.94 9a.75.75 0 0 1 0 1.06l-3.22 3.22H16.5a.75.75 0 0 1 0 1.5H4.81l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0Z'
										clipRule='evenodd'
									/>
								</svg>
								Flip
							</button>
							<span
								className={`absolute top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 ${sneaker.vote === "Flip" ? "scale-100" : ""}`}>
								I like it 😇
							</span>
						</div>

						<div className='relative group flex justify-center'>
							<button
								onClick={(e) => {
									handleRating("Skip", e);
								}}
								type='button'
								className={`flex items-center w-full px-4 py-2 md:text-sm  text-white transition ease-in duration-200 font-mono uppercase leading-[1.2] border-t border-b border-l rounded-r-md hover:bg-red-500  ${sneaker.vote === "Skip" ? "bg-red-500" : "" } `}>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 20 20'
									fill='currentColor'
									className='w-5 h-5 mr-2 '>
									<path d='M18.905 12.75a1.25 1.25 0 1 1-2.5 0v-7.5a1.25 1.25 0 0 1 2.5 0v7.5ZM8.905 17v1.3c0 .268-.14.526-.395.607A2 2 0 0 1 5.905 17c0-.995.182-1.948.514-2.826.204-.54-.166-1.174-.744-1.174h-2.52c-1.243 0-2.261-1.01-2.146-2.247.193-2.08.651-4.082 1.341-5.974C2.752 3.678 3.833 3 5.005 3h3.192a3 3 0 0 1 1.341.317l2.734 1.366A3 3 0 0 0 13.613 5h1.292v7h-.963c-.685 0-1.258.482-1.612 1.068a4.01 4.01 0 0 1-2.166 1.73c-.432.143-.853.386-1.011.814-.16.432-.248.9-.248 1.388Z' />
								</svg>
								Skip
							</button>

							<span
								className={`absolute top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 ${sneaker.vote === "Skip" ? "scale-100" : "" }`}>
								F*ck No! 🤡
							</span>
						</div>
					</div>

					<div>
					</div>
					
					
					</div>
					</div>
					<div className='flex justify-end mt-3'>
						<Link className="mr-5" href={"/sneakers/edit/" + sneaker.id}>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 24 24'
								fill='currentColor'
								className='w-6 h-6 hover:fill-indigo-400'>
								<path d='M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z' />
								<path d='M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z' />
							</svg>
						</Link>
						<Link className="mr-5"  href={"/sneakers/create/"}>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 24 24'
								fill='currentColor'
								class='w-6 h-6 hover:fill-indigo-400'>
								<path
									fill-rule='evenodd'
									d='M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z'
									clip-rule='evenodd'
								/>
							</svg>
						</Link>

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
}

export default SmoothieCard;