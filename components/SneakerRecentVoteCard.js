import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import PendingIcon from "./PendingIcon";

const SneakerCard = ({ sneaker, onDelete, onVote }) => {
	console.log("Cards", sneaker);

	const [vote, setVote] = useState(
		sneaker?.rating_id?.vote?.vote_id.toString()
	);

	const todayDate = new Date();
	const databaseDate = Date.parse(sneaker.release_date);
	//console.log("Cards vote", sneaker);
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
			<div class='w-full max-w-5xl flex flex-col  container  border  rounded-lg shadow bg-gray-800 border-gray-700'>
				<div class=' relative  '>
					<div className='flex justify-center align-middle items-center'>
						<img
							className='w-full h-40  object-cover '
							src={sneaker?.images[0]?.image_link || sneaker.main_image}
						/>
					</div>
					{/*<p
						className={`flex text-center absolute bottom-1 left-2 my-3 sm:my-0 text-sm sm:text-[0.7rem]  items-center justify-center w-12 px-2 py-1  rounded-xl  text-white  transition ease-in duration-200 font-mono leading-[1.2]  border-t border-b  border-l  ${
							vote === "1"
								? " bg-green-500"
								: vote === "2"
								? " bg-yellow-500"
								: vote === "3"
								? " bg-red-500"
								: ""
						} `}>
						{sneaker?.rating_id.vote?.vote_name}
					</p>

					<p className='absolute bottom-1 right-2 rounded-xl border py-1 px-2 text-blue-600  bg-blue-200 font-mono leading-[1.2] text-xs'>
						{databaseDate > todayDate ? "Upcoming" : "Released"}
					</p>*/}
					</div>

				<div class='w-full p-4 md:p-4'>
					<h1 class='font-mono  normal-case   text-[1.2rem] sm:text-[0.9rem] tracking-[-0.02em] leading-[1.33] my-2 font-semibold '>
						{sneaker.name}
					</h1>
					<p className='tracking-wide text-[0.9rem] title-font font-medium text-gray-400 mb-1 mt-3 font-mono'>
						Brand: {sneaker.brand_id?.name}
					</p>

					<span className='sm:text-sm text-gray-400 font-mono '>
						{`Voted: ${new Date(
							sneaker?.rating_id.voted_at
						).toLocaleDateString()}`}
					</span>
				</div>

				<div className='ml-4 flex flex-row gap-x-4 mb-4'>
					<p
						className={`flex text-center  my-3 sm:my-0 text-sm sm:text-[0.7rem]   items-center justify-center  w-24 px-2 py-1  rounded-xl  text-white  transition ease-in duration-200 font-mono leading-[1.2]  border-t border-b  border-l  ${
							vote === "1"
								? " bg-green-500"
								: vote === "2"
								? " bg-yellow-500 "
								: vote === "3"
								? " bg-red-500 "
								: vote === "4" ? " bg-indigo-500 "
								: ""
						} `}>
						{sneaker?.rating_id.vote?.vote_name}
					</p>

					<p className=' flex text-center text-blue-600  bg-blue-200 my-3 sm:my-0 text-sm sm:text-[0.7rem]  items-center justify-center w-20 px-2 py-1  rounded-xl   transition ease-in duration-200 font-mono leading-[1.2]  border-t border-b  border-l '>
						{databaseDate > todayDate ? "Upcoming" : "Released"}
					</p>
				</div>
			</div>
		</>
	);
};

export default SneakerCard;
