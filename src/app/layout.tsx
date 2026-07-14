import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/store/provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CineMax - Stream Premium Movies & Series",
    template: "%s | CineMax",
  },
  description: "Stream premium movies and web series online in HD. CineMax - your ultimate streaming platform for premium entertainment.",
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:4000"),
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    siteName: "CineMax",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0a0a0f" />
        <meta name="monetag" content="60d1a06d562117372df72849d5db08e3"></meta>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-[#0a0a0f] text-[#f5f5f7] antialiased font-sans" suppressHydrationWarning>
        <ReduxProvider>
          <Header />
          <main className="pt-8 md:pt-16 min-h-screen pb-16 md:pb-0 overflow-x-hidden">
            {children}
          </main>
          <Footer />
          <BottomNav />
          <ServiceWorkerRegistrar />
        </ReduxProvider>
      </body>
    </html>
  );
}
