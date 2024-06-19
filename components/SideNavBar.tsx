import React, { useEffect, useState } from "react";
import { Nav } from "./ui/nav";
import {
	Archive,
	ArchiveX,
	ChevronRight,
	ChevronLeft,
	File,
	LayoutDashboard,
	Heart,
	Clock,
	CirclePlus
	
} from "lucide-react";
import { Button } from "./ui/button";

import {
	useWindowSize,
	useWindowWidth,
	useWindowHeight,
} from "@react-hook/window-size";


type Props = {};

export default function SideNavBar({}: Props) {
	const [isCollapsed, setIsCollapsed] = useState(false);
const [windowWidth, setWindowWidth] = useState(0);
	const onlyWidth = useWindowWidth();



	useEffect(() => {
		window.addEventListener("resize", () => {
		  setWindowWidth(window.innerWidth);
		  
		});
	  }, []);



	const mobileWidth = windowWidth < 768;


	function toggleSideBar() {
		setIsCollapsed(!isCollapsed);
	}
	return (
		<div className=' relative min-w-[100px] border-r px-3 pb-10 pt-10 '>
			{!mobileWidth && (
				<div  className='absolute right-[-20px] top-7'>
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
						title: "Potential Sneaker Purchases",
						href: "/sneakers/dashboard/voted",
						label: "",
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

						{
						title: "Create New Listing",
						label: "",
						href: "/sneakers/create",
						icon: CirclePlus,
						variant: "ghost",
					},
				]}
			/>
		</div>
	);
}
