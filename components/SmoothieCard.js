import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import ThumbsDownIcon from "./ThumbsDownIcon";
import ThumbsUpIcon from "./ThumbsUpIcon";
import FlipIcon from "./FlipIcon";

const SmoothieCard = ({ smoothie, onVote }) => {
	console.log("smoothie Vote", smoothie.vote);

	const [vote, setVote] = useState(smoothie.vote);
	//const [sneakers, setUpdatedData] = useState(smoothie);
	const supabase = createClient();

	const handleDelete = async () => {
		const { data, error } = await supabase
			.from("sneakers")
			.delete()
			.eq("id", smoothie.id)
			.select();

		if (error) {
			console.log(error);
		}
		if (data) {
			onDelete(smoothie.id);
		}
	};

	const handleRating = async (value, e) => {
		setVote(value);
		console.log("value", value);

		const { data, error } = await supabase
			.from("sneakers")
			.update({ vote: value })
			.select()
			.eq("id", smoothie.id)

		if (error) {
			console.log(error);
		}
		if (data) {
			console.log("Vote data ID **", smoothie.id);
			setVote(null);
			onVote(smoothie);
		}
	};

	return (
		<div>
			<div className='w-full max-w-2xl bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700'>
				<div className='relative'>
					<img
						className='rounded-t-lg'
						src={smoothie.main_image}
						alt='product image'
					/>

					<p class='px-4 py-2 my-2 mx-2 absolute top-0 right-0  text-base rounded-full text-indigo-600 border border-indigo-600 '>
						{smoothie.vote === null ? "Pending Vote" : smoothie.vote}
					</p>
				</div>

				<div className='px-5 pb-5'>
					<h5 className='text-base mt-5 font-semibold tracking-tight text-gray-900 dark:text-white'>
						{smoothie.name}
					</h5>

					<div className='flex flex-row text-xs border-t border-b justify-between   gap-y-3 items-start mt-2.5 mb-5'>
						<p className='my-3 '>Release: {smoothie.release_date}</p>
						<p className='my-3 '>Brand: {smoothie.brand}</p>
						<p className='my-3 '>Retail: ${smoothie.price}</p>
					</div>

					<div class='flex justify-center align-middle items-center max-w-sm mx-auto'>
						<div className='relative group'>
							<button
								onClick={(e) => {
									handleRating("Drip", e);
								}}
								type='button'
								class={`flex items-center w-full px-4 py-2 md:text-base font-medium text-black bg-white border-t border-b border-l rounded-l-md hover:bg-green-300 ${
									smoothie.vote === "Drip" ? "bg-green-400" : ""
								} `}>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 20 20'
									fill='currentColor'
									className='w-6 h-6 mr-2  '>
									<path d='M1 8.25a1.25 1.25 0 1 1 2.5 0v7.5a1.25 1.25 0 1 1-2.5 0v-7.5ZM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0 1 14 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 0 1-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 0 1-1.341-.317l-2.734-1.366A3 3 0 0 0 6.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 0 1 2.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388Z' />
								</svg>
								Drip
							</button>
							<span class='absolute top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100'>
								I love it ❤️
							</span>
						</div>

						<div className='relative group'>
							<button
								onClick={(e) => {
									handleRating("Flip", e);
								}}
								type='button'
								class={`flex items-center w-full px-4 py-2 text-base font-medium text-black bg-white border-t border-b  border-l border-gray-200  hover:bg-yellow-300 ${
									smoothie.vote === "Flip" ? "bg-yellow-300" : ""
								} `}>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 24 24'
									fill='currentColor'
									className='w-6 h-6 mr-2 '>
									<path
										fill-rule='evenodd'
										d='M15.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H7.5a.75.75 0 0 1 0-1.5h11.69l-3.22-3.22a.75.75 0 0 1 0-1.06Zm-7.94 9a.75.75 0 0 1 0 1.06l-3.22 3.22H16.5a.75.75 0 0 1 0 1.5H4.81l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0Z'
										clip-rule='evenodd'
									/>
								</svg>
								Flip
							</button>
							<span class='absolute top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100'>
								Only purchase on sale 😇
							</span>
						</div>

						<div className='relative group'>
							<button
								onClick={(e) => {
									handleRating("Skip", e);
								}}
								type='button'
								class={`flex items-center w-full px-4 py-2 text-base font-medium text-black bg-white border-t border-b border-l rounded-r-md hover:bg-red-300 ${
									smoothie.vote === "Skip" ? "bg-red-400" : ""
								} `}>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 20 20'
									fill='currentColor'
									className='w-6 h-6 mr-2 '>
									<path d='M18.905 12.75a1.25 1.25 0 1 1-2.5 0v-7.5a1.25 1.25 0 0 1 2.5 0v7.5ZM8.905 17v1.3c0 .268-.14.526-.395.607A2 2 0 0 1 5.905 17c0-.995.182-1.948.514-2.826.204-.54-.166-1.174-.744-1.174h-2.52c-1.243 0-2.261-1.01-2.146-2.247.193-2.08.651-4.082 1.341-5.974C2.752 3.678 3.833 3 5.005 3h3.192a3 3 0 0 1 1.341.317l2.734 1.366A3 3 0 0 0 13.613 5h1.292v7h-.963c-.685 0-1.258.482-1.612 1.068a4.01 4.01 0 0 1-2.166 1.73c-.432.143-.853.386-1.011.814-.16.432-.248.9-.248 1.388Z' />
								</svg>
								Skip
							</button>

							<span class='absolute top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100'>
								F*ck No! 🤡
							</span>
						</div>
					</div>

					{/*<label htmlFor='medium'>
						<input
							type='radio'
							name={"vote " + smoothie.name}
							value='Medium'
							id='medium'
							checked={vote === "Flip"}
							onChange={onOptionChange}
						/>
						<span> I love it! Drip 😻</span>
						Medium
					</label>

					<input
						type='radio'
						name={"vote " + smoothie.name}
						value='Large'
						id='large'
						checked={vote === "Skip"}
						onChange={onOptionChange}
					/>
						<label htmlFor='large'>Large</label>*/}

					{/*	<p>
						Select topping <strong>{smoothie.vote}</strong>
					</p><div className='flex items-center justify-between'>
						<span className='text-3xl font-bold text-gray-900 dark:text-white'>
							$599
						</span>
						<a
							href='#'
							className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'>
							Add to cart
						</a>
	</div>*/}
				</div>
			</div>
		</div>
	);
};

