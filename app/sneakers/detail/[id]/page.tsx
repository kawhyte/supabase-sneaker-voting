"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import SectionHeader from "@/components/SectionHeader";

export default function SneakerDetail({ params }: { params: any }) {
	const id = params.id;

	const [name, setName] = useState("");
	const [date, setDate] = useState("");
	const [brand, setBrand] = useState("1");
	const [price, setPrice] = useState("");
	const [style, setStyle] = useState("");
	const [moreImages, setmoreImages] = useState<any[]>([]);
	const [formError, setFormError] = useState("");
	const [main_image, setImage] = useState("");
	const [collectionImage, setCollectionImage] = useState("");
	const supabase = createClient();

	useEffect(() => {
		const fetchSmoothie = async () => {
			const { data, error } = await supabase
				.from("sneakers")
				.select(`*, images(*),brand_id(*)`)
				.eq("id", id)
				.single();

			if (error) {
				//navigate("/", { replace: true });
			}

			if (data) {
				//console.log("DETAIL", data);
				setName(data.name);
				setImage(data.main_image);
				//setBrand(data.brand);
				setBrand(data.brand_id.name);
				setDate(data.release_date);
				setPrice(data.price);
				setStyle(data.style);
				setmoreImages(data.images);
				setCollectionImage(data.collection_image);

				//console.log(data);
			}
		};
		fetchSmoothie();

		// return () => {
		//   second
		// }
	}, [id]);

	return (
		<>
			{/* <section>
				<SectionHeader
					name={"Sneaker Statistics"}
					total={-1}
					sectiontext={"Sneaker Vote Count"}
				/>
			</section> */}

			<section className=''>
				<div className=' flex justify-center'>
					<img src={collectionImage} />
				</div>
				<div className='flex justify-between my-6 '>
					<div className='w-2/3 font-mono text-sm  '>
						<div className='mb-1 mt-3'>
							<span className='text-gray-400'> Retail Price:</span> ${price}
						</div>
						<div className='mb-1 mt-3'>
							<span className='text-gray-400'>Purchase Price:</span>{" "}
						</div>
					
						<div className='mb-1 mt-3'>
							<span className='text-gray-400'>Relaase Date:</span> {date}
						</div>
						<div className='mb-1 mt-3'>
							<span className='text-gray-400'>Brand:</span> {brand}
						</div>
						<div className='mb-1 mt-3'>
							<span className='text-gray-400'>SKU:</span> {style}
						</div>
					</div>
					<div className='text-gray-600 body-font flex flex-col justify-center items-center align-middle'>
						<div className='container mx-auto flex  items-center justify-center flex-col'>
							<div className=' w-96 flex flex-col justify-center align-middle items-center'>
								<div className='font-serif flex text-white flex-col   text-[2rem] sm:text-[2.9rem] tracking-[-0.02em] leading-[.99] font-bold'>
									<span className=' '>{name}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
			<div className='w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8 ' />

			<div>{id}</div>

			<div className=' mb-24'>
				<div className='font-serif flex text-white flex-col mb-10 underline decoration-sky-500/30  -skew-y-3   text-[2rem] sm:text-[2.1rem] tracking-[-0.02em] leading-[.99] font-bold'>
					Stats
				</div>
				<div className='grid grid-cols-4'>
					<div>Material</div>
					<div>Comfort</div>
				
					<div>Wearability</div>
					<div>Cost Per Wear</div>
					
				</div>
			</div>

			<div className='font-serif flex text-white flex-col mb-10 underline decoration-sky-500/30  -skew-y-3   text-[2rem] sm:text-[2.1rem] tracking-[-0.02em] leading-[.99] font-bold'>
				Reviews
			</div>
			

			<div className='font-serif flex text-white flex-col mb-10 underline decoration-sky-500/30  -skew-y-3   text-[2rem] sm:text-[2.1rem] tracking-[-0.02em] leading-[.99] font-bold'>
				Sneaker Photos
			</div>
			<div className='grid grid-cols-2 md:grid-cols-3  gap-3 p-4 max-w-[800px] md:max-w-[1300px] place-items-center'>
				{/* <img src={main_image} /> */}

				{moreImages.map((item) => (
					<div className="  bg-white" key={item.id}>
						<img className="w-full" src={item?.image_link} />
					</div>
				))}
			</div>
		</>
	);
}
