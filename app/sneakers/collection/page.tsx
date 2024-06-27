import { createClient } from "@/utils/supabase/server";
import CollectionCard from "@/components/CollectionCard";
import SectionHeader from "@/components/SectionHeader";

export default async function Index() {
	const supabase = createClient();

	const { data: sneakers } = await supabase
		.from("sneakers")
		.select(
			`*, rating_id!inner(*, in_collection, vote(*), stats(*)), images(*),brand_id(*)`
		)
		.eq(`rating_id.in_collection`, true)
		.order("purchase_date", { ascending: false });


		const { data: users, error } = await supabase.from("user").select("role").single();



	return (
		<div className='animate-in flex-1 w-full flex flex-col gap-20 items-center  justify-center align-middle '>
			<SectionHeader
				name={"Our Sneaker Collection"}
				total={sneakers?.length}
				sectiontext={"Sneaker Vote Count"}
			/>

			<div className='flex flex-col gap-10 mx-4 items-center '>
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-x-4 gap-y-5'>
					{sneakers?.map((sneaker) => (
						<CollectionCard sneaker={sneaker} showtxt={true} role={users?.role} />
					))}
				</div>
			</div>
		</div>
	);
}
