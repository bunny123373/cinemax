import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/store/provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import { Analytics } from "@vercel/analytics/react";
import PushNotificationRegistrar from "@/components/PushNotificationRegistrar";
import AdblockerDetector from "@/components/AdblockerDetector";
import InterstitialAd from "@/components/InterstitialAd";
import ExitIntentPopup from "@/components/ExitIntentPopup";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CineMax - Stream Premium Movies & Series in HD",
    template: "%s | CineMax",
  },
  description:
    "Watch thousands of premium movies and web series online for free in HD quality. CineMax brings you the latest Bollywood, Hollywood, Korean, and Anime content with subtitles and multiple audio tracks.",
  keywords: [
    "watch movies online free",
    "stream series HD",
    "CineMax",
    "free movies",
    "web series",
    "Bollywood movies",
    "Hollywood movies",
    "Korean drama",
    "anime streaming",
    "HD movies online",
    "watch series free",
    "movie streaming site",
  ],
  metadataBase: new URL(process.env.SITE_URL || "https://cinemax77.vercel.app"),
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "CineMax - Stream Premium Movies & Series in HD",
    description:
      "Watch thousands of premium movies and web series online for free in HD quality. Bollywood, Hollywood, Korean, and Anime with subtitles.",
    siteName: "CineMax",
    url: process.env.SITE_URL || "https://cinemax77.vercel.app",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/preview.png",
        width: 1280,
        height: 720,
        alt: "CineMax - Stream Premium Movies & Series",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CineMax - Stream Premium Movies & Series in HD",
    description:
      "Watch thousands of premium movies and web series online for free in HD quality.",
    images: ["/preview.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "kvuNK7ktH6fjJ8C5y1v12mFaCGUD209uv554HqUyO4c",
  },
  other: {
    "application-name": "CineMax",
    "apple-mobile-web-app-title": "CineMax",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes",
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
        <meta name="google-site-verification" content="kvuNK7ktH6fjJ8C5y1v12mFaCGUD209uv554HqUyO4c" />
        <meta name="44fd5e4d00b33980a1b07849289b58fb201392c1" content="44fd5e4d00b33980a1b07849289b58fb201392c1" />
        <meta name="monetag" content="60d1a06d562117372df72849d5db08e3"></meta>
        <script src="https://5gvci.com/act/files/tag.min.js?z=11282497" data-cfasync="false" async></script>
        <script src="https://www.effectivecpmnetwork.com/xht1pw0g3?key=9c3c37751b12c6f33324d06ee16bf044" async></script>
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
          <PushNotificationRegistrar />
          <AdblockerDetector />
          <InterstitialAd />
          <ExitIntentPopup />
        </ReduxProvider>
        <Analytics />
      </body>
    </html>
  );
}
