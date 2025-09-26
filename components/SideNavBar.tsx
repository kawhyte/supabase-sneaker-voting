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
	CirclePlus,
	Home
	
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
		  <div className=' relative min-w-[100px] border-r px-3 pb-10 pt-10  '>
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
						title: "Home",
						href: "/",
						icon: Home,
						variant: "ghost",
					},
					{
						title: "Dashboard",
						href: "/dashboard",
						icon: LayoutDashboard,
						variant: "ghost",
					},
				
				]}
			/>
		</div> 
	);
}
