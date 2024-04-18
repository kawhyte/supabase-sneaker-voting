import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import Link from "next/link";
import CollectionCard from "@/components/CollectionCard";

export default async function Index() {
	const supabase = createClient();

	const { data: sneakers } = await supabase
		.from("sneakers")
		.select("id, collection_image, name")
		.match({ in_collection: true })
		.order("created_at", { ascending: true })
		.limit(40);

	return (
		<div className='flex-1 w-full flex flex-col gap-20 items-center  justify-center align-middle'>
			<div className='animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3'>
			<div className='grid grid-cols-3    sm:grid-cols-2 md:grid-cols-4  sm:grid-row-2 gap-y-10  gap-x-10'>

				<CollectionCard  sneakers={sneakers} showtxt={true} />
				</div>
			</div>
		</div>
	);
}
