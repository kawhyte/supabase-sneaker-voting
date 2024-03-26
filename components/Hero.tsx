import Link from "next/link";
import Image from "next/image";

export default function Hero({ sneakers }: { sneakers: any }) {
	return (
		<div className=' '>
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

			<div className='text-2xl lg:text-3xl !leading-tight mx-auto max-w-4xl text-center mb-10'>
				<div className='font-serif flex flex-col -skew-y-3 drop-shadow-xl  text-[4.25rem] sm:text-[8rem] tracking-[-0.03em] leading-[0.88] font-bold'>
					<span className='underline decoration-sky-500/30   '>MTW's</span>
					<span className=''> Ultimate Sneaker</span>
					<span className=''>Collection</span>
				</div>
			</div>

			<div className='grid grid-cols-3 grid-rows-1 sm:grid-cols-6  sm:grid-row-2 gap-y-8  gap-x-7'>
				{sneakers.map((sneaker: any) => (
					<div className='flex flex-col justify-center align-middle items-center'>
						<Image
							width={300}
							height={200}
							src={sneaker.collection_image}
							alt={sneaker.name}
							blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg=='
							loading='lazy'
							placeholder='blur'
						/>
						<p className=' line-clamp-2 text-[0.59rem] mt-2 leading-[1.2] text-center  '>
							{sneaker.name}
						</p>
					</div>
				))}
			</div>
			<div className='w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8' />

			<div className=' flex flex-row gap-x-8 sm:gap-x-8 md:gap-x-20 justify-center items-center mx-auto'>
				<Link href={"/sneakers/collection"}>
					<button
						type='button'
						className=' hover:bg-yellow-500/80 border-2 items-center transition ease-in duration-200 py-2 px-3 rounded-full opacity translate-y-[10px] group font-mono uppercase leading-[1.2] text-xs md:text-sm'>
						Sneaker collection
					</button>
				</Link>
				<Link href={"/sneakers"}>
					<button
						type='button'
						className=' hover:bg-green-500/80 border-2 items-center transition ease-in duration-200 py-2 px-3 rounded-full opacity translate-y-[10px] group font-mono uppercase leading-[1.2] text-xs md:text-sm'>
						Recent Votes
					</button>
				</Link>
				<Link href={"/sneakers"}>
					<button
						type='button'
						className=' hover:bg-blue-500/80 border-2 items-center transition ease-in duration-200 py-2 px-3 rounded-full opacity translate-y-[10px] group font-mono uppercase leading-[1.2] text-xs md:text-sm'>
						Sneaker Tracker
					</button>
				</Link>
			</div>
		</div>
	);
}
function getImageBlurSvg() {
	throw new Error("Function not implemented.");
}
