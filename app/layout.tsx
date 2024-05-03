import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster"
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";


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
    <html lang="en" className={GeistSans.className}>
      <body className="  bg-background text-foreground">
        <Header/>
        <main className="min-h-screen flex flex-col justify-center items-center align-middle ">
          <div  className="m-auto"> 
          {children}
          </div>
          <Toaster />
        </main>
        <Footer/>
      </body>
 
    </html>
    </ReactQueryClientProvider>
  );
}
