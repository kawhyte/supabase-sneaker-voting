import Link from "next/link";
import NextLogo from "./NextLogo";
import SupabaseLogo from "./SupabaseLogo";

export default function Header({
	name,
	total = -1,
	sectiontext,
}: {
	name: string;
	total: number | undefined;
	sectiontext: string;
}) {
	return (
		<div className=''>
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

			<section className='text-gray-600 body-font flex flex-col justify-center items-center align-middle'>
				<div className='container mx-auto flex px-5 md:pt-10 items-center justify-center flex-row'>
				
					<div className='text-center w-full flex flex-col justify-center align-middle items-center'>
						<div className='font-serif flex text-white flex-col drop-shadow-xl mt-10  text-[1.25rem] sm:text-[2.5rem] tracking-[-0.03em] leading-[0.88] font-bold'>
							<span className='underline decoration-green-500/50 '>{name}</span>
						</div>

					</div>

					{total > 0? <p className="rounded-full bg-green-400 px-2">{total}</p>:<></>}
				</div>
			</section>

		


			{/* {total >= 0 && (
				<div className=' flex flex-row gap-x-8 sm:gap-x-8 md:gap-x-20 justify-center items-center mx-auto'>
					<div className=' flex flex-col justify-center align-middle text-center'>
						<span className='font-serif flex flex-col mt-10 mb-6  text-[1.25rem] sm:text-[2rem] tracking-[-0.03em] leading-[0.88] font-bold'>
							{sectiontext}
						</span>
						<span className='text-[2.25rem] sm:text-[3rem] tracking-[-0.03em] font-bold border-2 items-center transition ease-in duration-200 py-2 px-1 rounded-full opacity translate-y-[10px] group font-mono uppercase leading-[1.2] '>
							{total}
						</span>
					</div>
				</div>
			)} */}
		</div>
	);
}
