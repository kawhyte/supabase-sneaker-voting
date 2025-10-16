import { Lora, Lato } from 'next/font/google';
import "./globals.css";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: "http://localhost:3000";

export const metadata = {
	metadataBase: new URL(defaultUrl),
	title: "Wardrobe Journal",
	description: "Track your wardrobe items and add items to a watchlist and get notified when prices drop",
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

const fontBody = Lato({
  subsets: ['latin'],
  weight: ['400', '700'], // Load regular and bold weights
  variable: '--font-body',
});

const fontHeading = Lora({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
});


export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	 return (

   <html
  lang="en"
  className={cn("light", fontBody.variable, fontHeading.variable)}
  suppressHydrationWarning
>
  {/*
    ✅ COLOR SYSTEM v2.0 USAGE GUIDE

    Your app uses a professional sneaker brand palette defined in globals.css:

    🎨 SEMANTIC TOKENS (USE THESE):
    - bg-background = stone-200 (warm stone background, lets product images pop)
    - text-foreground = slate-900 (dark text)
    - bg-card = white (clean white cards)
    - bg-primary = sun-400 (vibrant yellow #FFC700, Mailchimp-inspired)
    - bg-secondary = terracotta-400 (warm orange-red accent)

    📘 HOW TO UPDATE COMPONENTS:
    1. Replace generic colors with semantic tokens:
       ❌ OLD: className="bg-white text-black"
       ✅ NEW: className="bg-background text-foreground"

    2. Use card backgrounds for elevated surfaces:
       ✅ className="bg-card text-card-foreground"

    3. Use primary for CTAs and brand moments:
       ✅ className="bg-primary text-primary-foreground hover:bg-primary-hover"

    4. Use secondary for supporting CTAs:
       ✅ className="bg-secondary text-secondary-foreground hover:bg-secondary-hover"

    5. Use functional colors for badges:
       - Sold out: className="bg-ember-400 text-ember-600"
       - New release: className="bg-blaze-400 text-blaze-600"
       - Good deal: className="bg-meadow-400 text-meadow-600"

    6. For direct color access, use the palette:
       ✅ bg-stone-{50-950}, bg-sun-{50-950}, bg-terracotta-{50-950}
       ✅ bg-ember-{50-950}, bg-blaze-{50-950}, bg-meadow-{50-950}
       ✅ bg-slate-{50-950} (neutral grays)

    ♿ ACCESSIBILITY:
    - All -600+ shades are WCAG AAA compliant for text
    - Use -400 for large text (18px+) or badges
    - Pair light backgrounds (50-200) with dark text (600-900)

    📚 Full documentation in globals.css (lines 97-315)
  */}
  <body className="min-h-screen bg-background text-foreground border-t-4 border-primary">
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Main content inherits bg-background from body, no need to repeat */}
      <main className="flex-1 py-8 sm:py-12 lg:py-16 lg:px-8">
        {children}
      </main>

      {/* Footer uses card color for subtle differentiation */}
      <footer className="border-t bg-card text-card-foreground py-8 px-6">
        <p className="text-sm text-muted-foreground">
          © 2025 Your Company. Built with love and Tailwind v4.
        </p>
      </footer>

      <Toaster />
    </div>
  </body>
</html>

    );
}
