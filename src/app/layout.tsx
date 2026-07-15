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
        <meta name="google-site-verification" content="2SHeOs3N1yV8TazjEYaWv_PyXlykKgemyDSJh-FY16w" />
        <meta name="44fd5e4d00b33980a1b07849289b58fb201392c1" content="44fd5e4d00b33980a1b07849289b58fb201392c1" />
        <meta name="monetag" content="60d1a06d562117372df72849d5db08e3"></meta>
        <script src="https://5gvci.com/act/files/tag.min.js?z=11282497" data-cfasync="false" async></script>
        <link rel="manifest" href="/manifest.json" />
        <link rel="dns-prefetch" href="https://streambox.sonixhub.net" />
        <link rel="preconnect" href="https://streambox.sonixhub.net" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#0a0a0f] text-[#f5f5f7] antialiased font-sans" suppressHydrationWarning>
      <script src="https://pl30358092.effectivecpmnetwork.com/83/ae/1d/83ae1d8e37ab5ebba22d210675001f57.js"></script>
      <script dangerouslySetInnerHTML={{ __html: `
        (function(kygw){
          var d = document,
              s = d.createElement('script'),
              l = d.scripts[d.scripts.length - 1];
          s.settings = kygw || {};
          s.src = "//physicaldad.com/cQDw9.6ibU2/5FlVSFWcQ/9_NCzrI/yaNKD/UO2/OkS/0w3JM/joIo0TNuTGcTzS";
          s.async = true;
          s.referrerPolicy = 'no-referrer-when-downgrade';
          l.parentNode.insertBefore(s, l);
        })({})
      ` }} />
        <ReduxProvider>
          <Header />
          <main className="pt-8 md:pt-16 min-h-screen pb-16 md:pb-0">
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
