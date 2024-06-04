import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import { cn } from "@/lib/utils";
import SideNavBar from "@/components/SideNavBar";
import MainPageLayout from "@/components/MainPageLayout";

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: "http://localhost:3000";

export const metadata = {
	metadataBase: new URL(defaultUrl),
	title: "MTW Sneaker Collection",
	description: "MTW Sneaker Collection & Tracking",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang='en'
			className={cn(
				"min-h-screen w-full dark bg-background text-foreground",
				GeistSans.className,
				{ "debug-screens": process.env.NODE_ENV === "development" }
			)}>
			<body className='w-full '>
				<Header />
				{/* <main className=" flex flex-col justify-center items-center align-middle "> */}
				<div className='flex  w-full  m-0'>
					{/* side bar */}
					<MainPageLayout children={undefined}></MainPageLayout>
					{/* main page */}
					{children}
					<Toaster />
				</div>
				<Footer />
			</body>
		</html>
	);
}
