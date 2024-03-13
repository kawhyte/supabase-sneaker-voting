import Link from "next/link";
import NextLogo from "./NextLogo";
import SupabaseLogo from "./SupabaseLogo";

export default function Header({name}: {name:string}) {


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
				<div className='font-serif flex flex-col -skew-y-3 drop-shadow-xl my-10  text-[4.25rem] sm:text-[8rem] tracking-[-0.03em] leading-[0.88] font-bold'>

					<span className='underline decoration-green-500/50'>{name}</span>
					
				</div>
			</div>

	

			<div className=' flex flex-row gap-x-8 sm:gap-x-8 md:gap-x-20 justify-center items-center mx-auto'>
				

					<span
					
						className='border-2 items-center transition ease-in duration-200 py-2 px-3 rounded-full opacity translate-y-[10px] group font-mono uppercase leading-[1.2] text-xs md:text-sm'>
						Total Sneakers:
					</span>
				
				<Link href={"/sneakers"}>

					<button
						type='button'
						className=' hover:bg-blue-500/80 border-2 items-center transition ease-in duration-200 py-2 px-3 rounded-full opacity translate-y-[10px] group font-mono uppercase leading-[1.2] text-xs md:text-sm'>
						Vote Required:
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
				<div className='w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8 ' />
		</div>
	);
}
