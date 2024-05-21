"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import DeployButton from "@/components/Logo";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function Page() {
	const [sneakers, setSneakers] = useState<any[] | null>(null);
	const [collection, setCollection] = useState<any[] | null>(null);
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
				.order("created_at", { ascending: true });

			const { data: pendingSneakerVote } = await supabase
				.from("sneakers")
				.select(`*, rating_id(*), images(*),brand_id(*)`)

				//.match({ in_collection: false })
				.is("rating_id", null);

			setPendingSneakerVote(pendingSneakerVote);
			setCollection(collectionSneakers);

			console.log("pendingSneakerVote", pendingSneakerVote);

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
			{/* <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <DeployButton />
    
        </div>
		
      </nav> */}
			<div className='animate-in flex-1 flex flex-col opacity-0 max-w-8xl px-3 font-mono'>
				<SectionHeader name={"Dashboard"} sectiontext={""} total={undefined} />
				<div className='grid grid-cols-3 mx-auto container mt-10 xl:grid-cols-3 gap-6'>
					<Card className=''>
						<CardHeader>
							<CardTitle className='text-xl'>Sneakers in Collection</CardTitle>
							<CardDescription className='text-base text-gray-400 '>
								Total amount of sneakers in our collection.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Link href={"/sneakers/collection"}>
								<h1 className='text-blue-200 font-mono w-24 text-[4rem]'>
									{collection?.length}
								</h1>
							</Link>
						</CardContent>
					</Card>
					<Card className=''>
						<CardHeader>
							<CardTitle>Pending Vote</CardTitle>
							<CardDescription>
								Total amount of sneakers waiting for a vote.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Link href={"/sneakers/pending"}>
								<h1 className=' text-green-200 font-mono w-24 text-[4rem]'>
									{pendingSneakerVote?.length}
								</h1>
							</Link>
						</CardContent>
					</Card>
					<Card className=''>
						<CardHeader>
							<CardTitle>Vote Counts</CardTitle>
							<CardDescription>Total amount of sneakers votes.</CardDescription>
						</CardHeader>
						<CardContent>
							<div className=' '>
								<h1 className=' font-mono text-[3rem]'>0</h1>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className='grid grid-cols-4 gap-6 mt-8'>
					<Card className='col-start-1 col-span-2 '>
						<CardHeader>
							<CardTitle>Sneakers by Brand</CardTitle>
							<CardDescription>
								Deploy your new project in one-click.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<canvas id='pieChart'></canvas>
							<form>
								<div className='grid w-full items-center gap-4'></div>
							</form>
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
