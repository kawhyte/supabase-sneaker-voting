import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: "http://localhost:3000";

export const metadata = {
	metadataBase: new URL(defaultUrl),
	title: "Sneaker Sizing Tracker",
	description: "Personal sneaker sizing and try-on experience tracker",
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
