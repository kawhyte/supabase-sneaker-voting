import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import Link from "next/link";
import CollectionCard from "@/components/CollectionCard";
import SectionHeader from "@/components/SectionHeader";

export default async function Index() {
	const supabase = createClient();

	const { data: sneakers } = await supabase
		.from("sneakers")
		.select("id, collection_image, name")
		.match({ in_collection: true })
		.order("created_at", { ascending: true })
		.limit(40);

	return (
		<div className='animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-7xl px-3'>
	<SectionHeader
					name={"Sneaker Owned"}
					total={-1}
					sectiontext={"Sneaker Vote Count"}
				/>
		<div className='container mx-auto flex flex-col gap-9 items-center '>
			<div className='grid grid-cols-2  mb-20   sm:grid-cols-3 lg:grid-cols-5  sm:grid-row-2 gap-y-5  gap-x-6'>

				<CollectionCard  sneakers={sneakers} showtxt={true} />
				</div>
			
		</div>
		</div>
	);
}
