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
	title: "SoleTracker - Item Price Monitor",
	description: "Track item prices across multiple stores and get notified when prices drop",
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
            className={cn(
                "light",
                fontBody.variable,
                fontHeading.variable
            )}
            suppressHydrationWarning
        >
            <body className="min-h-screen text-primary bg-primary">
                <div>
                    <Navbar />
                    <main className="py-8 sm:py-12 lg:py-16 lg:px-8">
                        {children}
                    </main>
                    <Toaster />
                </div>
            </body>
        </html>
    );
}
