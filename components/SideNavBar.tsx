import React, { useState } from "react";
import { Nav } from "./ui/nav";
import {
	Archive,
	ArchiveX,
	ChevronRight,
	ChevronLeft,
	File,
	LayoutDashboard,
	Heart,
	Clock
	
} from "lucide-react";
import { Button } from "./ui/button";

import {
	useWindowSize,
	useWindowWidth,
	useWindowHeight,
} from "@react-hook/window-size";

type Props = {};

export default function SideNavBar({}: Props) {
	const [isCollapsed, seIsCollapsed] = useState(false);

	const onlyWidth = useWindowWidth();
	const mobileWidth = onlyWidth < 768;

	function toggleSideBar() {
		seIsCollapsed(!isCollapsed);
	}
	return (
		<div className=' relative min-w-[80px] border-r px-3 pb-10 pt-10 '>
			{!mobileWidth && (
				<div className='absolute right-[-20px] top-7'>
					<Button
						onClick={toggleSideBar}
						variant={"secondary"}
						className=' rounded-full p-2 '>
						{isCollapsed ? <ChevronRight /> : <ChevronLeft />}
					</Button>
				</div>
			)}
			<Nav
				isCollapsed={mobileWidth ? true : isCollapsed}
				links={[
					{
						title: "Sneakers Overview",
						href: "/sneakers/dashboard",
						// label: "128",
						icon: LayoutDashboard,
						variant: "ghost",
					},
					{
						title: "Sneakers Awaiting Vote",
						href: "/sneakers/dashboard/pending",
						// label: "9",
						icon: Clock,
						variant: "ghost",
					},

					{
						title: "Sneakers I May Purchase",
						href: "/sneakers/dashboard/voted",
						label: "23",
						icon: Heart,
						variant: "ghost",
					},
				
					// {
					// 	title: "Our Collection",
					// 	label: "",
					// 	href: "/sneakers/collection",
					// 	icon: Trash2,
					// 	variant: "ghost",
					// },
					{
						title: "Archived Sneakers",
						href: "/sneakers/dashboard/archived",
						label: "",
						icon: Archive,
						variant: "ghost",
					},
				]}
			/>
		</div>
	);
}
