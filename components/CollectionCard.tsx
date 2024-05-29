import Link from "next/link";
import Image from "next/image";
//import getBase64 from "@/lib/getLocalBase64";
import addBlurredDataUrls from "@/lib/getLocalBase64";
import costPerWear from "@/lib/calculation";

export default async function CollectionCard({
	sneakers,
	showtxt,
}: {
	sneakers: any;
	showtxt: boolean;
}) {
	//console.log("sneakers from HERO function1", sneakers);
	//console.log("myBlurDataUrl - sneakers from function",sneakers.collection_image)

	//const sneakersWithBlurDataUrl = await addBlurredDataUrls(sneakers);
	let blurDataURL = "";
	//console.log("NEW myBlurDataUrl ####", sneakersWithBlurDataUrl);
	//const sneakerCostPerWear = costPerWear ()
	return (
		<>
			{sneakers?.map((sneaker: any) => (
				<div
					key={sneaker.id}
					className={`flex flex-col max-w-sm relative justify-center align-middle items-start ${
						showtxt ? "bg-gray-800/50 px-1 py-2 md:px-2 md:py-4 w-full" : ""
					} `}>
					{showtxt && (
						<>
							<div className=' flex flex-col  items-center  mx-3 my-3 text-end rounded-xl bg-indigo-900/50 p-1 absolute top-0 right-0'>
								<div className='px-1 '>
									<span className=' text-[1.35rem] md:text-[1.3rem] leading-[1.2] text-start'>
										8.8
									</span>
									<span className='text-[0.68rem]'>/10</span>
								</div>

								<p className='text-[0.67rem] md:text-[0.67rem] leading-[1.2] text-start px-2 '>
									Our Score
								</p>
							</div>

							<div className=' flex flex-col  items-center  mx-3 my-3 text-end rounded-full bg-gray-500/50 p-1 absolute top-0 left-0'>
								<span className='  '>
									<img
										className='text-gray-300 w-7 h-7 m-0 fill-gray-300'
										src={sneaker.brand_id.brand_logo}
									/>
								</span>
							</div>
						</>
					)}
					<div
						className={`${
							showtxt ? "mx-12 my-6 sm:mt-14  md:mt-16 lg:mt-20" : ""
						} `}>
						<Link href={`/sneakers/detail/${sneaker.id}`}>
							<Image
								width={250}
								height={150}
								src={
									sneaker?.collection_image
										? sneaker?.collection_image
										: "https://res.cloudinary.com/babyhulk/image/upload/a_vflip.180/co_rgb:e7e7e7,e_colorize:100/v1710621770/sneakers/baseball.png"
								}
								alt={sneaker?.name}
								className='w-56 mt-6 md:mt-0 md:w-80 img-outline cursor-pointer '
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
						</Link>
					</div>
					{showtxt && (
						<p className=' line-clamp-2 text-[0.95rem] md:text-[0.9rem] mt-2 leading-[1.2] text-start mx-2  md:mx-5 '>
							{sneaker?.name}-{sneaker.id}
						</p>
					)}

					{/*showtxt && (
						<div className='md:mt-5 mt-3 mb-1 mx-auto'>
							<Link href={`/sneakers/detail/${sneaker.id}`}>
								<button className='bg-white text-xs md:text-sm hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow'>
									View Sneaker Stats - {sneaker.id}
								</button>
							</Link>
						</div>
						
					)*/}
				</div>
			))}

			
		</>
	);
}
