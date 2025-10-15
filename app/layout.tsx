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
	themeColor: "#D4A373",
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
    ✅ COLOR SYSTEM USAGE GUIDE

    Your app now uses the warm earth-tone palette defined in globals.css:
    - bg-background = #E9EDC9 (warm light beige)
    - text-foreground = dark neutral text
    - bg-card = #CCD5AE (sage green for cards)
    - bg-primary = #D4A373 (terracotta accent)

    HOW TO UPDATE OTHER PAGES:
    1. Replace generic colors with semantic tokens:
       ❌ OLD: className="bg-white text-black"
       ✅ NEW: className="bg-background text-foreground"

    2. Use card backgrounds for elevated surfaces:
       ✅ className="bg-card text-card-foreground"

    3. Use primary for accents/CTAs:
       ✅ className="bg-primary text-primary-foreground"

    4. Use secondary for supporting elements:
       ✅ className="bg-secondary text-secondary-foreground"

    5. For custom colors, define them in globals.css @layer base :root
       (lines 12-47), NOT in tailwind.config.ts
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
