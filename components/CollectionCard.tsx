import Link from "next/link";
import Image from "next/image";
//import getBase64 from "@/lib/getLocalBase64";
import addBlurredDataUrls from "@/lib/getLocalBase64";

export default async function CollectionCard({ sneakers, showtxt }: { sneakers: any, showtxt:boolean }) {

	//console.log("sneakers from HERO function",sneakers)
	//console.log("myBlurDataUrl - sneakers from function",sneakers.collection_image)



	const sneakersWithBlurDataUrl = await addBlurredDataUrls(sneakers);

	//console.log("NEW myBlurDataUrl ####", sneakersWithBlurDataUrl);

	return (
		<>
			{/* <div className='flex gap-8 justify-center items-center'>
				<a
					href='https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs'
					target='_blank'
					rel='noreferrer'>
					<SupabaseLogo />
				</a>
				<span className='border-l rotate-45 h-6' />
				<a href='https://nextjs.org/' target='_blank' rel='noreferrer'>
					<NextLogo />
				</a>
			</div> */}
			{/* <h1 className='sr-only'>Supabase and Next.js Starter Template</h1> */}

			{/* <div className='text-2xl lg:text-3xl !leading-tight mx-auto max-w-4xl text-center mb-10 '>
				<div className='font-serif flex flex-col -skew-y-3 drop-shadow-xl  text-[4.25rem] sm:text-[8rem] tracking-[-0.03em] leading-[0.88] font-bold'>
					<span className='underline decoration-sky-500/30   '>MTW's</span>
					<span className=''> Ultimate Sneaker</span>
					<span className=''>Collection</span>
				</div>
			</div>

			<div className='w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8' /> */}

				{sneakersWithBlurDataUrl.map((sneaker: any) => (
					<div className='flex flex-col justify-start align-middle items-start '>
						<div>
						<Image
							width={300}
							height={200}
							src={sneaker?.collection_image}
							alt={sneaker?.name}
							blurDataURL={sneaker?.blurredDataUrl !== undefined ? sneaker?.blurredDataUrl : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg=='}
							placeholder='blur'
							
						/></div>
						{showtxt && <p className=' line-clamp-2 text-[0.79rem] mt-2 leading-[1.2] text-start  '>
							{sneaker.name}
						</p>}
					</div>
				))}
			

			{/* <div className=' grid justify-items-center mt-8'>
				<Link href={"/sneakers/collection"}>
					<button
						type='button'
						className=' hover:bg-yellow-500/80 border-2 items-center transition ease-in duration-200 py-2 px-3 rounded-full opacity translate-y-[10px] group font-mono uppercase leading-[1.2] text-xs md:text-sm'>
						View full Sneaker collection
					</button>
				</Link>
			</div> */}
		</>
	);
}
