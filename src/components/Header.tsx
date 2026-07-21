"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Film, Tv, X } from "lucide-react";
import type { Net27Item } from "@/types/net27";

const TELEGRAM_URL = "https://t.me/YOUR_CHANNEL";

const pcNavLinks = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/series", label: "Series" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/download", label: "App" },
];

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"all" | "movie" | "tv">("all");
  const [results, setResults] = useState<Net27Item[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSearch(false);
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (!showSearch) {
      setSearchQuery("");
      setResults([]);
      setTypeFilter("all");
    }
  }, [showSearch]);

  const doSearch = useCallback(async (q: string, type: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/net27/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      let items: Net27Item[] = json.items || [];
      if (type !== "all") items = items.filter((r) => r.type === type);
      setResults(items.slice(0, 20));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val, typeFilter), 300);
  };

  const handleTypeChange = (t: "all" | "movie" | "tv") => {
    setTypeFilter(t);
    if (searchQuery.trim()) doSearch(searchQuery, t);
  };

  const goToItem = (item: Net27Item) => {
    const slug = toSlug(item.title);
    const href = item.type === "movie"
      ? `/movie/${slug}?tmdbId=${item.tmdbId}`
      : `/series/${slug}?tmdbId=${item.tmdbId}`;
    setShowSearch(false);
    router.push(href);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearch(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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
                <Image src="/header_logo.png" alt="CineMax" fill className="object-contain" sizes="36px" />
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

            <div className="flex items-center gap-3">
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#12121a] border border-[#2a2a3a] text-sm text-[#8e8ea0] hover:text-[#2CA5E0] hover:border-[#2CA5E0]/30 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                <span className="hidden lg:inline">Join Telegram</span>
              </a>
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#12121a] border border-[#2a2a3a] text-sm text-[#8e8ea0] hover:text-white hover:border-[#f5c542]/30 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="fixed top-0 left-0 right-0 z-50 md:hidden pt-2 px-3">
        <div className="flex items-center justify-center">
          <div className="bg-[#0a0a0f]/95 backdrop-blur-xl rounded-full px-3 py-1.5 shadow-lg shadow-black/40 border border-[#2a2a3a]/50">
            <Link href="/" className="flex items-center gap-1.5">
              <div className="relative w-6 h-6">
                <Image src="/header_logo.png" alt="CineMax" fill className="object-contain" sizes="24px" />
              </div>
              <span className="text-xs font-bold tracking-tight">
                <span className="text-[#f5c542]">Cine</span>
                <span className="text-white">Max</span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {showSearch && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] bg-black/70 backdrop-blur-sm"
          onClick={() => setShowSearch(false)}
        >
          <div
            className="w-full max-w-[600px] mx-4 bg-[#12121a] border border-[#2a2a3a] shadow-2xl rounded-xl overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2a3a]">
              <Search className="w-5 h-5 text-[#8e8ea0] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search movies & series..."
                className="flex-1 bg-transparent text-white text-base placeholder-[#8e8ea0] focus:outline-none"
              />
              <button type="button" onClick={() => setShowSearch(false)} className="text-[#8e8ea0] hover:text-white shrink-0">
                <X className="w-5 h-5" />
              </button>
            </form>

            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#2a2a3a]/50">
              {(["all", "movie", "tv"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors ${
                    typeFilter === t
                      ? "bg-[#f5c542] text-[#0a0a0f]"
                      : "bg-[#1a1a26] text-[#8e8ea0] hover:text-white border border-[#2a2a3a]"
                  }`}
                >
                  {t === "movie" && <Film className="w-3 h-3" />}
                  {t === "tv" && <Tv className="w-3 h-3" />}
                  {t === "all" ? "All" : t === "movie" ? "Movies" : "Series"}
                </button>
              ))}
            </div>

            <div className="max-h-[50vh] overflow-y-auto">
              {loading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-[#f5c542] border-t-transparent rounded-full" />
                </div>
              )}

              {!loading && searchQuery.trim() && results.length === 0 && (
                <p className="text-center text-sm text-[#8e8ea0] py-8">No results found</p>
              )}

              {!loading && results.length > 0 && (
                <div className="p-2">
                  {results.map((item) => {
                    const slug = toSlug(item.title);
                    const isMovie = item.type === "movie";
                    return (
                      <button
                        key={item.tmdbId}
                        onClick={() => goToItem(item)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1a1a26] transition-colors text-left group"
                      >
                        <div className="w-10 h-14 relative rounded overflow-hidden bg-[#1a1a26] shrink-0">
                          <Image
                            src={item.poster || "https://image.tmdb.org/t/p/w92/placeholder.svg"}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate group-hover:text-[#f5c542] transition-colors">{item.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[9px] px-1 py-0.5 font-semibold ${isMovie ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
                              {isMovie ? "Movie" : "Series"}
                            </span>
                            <span className="text-[11px] text-[#8e8ea0]">{item.year}</span>
                            {item.rating > 0 && (
                              <span className="text-[11px] text-[#f5c542]">{item.rating.toFixed(1)}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {!searchQuery.trim() && !loading && (
                <p className="text-center text-sm text-[#8e8ea0] py-8">Type to search...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
