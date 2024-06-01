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
				<div className='w-full px-16  flex justify-between items-center p-3 text-xs '>
					<div className='flex justify-start w-3/5 font-semibold text-base gap-x-3 '>
						<Logo />

						{user ? (
							<Link href={"/sneakers/pending"}>
								<span className=' hidden md:block hover:border-b-4  border-b-green-600 hover:text-green-500/80 items-center transition ease-in duration-200 py-2 px-3 opacity translate-y-[10px]   leading-[1.2]  '>
									Pending Vote
								</span>
							</Link>
						) : (
							<></>
						)}
						<Link href={"/sneakers/voted"}>
							<span className='hidden md:block hover:border-b-4  border-b-blue-600 hover:text-blue-500/80 items-center transition ease-in duration-200 py-2 px-3  opacity translate-y-[10px]   leading-[1.2] '>
								Recent Votes
							</span>
						</Link>
						<Link href={"/sneakers/collection"}>
							<span className=' hidden md:block hover:border-b-4  border-b-yellow-600 hover:text-yellow-500/80 items-center transition ease-in duration-200 py-2 px-3  opacity translate-y-[10px]  leading-[1.2] '>
								Our Collection
							</span>
						</Link>
					</div>

					<div className=' flex justify-end gap-3 align-bottom items-baseline w-2/5'>
						<Link className='' href={"/sneakers"}>
							<Button
								className='hover:border-gray-300 rounded-xl border-2  h-9'
								variant='default'>
								{" "}
								Dashboard
							</Button>
						</Link>

						{isSupabaseConnected && <AuthButton />}
					</div>
				</div>
				{/* </nav> */}
				<div className='border-b border-b-foreground/10'></div>
			</>
		</div>
	);
}
