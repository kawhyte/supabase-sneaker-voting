import Link from "next/link";
import Logo from "./Logo";
import { buttonVariants } from "@/components/ui/button";
import AuthButton from "./AuthButton";
import { createClient } from "@/utils/supabase/server";
import { Archive, Clock, Heart, LayoutDashboard } from "lucide-react";
import { links } from "../app/data/constData";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default async function Header() {
	let user = null;
	let isSupabaseConnected = false;

	try {
		const supabase = await createClient();
		if (supabase) {
			const {
				data: { user: authUser },
			} = await supabase.auth.getUser();
			user = authUser;
			isSupabaseConnected = true;
		}
	} catch (e) {
		console.error('Supabase client error:', e);
		isSupabaseConnected = false;
	}

	return (
		<TooltipProvider>
			<>
				<nav />
				<div className='w-full flex justify-between items-center p-3 text-xs'>
					<div className='flex justify-start items-center font-semibold text-base gap-x-3'>
						<Logo />

						{links.map((item, index) => (
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
										<item.icon className='mr-2 h-4 w-4' />
										{item.title}
									</Link>
								</TooltipTrigger>
							</Tooltip>
						))}
					</div>

					<div className='flex justify-end gap-3 align-bottom items-baseline'>
						<div>{isSupabaseConnected && <AuthButton />}</div>
					</div>
				</div>
				<div className='border-b border-b-foreground/10'></div>
			</>
		</TooltipProvider>
	);
}