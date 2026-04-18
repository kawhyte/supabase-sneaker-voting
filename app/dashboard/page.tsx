"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { WardrobeDashboard } from "@/components/WardrobeDashboard";
import { SneakerInspirationView } from "@/components/sneaker-inspo/SneakerInspirationView";
import {
	Footprints,
	Heart,
	Sparkles,
	Archive,
	Plus,
} from "lucide-react";
import { ItemStatus } from "@/types/ItemStatus";
import Link from "next/link";

function DashboardContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	const activeTab = searchParams.get("tab") ?? "rotation";
	const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

	const handleTabChange = (value: string) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("tab", value);
		params.set("page", "1");
		router.replace(`${pathname}?${params.toString()}`);
	};

	const buildPageUrl = (p: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", String(p));
		return `${pathname}?${params.toString()}`;
	};

	return (
		<div className='w-full min-h-screen md:mt-6'>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}>
				<div className='flex justify-between items-center'>
					<h3 className='text-3xl font-bold font-sans -mb-2'>My Collection</h3>

					<div className='flex items-center gap-3'>
						<Link href='/dashboard?tab=archive'>
							<Button
								variant='outline'
								className='flex items-center gap-2 px-4 py-2 rounded-lg transition-all motion-safe:hover:scale-105 will-change-transform'>
								<Archive className='h-4 w-4' />
								Archive
							</Button>
						</Link>

						<Link href='/add-new-item'>
							<Button className='flex items-center gap-2 bg-primary text-foreground hover:bg-primary/90 font-semibold px-4 py-2 rounded-lg transition-all motion-safe:hover:scale-105 will-change-transform'>
								<Plus className='h-4 w-4' />
								Add Item
							</Button>
						</Link>
					</div>
				</div>

				<div className='mt-12 mb-6'>
					<Tabs
						value={activeTab}
						onValueChange={handleTabChange}
						className='w-full max-w-[1920px] mx-auto rounded-lg '>
						<div className='flex flex-col sm:flex-row justify-between sm:items-center gap-6 '>
							<div className='flex-1'>
								<TabsList
									data-variant='underline'
									className='w-full justify-start border-b border-border bg-transparent p-0 gap-8 mb-8'>
									<TabsTrigger
										value='rotation'
										data-variant='underline'
										className='relative py-2 px-4 rounded-xl pb-4 bg-transparent flex items-center gap-2'>
										<Footprints className='h-4 w-4' />
										Sneakers
									</TabsTrigger>
									<TabsTrigger
										value='wishlist'
										data-variant='underline'
										className='relative py-2 px-4 rounded-xl  pb-4 bg-transparent flex items-center gap-2'>
										<Heart className='h-4 w-4' />
										Wishlist
									</TabsTrigger>
									<TabsTrigger
										value='fits'
										data-variant='underline'
										className='relative py-2 px-4 rounded-xl  pb-4 bg-transparent flex items-center gap-2'>
										<Sparkles className='h-4 w-4' />
										Styling
									</TabsTrigger>
								</TabsList>
							</div>
						</div>

						<TabsContent value='rotation'>
							<motion.div
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 8 }}
								transition={{ duration: 0.3 }}>
								<WardrobeDashboard
									status={[ItemStatus.OWNED]}
									categoryFilter={["lifestyle", "running", "basketball", "skate", "training", "boots", "other"]}
									page={page}
									buildPageUrl={buildPageUrl}
								/>
							</motion.div>
						</TabsContent>

						<TabsContent value='wishlist'>
							<motion.div
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 8 }}
								transition={{ duration: 0.3 }}>
								<WardrobeDashboard
									status={[ItemStatus.WISHLISTED]}
									page={page}
									buildPageUrl={buildPageUrl}
								/>
							</motion.div>
						</TabsContent>

						<TabsContent value='fits'>
							<motion.div
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 8 }}
								transition={{ duration: 0.3 }}>
								<SneakerInspirationView
									showHeader={true}
									page={page}
									buildPageUrl={buildPageUrl}
								/>
							</motion.div>
						</TabsContent>

						<TabsContent value='archive'>
							<motion.div
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 8 }}
								transition={{ duration: 0.3 }}>
								<WardrobeDashboard
									status={[ItemStatus.OWNED, ItemStatus.WISHLISTED]}
									isArchivePage={true}
									page={page}
									buildPageUrl={buildPageUrl}
								/>
							</motion.div>
						</TabsContent>
					</Tabs>
				</div>
			</motion.div>
		</div>
	);
}

export default function DashboardPage() {
	return (
		<Suspense
			fallback={
				<div className='w-full py-8 flex items-center justify-center'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
				</div>
			}>
			<DashboardContent />
		</Suspense>
	);
}
