import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

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
	themeColor: "#2563eb",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			className={cn(
				"light bg-background text-foreground",
				GeistSans.className
			)}>
			<body className="min-h-screen">
				<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
					{children}
					<Toaster />
				</div>
			</body>
		</html>
	);
}
