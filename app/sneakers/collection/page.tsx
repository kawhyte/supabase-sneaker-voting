"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";

export default function Page() {
	const [sneakers, setSneakers] = useState<any[] | null>(null);

	const [collectionCount, setCollectionCount] = useState<number | undefined>(undefined);;

	const [orderBy, setOrderBy] = useState("created_at");
	const [fetchError, setFetchError] = useState(null);

	const supabase = createClient();

	// const handleDelete = (id:any) => {
	// 	setSneakers((prevSmoothies:any) => {
	// 		return prevSmoothies?.filter((sm:any) => sm.id !== id);
	// 	});
	// };
	// const handleVote = async () => {
	// 	const { data } =  await supabase.from("sneakers").select().order("name", { ascending: true })

	// 	setSneakers(data);
	// 	return sneakers
	// };

	useEffect(() => {
		const getData = async () => {
			const { data } = await supabase
				.from("sneakers")
				.select()
				.match({ in_collection: true })
				.order("created_at", { ascending: false });

			setSneakers(data);
			setCollectionCount(data?.length)
			console.log("Collection ",data);
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

			<div className='animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-7xl px-3'>
				<SectionHeader name={"Our Sneaker Collection"} total={collectionCount} sectiontext={"Collection Count"} />
				<div className='grid grid-cols-2 sm:grid-cols-4  grid-row-2 gap-y-10  gap-x-12 md:mt-10 justify-items-start'>
					{sneakers?.map((sneaker) => (
						<> 
						<div
							key={sneaker.id}
							className='flex flex-col '>
							<img
								src={
									sneaker.collection_image !== null
										? sneaker.collection_image ||sneaker.collection_image
										: "https://res.cloudinary.com/babyhulk/image/upload/a_vflip.180/co_rgb:e7e7e7,e_colorize:100/v1710621770/sneakers/baseball.png"
								}
								alt={`${sneaker.name + "sneaker"}`}
								className="mb-1 hover:scale-105 img-outline  transition duration-300 ease-in-out cursor-pointer"
							/>
							{/* <p className='text-[0.8rem] font-mono leading-[1.2] mt-1 mb-2'>{sneaker.brand}</p> */}
							
							
							<p className='text-[0.7rem] md:text-[0.8rem] font-mono leading-[1.2] mt-1 text-center line-clamp-2  '>
								{sneaker.name}

							</p>

							
						
							{/* <div className='border  w-full flex flex-col border-dotted bg-gray-800  px-2 py-1 text-[0.7rem] md:text-[0.8rem] font-mono leading-[1.2] mt-2  '>
							<p className="mb-1">Overall rating  </p>
							
							<p> {'5/10'}</p>

							</div>
							 */}
							
							
							{/* <div className='text-[0.7rem] md:text-[0.8rem] font-mono leading-[1.2] mt-1   grid grid-cols-2 gap-2 '>
								<p className="border border-dashed "> CPW:{sneaker.price/3}</p>
								<p className="border border-dashed "> item 2</p>
								<p className="border border-dashed ">item 3</p>
								<p className="border border-dashed ">item 4</p>
								

							</div> */}
							
						</div>

						{/* <div className="flex flex-col gap-x-7 justify-center"> 
						<p>CPW:</p>
						<p>CPW:</p>
						<p>CPW:</p>
						</div> */}
						</>
					))}
				</div>
			</div>
		</>
	);
}
