"use client";
import SideNavBar from "./SideNavBar";

export default function ExampleClientComponent({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<SideNavBar />

			{children}
		</>
	);
}
