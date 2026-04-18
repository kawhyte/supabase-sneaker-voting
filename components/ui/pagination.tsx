"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	buildPageUrl: (page: number) => string;
	className?: string;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	const pages: (number | "ellipsis")[] = [1];

	const leftBound = Math.max(2, currentPage - 2);
	const rightBound = Math.min(totalPages - 1, currentPage + 2);

	if (leftBound > 2) pages.push("ellipsis");

	for (let i = leftBound; i <= rightBound; i++) {
		pages.push(i);
	}

	if (rightBound < totalPages - 1) pages.push("ellipsis");

	pages.push(totalPages);

	return pages;
}

export function Pagination({
	currentPage,
	totalPages,
	buildPageUrl,
	className,
}: PaginationProps) {
	if (totalPages <= 1) return null;

	const pages = getPageNumbers(currentPage, totalPages);
	const isFirst = currentPage <= 1;
	const isLast = currentPage >= totalPages;

	return (
		<nav
			aria-label="Pagination"
			className={cn("flex items-center justify-center gap-1 pt-16", className)}>
			{/* Prev */}
			{isFirst ? (
				<span className="flex h-9 w-9 items-center justify-center opacity-25 cursor-not-allowed">
					<ChevronLeft className="h-4 w-4" />
				</span>
			) : (
				<Link
					href={buildPageUrl(currentPage - 1)}
					className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
					aria-label="Previous page">
					<ChevronLeft className="h-4 w-4" />
				</Link>
			)}

			{/* Page numbers */}
			{pages.map((page, index) => {
				if (page === "ellipsis") {
					return (
						<span
							key={`ellipsis-${index}`}
							className="flex h-9 w-9 items-center justify-center font-mono text-xs tracking-widest text-muted-foreground/40 select-none">
							&hellip;
						</span>
					);
				}

				const isActive = page === currentPage;

				return (
					<Link
						key={page}
						href={buildPageUrl(page)}
						aria-current={isActive ? "page" : undefined}
						className={cn(
							"flex h-9 w-9 items-center justify-center rounded font-mono text-xs tracking-widest transition-colors",
							isActive
								? "bg-accent/10 font-semibold text-accent"
								: "text-muted-foreground hover:text-foreground"
						)}>
						{String(page).padStart(2, "0")}
					</Link>
				);
			})}

			{/* Next */}
			{isLast ? (
				<span className="flex h-9 w-9 items-center justify-center opacity-25 cursor-not-allowed">
					<ChevronRight className="h-4 w-4" />
				</span>
			) : (
				<Link
					href={buildPageUrl(currentPage + 1)}
					className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
					aria-label="Next page">
					<ChevronRight className="h-4 w-4" />
				</Link>
			)}
		</nav>
	);
}
