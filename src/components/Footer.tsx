import Link from "next/link";
import Image from "next/image";

const TELEGRAM_URL = "https://t.me/YOUR_CHANNEL";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#2a2a3a] bg-[#0a0a0f] mt-16">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="relative w-9 h-9">
                <Image
                  src="/header_logo.png"
                  alt="CineMax"
                  fill
                  className="object-contain"
                  sizes="36px"
                />
              </div>
              <span className="text-lg font-bold tracking-tight">
                <span className="text-[#f5c542]">Cine</span>
                <span className="text-white">Max</span>
              </span>
            </Link>
            <p className="text-sm text-[#8e8ea0] max-w-xs">
              Stream premium movies and series in stunning HD quality. Your ultimate entertainment destination.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Browse</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Home</Link>
              <Link href="/movies" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Movies</Link>
              <Link href="/series" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Series</Link>
              <Link href="/search" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Search</Link>
              <Link href="/download" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Download App</Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Genres</h3>
            <div className="space-y-2">
              <Link href="/movies" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Action</Link>
              <Link href="/movies" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Drama</Link>
              <Link href="/movies" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Comedy</Link>
              <Link href="/movies" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Horror</Link>
              <Link href="/movies" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Sci-Fi</Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">More</h3>
            <div className="space-y-2">
              <Link href="/watchlist" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Watchlist</Link>
              <Link href="/download" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">APK Download</Link>
              <Link href="/support" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Support Us</Link>
            </div>
          </div>
          <div className="col-span-2 md:col-span-4">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm border border-[#2CA5E0]/30 text-[#2CA5E0] hover:bg-[#2CA5E0]/10 transition-colors rounded-lg"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                Join Telegram
              </a>
              <Link
                href="/support"
                className="flex items-center gap-2 px-4 py-2 text-sm border border-[#f5c542]/30 text-[#f5c542] hover:bg-[#f5c542]/10 transition-colors rounded-lg"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                Support Us
              </Link>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-[#2a2a3a] text-center">
          <p className="text-sm text-[#8e8ea0]">
            <span className="text-[#f5c542] font-bold">CineMax</span> &copy; {currentYear}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
