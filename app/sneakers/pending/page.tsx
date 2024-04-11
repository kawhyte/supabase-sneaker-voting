"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import SneakerCardUi from "@/components/SneakerCardUI";
import SectionHeader from "@/components/SectionHeader";
import SneakerCard from "@/components/SneakerCard";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";


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

				//return redirect("/login");
			  } else{

				setSupabaseUser(user)
			  }


			
			const { data } = await supabase
				.from("sneakers")
				.select(`*, rating_id(*), images(*),brand_id(*)`)

				.match({ in_collection: false })
				.is("rating_id", null)
				.order("created_at", { ascending: false });

			setSneakers(data);

			setSneakersPending(data?.length);
		};
		getData();
	}, []);

	return supabaseUser ? (
		<>
			{/* <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <DeployButton />
    
        </div>
		
      </nav> */}
			<div className='animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-7xl px-3'>
				<SectionHeader
					name={"Sneaker Voting_____"}
					total={sneakersPending}
					sectiontext={"Sneakers Pending Vote:"}
				/>
			

				<div className='container mx-auto flex flex-col gap-9 items-center '>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-x-5 gap-y-6'>
						{sneakers?.map((sneaker) => (
							<div key={sneaker.id}>
								<SneakerCard
									key={sneaker.id}
									sneaker={sneaker}
									onVote={handleVote}
									onDelete={handleDelete}
									showElement={false}
								/>
								{/* <SneakerCardUi 	sneaker={sneaker}/> */}
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	): (
		<>
		  
		</>
	  );;
}
