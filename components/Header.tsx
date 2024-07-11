import Link from "next/link";
import NextLogo from "./NextLogo";
import SupabaseLogo from "./SupabaseLogo";
import Logo from "./Logo";
import { buttonVariants } from "@/components/ui/button";
import AuthButton from "./AuthButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuIndicator,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Button } from "./ui/button";
import { Archive, Clock, Heart, LayoutDashboard } from "lucide-react";
import { links } from "../app/data/constData";
import { usePathname } from "next/navigation";

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
export default async function Header() {
	// const pathName=  usePathname()

	// const links = [
	// 	{ title: "Overview ", href: "/sneakers/dashboard", icon: LayoutDashboard, variant: "ghost", color: "green" },
	// 	{ title: "Awaiting Vote ",href: "/sneakers/dashboard/pending", value: "4", icon: Clock, variant: "ghost", color: "blue" },
	// 	{ title: "Potential Purchases ",href: "/sneakers/dashboard/voted", value: "2", icon: Heart, variant: "ghost", color: "yellow" },
	// 	{ title: "Archived ", href: "/sneakers/dashboard/archived", icon: Archive, variant: "ghost", color: "red" },
	// ] as const;

	//console.log("LINKS ",  links)
	const supabase = createClient();
	// const pathName=  usePathname()

	const canInitSupabaseClient = () => {
		// This function is just for the interactive tutorial.
		// Feel free to remove it once you have Supabase connected.
		try {
			createClient();
			return true;
		} catch (e) {
			return false;
		}
	};

	const {
		data: { user },
	} = await supabase.auth.getUser();

	//   if (!user) {
	// 	return redirect("/");
	//   }

	const isSupabaseConnected = canInitSupabaseClient();

	return (
		<TooltipProvider>
			<>
				<nav />
				{/* <nav className='w-full flex justify-center align-bottom items-baseline  h-16 my-3  '> */}
				<div className='w-full  flex justify-between items-center p-3 text-xs '>
					<div className='flex justify-start items-center font-semibold text-base gap-x-3 '>
						<Logo />

						{links.map((item, index) => (
							// 	<Link className='' href={item.href}>
							// 	<Button
							// 		variant={item.variant}

							// 		className='hover:border-gray-300 rounded-xl border-2  h-9'><item.icon className="mr-2 h-4 w-4" />
							// 		{item.title}
							// 	</Button>
							// </Link>

							<Tooltip key={index} delayDuration={0}>
								<TooltipTrigger asChild>
									<Link
										key={index}
										href={item.href}
										className={cn(
											buttonVariants({
												variant: item.href ? "default" : "ghost",
												size: "sm",
											}),
											item.variant === "default" &&
												"dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
											"justify-start"
										)}>
										<item.icon className='mr-2 h-4 w-4 ' />
										{item.title}
										{/* {item.label && (
                <span
                  className={cn(
                    "ml-auto ",
                    link.variant === "default" &&
                      "text-background dark:text-white "
                  )}
                >
                  {link.label}
                </span>
              )} */}
									</Link>
								</TooltipTrigger>
								{/* <TooltipContent
									side="bottom"
									className='flex items-center gap-4'>
									{item.title}
									{item.label && (
                  <span className="ml-auto text-muted-foreground">
                    {link.label}
                  </span>
                )}
								</TooltipContent> */}
							</Tooltip>
						))}

						{/* <div className='flex justify-between gap-x-6'>
							<Link className='' href={"/sneakers/dashboard"}>
								<Button
									variant={"default"}
									className='hover:border-gray-300 rounded-xl border-2  h-9'>
									Dashboard2
								</Button>
							</Link>
							<Link href={"/sneakers/collection"}>
								<p className='hover:border-gray-300 hover:border-2  md:block rounded-xl   h-9'>
									Our Collection 8
								</p>
							</Link>
						</div> */}
					</div>

					<div className='flex justify-end gap-3 align-bottom items-baseline '>
						<div>{isSupabaseConnected && <AuthButton />}</div>
					</div>
				</div>
				{/* </nav> */}
				<div className='border-b border-b-foreground/10'></div>
			</>
		</TooltipProvider>
	);
}
