import Link from "next/link";
import NextLogo from "./NextLogo";
import SupabaseLogo from "./SupabaseLogo";
import DeployButton from "./DeployButton";
import AuthButton from "./AuthButton";
import { createClient } from "@/utils/supabase/server";

export default function Header() {
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

	const isSupabaseConnected = canInitSupabaseClient();

	return (
		<div className=' md:mb-20 '>
			<nav className='w-full flex justify-center border-b border-b-foreground/10 h-16'>
				<div className='w-full max-w-4xl flex justify-between items-center p-3 text-sm'>
					<DeployButton />

					<Link href={"/sneakers/pending"}>
						<span className=' hidden md:block hover:text-green-500/80 items-center transition ease-in duration-200 py-2 px-3 opacity translate-y-[10px] group font-mono leading-[1.2] text-xs md:text-sm'>
							Pending Vote
						</span>
					</Link>
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

					{isSupabaseConnected && <AuthButton />}
				</div>
			</nav>
		</div>
	);
}
