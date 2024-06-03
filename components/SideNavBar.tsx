import React, { useState } from "react";
import { Nav } from "./ui/nav";
import {
	Archive,
	ArchiveX,
	ChevronRight,
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
const mobileWidth = onlyWidth < 768

	function toggleSideBar() {
		seIsCollapsed(!isCollapsed);
	}
	return (
		<div className=' relative min-w-[80px] border-r px-3 pb-10 pt-24  '>
			
      {!mobileWidth && (
      <div className='absolute right-[-20px] top-7'>
				<Button
					onClick={toggleSideBar}
					variant={"secondary"}
					className=' rounded-full p-2'>
					<ChevronRight />
				</Button>
			</div>)}
			<Nav
				isCollapsed={mobileWidth ? true: isCollapsed}
				links={[
					{
						title: "Dashboard",
						href: "/test",
						// label: "128",
						icon: LayoutDashboard,
						variant: "default",
					},
					{
						title: "Users",
						href: "/users",
						// label: "9",
						icon: File,
						variant: "ghost",
					},

					{
						title: "Junk",
						href: "/users",
						label: "23",
						icon: ArchiveX,
						variant: "ghost",
					},
					{
						title: "Trash",
						label: "",
						href: "/users",
						icon: Trash2,
						variant: "ghost",
					},
					{
						title: "Archive",
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
