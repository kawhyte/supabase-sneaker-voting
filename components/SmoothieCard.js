import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const SmoothieCard = ({ smoothie }) => {
	//console.log("smoothie", smoothie);

	const [rating, setRating] = useState("");
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
			//console.log(data);
			onDelete(smoothie.id);
		}
	};

	const handleRating = async (rate, e) => {
		setRating(rate);
		// console.log("smoothie", smoothie);
		// console.log("Rating", rate);
		// console.log("E", e.target);
		const { data, error } = await supabase
			.from("sneakers")
			.update({ rating: rate })
			.select()
			.eq("id", smoothie.id);
		if (error) {
			console.log(error);
		}
		if (data) {
			console.log("Rating data**", smoothie.id);
			//setData(data)
			onRating(smoothie.id);
			//onDelete(smoothie.id);

			//.order(orderBy, { ascending: false });

			//setUpdatedData(data)
		}
	};

	return (
		<div>
			<div class='w-full max-w-2xl bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700'>
				<a href='#'>
					<img
						class='rounded-t-lg'
						src={smoothie.main_image}
						alt='product image'
					/>
				</a>
				<div class='px-5 pb-5'>
					<h5 class='text-2xl mt-5 font-semibold tracking-tight text-gray-900 dark:text-white'>
						{smoothie.name}
					</h5>

					<div class='flex flex-row justify-between text-lg  gap-y-3 items-start mt-2.5 mb-5'>
						<p>Release: {smoothie.release_date}</p>
						<p>Brand: {smoothie.brand}</p>
						<p>Retail: ${smoothie.price}</p>
					</div>
					<div class='flex items-center justify-between'>
					


				
				
					<div  class=" w-full  bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600" >
						<ul class="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownHelperRadioButton">
						  <li>
							<div class="flex p-2 rounded hover:bg-green-100 dark:hover:bg-green-600">
							  <div class="flex items-center h-5">
								  <input id="helper-radio-4" name="helper-radio" type="radio" value="" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
							  </div>
							  <div class="ms-2 text-lg">
								  <label for="helper-radio-4" class=" text-gray-900 dark:text-gray-300">
									<div>Drip 😻</div>
									<p id="helper-radio-text-4" class="text-base font-normal text-gray-500 dark:text-gray-300">I love it and would purchase it. </p>
								  </label>
							  </div>
							</div>
						  </li>
						  <li>
							<div class="flex p-2 rounded hover:bg-yellow-800 dark:hover:bg-yellow-800">
							  <div class="flex items-center h-5">
								  <input id="helper-radio-5" name="helper-radio" type="radio" value="" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"/>
							  </div>
							  <div class="ms-2 text-lg">
								  <label for="helper-radio-5" class="font-medium text-gray-900 dark:text-gray-300">
									<div>Flip 😇</div>
									<p id="helper-radio-text-5" class="text-base font-normal text-gray-500 dark:text-gray-300">I like it but would only purchase it on sale. </p>
								  </label>
							  </div>
							</div>
						  </li>
						  <li>
							<div class="flex p-2 rounded hover:bg-red-300 dark:hover:bg-red-500">
							  <div class="flex items-center h-5">
								  <input id="helper-radio-6" name="helper-radio" type="radio" value="" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"/>
							  </div>
							  <div class="ms-2 text-lg">
								  <label for="helper-radio-6" class="font-medium text-gray-900 dark:text-gray-300">
									<div>Skip 🤡</div>
									<p id="helper-radio-text-6" class="text-base font-normal text-gray-500 dark:text-gray-300">Hell No! I don't like it at all. </p>
								  </label>
							  </div>
							</div>
						  </li>
						</ul>
					</div>
					




					</div>
					{/*<div class='flex items-center justify-between'>
						<span class='text-3xl font-bold text-gray-900 dark:text-white'>
							$599
						</span>
						<a
							href='#'
							class='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'>
							Add to cart
						</a>
	</div>*/}
				</div>
			</div>

			<div className='smoothie-card'>
				<img src={smoothie.main_image} alt='sneakers' />
				<h3>{smoothie.name}</h3>
				<p>RELEASE: {smoothie.release_date}</p>
				<p>BRAND: {smoothie.brand}</p>
				<p> RETAIL: ${smoothie.price}</p>
				<div className='rating'>
					{smoothie.rating === null ? "Not Rated" : smoothie.rating}
				</div>

				<hr></hr>

				<div className='rating-buttons'>
					<div>
						<i
							className='material-icons'
							onClick={(e) => {
								handleRating("Love it", e);
							}}>
							thumb_up
						</i>
						<span> I love it! Drip 😻</span>
					</div>
					<div>
						<i
							className='material-icons'
							onClick={(e) => {
								handleRating("Like it", e);
							}}>
							face
						</i>
						<span> I like it, but would only purchase on discount 😇</span>
					</div>
					<div>
						<i
							className='material-icons'
							onClick={(e) => {
								handleRating("Hate it", e);
							}}>
							thumb_down
						</i>
						<span>Hell No! I don't like it at all 🤡 </span>
					</div>
				</div>
				<div className='buttons'>
					<Link href={"/" + smoothie.id}>
						<i className='material-icons'>edit</i>
					</Link>
					<i className='material-icons' onClick={handleDelete}>
						delete
					</i>
				</div>
			</div>
		</div>
	);
};

export default SmoothieCard;
