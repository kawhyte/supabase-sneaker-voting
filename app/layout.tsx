import { Inter } from 'next/font/google';;
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

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', 
});



export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
        <html lang="en" suppressHydrationWarning>
            {/*
              The font variable is applied here.
              We also set the base background and text colors for the whole app.
            */}
            <body
                className={cn(
                    "min-h-screen bg-background font-sans antialiased",
                    inter.variable
                )}
            >
                <Navbar />
                {/* This main tag adds the generous vertical spacing */}
                <main className="py-8 sm:py-12 lg:py-16">
                    {children}
                </main>
                <Toaster />
            </body>
        </html>
    );
}
