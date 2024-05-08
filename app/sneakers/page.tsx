"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import DeployButton from "@/components/Logo";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";

export default function Page() {
	const [sneakers, setSneakers] = useState<any[] | null>(null);
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
			<div className='animate-in flex-1 flex flex-col opacity-0 max-w-8xl px-3'>
				<SectionHeader name={"Dashboard"} total={0} sectiontext={""} />

				<div className=' grid grid-cols-4 '>

<Link href={'/sneakers/pending'}> Pending Votes</Link>
<Link href={'/sneakers/recent'}> Recent Votes</Link>
<Link href={'/sneakers/collection'}> Collection</Link>
<Link href={'/'}> Quiz</Link>

				</div>
			</div>
		</>
	);
}
