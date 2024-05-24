"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import SectionHeader from "@/components/SectionHeader";
import CollectionDetailPage from "@/components/CollectionDetailPage";

export default function SneakerDetail({ params }: { params: any }) {
	const id = params.id;

	const [name, setName] = useState("");
	const [date, setDate] = useState("");
	const [brand, setBrand] = useState("1");
	const [price, setPrice] = useState("");
	const [purchasePrice, setPurchasePrice] = useState("");
	const [style, setStyle] = useState("");
	const [moreImages, setmoreImages] = useState<any[]>([]);
	const [formError, setFormError] = useState("");
	const [main_image, setImage] = useState("");
	const [collectionImage, setCollectionImage] = useState("");
	const [stats, setStats] = useState<any>({});
	const supabase = createClient();

	useEffect(() => {
		const fetchSmoothie = async () => {
			const { data, error } = await supabase
				.from("sneakers")
				.select(
					`*, rating_id!inner(*, in_collection, vote(*), stats(*)), images(*),brand_id(*)`
				)
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
				setPurchasePrice(data.purchase_price);
				setStyle(data.style);
				setmoreImages(data.images);
				setCollectionImage(data.collection_image);
				setStats(data.rating_id.stats);
				//console.log("MT DATA",stats);
				//console.log("STATs", data.rating_id.stats);
			}
		};
		fetchSmoothie();

		// return () => {
		//   second
		// }
	}, [id]);

	return (
		<>
			- {id}
			<div className='flex-1 w-full flex flex-col gap-20 items-center  justify-center align-middle'>
				<CollectionDetailPage
					name={name}
					date={date}
					brand={brand}
					price={price}
					purchasePrice={purchasePrice}
					style={style}
					moreImages={moreImages}
					collectionImage={collectionImage}
					stats={stats}
				/>
			</div>
		</>
	);
}
