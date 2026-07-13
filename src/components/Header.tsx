"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/series", label: "Series" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/download", label: "Download" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 md:bg-[#0a0a0f]/80 md:backdrop-blur-xl md:border-b md:border-[#2a2a3a]/50">
      <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-8 pt-2 md:pt-0">
        <div className="flex items-center justify-between h-12 sm:h-14 md:h-16 bg-[#0a0a0f]/90 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none rounded-full md:rounded-none px-3 md:px-0 shadow-lg md:shadow-none border border-[#2a2a3a]/50 md:border-0">
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className="relative w-24 h-9 md:w-28 md:h-10">
              <Image
                src="/header_logo.png"
                alt="CineMax"
                fill
                className="object-contain brightness-0 invert"
                priority
                sizes="112px"
              />
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 ml-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-[#f5c542]"
                    : "text-[#8e8ea0] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies & series..."
                  className="w-64 pl-10 pr-4 py-2 rounded-lg bg-[#12121a] border border-[#2a2a3a] text-sm text-white placeholder-[#8e8ea0] focus:outline-none focus:border-[#f5c542]/50 transition-colors"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e8ea0]" />
              </div>
            </form>

            <Link
              href="/search"
              className="md:hidden p-2 text-[#8e8ea0] hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
