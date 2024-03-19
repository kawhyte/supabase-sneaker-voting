"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SneakerDetail({ params }: { params: any }) {
	const id = params.id;

	const [name, setName] = useState("");
	const [date, setDate] = useState("");
	const [brand, setBrand] = useState("Nike");
	const [price, setPrice] = useState("");
	const [style, setStyle] = useState("");
	const [moreImages, setmoreImages] = useState<any[]>([]);
	const [formError, setFormError] = useState("");
	const [main_image, setImage] = useState("");
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
				console.log("DETAIL", data);
				setName(data.name);
				setImage(data.main_image);
				//setBrand(data.brand);
				setBrand(data.brand_id.name);
				setDate(data.release_date);
				setPrice(data.price);
				setStyle(data.style);
				setmoreImages(data.images)

				console.log(data);
			}
		};
		fetchSmoothie();


		// return () => {
		//   second
		// }
	}, [id]);

	return (
		<>
			<div>{id}</div>

			<div>{name}</div>
		
<div>{brand}</div>
	
			<div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 max-w-[800px] md:max-w-[1300px] place-items-center">
   

   
   {moreImages.map(item=>(


	   <img src={item?.image_link} />

   ))}
   
</div>

			
		</>
	);
}
