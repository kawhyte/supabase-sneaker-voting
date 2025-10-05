import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: "http://localhost:3000";

export const metadata = {
	metadataBase: new URL(defaultUrl),
	title: "SoleTracker - Sneaker Price Monitor",
	description: "Track sneaker prices across multiple stores and get notified when prices drop",
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
	themeColor: "#2563eb",
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
		lang="en"
			className={cn(
				"light text-foreground",
				GeistSans.className
			)}>
			<body className="min-h-screen text-primary" suppressHydrationWarning>
				<div className="min-h-screen bg-primary">
					<Navbar />
					<main className=" lg:px-8">
						{children}
					</main>
					<Toaster />
				</div>
			</body>
		</html>
	);
}
