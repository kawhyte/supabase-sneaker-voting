import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import Link from "next/link";
import CollectionCard from "@/components/CollectionCard";
import SectionHeader from "@/components/SectionHeader";

export default async function Index() {
	const supabase = createClient();

	const { data: sneakers } = await supabase
		.from("sneakers")
		.select(`*, rating_id!inner(*, in_collection, vote(*), stats(*)), images(*),brand_id(*)`)
		.eq(`rating_id.in_collection`, true )
		.order("created_at", { ascending: true });
	//.limit(40);
	//  console.log("HeyCoubt1", sneakers?.length);
	return (
		<div className='animate-in flex-1 w-full flex flex-col gap-20 items-center  justify-center align-middle '>
			<div>{sneakers?.length}</div>
			
			<SectionHeader
				name={"Our Sneaker Collection"}
				total={-1}
				sectiontext={"Sneaker Vote Count"}
			/>
			<div className="mx-6"> 
				<div className='grid grid-cols-1   sm:grid-cols-2 lg:grid-cols-3  sm:grid-row-2 gap-y-5  gap-x-6 place-items-center'>
					<CollectionCard sneakers={sneakers} showtxt={true} />
				</div>
			</div>
		</div>
	);
}
