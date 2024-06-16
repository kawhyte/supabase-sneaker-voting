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
} from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Button } from "./ui/button";

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
				{/* <nav className='w-full flex justify-center align-bottom items-baseline  h-16 my-3  '> */}
				<div className='w-full  flex justify-between items-center p-3 text-xs '>
					<div className='flex justify-start items-center font-semibold text-base gap-x-3 '>
						<Logo />

						<div className='flex justify-between gap-x-6'>
							<Link className='' href={"/sneakers/dashboard"}>
								<Button
									variant={"default"}
									className='hover:border-gray-300 rounded-xl border-2  h-9'>
									Dashboard
								</Button>
							</Link>
							<Link href={"/sneakers/collection"}>
								<Button
									variant={"ghost"}
									className='hover:border-gray-300 hidden md:block rounded-xl border-2  h-9'>
									Our Collection
								</Button>
							</Link>
						</div>
					</div>

					<div className='flex justify-end gap-3 align-bottom items-baseline '>
						<div>{isSupabaseConnected && <AuthButton />}</div>
					</div>
				</div>
				{/* </nav> */}
				<div className='border-b border-b-foreground/10'></div>
			</>
		</div>
	);
}


