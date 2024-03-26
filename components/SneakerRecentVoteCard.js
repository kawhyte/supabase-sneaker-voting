import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import PendingIcon from "./PendingIcon";

const SneakerCard = ({ sneaker, onDelete, onVote }) => {
	//console.log("Cards", sneaker);

	const [vote, setVote] = useState(sneaker?.vote?.vote_id?.toString());

	console.log("Cards vote", sneaker);
	//const [sneakers, setUpdatedData] = useState(smoothie);
	const supabase = createClient();

	const refreshData = () => {
		router.replace(router.asPath);
	};

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

		console.log(value);

		// const { data, error } = await supabase
		// .from('rating')
		// .update({ vote: parseInt(value,10) })
		// .eq("sneaker_details.id", sneaker.sneaker_details.id)
		// .select()

		const { data, error } = await supabase
			.from("rating")
			.update({ vote: parseInt(value, 10) })
			.select(`sneaker_details(*)`)
			.eq("sneaker_details", sneaker.sneaker_details.id)
			.order("name", { ascending: true });

		if (error) {
			console.log(error);
		}
		if (data) {
			console.log("Vote data ID **", sneaker.sneaker_details.id);
			setVote(value);
			//setVote(null);
			//refreshData()
			//onDelete(sneaker.id);
			//onVote(sneaker);
		}
	};

	return (
		<>
			<div class='flex max-w-md justify-center align-middle items-center  h-32 overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800'>
				<div class='w-1/2 ml-2 relative  '>
					<img
						className='bg-cover '
						src={sneaker?.sneaker_details?.main_image}
					/>

					<p
						className={`flex text-center absolute left-2 top-2 my-3 sm:my-0 text-sm sm:text-xs items-center justify-center w-12 px-2 py-1  rounded-xl  text-white  transition ease-in duration-200 font-mono uppercase leading-[1.2]  border-t border-b  border-l  ${
							vote === "1"
								? " bg-green-500"
								: vote === "2"
								? " bg-yellow-500"
								: vote === "3"
								? " bg-red-500"
								: ""
						} `}>
						{sneaker?.vote?.vote_name}
					</p>
				</div>

				<div class='w-1/2 p-4 md:p-4'>
					<h1 class='font-serif normal-case   text-[1.2rem] sm:text-[1.0rem] tracking-[-0.02em] leading-[1.33] my-2 font-semibold line-clamp-2 break-words'>
						{sneaker.sneaker_details.name}
					</h1>
					<span className='sm:text-sm text-gray-400 font-extralight'>
						{" "}
						{`Voted: ${new Date(sneaker?.voted_at).toLocaleDateString()}`}
					</span>
				</div>
			</div>
		</>
	);
};

export default SneakerCard;

// <div className='flex justify-center align-middle items-center max-w-sm mx-auto mb-7'>

// 						<div className='relative group flex justify-center'>
// 							<button
// 								onClick={(e) => {
// 									handleRating("1", e);
// 								}}
// 								type='button'
// 								className={`flex items-center w-full px-3 py-2 text-xs  text-white  transition ease-in duration-200 font-mono uppercase leading-[1.2]  border-t border-b  border-l  hover:bg-yellow-500 ${
// 									vote === "1" ? " bg-green-500" : " "
// 								} `}>
// 								<svg
// 									xmlns='http://www.w3.org/2000/svg'
// 									viewBox='0 0 20 20'
// 									fill='currentColor'
// 									className='w-4 h-4 mr-2  '>
// 									<path d='M1 8.25a1.25 1.25 0 1 1 2.5 0v7.5a1.25 1.25 0 1 1-2.5 0v-7.5ZM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0 1 14 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 0 1-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 0 1-1.341-.317l-2.734-1.366A3 3 0 0 0 6.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 0 1 2.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388Z' />
// 								</svg>
// 								Drip
// 							</button>
// 							<span
// 								className={`absolute top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 ${
// 									vote === "1" ? "scale-100" : ""
// 								}`}>
// 								I like it 😇
// 							</span>
// 						</div>
// 						<div className='relative group flex justify-center'>
// 							<button
// 								onClick={(e) => {
// 									handleRating("2", e);
// 								}}
// 								type='button'
// 								className={`flex items-center w-full px-3 py-2 text-xs  text-white  transition ease-in duration-200 font-mono uppercase leading-[1.2]  border-t border-b  border-l  hover:bg-yellow-500 ${
// 									vote === "2" ? " bg-yellow-500" : " "
// 								} `}>
// 								<svg
// 									viewBox='0 0 24 24'
// 									fill='currentColor'
// 									className='w-4 h-4 mr-2 '>
// 									<path d='M22.5,10H15.75C15.13,10 14.6,10.38 14.37,10.91L12.11,16.2C12.04,16.37 12,16.56 12,16.75V18A1,1 0 0,0 13,19H18.18L17.5,22.18V22.42C17.5,22.73 17.63,23 17.83,23.22L18.62,24L23.56,19.06C23.83,18.79 24,18.41 24,18V11.5A1.5,1.5 0 0,0 22.5,10M12,6A1,1 0 0,0 11,5H5.82L6.5,1.82V1.59C6.5,1.28 6.37,1 6.17,0.79L5.38,0L0.44,4.94C0.17,5.21 0,5.59 0,6V12.5A1.5,1.5 0 0,0 1.5,14H8.25C8.87,14 9.4,13.62 9.63,13.09L11.89,7.8C11.96,7.63 12,7.44 12,7.25V6Z' />
// 								</svg>
// 								Flip
// 							</button>
// 							<span
// 								className={`absolute top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 ${
// 									vote === "2" ? "scale-100" : ""
// 								}`}>
// 								I like it 😇
// 							</span>
// 						</div>

// 						<div className='relative group flex justify-center '>
// 							<button
// 								onClick={(e) => {
// 									handleRating("3", e);
// 								}}
// 								type='button'
// 								className={`flex items-center w-full px-3 py-2 text-xs text-white transition ease-in duration-200 font-mono uppercase leading-[1.2] border-t border-b border-l  border-r rounded-r-md hover:bg-red-500  ${
// 									vote === "3" ? "bg-red-500" : ""
// 								} `}>
// 								<svg
// 									xmlns='http://www.w3.org/2000/svg'
// 									viewBox='0 0 20 20'
// 									fill='currentColor'
// 									className='w-4 h-4 mr-2 '>
// 									<path d='M18.905 12.75a1.25 1.25 0 1 1-2.5 0v-7.5a1.25 1.25 0 0 1 2.5 0v7.5ZM8.905 17v1.3c0 .268-.14.526-.395.607A2 2 0 0 1 5.905 17c0-.995.182-1.948.514-2.826.204-.54-.166-1.174-.744-1.174h-2.52c-1.243 0-2.261-1.01-2.146-2.247.193-2.08.651-4.082 1.341-5.974C2.752 3.678 3.833 3 5.005 3h3.192a3 3 0 0 1 1.341.317l2.734 1.366A3 3 0 0 0 13.613 5h1.292v7h-.963c-.685 0-1.258.482-1.612 1.068a4.01 4.01 0 0 1-2.166 1.73c-.432.143-.853.386-1.011.814-.16.432-.248.9-.248 1.388Z' />
// 								</svg>
// 								Skip
// 							</button>

// 							<span
// 								className={`absolute top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 ${
// 									vote === "3" ? "scale-100" : ""
// 								}`}>
// 								Hell No 🤡
// 							</span>
// 						</div>
// 					</div>
