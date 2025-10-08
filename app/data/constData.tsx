import { Archive, Clock, Heart, LayoutDashboard, Library } from "lucide-react";

export const links = [
	{
		title: "Overview ",
		href: "/items/dashboard",
		icon: LayoutDashboard,
		variant: "default",
		color: "green",
	},
	{
		title: "Awaiting Vote ",
		href: "/items/dashboard/pending",
		value: "4",
		icon: Clock,
		variant: "default",
		color: "blue",
	},
	{
		title: "Potential Purchases ",
		href: "/items/dashboard/voted",
		value: "2",
		icon: Heart,
		variant: "default",
		color: "yellow",
	},
	{
		title: "Archived ",
		href: "/items/dashboard/archived",
		icon: Archive,
		variant: "default",
		color: "red",
	},
	{
		title: "Collection ",
		href: "/items/collection",
		icon: Library,
		variant: "default",
		color: "red",
	},
] as const;
