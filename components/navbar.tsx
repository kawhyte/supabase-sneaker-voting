"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Navbar() {
	const pathname = usePathname();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const isActive = (path: string) => pathname === path;

	const navLinks = [
		// { href: "/", label: "Home" },
		// { href: "/add-new-item", label: "Add New Item" },
		// { href: "/dashboard", label: "Dashboard" },
		// // { href: '/wishlist', label: 'Wishlist' },
		// { href: "/dashboard?tab=wishlist", label: "Wishlist" },
		// { href: "/collection", label: "Collection" },

       { href: '/', label: 'Home' },
    // A single, clear link to the main user area
    { href: '/add-new-item', label: 'Add New Item' },
    { href: '/dashboard', label: 'My Wardrobe' }, 
	];

	return (
		<nav className='sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80'>
			<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex h-16 items-center justify-between'>
					{/* Logo/Brand */}
					<Link href='/' className='flex items-center gap-2'>
						<span className='text-2xl'>👟</span>
						<span className='text-xl font-bold text-gray-900'>
							Item Tracker
						</span>
					</Link>

					{/* Desktop Navigation Links */}
					<div className='hidden md:flex items-center space-x-8'>
						{navLinks.map((link) => (
							<Link key={link.href} href={link.href} className='relative'>
								<span
									className={`text-sm font-medium transition-colors ${
										isActive(link.href)
											? "text-gray-900"
											: "text-gray-600 hover:text-gray-900"
									}`}>
									{link.label}
								</span>
								{isActive(link.href) && (
									<span className='absolute bottom-[-4px] left-0 right-0 h-0.5 bg-yellow-400'></span>
								)}
							</Link>
						))}
					</div>

					{/* Desktop Login Button */}
					<div className='hidden md:block'>
						<Button className='bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-medium rounded-md px-4 py-2'>
							Login
						</Button>
					</div>

					{/* Mobile Menu Button */}
					<div className='md:hidden'>
						<Button
							variant='ghost'
							className='text-gray-700 hover:text-gray-900'
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
							{isMobileMenuOpen ? (
								<X className='h-3 w-3' />
							) : (
								<Menu className='h-3 w-3' />
							)}
						</Button>
					</div>
				</div>

				{/* Mobile Menu */}
				{isMobileMenuOpen && (
					<div className='md:hidden py-4 border-t border-gray-200'>
						<div className='flex flex-col space-y-4'>
							{navLinks.map((link) => (
								<Link key={link.href} href={link.href} className='relative'>
									<span
										className={`text-sm font-medium transition-colors ${
											isActive(link.href)
												? "text-gray-900"
												: "text-gray-600 hover:text-gray-900"
										}`}
										onClick={() => setIsMobileMenuOpen(false)}>
										{link.label}
									</span>
									{isActive(link.href) && (
										<span className='absolute bottom-[-4px] w-10 left-0 right-0 h-0.5 bg-yellow-400'></span>
									)}
								</Link>
							))}
							<Button
								className='bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-medium rounded-md px-4 py-2 w-full justify-center'
								onClick={() => setIsMobileMenuOpen(false)}>
								Login
							</Button>
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}
