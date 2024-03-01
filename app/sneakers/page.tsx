"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import SmoothieCard from "../../components/SmoothieCard";

export default function Page() {
	const [sneakers, setSneakers] = useState<any[] | null>(null);
	const [orderBy, setOrderBy] = useState("created_at");
	const [fetchError, setFetchError] = useState(null);

	const supabase = createClient();

	// const handleDelete = (id) => {
	// 	setSneakers((prevSmoothies) => {
	// 		return prevSmoothies?.filter((sm) => sm.id !== id);
	// 	});
	// };

	useEffect(() => {
		const getData = async () => {
			const { data } = await supabase.from("sneakers").select();
			setSneakers(data);
		};
		getData();
	}, []);

	return (
		<div>
			{/* <pre>{JSON.stringify(sneakers, null, 2)}</pre> */}
			<div className='containner mx-auto'>
				<div className='grid grid-cols-3  gap-10'>
					{sneakers?.map((sneaker) => (
						<SmoothieCard key={sneaker.id} smoothie={sneaker} />
					))}
				</div>
			</div>
		</div>
	);
}
