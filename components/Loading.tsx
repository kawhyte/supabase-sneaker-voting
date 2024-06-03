import React from "react";
import SkeletonCard from "./SkeletonCard";

export default function Loading() {
	return (
		<>
			<main className='animate-in container mx-auto p-10  w-full'>
				<div className='w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8 ' />

				<div className='w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8 ' />

				<div className=' flex flex-row gap-x-8 sm:gap-x-8 md:gap-x-20 justify-center items-center mx-auto'>
					<div className=' flex flex-col justify-center align-middle text-center'>
						<span className='font-serif flex flex-col mt-10 mb-6  text-[1.25rem] sm:text-[2rem] tracking-[-0.03em] leading-[0.88] font-bold'>
							{"sectiontext"}
						</span>
						<span className='text-[2.25rem] sm:text-[3rem] tracking-[-0.03em] font-bold border-2 items-center transition ease-in duration-200 py-2 px-1 rounded-full opacity translate-y-[10px] group font-mono uppercase leading-[1.2] '>
							{"total"}
						</span>
					</div>
				</div>

				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2  gap-x-8 gap-y-5'>
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
				</div>
			</main>
		</>
	);
}
