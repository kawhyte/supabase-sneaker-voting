"use client";
import { ItemStatus } from "@/types/ItemStatus";

// Sub-components
export function DashboardHeader({ status }: { status: ItemStatus }) {
	const titles: Record<ItemStatus, { title: string; description: string }> = {
		[ItemStatus.OWNED]: {
			title: "Owned Items",
			description: "Items you own and have purchased",
		},
		[ItemStatus.WISHLISTED]: {
			title: "Want to Buy",
			description: "Track items you're interested in and monitor price changes",
		},
	};

	const { title, description } =
		titles[status] || titles[ItemStatus.WISHLISTED];

	return (
		<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-4'>
			<div>
				{/* <h1 className='text-3xl font-bold font-heading -mb-2'>{title}</h1> */}
				<p className='text-slate-600'>{description}</p>
			</div>
		</div>
	);
}
