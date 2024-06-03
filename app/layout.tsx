import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster"
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import { cn } from "@/lib/utils";


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
    <ReactQueryClientProvider> 
    <html lang="en" className={cn(GeistSans.className,{'debug-screens':process.env.NODE_ENV==='development'})}>
      <body className=" dark  bg-background text-foreground">
        <Header/>
        {/* <main className=" flex flex-col justify-center items-center align-middle "> */}
        <main className=" ">
         
          {children}
        
          <Toaster />
        </main>
        <Footer/>
      </body>
 
    </html>
    </ReactQueryClientProvider>
  );
}
