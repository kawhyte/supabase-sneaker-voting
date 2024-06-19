"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import SneakerCard from "@/components/SneakerCard1";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import Loading from "@/components/Loading";

export default function PendingVote() {
	const [sneakers, setSneakers] = useState<any[] | null>(null);
	const [sneakersPending, setSneakersPending] = useState<number | undefined>(
		undefined
	);

	const [orderBy, setOrderBy] = useState("created_at");
	const [fetchError, setFetchError] = useState(null);
	const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
	const router = useRouter();
	const supabase = createClient();

	const handleDelete = (id: any) => {
		setSneakers((prevSmoothies: any) => {
			const updatedSneakers = prevSmoothies?.filter((sm: any) => sm.id !== id);
			setSneakersPending(updatedSneakers?.length);

			return updatedSneakers;
		});
	};
	const handleVote = async () => {
		const { data } = await supabase
			.from("sneakers")
			.select()
			.order("name", { ascending: true });

		return sneakers;
	};

	useEffect(() => {
		const getData = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				router.push("/login");
			} else {
				setSupabaseUser(user);
			}

			const { data } = await supabase
				.from("sneakers")
				.select(`*, rating_id(*), images(*),brand_id(*)`)

				.is("rating_id", null)

				.order("created_at", { ascending: false });

			setSneakers(data);

			setSneakersPending(data?.length);
		};
		getData();
	}, []);

	return supabaseUser ? (
		<>
		
			<div className='animate-in flex-1 w-full flex flex-col gap-y-20 items-center  justify-center align-middle '>
				<SectionHeader
					name={"Sneakers Awaiting Vote"}
					total={ sneakersPending}
					sectiontext={"Pending Vote count:"}
				/>

			{/* <Loading />	 */}
					{sneakers === null ? <Loading /> : <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 px-8  gap-x-8 gap-y-8'>
						{sneakers?.map((sneaker) => (
							<div key={sneaker.id}>
								<SneakerCard
									key={sneaker.id}
									sneaker={sneaker} showtxt={false} //onVote={handleVote}
									onDelete={handleDelete}									//onDelete={handleDelete}
									showElement={true}
								/>
							</div>
						))}
					</div>}
			
			</div>
		</>
	) : (
		<></>
	);
}
