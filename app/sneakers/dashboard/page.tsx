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

import { Award, Clock, Heart, ArchiveX } from "lucide-react";
import DashboardDataCard, { CardProps } from "@/components/DashboardDataCard";
import DashboardImageDataCard from "@/components/DashboardImageDataCard";
import CollectionCard from "@/components/CollectionCard";
import { cn } from "@/lib/utils";
import SideNavBar from "@/components/SideNavBar";
import BarGraph from "@/components/BarGraph";

export default function Page() {
	const [sneakers, setSneakers] = useState<any[] | null>(null);
	const [count, setCount] = useState(0);
	const [collection, setCollection] = useState<any[] | null>(null);
	const [sneakersVoted, setSneakersVoted] = useState<any[] | null>(null);
	const [potentialSneakers, setPotentialSneakers] = useState<any[] | null>(
		null
	);
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
				.order("purchase_date", { ascending: false });

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

			const { data: potentialSneakers } = await supabase
				.from("sneakers")
				.select(`*, rating_id(*, vote(*)), images(*),brand_id(*)`)
				.filter(`rating_id.in_collection`, "eq", false)
				.neq(`rating_id.vote`, 3)

				.not("rating_id", "is", null)
				.order("created_at", { ascending: false });

			setPendingSneakerVote(pendingSneakerVote);
			setSneakersVoted(sneakersVoted);
			setCollection(collectionSneakers);
			setPotentialSneakers(potentialSneakers);

			//console.log("collection", collectionSneakers);

			setSneakersPendingVote(data?.filter((test) => test?.vote === null));
			setSneakersDrip(data?.filter((test) => test?.vote === "Drip"));
			setSneakersSkip(data?.filter((test) => test?.vote === "Skip"));
			// console.log(
			// 	"Sneakers Ken",
			// 	data?.filter((test) => test.vote === null)
			// );

			//console.log("Collection ", collectionSneakers[0])

			let count = collectionSneakers?.reduce(function (value, value2) {
				return (
					value[value2.brand_id.name]
						? ++value[value2.brand_id.name]
						: (value[value2.brand_id.name] = 1),
					value
				);
			}, {});

			setCount(count);

			//console.log("COunt ", count);
		};
		getData();
	}, []);

	const CardData: CardProps[] = [
		{
			title: "Sneakers Collection Count",
			icon: Award,
			amount: collection?.length,
			description: "sneakers in collection",
		},
		{
			title: "Sneakers Awaiting Vote",
			icon: Clock,
			amount: pendingSneakerVote?.length,
			description: "sneakers waiting for a vote",
		},
		{
			title: "Potential Sneaker Purchases",
			icon: Heart,
			amount: potentialSneakers?.length,
			description: "sneakers I want to purchase",
		},
		{
			title: "Sneakers I didnt like",
			icon: ArchiveX,
			amount: pendingSneakerVote?.length,
			description: "sneakers did not fit my style right now",
		},
	];

	return (
		<div className='animate-in flex-1 w-full flex flex-col gap-x-20 items-center  justify-center align-middle '>
			<SectionHeader
				name={"Sneaker Overview"}
				sectiontext={""}
				total={undefined}
			/>
			<div className='p-8 flex flex-col justify-between gap-8 '>
				<section className='grid w-full  grid-cols-1 gap-4 gap-x-8 transition-all sm:grid-cols-2   mt-10 xl:grid-cols-4 '>
					{CardData.map((card, i) => (
						<DashboardDataCard
							key={i}
							title={card.title}
							icon={card.icon}
							amount={card.amount}
							description={card.description}
						/>
					))}
				</section>

				

				<section className='grid grid-cols-1 gap-4 transition-all lg:grid-cols-2   w-full '>
					<Card>
						<CardHeader>
							<h1 className='text-sm font-semibold  font-mono'>
								Sneakers Collection Brand Count{" "}
							</h1>
						</CardHeader>

						<CardContent>
							<BarGraph count={count} />
						</CardContent>
					</Card>

					<DashboardImageDataCard
						title={"Latest Sneaker pickups"}
						icon={ArchiveX}
						description={"Last 6 Sneakers added to collection"}
						images={collection}
					
					/>
					{/* <DashboardImageDataCard
						cardTitle={"Most worn sneakers"}
						cardDescription={"Most worn sneakers collection"}
						cardContent={collection}
					/>
					<DashboardImageDataCard
						cardTitle={"Sneakers you need to wear"}
						cardDescription={"Sneakers you need to wear"}
						cardContent={collection}
					/> */}
				</section>
			</div>
		</div>
	);
}
