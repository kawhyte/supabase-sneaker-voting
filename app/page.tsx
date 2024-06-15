import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import Link from "next/link";
import Image from "next/image";
import CollectionCard from "@/components/CollectionCard";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default async function Index() {
	const supabase = createClient();

	const { data: sneakers } = await supabase
		.from("sneakers")
		.select(`name,collection_image,id, rating_id!inner(in_collection)`)
		.filter(`rating_id.in_collection`, "eq", true)
		.order("created_at", { ascending: true })
		.limit(4);
	// console.log("HeyCoubt1", sneakers?.length);
	// console.log("Data", sneakers);

	return (
		<div className=''>
			<div className='animate-in flex-1 flex flex-col gap-x-20 opacity-0 max-w-4xl px-3'>
				<div className='text-2xl lg:text-3xl !leading-tight mx-auto max-w-4xl text-center md:mt-20 '>
					<div className='font-serif flex flex-col -skew-y-3 drop-shadow-xl  text-[4.50rem] sm:text-[8rem] tracking-[-0.03em] leading-[0.88] font-bold'>
						<span className='underline decoration-sky-500/30   '>MTW's</span>
						<span className=''>Sneaker</span>
						<span className=''>Collection</span>
					</div>
				</div>

				<div className=' w-[390px] md:w-[850px] z-30 ml-1 -mt-16   md:-mt-32 md:mr-20'>
					<AspectRatio ratio={16 / 9}>
						<Image
							className='rounded-md object-cover'
							blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAYAAAC09K7GAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAO0lEQVR4nGNgYGBg+P//P1t9fT0TiM0we3ZjxZxZjQ9XLpwwe9nCHkOGGZOyanraY9aumN2wbsn0hmQA/MEWfj4ocjcAAAAASUVORK5CYII='
							placeholder='blur'
							quality={60}
							fill
							src='https://images.soleretriever.com/sb/product-images/2277/21b5830f-5553-4663-928b-8061eb7d5b2c.png?width=1200&quality=70&resize=contain'
							alt='sneaker'
						/>
					</AspectRatio>
				</div>

				{/* <div className='w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent' /> */}

				{/* <div className='grid grid-cols-4  grid-rows-2 sm:grid-cols-4  sm:grid-row-2 gap-6'>
					<CollectionCard sneakers={sneakers} showtxt={false} />
				</div> */}
			</div>

			{/* <div className=' grid justify-items-center mt-8'>
				<Link href={"/sneakers/collection"}>
					<button
						type='button'
						className=' hover:bg-yellow-500/80 border-2 items-center transition ease-in duration-200 py-2 px-3 rounded-full opacity translate-y-[10px] group font-mono uppercase leading-[1.2] text-xs md:text-sm'>
						View full Sneaker collection
					</button>
				</Link>
			</div> */}
		</div>
	);
}
