import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MainPageLayout from "@/components/MainPageLayout";
import { cn } from "@/lib/utils";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div
			lang='en'
			className={cn(
				"min-h-screen w-full dark bg-background text-foreground",

				{ "debug-screens": process.env.NODE_ENV === "development" }
			)}>
			{/* <main className=" flex flex-col justify-center items-center align-middle "> */}
			<div className='flex  w-full  m-0'>
				{/* side bar */}
				<MainPageLayout children={children}></MainPageLayout>

				{/* main page */}
				{/* {children} */}
			</div>
		</div>
	);
}