export default SmoothieCard;

// <div className='smoothie-card'>
// 				<img src={smoothie.main_image} alt='sneakers' />
// 				<h3>{smoothie.name}</h3>
// 				<p>RELEASE: {smoothie.release_date}</p>
// 				<p>BRAND: {smoothie.brand}</p>
// 				<p> RETAIL: ${smoothie.price}</p>
// 				<div className='rating'>
// 					{smoothie.rating === null ? "Not Rated" : smoothie.rating}
// 				</div>

// 				<hr></hr>

// <div className='rating-buttons'>
// 	<div>
// 		<i
// 			className='material-icons'
// 			onClick={(e) => {
// 				handleRating("Love it", e);
// 			}}>
// 			thumb_up
// 		</i>
// 		<span> I love it! Drip 😻</span>
// 	</div>
// 	<div>
// 		<i
// 			className='material-icons'
// 			onClick={(e) => {
// 				handleRating("Like it", e);
// 			}}>
// 			face
// 		</i>
// 		<span> I like it, but would only purchase on discount 😇</span>
// 	</div>
// 	<div>
// 		<i
// 			className='material-icons'
// 			onClick={(e) => {
// 				handleRating("Hate it", e);
// 			}}>
// 			thumb_down
// 		</i>
// 		<span>Hell No! I don't like it at all 🤡 </span>
// 	</div>
// </div>
// <div className='buttons'>
// 	<Link href={"/" + smoothie.id}>
// 		<i className='material-icons'>edit</i>
// 	</Link>
// 	<i className='material-icons' onClick={handleDelete}>
// 		delete
// 	</i>
// </div>
// 			</div>

