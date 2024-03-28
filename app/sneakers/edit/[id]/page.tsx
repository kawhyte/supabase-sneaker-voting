"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import SmoothieCard from "../../../../components/SneakerRecentVoteCard";
import Header from "@/components/Header";
import DeployButton from "@/components/DeployButton";
import AuthButton from "@/components/AuthButton";

import { useParams, useRouter } from "next/navigation";

const Edit = ({ params }: { params: any }) => {
	//const navigate = useNavigate();
	// const id = useParams<{ tag: string; item: string }>();

	const id = params.id;

	const [name, setName] = useState("");
	const [date, setDate] = useState("");
	const [brand, setBrand] = useState("1");
	const [price, setPrice] = useState("");
	const [style, setStyle] = useState("");
	const [formError, setFormError] = useState("");
	const [main_image, setImage] = useState("");
	const supabase = createClient();
	const router = useRouter();

	//console.log("useParams ", id);

	const handleSubmit = async (e: any) => {
		e.preventDefault();

		//console.log("handleSubmit ", e);

		if (!name || !date || !brand || !price || !style || !main_image) {
			setFormError("Please fill in all the fields correctly.");
			//console.log("ERRRRROORRR!!1")
			return;
		}

		// console.log(
		// 	"Name:",
		// 	name,
		// 	"date:",
		// 	date,
		// 	"Brand:",
		// 	brand,
		// 	"Price:",
		// 	price,
		// 	"main Image:",
		// 	main_image
		// );

		const { data, error } = await supabase
			.from("sneakers")
			.update({
				name: name,
				brand_id: brand,
				release_date: date,
				price: price,
				style: style,
				main_image: main_image,
			})
			.eq("id", id)
			.select();

		if (error) {
			console.log(error);
			setFormError("Please fill in all the fields correctly.");
			//console.log("ERRRRROORRR")
		}
		if (data) {
			console.log(data);
			setFormError("");
			router.push("/sneakers/pending");
			//navigate("/");
		}
	};

	useEffect(() => {
		const fetchSmoothie = async () => {
			const { data, error } = await supabase
				.from("sneakers")
				.select()
				.eq("id", id)
				.single();

			if (error) {
				//navigate("/", { replace: true });
			}

			if (data) {
				setName(data.name);
				setImage(data.main_image);
				setBrand(data.brand_id);
				setDate(data.release_date);
				setPrice(data.price);
				setStyle(data.style);

				console.log(data);
			}
		};
		fetchSmoothie();
		// return () => {
		//   second
		// }
	}, [id, router]);

	return (
		<div className='page create'>
			<h2>Edit Page for {id}</h2>

			<form
				onSubmit={handleSubmit}
				className='w-full max-w-2xl p-5  border border-gray-200 rounded-lg shadow bg-gray-800 border-gray-7005'>
				<div className='mb-6'>
					<img src={main_image} alt='Sneaker' />
				</div>

				<div className='flex flex-wrap -mx-3 mb-6'>
					<div className='w-full md:w-1/2 px-3 mb-6 md:mb-0'>
						<label
							className='block uppercase tracking-wide text-gray-100 text-xs font-bold mb-2'
							htmlFor='grid-first-name'>
							Sneaker name
						</label>
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							className='appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white'
							id='grid-first-name'
							type='text'
							placeholder='Air Jordan 1'
						/>
					</div>
					<div className='w-full md:w-1/2 px-3'>
						<label
							className='block uppercase tracking-wide text-gray-100 text-xs font-bold mb-2'
							htmlFor='grid-last-name'>
							Release Date
						</label>
						<input
							onChange={(e) => setDate(e.target.value)}
							className='appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500'
							id='grid-last-name'
							type='date'
							placeholder='02-10-24'
							value={date}
						/>
					</div>
				</div>
				<div className='flex flex-wrap -mx-3 mb-6'>
					<div className='w-full px-3'>
						<label
							className='block uppercase tracking-wide text-gray-100 text-xs font-bold mb-2'
							htmlFor='grid-password'>
							Image Link
						</label>
						<input
							value={main_image}
							onChange={(e) => setImage(e.target.value)}
							className='appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500'
							id='grid-password'
							type='text'
							placeholder='https://'
						/>
						<p className='text-gray-600 text-xs italic'>
							Make it as long and as crazy as you'd like
						</p>
					</div>
				</div>
				<div className='flex flex-wrap -mx-3 mb-2'>
					<div className='w-full md:w-1/3 px-3 mb-6 md:mb-0'>
						<label
							className='block uppercase tracking-wide text-gray-100 text-xs font-bold mb-2'
							htmlFor='grid-state'>
							Sneaker Brand
						</label>
						<div className='relative'>
							<select
								value={brand}
								onChange={(e) => setBrand(e.target.value)}
								className='block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500'
								id='grid-state'>
								<option value='1'>Jordan</option>
								<option value='2'>Nike</option>
								<option value='3'>Adidas</option>
								<option value='4'>Asics</option>
								<option value='5'>New Balance</option>
								<option value='6'>Saucony</option>
								<option value='7'>Reebok</option>
								<option value='8'>Puma</option>
								<option value='9'>Other</option>
							</select>
							<div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
								<svg
									className='fill-current h-4 w-4'
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 20 20'>
									<path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
								</svg>
							</div>
						</div>
					</div>

					<div className='w-full md:w-1/3 px-3 mb-6 md:mb-0'>
						<label
							className='block uppercase tracking-wide text-gray-100 text-xs font-bold mb-2'
							htmlFor='grid-zip'>
							Style/SKU
						</label>
						<input
							value={style}
							onChange={(e) => setStyle(e.target.value)}
							className='appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500'
							id='grid-zip'
							type='string'
							placeholder='AQ9129 500'
						/>
					</div>
					<div className='w-full md:w-1/3 px-3 mb-6 md:mb-0'>
						<label
							className='block uppercase tracking-wide text-gray-100 text-xs font-bold mb-2'
							htmlFor='grid-zip'>
							Retail Price
						</label>
						<input
							value={price}
							onChange={(e) => setPrice(e.target.value)}
							className='appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500'
							id='grid-zip'
							type='number'
							placeholder='210'
						/>
					</div>
				</div>
				<button
					type='submit'
					className='py-4 px-4 my-6 inline-flex items-center bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white  transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg '>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 24 24'
						fill='currentColor'
						className='w-6 h-6 mr-1'>
						<path
							fillRule='evenodd'
							d='M21.53 9.53a.75.75 0 0 1-1.06 0l-4.72-4.72V15a6.75 6.75 0 0 1-13.5 0v-3a.75.75 0 0 1 1.5 0v3a5.25 5.25 0 1 0 10.5 0V4.81L9.53 9.53a.75.75 0 0 1-1.06-1.06l6-6a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06Z'
							clipRule='evenodd'
						/>
					</svg>
					Update Sneaker Listing
				</button>
				{formError && <p className='error'>{formError}</p>}

				{formError && (
					<div
						className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'
						role='alert'>
						<strong className='font-bold'>Holy smokes!</strong>
						<span className='block sm:inline'>{formError}</span>
						<span className='absolute top-0 bottom-0 right-0 px-4 py-3'>
							<svg
								className='fill-current h-6 w-6 text-red-500'
								role='button'
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 20 20'>
								<title>Close</title>
								<path d='M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z' />
							</svg>
						</span>
					</div>
				)}
			</form>
		</div>
	);
};

export default Edit;
