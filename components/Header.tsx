

import Link from "next/link";
import NextLogo from "./NextLogo";
import SupabaseLogo from "./SupabaseLogo";
import Logo from "./Logo";
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
  } from "@/components/ui/navigation-menu"
  import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"


export default async function Header() {
	const supabase = createClient();

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
		<div className='  '>
			<> 
		

			<nav className='w-full flex justify-center  h-16 my-3 '>
				<div className='w-full max-w-6xl flex justify-between items-center p-3 text-xs '>
					<Logo />

					{user ? (
						<Link href={"/sneakers/pending"}>
							<span className=' hidden md:block hover:text-green-500/80 items-center transition ease-in duration-200 py-2 px-3 opacity translate-y-[10px] group font-mono leading-[1.2] text-xs md:text-sm'>
								Pending Vote
							</span>
						</Link>
					) : (
						<></>
					)}
					<Link href={"/sneakers/voted"}>
						<span className='hidden md:block hover:text-blue-500/80 items-center transition ease-in duration-200 py-2 px-3  opacity translate-y-[10px] group font-mono leading-[1.2] text-xs md:text-sm'>
							Recent Votes
						</span>
					</Link>
					<Link href={"/sneakers/collection"}>
						<span className=' hidden md:block hover:text-yellow-500/80 items-center transition ease-in duration-200 py-2 px-3  opacity translate-y-[10px] group font-mono  leading-[1.2] text-xs md:text-sm'>
							Our Collection
						</span>
					</Link>
					<Link href={"/sneakers"}>
						<button className=' hidden md:block border rounded-lg hover:bg-green-700/80 bg-green-600 items-center transition ease-in duration-200 py-1 px-2  opacity translate-y-[10px] group font-mono  leading-[1.2] text-xs md:text-sm'>
							Dashboard
						</button>
					</Link>

					{isSupabaseConnected && <AuthButton />}
				</div>
			</nav>
			<div className="border-b border-b-foreground/10"></div>
			</>
		</div>
	);
}
