import Link from "next/link";
import NextLogo from "./NextLogo";
import SupabaseLogo from "./SupabaseLogo";
import ThumbsUpIcon from "./ThumbsUpIcon";

export default function Hero() {
	
const sneakers = [
		{
			name: "Chunky Dunky",
			link: "https://res.cloudinary.com/babyhulk/image/upload/v1709927401/sneakers/1.png",
		},

		{
			name: "Spider-Verse",
			link: "https://res.cloudinary.com/babyhulk/image/upload/v1709927406/sneakers/6.png",
		},

		{
			name: "990V3 Outside Clothes",
			link: "https://res.cloudinary.com/babyhulk/image/upload/v1709931661/sneakers/The_Ultimate_Sneaker_Voting_1.png",
		},
		{
			name: "Lightning",
			link: "https://res.cloudinary.com/babyhulk/image/upload/v1709927404/sneakers/5.png",
		},
		{
			name: "Dia de Los Muertos",
			link: "https://res.cloudinary.com/babyhulk/image/upload/v1709927398/sneakers/4.png",
		},
		{
			name: "Grinch",
			link: "https://res.cloudinary.com/babyhulk/image/upload/v1709930979/sneakers/7.png",
		},
	];

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

			<div className='grid grid-cols-3 sm:grid-cols-6  grid-row-2 gap-y-8  gap-x-7'>
				{sneakers.map((sneaker) => (
					<div className='flex flex-col justify-center align-middle items-center'>
						<img src={sneaker.link} alt='test' />
						<p className='text-[0.59rem] font-mono leading-[1.2]'>{sneaker.name}</p>
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
						className=' hover:bg-blue-500/80 border-2 items-center transition ease-in duration-200 py-2 px-3 rounded-full opacity translate-y-[10px] group font-mono uppercase leading-[1.2] text-xs md:text-sm'>
						Sneaker Tracker
					</button>
				</Link>
				<Link href={"/sneakers"}>

					<button
						type='button'
						className=' hover:bg-green-500/80 border-2 items-center transition ease-in duration-200 py-2 px-3 rounded-full opacity translate-y-[10px] group font-mono uppercase leading-[1.2] text-xs md:text-sm'>
						Rank Sneakers
					</button>
				</Link>

		
			</div>
		</div>


 
	);
}
