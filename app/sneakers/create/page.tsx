"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import SmoothieCard from "../../../components/SneakerCard";
import Header from "@/components/Header";
import DeployButton from "@/components/DeployButton";
import AuthButton from "@/components/AuthButton";

import { useRouter } from "next/navigation";

const Create = () => {
	//const navigate = useNavigate();

	const [name, setName] = useState("");
	const [date, setDate] = useState("");
	const [brand, setBrand] = useState("2");
	const [price, setPrice] = useState("");
	const [style, setStyle] = useState("");
	const [formError, setFormError] = useState("");
	const [main_image, setImage] = useState(
		""
	);
	const supabase = createClient();
	const router = useRouter();

	const handleSubmit = async (e: any) => {
		e.preventDefault();

		console.log("handleSubmit ", e);

		if (!name || !date || !brand || !price || !style || !main_image) {
			setFormError("Please fill in all the fields correctly.");
			//console.log("ERRRRROORRR!!1")
			return;
		}
		const { data, error } = await supabase
			.from("sneakers")
			.insert([
				{
					name: name,
					brand_id: parseInt(brand,10),
					release_date: date,
					price: price,
					style: style,
					main_image: main_image,
				},
			])
			.select();

		if (error) {
			console.log(error);
			setFormError("Please fill in all the fields correctly.");
			//console.log("ERRRRROORRR")
		}
		if (data) {
			console.log(data);
			setFormError("");
			//router.push("/sneakers/pending");
			//navigate("/");
		}
	};

	return (
		<div className='page create'>
			<h2>Create Page</h2>

			<form
				onSubmit={handleSubmit}
				className='w-full max-w-xl p-5 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-7005'>
				<div className='mb-6'>
					<img src={main_image === "" ? "https://placehold.co/600x290?text=Sneaker+Image": main_image } alt='Sneaker' />
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
							className='appearance-none block w-full bg-gray-200 text-gray-700 border  rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white'
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
								<option value= "2" >Nike</option>
								<option value= "3">Adidas</option>
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
						className='me-1 -ms-1 w-5 h-5'
						fill='currentColor'
						viewBox='0 0 20 20'
						xmlns='http://www.w3.org/2000/svg'>
						<path
							fillRule='evenodd'
							d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
							clipRule='evenodd'></path>
					</svg>
					Create Sneaker Listing
				</button>
				{formError && <p className='error'>{formError}</p>}
			</form>
		</div>
	);
};

export default Create;
