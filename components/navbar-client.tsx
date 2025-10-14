"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface NavbarClientProps {
	authButton: ReactNode;
	isAuthenticated: boolean;
}

export function NavbarClient({ authButton, isAuthenticated }: NavbarClientProps) {
	const pathname = usePathname();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const isActive = (path: string) => pathname === path;

	const publicNavLinks = [
		{ href: '/', label: 'Home' },
	];

	const authenticatedNavLinks = [
		{ href: '/add-new-item', label: 'Add New Item' },
		{ href: '/dashboard', label: 'My Wardrobe' },
	];

	const navLinks = isAuthenticated
		? [...publicNavLinks, ...authenticatedNavLinks]
		: publicNavLinks;

	return (
		<nav className='sticky top-0 z-50 w-full border-b border-[var(--color-border-primary)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80'>
			<div className='container mx-auto px-md sm:px-lg lg:px-xl'>
				<div className='flex h-16 items-center justify-between'>
					{/* Logo/Brand */}
					<Link href='/' className='flex items-center gap-xs'>
						<span className='text-2xl'>👟</span>
						<span className='text-xl font-bold text-[var(--color-text-primary)]'>
							Item Tracker
						</span>
					</Link>

					{/* Desktop Navigation Links */}
					<div className='hidden md:flex items-center gap-5'>
						{navLinks.map((link) => (
							<Link key={link.href} href={link.href} className='relative'>
								<span
									className={`text-sm font-medium transition-colors ${
										isActive(link.href)
											? "text-[var(--color-text-primary)]"
											: "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
									}`}>
									{link.label}
								</span>
								{isActive(link.href) && (
									<span className='absolute bottom-[-4px] left-0 right-0 h-0.5 bg-[var(--color-primary-500)]'></span>
								)}
							</Link>
						))}
					</div>

					{/* Desktop Auth Button */}
					<div className='hidden md:block'>
						{authButton}
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
					<div className='md:hidden py-md border-t border-[var(--color-border-primary)]'>
						<div className='flex flex-col gap-md'>
							{navLinks.map((link) => (
								<Link key={link.href} href={link.href} className='relative'>
									<span
										className={`text-sm font-medium transition-colors ${
											isActive(link.href)
												? "text-[var(--color-text-primary)]"
												: "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
										}`}
										onClick={() => setIsMobileMenuOpen(false)}>
										{link.label}
									</span>
									{isActive(link.href) && (
										<span className='absolute bottom-[-4px] w-10 left-0 right-0 h-0.5 bg-[var(--color-primary-500)]'></span>
									)}
								</Link>
							))}
							<div onClick={() => setIsMobileMenuOpen(false)}>
								{authButton}
							</div>
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}
