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
import DashboardImageDataCard from "@/components/DashboardImageDataCard";
import CollectionCard from "@/components/CollectionCard";

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

			console.log("collection", collectionSneakers);

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
			<div className='animate-in flex-1 w-full flex flex-col gap-20 items-center  justify-center align-middle '>
				<SectionHeader name={"Dashboard"} sectiontext={""} total={undefined} />
				<div className='grid grid-cols-3 mx-auto container mt-10 xl:grid-cols-3 gap-6'>
					<DashboardDataCard
						cardTitle={"Collection Count"}
						cardDescription={"Total amount of sneakers in our collection."}
						cardContent={collection}
					/>
					<DashboardDataCard
						cardTitle={"Pending Vote"}
						cardDescription={"Total amount of sneakers waiting for a vote."}
						cardContent={pendingSneakerVote}
					/>
					<DashboardDataCard
						cardTitle={"Vote Counts"}
						cardDescription={`Total amount of sneakers votes.`}
						cardContent={sneakersVoted}
					/>
				</div>

				<div className='grid grid-cols-3 gap-2 mt-8'>
					<DashboardImageDataCard
						cardTitle={"Latest Sneaker pickups"}
						cardDescription={"Last 4 Sneakers added to collection"}
						cardContent={collection}
					/>
					<DashboardImageDataCard
						cardTitle={"Most worn sneakers"}
						cardDescription={"Most worn sneakers collection"}
						cardContent={collection}
					/>
					<DashboardImageDataCard
						cardTitle={"Sneakers you need to wear"}
						cardDescription={"Sneakers you need to wear"}
						cardContent={collection}
					/>
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
