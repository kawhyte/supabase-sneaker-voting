import Link from "next/link";
import Image from "next/image";
//import getBase64 from "@/lib/getLocalBase64";
import addBlurredDataUrls from "@/lib/getLocalBase64";

export default async function CollectionCard({
	sneakers,
	showtxt,
}: {
	sneakers: any;
	showtxt: boolean;
}) {
	 console.log("sneakers from HERO function1",sneakers)
	//console.log("myBlurDataUrl - sneakers from function",sneakers.collection_image)

	//const sneakersWithBlurDataUrl = await addBlurredDataUrls(sneakers);
	let blurDataURL = "";
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

			{sneakers?.map((sneaker: any) => (
				<div
					key={sneaker.id}
					className={`flex flex-col relative justify-center align-middle items-start ${
						showtxt ? "bg-gray-800 px-1 py-2 md:px-2 md:py-4 w-full" : ""
					} `}>
					{showtxt && (
						<div className=' flex flex-col  items-center  mx-3 my-3 text-end rounded-xl bg-indigo-900 p-1 absolute top-0 right-0'>
							<div className='px-1 '>
								<span className='md:text-[1.5rem] leading-[1.2] text-start'>
									8.8
								</span>
								<span className='text-[0.68rem]'>/10</span>
							</div>

							<p className='text-[0.6rem] md:text-[0.67rem] leading-[1.2] text-start '>
								Our Score
							</p>
						</div>
					)}
					<div>
						<Image
							width={250}
							height={150}
							src={sneaker?.collection_image?sneaker?.collection_image:"https://res.cloudinary.com/babyhulk/image/upload/a_vflip.180/co_rgb:e7e7e7,e_colorize:100/v1710621770/sneakers/baseball.png" }
							alt={sneaker?.name}
							className='w-48 mt-6 md:mt-0 md:w-80'
							// blurDataURL={
							// 	sneaker?.blurredDataUrl !== undefined ||
							// 	sneaker?.blurredDataUrl !== null
							// 		? sneaker?.blurredDataUrl
							// 		: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg=="
							// }
							blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAYAAAC09K7GAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAO0lEQVR4nGNgYGBg+P//P1t9fT0TiM0we3ZjxZxZjQ9XLpwwe9nCHkOGGZOyanraY9aumN2wbsn0hmQA/MEWfj4ocjcAAAAASUVORK5CYII='
							placeholder='blur'
							quality={30}
						/>
					</div>
					<p className=' line-clamp-2 text-[0.7rem] md:text-[0.9rem] mt-2 leading-[1.2] text-start mx-2  md:mx-5 '>
						{sneaker?.name}
					</p>

					{showtxt && (
						<div className='md:mt-5 mt-3 mb-1 mx-auto'>
							<Link href={`/sneakers/detail/${sneaker.id}`}>
							<button className='bg-white text-xs md:text-sm hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow'>
								View Statistics - {sneaker.id}
							</button>
							</Link>
						</div>
						// <div className=' flex flex-col  justify-end  items-center  mx-2 my-2 text-end rounded-xl bg-indigo-900 p-1  '>
						// 	<button>Test</button>
						// 	<div className="px-1 ">
						// 	<span className="text-[1.5rem] leading-[1.2] text-start">8.8</span>
						// 	<span className="text-[0.68rem]">/10</span>
						// 	</div>

						// 	<p className='text-[0.67rem] leading-[1.2] text-start '>
						// 		Our Score
						// 	</p>
						// </div>
					)}
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
