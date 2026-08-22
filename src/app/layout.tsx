import type { Metadata } from "next";
import "@fontsource-variable/vazirmatn";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "پرواز ۷۲۴ | رزرو بلیط هواپیما",
  description: "رزرو آنلاین بلیط هواپیما با بهترین قیمت",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="font-[var(--font-vazirmatn)] antialiased bg-base-200 text-base-content">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1" id="top">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
