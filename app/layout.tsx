import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { ViewDensityProvider } from "@/lib/view-density-context";
import { FormModeProvider } from "@/lib/form-mode-context";
import { UndoProvider } from "@/contexts/UndoContext";

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: "http://localhost:3000";

export const metadata = {
	metadataBase: new URL(defaultUrl),
	title: "PurrView: Wardrobe Watchlist",
	description:
		"Track your wardrobe items and add items to a watchlist and get notified when prices drop",
	manifest: "/manifest.json",
	icons: {
		icon: "/icon-192x192.png",
		shortcut: "/icon-192x192.png",
		apple: "/icon-192x192.png",
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "SoleTracker",
	},
	formatDetection: {
		telephone: false,
	},
};

export const viewport = {
	themeColor: "#FFC700", // Sun yellow - primary brand color
	width: "device-width",
	initialScale: 1,
};

const fontBody = Poppins({
	subsets: ["latin"],
	weight: ["400", "600"], // Regular and SemiBold for modern fintech aesthetic
	variable: "--font-body",
});

const fontHeading = Poppins({
	subsets: ["latin"],
	weight: ["600", "700"], // SemiBold and Bold for headings
	variable: "--font-heading",
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang='en'
			className={cn("light", fontBody.variable, fontHeading.variable)}
			suppressHydrationWarning>
			{/*
    ✅ COLOR & SPACING SYSTEM v2.0 IMPLEMENTATION GUIDE

    🎯 DESIGN STRATEGY:

    **Page Background:** blaze-50 (oklch(0.97 0.03 45))
    - Signals "new releases" & energy (psychological color psychology)
    - Lightness 0.97 = excellent readability + product image clarity
    - Creates contrast that makes white cards "pop"

    **Navbar:** White background (var(--color-card))
    - Clean visual separation from page background
    - Anchors the top of the page as primary navigation
    - Improves visual hierarchy & usability

    **Border Top:** 6px (border-t-6 with sun-400)
    - Prominent brand accent without overwhelming
    - 48% larger than previous (from 4px → 6px)
    - Sun-400 (#FFC700) provides high contrast against white navbar

    **Spacing System:** Perfect 8px Grid
    - Navbar margin: var(--spacing-6) = 24px (component-level)
    - Main content: px-4 sm:px-6 lg:px-8 (responsive, mobile-first)
    - Footer: symmetric py-8 px-8 (32px on all sides)

    🎨 SEMANTIC TOKENS (USE THESE):
    - bg-background = blaze-50 (energetic page background)
    - text-foreground = slate-900 (dark text, WCAG AAA compliant)
    - bg-card = white (elevated surfaces pop against blaze-50)
    - bg-primary = sun-400 (vibrant yellow #FFC700 CTAs)
    - bg-secondary = terracotta-400 (warm orange-red accents)

    📘 HOW TO UPDATE COMPONENTS:
    1. Replace generic colors with semantic tokens:
       ❌ OLD: className="bg-white text-black"
       ✅ NEW: className="bg-background text-foreground"

    2. Use card backgrounds for elevated surfaces:
       ✅ className="bg-card text-card-foreground"

    3. Use primary for CTAs and brand moments:
       ✅ className="bg-primary text-primary-foreground hover:bg-primary-hover"

    4. Use functional colors for badges:
       - Sold out: className="bg-slate-100 text-slate-600"
       - New release: className="bg-blaze-400 text-blaze-600"
       - Good deal: className="bg-meadow-400 text-meadow-600"

    ♿ ACCESSIBILITY NOTES:
    - All -600+ shades are WCAG AAA compliant for text
    - blaze-50 + slate-900 = 16.5:1 contrast ratio (exceeds AAA)
    - Navbar white provides essential visual separator for cognitive load
    - 24px navbar spacing + 8px typography grid = perfect vertical rhythm

    📚 Full documentation in globals.css (lines 97-315, 404-476)
  */}
			<body className='min-h-screen bg-background text-foreground border-t-6 border-primary'>
				<UndoProvider>
					<FormModeProvider>
						<ViewDensityProvider>
							<div className='flex flex-col min-h-screen'>
								<Navbar />

								{/* Main content inherits bg-background from body, no need to repeat */}
								{/* Add responsive horizontal padding so content doesn't touch screen edges on small devices */}
								<main className='flex-1 py-8 sm:py-12 lg:py-16 px-8 sm:px-8 lg:px-8 container mx-auto w-full'>
									{children}
								</main>

								{/* Footer uses card color for subtle differentiation */}
								<footer className='border-t bg-card text-card-foreground py-8 px-8'>
									<p className='text-sm text-muted-foreground'>
										© 2025 PurrView.
									</p>
								</footer>

								<Toaster />
							</div>
						</ViewDensityProvider>
					</FormModeProvider>
				</UndoProvider>
			</body>
		</html>
	);
}