// <div className='flex items-center justify-between'>
// 						<div className=' w-full  bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600'>
// 							<ul
// 								className='p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200'
// 								aria-labelledby='dropdownHelperRadioButton'>
// 								<li>
// 									<div className='flex p-2 rounded hover:bg-green-100 dark:hover:bg-green-600'>
// 										<div className='flex items-center h-5'>
// 											<input
// 												onClick={(e) => {
// 													handleRating(e);
// 												}}
// 												id='drip'
// 												name={"helper-radio " + smoothie.name}
// 												type='radio'
// 												value='Drip'
// 												checked={vote === "Drip"}
// 												className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500'
// 											/>
// 										</div>
// 										<div className='ms-2 text-lg'>
// 											<label
// 												for='drip'
// 												className=' text-gray-900 dark:text-gray-300'>
// 												<div>Drip 😻</div>
// 												<p
// 													id='helper-radio-text-4'
// 													className='text-base font-normal text-gray-500 dark:text-gray-300'>
// 													I love it and would purchase it.{" "}
// 												</p>
// 											</label>
// 										</div>
// 									</div>
// 								</li>
// 								<li>
// 									<div className='flex p-2 rounded hover:bg-yellow-800 dark:hover:bg-yellow-800'>
// 										<div className='flex items-center h-5'>
// 											<input
// 												id='helper-radio-5'
// 												name={"helper-radio " + smoothie.name}
// 												type='radio'
// 												value='Flip'
// 												className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500'
// 											/>
// 										</div>
// 										<div className='ms-2 text-lg'>
// 											<label
// 												for='helper-radio-5'
// 												className='font-medium text-gray-900 dark:text-gray-300'>
// 												<div>Flip 😇</div>
// 												<p
// 													id='helper-radio-text-5'
// 													className='text-base font-normal text-gray-500 dark:text-gray-300'>
// 													I like it but would only purchase it on sale.{" "}
// 												</p>
// 											</label>
// 										</div>
// 									</div>
// 								</li>
// 								<li>
// 									<div className='flex p-2 rounded hover:bg-red-300 dark:hover:bg-red-500'>
// 										<div className='flex items-center h-5'>
// 											<input
// 												id='helper-radio-6'
// 												name={"helper-radio " + smoothie.name}
// 												type='radio'
// 												value='Skip'
// 												className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500'
// 											/>
// 										</div>
// 										<div className='ms-2 text-lg'>
// 											<label
// 												for='helper-radio-6'
// 												className='font-medium text-gray-900 dark:text-gray-300'>
// 												<div>Skip 🤡</div>
// 												<p
// 													id='helper-radio-text-6'
// 													className='text-base font-normal text-gray-500 dark:text-gray-300'>
// 													Hell No! I don't like it at all.{" "}
// 												</p>
// 											</label>
// 										</div>
// 									</div>
// 								</li>
// 							</ul>
// 						</div>
// 					</div>

// <div className='mb-4'>
// 						<div
// 							onClick={(e) => {
// 								handleRating("Drip", e);
// 							}}
// 							className='flex'>
// 							<ThumbsUpIcon />

// 							<label className='ml-2 text-sm' htmlFor='regular'>
// 								Drip
// 							</label>
// 						</div>
// 						<p className='text-sm mt-1 ml-8'>
// 							I love it and would purchase it 😻
// 						</p>
// 					</div>

// 					<div>
// 						<div
// 							onClick={(e) => {
// 								handleRating("Flip", e);
// 							}}
// 							className='flex'>
// 							<FlipIcon />

// 							<label className='ml-2 text-lg' htmlFor='regular'>
// 								Flip
// 							</label>
// 						</div>
// 						<p className='text-base mt-1 ml-8'>
// 							I like it but would only purchase it on sale 😇
// 						</p>
// 					</div>
// 					<div>
// 						<div
// 							onClick={(e) => {
// 								handleRating("Skip", e);
// 							}}
// 							className='flex'>
// 							<ThumbsDownIcon />

// 							<label className='ml-2 text-lg' htmlFor='regular'>
// 								Skip
// 							</label>
// 						</div>
// 						<p className='text-base mt-1 ml-8'>
// 							F*ck No! I don't like it at all 🤡
// 						</p>
// 					</div>
