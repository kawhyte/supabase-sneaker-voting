"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import DeployButton from "@/components/Logo";
import AuthButton from "@/components/AuthButton";
import Image from "next/image";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import DashboardDataCard from "@/components/DashboardDataCard";

export default function Page() {
	const [sneakers, setSneakers] = useState<any[] | null>(null);
	const [collection, setCollection] = useState<any[] | null>(null);
	const [sneakersVoted, setSneakersVoted] = useState<any[] | null>(null);
	const [pendingSneakerVote, setPendingSneakerVote] = useState<any[] | null>(
		null
	);
	const [sneakersPendingVote, setSneakersPendingVote] = useState<
		any[] | undefined
	>(undefined);
	const [sneakersDrip, setSneakersDrip] = useState<any[] | undefined>(
		undefined
	);
	const [sneakersSkip, setSneakersSkip] = useState<any[] | undefined>(
		undefined
	);
	const [orderBy, setOrderBy] = useState("created_at");
	const [fetchError, setFetchError] = useState(null);

	const supabase = createClient();

	const handleDelete = (id: any) => {
		setSneakers((prevSmoothies: any) => {
			return prevSmoothies?.filter((sm: any) => sm.id !== id);
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
			const { data } = await supabase
				.from("sneakers")
				.select()
				.match({ in_collection: false })
				.order("name", { ascending: true });
			setSneakers(data);

			const { data: collectionSneakers } = await supabase
				.from("sneakers")
				.select(
					`*, rating_id!inner(*, in_collection, vote(*), stats(*)), images(*),brand_id(*)`
				)
				.eq(`rating_id.in_collection`, true)
				.order("created_at", { ascending: false });

			const { data: pendingSneakerVote } = await supabase
				.from("sneakers")
				.select(`*, rating_id(*), images(*),brand_id(*)`)

				//.match({ in_collection: false })
				.is("rating_id", null);

			const { data: sneakersVoted } = await supabase
				.from("sneakers")
				.select(`*, rating_id(*, vote(*)), images(*),brand_id(*)`)
				.filter(`rating_id.in_collection`, "eq", false)

				.not("rating_id", "is", null)
				.order("created_at", { ascending: false });

			setPendingSneakerVote(pendingSneakerVote);
			setSneakersVoted(sneakersVoted);
			setCollection(collectionSneakers);

			console.log("collectionSneakers", collectionSneakers);

			setSneakersPendingVote(data?.filter((test) => test?.vote === null));
			setSneakersDrip(data?.filter((test) => test?.vote === "Drip"));
			setSneakersSkip(data?.filter((test) => test?.vote === "Skip"));
			// console.log(
			// 	"Sneakers Ken",
			// 	data?.filter((test) => test.vote === null)
			// );
		};
		getData();
	}, []);

	return (
		<>
		
			<div className='animate-in flex-1 flex flex-col opacity-0 max-w-8xl px-3 font-mono'>
				<SectionHeader name={"Dashboard"} sectiontext={""} total={undefined} />
				<div className='grid grid-cols-3 mx-auto container mt-10 xl:grid-cols-3 gap-6'>
					
					
					<DashboardDataCard cardTitle={"Collection Count"} cardDescription={"Total amount of sneakers in our collection."} cardContent={collection}/>
					<DashboardDataCard cardTitle={"Pending Vote"} cardDescription={"Total amount of sneakers waiting for a vote."} cardContent={pendingSneakerVote}/>
					<DashboardDataCard cardTitle={"Vote Counts"} cardDescription={"Total amount of sneakers votes."} cardContent={sneakersVoted}/>
					
					
			
				</div>

				<div className='grid grid-cols-4 gap-6 mt-8'>
					<Card className='col-start-1 col-span-2 '>
						<CardHeader>
							<CardTitle>Latest Sneaker pickups</CardTitle>
							<CardDescription>
							Last 6 Sneakers added to collection
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-2 gap-y-4 gap-x-4 max-w-xl'>
								{collection?.slice(0, 6).map((item) => (
									<div key={item.id}>
								
										<Image
											src={item.collection_image}
											width={0}
											height={0}
											style={{width:'120px', height: "auto" }}
											alt='sneaker'
										/>

										<p className='text-[0.63rem] line-clamp-1  w-52 '>{item.name}</p>
										<p className='text-[0.6rem] line-clamp-1  w-52 '>{item.created_at}</p>
										
										
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<div className='col-start-3 col-span-2'>
						<div className='grid grid-col-2'>
							<Card className=' '>
								<CardHeader>
									<CardTitle>Most worn sneakers</CardTitle>
									<CardDescription>
										Deploy your new project in one-click.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<form>
										<div className='grid w-full items-center gap-4'></div>
									</form>
								</CardContent>
							</Card>
							<Card className='col-start-3 col-span-2 '>
								<CardHeader>
									<CardTitle>Sneakers you need to wear </CardTitle>
									<CardDescription>
										Deploy your new project in one-click.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<form>
										<div className='grid w-full items-center gap-4'></div>
									</form>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
				<div className=' grid grid-cols-4 '>
					<Link href={"/sneakers/pending"}> Pending Votes</Link>
					<Link href={"/sneakers/recent"}> Recent Votes</Link>
					<Link href={"/sneakers/collection"}> Collection</Link>
					<Link href={"/"}> Quiz</Link>
				</div>
			</div>
		</>
	);
}
