"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Film, Tv, Home, Bookmark, Download } from "lucide-react";

const pcNavLinks = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/series", label: "Series" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/download", label: "Download" },
];

const mobileNavLinks = [
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/series", label: "Series", icon: Tv },
];

const bottomTabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/series", label: "Series", icon: Tv },
  { href: "/watchlist", label: "Watchlist", icon: Bookmark },
  { href: "/download", label: "Download", icon: Download },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearch(false);
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#2a2a3a]/50 hidden md:block">
        <div className="max-w-[1800px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="relative w-9 h-9">
                <Image src="/header_logo.png" alt="CineMax" fill className="object-contain" priority sizes="36px" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-[#f5c542]">Cine</span>
                <span className="text-white">Max</span>
              </span>
            </Link>

            <nav className="flex items-center gap-8 ml-10">
              {pcNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.href) ? "text-[#f5c542]" : "text-[#8e8ea0] hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <form onSubmit={handleSearch} className="flex items-center">
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
          </div>
        </div>
      </header>

      <div className="fixed top-0 left-0 right-0 z-50 md:hidden pt-1.5 px-3">
        <div className="flex items-center justify-between bg-[#0a0a0f]/95 backdrop-blur-xl rounded-full px-3 py-1.5 shadow-lg shadow-black/40 border border-[#2a2a3a]/50">
          <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
            <div className="relative w-6 h-6">
              <Image src="/header_logo.png" alt="CineMax" fill className="object-contain" priority sizes="24px" />
            </div>
            <span className="text-xs font-bold tracking-tight">
              <span className="text-[#f5c542]">Cine</span>
              <span className="text-white">Max</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {mobileNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors ${
                    isActive(link.href) ? "text-[#f5c542]" : "text-[#8e8ea0]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-1.5 text-[#8e8ea0] hover:text-white transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </nav>
        </div>

        {showSearch && (
          <form onSubmit={handleSearch} className="mt-1.5 mx-2">
            <div className="relative bg-[#0a0a0f]/95 backdrop-blur-xl rounded-full border border-[#2a2a3a]/50 overflow-hidden">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies & series..."
                className="w-full pl-10 pr-4 py-2 bg-transparent text-sm text-white placeholder-[#8e8ea0] focus:outline-none"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e8ea0]" />
            </div>
          </form>
        )}
      </div>
    </>
  );
}
