import Link from "next/link";
import NextLogo from "./NextLogo";
import SupabaseLogo from "./SupabaseLogo";
import costPerWear from "@/lib/calculation";

export default function CollectionDetailPage({
	name,
	date,
	brand,
	price,
	purchasePrice,
	style,
	moreImages,
	collectionImage,
	stats,
}: {
	name: string;
	date: any;
	brand: string;
	price: any;
	purchasePrice:any
	style: string;
	moreImages: any;
	collectionImage: any;
	stats: any;
}) {
	// console.log("Before Price ", price);
	 const sneakerCostPerWear = costPerWear(stats, price);

	// console.log("TTCost7", sneakerCostPerWear);
	// console.log("date", date);

	let cardElement = [
		{
			id: 1,
			name: "Comfort",

			svg: (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					className='text-gray-300 w-8 h-8 my-1.5 inline-block'
					strokeLinecap='round'
					strokeLinejoin='round'>
					<path d='M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5zM16 8 2 22m15.5-7H9' />
				</svg>
			),
			data: stats?.comfort,
			description: "Can I wear it for an extended period.",
		},

		{
			id: 2,
			name: "Material",

			svg: (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='text-gray-300 w-8 h- fill-gray-300 my-1.5 inline-block'
					viewBox='0 0 350 350'>
					<path d='M241 35.5V0H111v35.5C111 53.42 96.42 68 78.5 68H23v48.368l8.47 7.847C45.773 137.466 53.65 155.502 53.65 175s-7.876 37.534-22.179 50.785L23 233.632V282h55.5c17.92 0 32.5 14.58 32.5 32.5V350h130v-35.5c0-17.92 14.579-32.5 32.5-32.5H327v-48.368l-8.471-7.847c-14.303-13.251-22.18-31.288-22.18-50.786s7.877-37.534 22.18-50.785l8.471-7.847V68h-53.5C255.579 68 241 53.42 241 35.5m66 72.132-2.063 1.911C286.77 126.375 276.35 150.233 276.35 175s10.42 48.625 28.588 65.457l2.063 1.911V262h-33.5c-28.948 0-52.5 23.551-52.5 52.5V330h-90v-15.5c0-28.949-23.551-52.5-52.5-52.5H43v-19.632l2.063-1.911C63.23 223.625 73.65 199.767 73.65 175s-10.419-48.625-28.587-65.457L43 107.632V88h35.5c28.949 0 52.5-23.551 52.5-52.5V20h90v15.5c0 28.949 23.552 52.5 52.5 52.5H307z' />
				</svg>
			),
			data: stats?.material,
			description: "Quality of materials including tech specs.",
		},

		{
			id: 3,
			name: "Wow factor",
			svg: (
				<svg
					className='text-gray-300 w-8 h-8 my-1.5 fill-gray-300 inline-block'
					viewBox='0 0 24 24'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'>
					<path
						fillRule='evenodd'
						clipRule='evenodd'
						d='M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0m8-10C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2M8.03 15.243A1.012 1.012 0 0 1 9 14h6c.633 0 1.126.617.97 1.24C15.452 16.988 13.785 18 12 18c-1.717 0-3.531-1.001-3.97-2.758m.436-5.775c-.079-.45-1.03-1.433-1.8-1.298-.923.163-1.335.955-1.182 1.822.14.789.74 1.437 1.39 1.938.659.508 1.428.91 2 1.192a.4.4 0 0 0 .458-.08c.442-.461 1.027-1.102 1.473-1.805.438-.693.782-1.508.643-2.296-.153-.868-.815-1.47-1.738-1.307-.768.135-1.32 1.405-1.244 1.834m5.82-1.835c.769.136 1.327 1.386 1.248 1.835.075-.429 1.028-1.434 1.796-1.298.923.163 1.339.955 1.186 1.822-.14.789-.74 1.437-1.39 1.938-.659.508-1.428.91-2 1.192a.4.4 0 0 1-.458-.08c-.442-.461-1.027-1.102-1.473-1.805-.438-.693-.782-1.508-.643-2.296.153-.868.811-1.47 1.734-1.308'
					/>
				</svg>
			),
			data: stats?.wearability,
			description: "Is it unique enough to turn heads.",
		},

		{
			id: 4,
			name: "# of times worn",
			svg: (
				<svg
					className='text-gray-300 w-8 h-8 my-1.5 fill-gray-300 inline-block'
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 512 512'>
					<path d='M395.13 217.043c-74.458 0-73.929.794-83.956-2.411l-.204-.066c-25.681-8.33-26.685-20.115-76.998-120.74-2.494-6.065-8.458-10.338-15.42-10.349H16.696C7.475 83.478 0 90.953 0 100.174v278.261c0 27.618 22.469 50.087 50.087 50.087h411.826c27.618 0 50.087-22.469 50.087-50.087v-44.522c0-64.442-52.428-116.87-116.87-116.87m-5.565 33.392h5.565c44.158 0 80.396 34.47 83.272 77.913h-88.838v-77.913zM33.391 116.87h174.77l11.786 23.572-48.1 48.1c-6.52 6.519-6.52 17.091 0 23.611a16.64 16.64 0 0 0 11.805 4.891c4.273 0 8.546-1.631 11.805-4.891l40.23-40.23 13.318 26.635-27.198 48.525c-4.508 8.044-1.643 18.218 6.401 22.727a16.6 16.6 0 0 0 8.147 2.135c5.845 0 11.518-3.075 14.58-8.536l19.416-34.641a82.6 82.6 0 0 0 19.04 13.022v36.471c0 9.22 7.475 16.696 16.696 16.696 9.22 0 16.696-7.475 16.696-16.696v-27.918a85 85 0 0 0 3.753.092h29.639v77.913H33.391zm445.218 261.565c0 9.206-7.49 16.696-16.696 16.696H50.087c-9.206 0-16.696-7.49-16.696-16.696v-16.696h445.217v16.696z' />
				</svg>
			),
			data: stats?.times_worn,
			description: "Esimated amount of times I've worn the shoe.",
			remove: true,
		},
	];
	return (
		<>
		
			<section className='max-w-7xl bg-red-200 '>
				<div className=' flex justify-center'>
					<img src={collectionImage} />
				</div>
				<div className='flex flex-col lg:flex-row-reverse  my-6  px-4 '>
					<div className='font-serif flex   text-white mb-2 flex-col   text-[1.5rem] sm:text-[2.9rem] tracking-[-0.02em] leading-[1.2] font-bold'>
						<p className=' '>{name}</p>
					</div>
					<div className='md:w-5/6 font-mono text-sm flex flex-col justify-between  '>
						<div className='mb-2 mt-3'>
							<span className='text-gray-400'> Retail Price:</span> ${price}
						</div>
						<div className='mb-2 '>
							<span className='text-gray-400'>Purchase Price:</span> ${purchasePrice}
						</div>
						<div className='mb-2 '>
							<span className='text-gray-400'>Cost per Wear:</span> {`${sneakerCostPerWear? "$"+ sneakerCostPerWear: "No data availiable"}`}
						</div>

						<div className='mb-2'>
							<span className='text-gray-400'>Release Date:</span> {date}
						</div>
						<div className='mb-2'>
							<span className='text-gray-400'>Brand:</span> {brand}
						</div>
						<div className=''>
							<span className='text-gray-400'>SKU:</span> {style}
						</div>
					</div>
				</div>
			</section>
			<div className='w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8 ' />

			{stats && (
				<div className='  my-20'>
					<div className='grid grid-row-2 gap-4 ml-4 mb-10 md:mb-20'>
						<div className='font-serif flex text-white    underline decoration-sky-500/30  -skew-y-3   text-[2rem] sm:text-[2.1rem] tracking-[-0.02em] leading-[.99] font-bold'>
							Review
						</div>
					</div>

					<div className='grid grid-cols-2 md:grid-cols-4 place-items-center font-mono'>
						{cardElement.map((item) => (
							<div key={item.id}>
								<div className=' flex flex-col  items-center  mx-3 my-3 text-end rounded-xl border border-indigo-100 p-1 w-40  '>
									{item.svg}
									<div className='px-1 '>
										<span className=' text-[1.99rem] md:text-[2.8rem] leading-[1.2] text-start'>
											{item.data}
										</span>
										{!item.remove && <span className='text-[0.9rem]'>/10</span>}
									</div>

									<p className='text-[0.9rem] md:text-[1rem] leading-[1.2] text-start mb-1 text-gray-400  '>
										{item.name}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
			{moreImages.length > 1 ? (
				<div className='mb-20'>
					<div className='font-serif ml-4 md:mb-20 flex text-white flex-col mb-10 underline decoration-sky-500/30  -skew-y-3   text-[2rem] sm:text-[2.1rem] tracking-[-0.02em] leading-[.99] font-bold'>
						Sneaker Photos
					</div>
					<div className='grid grid-cols-2 md:grid-cols-3  gap-3 p-4 max-w-[800px] md:max-w-[1300px] place-items-center'>
						{/* <img src={main_image} /> */}

						{moreImages.map((item: any) => (
							<div className='  bg-white' key={item.id}>
								<img className='w-full' src={item?.image_link} />
							</div>
						))}
					</div>
				</div>
			) : (
				""
			)}

			<div className='grid grid-cols-1 max-w-7xl gap-y-3 mb-16 font-mono '>
				<div className='font-serif ml-4 md:mb-4 flex text-white flex-col mb-2 underline decoration-sky-500/30  text-[2rem] sm:text-[1.6rem] tracking-[-0.02em] leading-[.99] font-bold'>
					Our Review Metrics Breakdown
				</div>
				{cardElement.map((item) => (
					<div key={item.name}>
						<div className='inline-flex items-center align-bottom  leading-none ${props.textColor} rounded-full p-2 shadow text-teal text-sm'>
							<span className='inline-flex  text-white rounded-full h-6 px-3 justify-center items-center'>
								<span>{item.svg} </span>

								<span className='inline-flex px-4 leading-4 text-gray-200'>
									{item.description}
								</span>
							</span>
						</div>
					</div>
				))}
			</div>
		</>
	);
}
