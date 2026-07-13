import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#2a2a3a] bg-[#0a0a0f] mt-16">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <div className="relative w-24 h-9">
                <Image
                  src="/header_logo.png"
                  alt="CineMax"
                  fill
                  className="object-contain"
                  sizes="96px"
                />
              </div>
            </Link>
            <p className="text-sm text-[#8e8ea0] max-w-xs">
              Stream premium movies and series in stunning HD quality. Your ultimate entertainment destination.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Browse</h3>
            <div className="space-y-2">
              <Link href="/movies" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Movies</Link>
              <Link href="/series" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Series</Link>
              <Link href="/watchlist" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Watchlist</Link>
              <Link href="/download" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Download App</Link>
              <Link href="/search" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Search</Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Categories</h3>
            <div className="space-y-2">
              <Link href="/category/action" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Action</Link>
              <Link href="/category/drama" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Drama</Link>
              <Link href="/category/comedy" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Comedy</Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Legal</h3>
            <div className="space-y-2">
              <Link href="/privacy" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">Terms of Service</Link>
              <Link href="/dmca" className="block text-sm text-[#8e8ea0] hover:text-[#f5c542] transition-colors">DMCA</Link>
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
