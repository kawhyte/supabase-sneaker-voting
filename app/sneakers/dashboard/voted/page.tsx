"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import SneakerCard from "@/components/SneakerCard1";
import SectionHeader from "@/components/SectionHeader";
// import DeployButton from "@/components/Logo";
// import AuthButton from "@/components/AuthButton";
// import Link from "next/link";
// import { redirect } from "next/navigation";
// import addBlurredDataUrls from "@/lib/getLocalBase64";
import { UpdateData } from "@/lib/sneakerUtils";

export default function Voted() {
	const [sneakers, setSneakers] = useState<any[] | null>(null);
	// const [filteredsneakers, setFilteredSneakers] = useState<any[] | null>(null);

	const [sneakerCount, setSneakerCount] = useState<number | undefined>(
		undefined
	);

	const [orderBy, setOrderBy] = useState("created_at");
	const [fetchError, setFetchError] = useState(null);

	const supabase = createClient();

	const handleDataUpdate = UpdateData(setSneakers, setSneakerCount);

	useEffect(() => {
		const getData = async () => {
			const { data } = await supabase
				.from("sneakers")
				.select(`*, rating_id(*, vote(*)), images(*),brand_id(*)`)
				.filter(`rating_id.in_collection`, "eq", false)
				.neq(`rating_id.vote`, 3)

				.not("rating_id", "is", null)
				.order("created_at", { ascending: false });

			setSneakers(data);
			setSneakerCount(data?.length);
		};
		getData();
	}, []);

	return (
		<>
			<div className='animate-in flex-1 w-full flex flex-col gap-20 items-center  justify-center align-middle '>
				<SectionHeader
					name={"Potential Sneaker Purchases"}
					total={sneakerCount}
					sectiontext={"Sneaker Vote Count"}
				/>

				<div className='flex flex-col gap-10 mx-4 items-center '>
					<div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3  gap-x-6 gap-y-6'>
						{sneakers?.map((sneaker) => (
							<SneakerCard
								key={sneaker.id}
								sneaker={sneaker}
								//onVote={handleVote}
								refeshPage={handleDataUpdate}
								showElement={false}
								showtxt={false}
							/>
						))}
					</div>
				</div>
			</div>
		</>
	);
}
