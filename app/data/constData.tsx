import { Archive, Clock, Heart, LayoutDashboard, Library } from "lucide-react";

export const links = [
	{
		title: "Overview ",
		href: "/sneakers/dashboard",
		icon: LayoutDashboard,
		variant: "default",
		color: "green",
	},
	{
		title: "Awaiting Vote ",
		href: "/sneakers/dashboard/pending",
		value: "4",
		icon: Clock,
		variant: "default",
		color: "blue",
	},
	{
		title: "Potential Purchases ",
		href: "/sneakers/dashboard/voted",
		value: "2",
		icon: Heart,
		variant: "default",
		color: "yellow",
	},
	{
		title: "Archived ",
		href: "/sneakers/dashboard/archived",
		icon: Archive,
		variant: "default",
		color: "red",
	},
	{
		title: "Collection ",
		href: "/sneakers/collection",
		icon: Library,
		variant: "default",
		color: "red",
	},
] as const;
