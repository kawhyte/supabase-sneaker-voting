
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import Link from "next/link";
import Hero from "@/components/Hero";

export default async function Index() {

	const supabase = createClient();

	const { data: sneakers } = await supabase
		.from("sneakers")
		.select("id, collection_image, name")
		.match({ in_collection: true })
		.order("created_at", { ascending: true })
		.limit(6);

	return (
		<div className='flex-1 w-full flex flex-col gap-20 items-center  justify-center align-middle'>
			<div className='animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3'>
				<Hero sneakers={sneakers} />
			</div>

		</div>
	);
}
