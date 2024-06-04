import React, { useState } from "react";
import { Nav } from "./ui/nav";
import {
	Archive,
	ArchiveX,
	ChevronRight,
	ChevronLeft,
	File,
	LayoutDashboard,
	Trash2,
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
						title: "Sneaker by the numbers",
						href: "/sneakers",
						// label: "128",
						icon: LayoutDashboard,
						variant: "ghost",
					},
					{
						title: "Pending Votes",
						href: "/sneakers/pending",
						// label: "9",
						icon: File,
						variant: "ghost",
					},

					{
						title: "Recent Votes",
						href: "/sneakers/voted",
						label: "23",
						icon: ArchiveX,
						variant: "ghost",
					},
					{
						title: "Our Collection",
						label: "",
						href: "/sneakers/collection",
						icon: Trash2,
						variant: "ghost",
					},
					{
						title: "Archived",
						href: "/users",
						label: "",
						icon: Archive,
						variant: "ghost",
					},
				]}
			/>
		</div>
	);
}
