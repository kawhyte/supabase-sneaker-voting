"use client";

import { createClient } from "@/utils/supabase/client";
import CreateForm from "@/components/CreateForm";
import SectionHeader from "@/components/SectionHeader";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sneaker } from "@/app/types/Sneaker";

const Edit = ({ params }: { params: any }) => {
	const id = params.id;

	//console.log("IDDDD",id)

	const [name, setName] = useState("");
	const [data, setData] = useState<Sneaker | undefined>(undefined);
	const [vote, setVote] = useState("");
	const [date, setDate] = useState("");
	const [brand, setBrand] = useState("1");
	const [price, setPrice] = useState("");
	const [style, setStyle] = useState("");
	const [main_image, setImage] = useState("");
	const supabase = createClient();
	const router = useRouter();

	useEffect(() => {
		const fetchSneakers = async () => {
			const { data, error } = await supabase
				.from("sneakers")
				.select(`*, rating_id(*, vote(*)), images(*),brand_id(*)`)
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

				//data.images.map((a: { sneaker_id: { toString: () => any; }; }) => (a.sneaker_id.toString() ));
				//data.images.forEach(v => v.sneaker.id += '');
				setData(data);

				//console.log("data.images ",data.images)

				// const { data: rating, error } = await supabase
				// 	.from("rating")
				// 	.select(`*, vote(*)`)
				// 	.eq("id", data.rating_id)
				// 	.single();

				// setVote(rating.vote.vote_id);
			}
		};
		fetchSneakers();
	}, [id, router]);

	//console.log("DATA2 ",data)

	return (
		<div className='max-w-3xl mx-auto p-10'>
			<h2 className='scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0'>
				{`Editing ${name}`}
			</h2>

			<CreateForm
				sneaker={data}
				main={data?.main_image}
				id={id}
				all_images={data?.images}
			/>
		</div>
	);
};

export default Edit;
